import { Client, Intents, Message } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES
  ]
})

// Should filter accidental non-media comments, not deliberate abuse.
function isGalleryMessage (message: Message<boolean>) {
  return message.attachments.size > 0 || // some kind of media
    message.content.includes('```') || // code snippet
    message.content.includes('http') // link
}

client.on('messageCreate', async message => {
  try {
    if (message.channel.type !== 'GUILD_TEXT') {
      return
    }

    const content = message.content
    if (!isGalleryMessage(message)) {
      await message.author.send(
        `Your message in **${message.channel.name}** was removed ` +
        'as it was not deemed to contain any work or links.\n\n' +

        'This channel is only intended for posting work, ' +
        'please join the thread if you want to comment.\n\n' +

        'Your comment: ' + content
      )
      await message.delete()
    } else {
      const topic = content.substring(0, Math.min(content.length, 32))
      const thread = await message.channel.threads
        .create({ startMessage: message.id, name: topic })
      thread.members.add(message.author)
    }
  } catch (err) {
    console.log(err)
  }
})

client.login(process.env.DISCORD_TOKEN)
