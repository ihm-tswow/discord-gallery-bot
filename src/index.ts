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
  if (message.channel.type !== 'GUILD_TEXT') {
    return
  }

  if (!isGalleryMessage(message)) {
    await message.author.send(
      `Your message in **${message.channel.name}** was removed ` +
      'as it was not deemed to contain any work or links.\n\n' +

      'This channel is only intended for posting work, ' +
      'please join the thread if you want to comment.\n\n' +

      'Your comment: ' + message.content
    )
    await message.delete()
  }
})

client.login(process.env.DISCORD_TOKEN)
