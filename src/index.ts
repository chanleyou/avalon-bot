import Telegraf, { Telegram } from 'telegraf'
import dotenv from 'dotenv'

dotenv.config()

export const bot = new Telegraf(process.env.API_KEY)
export const telegram = new Telegram(process.env.API_KEY)

bot.on('message', ({ message, chat }) => {
  console.log(message, chat)
})

bot.launch()

console.log(`~~~ Initialized ~~~`)
