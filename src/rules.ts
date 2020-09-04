import { shuffle } from './utils'

type Role =
  | {
      role: 'Merlin'
      team: 'Good'
    }
  | {
      role: 'Percival'
      team: 'Good'
    }
  | {
      role: 'Knight'
      team: 'Good'
    }
  | {
      role: 'Minion'
      team: 'Evil'
    }
  | {
      role: 'Morgana'
      team: 'Evil'
    }
  | {
      role: 'Mordred'
      team: 'Evil'
    }
  | {
      role: 'Assassin'
      team: 'Evil'
    }
  | {
      role: 'Oberon'
      team: 'Evil'
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
    { role: 'Merlin', team: 'Good' },
    { role: 'Percival', team: 'Good' },
    { role: 'Knight', team: 'Good' },
    { role: 'Morgana', team: 'Evil' },
    { role: 'Assassin', team: 'Evil' },
  ]

  if (numberOfPlayers >= 6) roles.push({ role: 'Knight', team: 'Good' })
  if (numberOfPlayers >= 8) roles.push({ role: 'Knight', team: 'Good' })
  if (numberOfPlayers >= 9) roles.push({ role: 'Knight', team: 'Good' })

  if (numberOfPlayers === 7 || numberOfPlayers === 8) roles.push({ role: 'Minion', team: 'Evil' })
  else if (numberOfPlayers > 8) roles.push({ role: 'Mordred', team: 'Evil' })

  if (numberOfPlayers === 10) roles.push({ role: 'Oberon', team: 'Evil' })

  return [...players].map((player, index) => ({
    ...player,
    ...roles[index],
  }))
}
