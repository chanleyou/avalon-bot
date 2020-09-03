import { shuffle } from './utils'

type Role =
  | {
      name: 'Merlin'
      alignment: 'good'
    }
  | {
      name: 'Percival'
      alignment: 'good'
    }
  | {
      name: 'Knight'
      alignment: 'good'
    }
  | {
      name: 'Minion'
      alignment: 'evil'
    }
  | {
      name: 'Morgana'
      alignment: 'evil'
    }
  | {
      name: 'Mordred'
      alignment: 'evil'
    }
  | {
      name: 'Assassin'
      alignment: 'evil'
    }
  | {
      name: 'Oberon'
      alignment: 'evil'
    }

export type User = {
  id: number
  username?: string
  first_name?: string
}

export type Player = User & Role

/**
 * 5 players 3/2
 * Merlin Percival Knight vs Morgana Assassin
 *
 * 6 players 4/2
 * Merlin Percival 2x Knight vs Morgana Assassin
 *
 * 7 players 4/3
 * Merlin Percival 2x Knight vs Morgana Assassin Evil
 *
 * 8 players 5/3
 * Merlin Percival 3x Knight vs Morgana Assassin Evil
 *
 * 9 players 6/3
 * Merlin Percival 4x Knight vs Morgana Assassin Mordred
 *
 * 10 players 6/4
 * Merlin Percival 4x Knight vs Morgana Assassin Mordred Oberon
 */

export const generateRoles = (players: User[]): Player[] => {
  const numberOfPlayers = players.length
  if (numberOfPlayers > 10 || numberOfPlayers < 5) {
    throw new Error('Sorry, Avalon Bot only supports 5-10 players.')
  }

  const roles: Role[] = [
    { name: 'Merlin', alignment: 'good' },
    { name: 'Percival', alignment: 'good' },
    { name: 'Knight', alignment: 'good' },
    { name: 'Morgana', alignment: 'evil' },
    { name: 'Assassin', alignment: 'evil' },
  ]

  if (numberOfPlayers >= 6) roles.push({ name: 'Knight', alignment: 'good' })
  if (numberOfPlayers >= 8) roles.push({ name: 'Knight', alignment: 'good' })
  if (numberOfPlayers >= 9) roles.push({ name: 'Knight', alignment: 'good' })

  if (numberOfPlayers === 7 || numberOfPlayers === 8)
    roles.push({ name: 'Minion', alignment: 'evil' })
  else if (numberOfPlayers > 8) roles.push({ name: 'Mordred', alignment: 'evil' })

  if (numberOfPlayers === 10) roles.push({ name: 'Oberon', alignment: 'evil' })

  return [...players].map((player, index) => ({
    ...player,
    ...roles[index],
  }))
}
