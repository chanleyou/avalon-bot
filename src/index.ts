import Telegraf, { Telegram, Middleware } from 'telegraf'
import { TelegrafContext } from 'telegraf/typings/context'
import RedisSession from 'telegraf-session-redis'
import dotenv from 'dotenv'
import { generateRoles, Player, User } from './rules'

interface ContextWithSession extends TelegrafContext {
  session: {
    users?: User[]
    players?: Player[]
  }
}

dotenv.config()

export const bot = new Telegraf(process.env.API_KEY)
export const telegram = new Telegram(process.env.API_KEY)

// only need URL, typing requires host and port
const redisSession = new RedisSession({
  store: { host: 'abc', port: 'def', url: process.env.REDIS_URL },
  ttl: 86400,
  getSessionKey: (ctx) => ctx.chat.id,
})

bot.use(redisSession)

bot.on('message', (ctx, next) => {
  const { message } = ctx
  const originalReply = ctx.reply.bind(ctx)
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: message.message_id,
  }

  ctx.reply = async function (text: string) {
    return await originalReply(text, options)
  }

  next()
})

bot.on('message', (async (ctx) => {
  const { from, message, chat, reply } = ctx
  let { session } = ctx
  const { text } = message
  if (text[0] !== '/') return
  const command = text.split(' ')[0].slice(1)

  const reportPlayers = () => {
    if (session.players) {
      reply(
        'Game running! Players: ' +
          session.players.map((p) => `${p.first_name} (@${p.username})`).join(', '),
      )
      return
    }
    if (session.users) {
      reply(
        'Waiting for people to join. Players: ' +
          session.users.map((p) => `${p.first_name} (@${p.username})`).join(', '),
      )
      return
    }
    reply('No game running!')
  }

  const startGame = async (users: User[]) => {
    const players = generateRoles(users)
    session.players = players

    const playerMap = (p: Player) => `${p.first_name} (@${p.username})`

    const merlinKnows = players
      .filter((p) => p.team === 'Evil' && p.role !== 'Mordred')
      .map(playerMap)
      .join(', ')

    const evilTeam = players
      .filter((p) => p.team === 'Evil' && p.role !== 'Oberon')
      .map(playerMap)
      .join(', ')

    const percivalKnows = players
      .filter((p) => p.role === 'Merlin' || p.role === 'Morgana')
      .map(playerMap)
      .join(', ')

    const roleText = ({ role }: Player): string => {
      switch (role) {
        case 'Merlin':
        case 'Morgana':
        case 'Percival':
        case 'Mordred':
        case 'Oberon':
          return role
        case 'Knight':
          return 'a loyal servant of Arthur'
        case 'Minion':
          return 'a minion of Mordred'
        case 'Assassin':
          return 'the Assassin'
      }
    }

    const knowText = ({ role, team }: Player): string => {
      if (role === 'Merlin') return `The evil players known to you are: ${merlinKnows}`
      if (team === 'Evil' && role !== 'Oberon') return `The evil team is: ${evilTeam}`
      if (role === 'Percival') return `Merlin/Morgana could be: ${percivalKnows}`
      return 'You know nothing.'
    }

    players.forEach((player) => {
      telegram.sendMessage(
        player.id,
        `Chat: ${chat.title}\nYou are <b>${roleText(player)}</b>!\nYou are part of team <b>${
          player.team
        }</b>.\n${knowText(player)}`,
        { parse_mode: 'HTML' },
      )
    })
  }

  const { id, username, first_name } = from
  const player = { id, username, first_name }

  switch (command) {
    case 'start':
      if (!session.users) {
        reportPlayers()
      } else if (session.users.length > 10 || session.users.length < 5) {
        reply(`Game needs 5-10 players!`)
        reportPlayers()
      } else {
        try {
          startGame(session.users)
        } catch (e) {
          reply(e)
        }
      }
      break
    case 'join':
      if (session.players) {
        reply('There is already a game running!')
      } else if (!session.users) {
        session.users = [player]
      } else if (session.users.some((p) => p.id === player.id)) {
        reply(`You're already in the game!`)
      } else if (session.users.length >= 10) {
        reply('Sorry, the game has reached maxed player capacity (10).')
      } else {
        session.users.push(player)
      }
      reportPlayers()
      break
    case 'status':
      reportPlayers()
      break
    case 'clear': {
      session.users = undefined
      session.players = undefined
      session = null
      reply('Ok, game cleared.')
      break
    }
    case 'debug': {
      if (from.id.toString() !== process.env.ADMIN_ID) break
      const test = [player, player, player, player, player, player, player, player, player, player]
      startGame(test)
      break
    }
    case 'report': {
      if (from.id.toString() !== process.env.ADMIN_ID) break
      reply(JSON.stringify(session))
    }
  }

  redisSession.saveSession(ctx.chat.id as any, session)
}) as Middleware<ContextWithSession>)

bot.launch()

console.log(`~~~ Initialized ~~~`)
