import {
  getTidraftSessionName,
  getTidraftSlug,
  parseTidraftImport,
} from './tidraftImport'
import { GameVersion } from '../GameComponents/GameVersionPicker'

function serializeLoaderData(source) {
  const table = []
  const encode = (value) => {
    const index = table.length
    table.push(null)
    if (Array.isArray(value)) {
      table[index] = value.map(encode)
    } else if (value && typeof value === 'object') {
      table[index] = Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          `_${encode(key)}`,
          encode(child),
        ]),
      )
    } else {
      table[index] = value
    }

    return index
  }
  encode(source)

  return JSON.stringify(table)
}

describe('TIDraft import', () => {
  it('accepts only a TIDraft game URL', () => {
    expect(getTidraftSlug('https://tidraft.com/draft/example-game')).toBe(
      'example-game',
    )
    expect(() => getTidraftSlug('https://example.com/draft/example')).toThrow()
  })

  it('uses the TIDraft slug as a title-cased session name', () => {
    expect(
      getTidraftSessionName('https://tidraft.com/draft/corner-rebellion-speed'),
    ).toBe('Corner Rebellion Speed')
  })

  it('imports faction, player, color, and seat selections', () => {
    const players = ['Jeff', 'George', 'Lee', 'Jon'].map((name, id) => ({
      id,
      name,
    }))
    const factions = ['arborec', 'barony', 'saar', 'muaat']
    const seats = [3, 2, 1, 0]
    const selections = players.flatMap(({ id }) => [
      {
        type: 'SELECT_FACTION',
        playerId: id,
        factionId: factions[id],
      },
      {
        type: 'SELECT_PLAYER_COLOR',
        playerId: id,
        color: ['Blue', 'Black', 'Green', 'Orange'][id],
      },
      { type: 'SELECT_SEAT', playerId: id, seatIdx: seats[id] },
    ])
    const source = {
      'routes/draft.$id._index': {
        data: {
          data: {
            players,
            selections,
            settings: { factionGameSets: ['base', 'pok', 'te'] },
          },
          imageUrl:
            'https://pub-1234567890abcdef.r2.dev/drafts/example-game.png',
        },
      },
    }
    expect(parseTidraftImport(serializeLoaderData(source))).toEqual({
      factions: [
        'The_Embers_of_Muaat',
        'The_Clan_of_Saar',
        'The_Barony_of_Letnev',
        'The_Arborec',
      ],
      gameVersion: GameVersion.ThundersEdge,
      playerNames: {
        The_Arborec: 'Jeff',
        The_Barony_of_Letnev: 'George',
        The_Clan_of_Saar: 'Lee',
        The_Embers_of_Muaat: 'Jon',
      },
      colors: {
        The_Arborec: 'blue',
        The_Barony_of_Letnev: 'black',
        The_Clan_of_Saar: 'green',
        The_Embers_of_Muaat: 'orange',
      },
      tidraftMapUrl:
        'https://pub-1234567890abcdef.r2.dev/drafts/example-game.png',
    })
  })

  it('rejects galaxy map links outside the TIDraft image host', () => {
    const players = ['Jeff', 'George', 'Lee', 'Jon'].map((name, id) => ({
      id,
      name,
    }))
    const source = {
      'routes/draft.$id._index': {
        data: {
          data: {
            players,
            selections: players.map(({ id }, index) => ({
              type: 'SELECT_FACTION',
              playerId: id,
              factionId: ['arborec', 'barony', 'saar', 'muaat'][index],
            })),
          },
          imageUrl: 'https://example.com/map.png',
        },
      },
    }
    expect(() => parseTidraftImport(serializeLoaderData(source))).toThrow(
      'unsupported galaxy map link',
    )
  })
})
