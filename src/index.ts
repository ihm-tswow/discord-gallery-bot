import { Client, Intents, Message, TextChannel, ThreadChannel } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES
  ]
})

const RENAME_COMMAND = '!rename'

// Should filter accidental non-media comments, not deliberate abuse.
function isGalleryMessage (message: Message<boolean>) {
  return message.attachments.size > 0 || // some kind of media
    message.content.includes('```') || // code snippet
    message.content.includes('http') // link
}

function getDeleteText (message: Message<boolean>, channel: TextChannel) {
  return `Your message in **#${channel.name} (${channel.guild.name})** was removed ` +
    'as it was not deemed to contain any work or links.\n\n' +

    'This channel is only intended for posting work, ' +
    'please join a thread if you want to comment.\n\n' +

    'Your comment: ' + message.content
}

async function getTopic (message: Message<boolean>) {
  if (message.content.length > 0) {
    const content = message.content.includes('\n')
      ? message.content.split('\n')[0]
      : message.content
    return content.substring(0, Math.min(message.content.length, 32))
  }

  if (message.guild) {
    const member = await message.guild.members.fetch(message.author)
    if (member && member.nickname) {
      return `${member.nickname}s Work`
    }
  }

  return `${message.author.username}s Work`
}

const channels = (process.env.CHANNELS || '').split(',')

async function handleThreadMessage (message: Message<boolean>, channel: ThreadChannel) {
  const startMessage = await channel.fetchStarterMessage()
  if (!channels.includes(startMessage.channelId)) {
    return
  }

  if (!message.content.startsWith(RENAME_COMMAND)) {
    return
  }

  const rename = message.content.substring(RENAME_COMMAND.length)
  if (rename.length > 0 && startMessage.author.id === message.author.id) {
    channel.setName(rename)
  }
}

async function handleChannelMessage (message: Message<boolean>, channel: TextChannel) {
  if (!channels.includes(message.channelId)) {
    return
  }

  if (!isGalleryMessage(message)) {
    await message.author.send(getDeleteText(message, channel))
    await message.delete()
  } else {
    const thread = await channel.threads
      .create({ startMessage: message.id, name: await getTopic(message) })
    thread.members.add(message.author)
  }
}

client.on('ready', () => {
  console.log('Gallery Bot ready...')
})

client.on('messageCreate', async message => {
  try {
    switch (message.channel.type) {
      case 'GUILD_PUBLIC_THREAD': {
        await handleThreadMessage(message, message.channel)
        break
      }
      case 'GUILD_TEXT': {
        await handleChannelMessage(message, message.channel)
        break
      }
    }
  } catch (err) {
    console.log(err)
  }
})

client.login(process.env.DISCORD_TOKEN)
