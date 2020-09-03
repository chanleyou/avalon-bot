import Telegraf, { Telegram, Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import RedisSession from 'telegraf-session-redis'
import dotenv from 'dotenv'
import { generateRoles, Player, User } from './rules'

interface ContextWithSession extends TelegrafContext {
  session: {
    players?: User[]
    roles?: Player[]
  }
}

dotenv.config()

export const bot = new Telegraf(process.env.API_KEY)
export const telegram = new Telegram(process.env.API_KEY)

// only need URL, typing requires host and port
const redisSession = new RedisSession({
  store: { host: 'abc', port: 'def', url: process.env.REDIS_URL },
  ttl: 86400,
})

bot.use(redisSession)

bot.on('message', (async ({ from, message, session, chat, reply }) => {
  const { text } = message
  if (text[0] !== '/') return
  const command = text.split(' ')[0].slice(1)

  // use chat.title

  const reportPlayers = () => {
    if (!session.players) {
      reply('No game running!')
      return
    }
    reply('Players: ' + session.players.map((p) => `${p.first_name} (@${p.username})`).join(', '))
  }

  const { id, username, first_name } = from
  const player = { id, username, first_name }

  switch (command) {
    case 'start':
      if (session.players?.length > 0) {
        reply(`There's already a game starting! Did you mean to /join instead?`)
      } else {
        session.players = [player]
        reportPlayers()
      }
      break
    case 'join':
      if (session.players?.some((p) => p.id === player.id)) {
        reply(`You're already in the game!`)
      } else {
        session.players.push(player)
        reportPlayers()
      }
      break
    case 'status':
      reportPlayers()
      break
    case 'clear': {
      session.players = undefined
    }
  }
}) as Middleware<ContextWithSession>)

bot.launch()

console.log(`~~~ Initialized ~~~`)
