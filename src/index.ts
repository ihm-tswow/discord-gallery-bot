import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
})

client.on('ready', () => {
  console.log('Hello world!')
})

client.login(process.env.DISCORD_TOKEN)
