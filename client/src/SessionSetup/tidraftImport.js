import { FACTION } from '../GameComponents/gameInfo/factions'
import { GameVersion } from '../GameComponents/GameVersionPicker'

const FACTION_IDS = {
  arborec: FACTION.The_Arborec,
  barony: FACTION.The_Barony_of_Letnev,
  saar: FACTION.The_Clan_of_Saar,
  muaat: FACTION.The_Embers_of_Muaat,
  hacan: FACTION.The_Emirates_of_Hacan,
  sol: FACTION.The_Federation_of_Sol,
  creuss: FACTION.The_Ghosts_of_Creuss,
  l1z1x: FACTION.The_L1Z1X_Mindnet,
  mentak: FACTION.The_Mentak_Coalition,
  naalu: FACTION.The_Naalu_Collective,
  nekro: FACTION.The_Nekro_Virus,
  sardakk: FACTION.Sardakk_Norr,
  jolnar: FACTION.The_Universities_of_Jol__Nar,
  winnu: FACTION.The_Winnu,
  xxcha: FACTION.The_Xxcha_Kingdom,
  yin: FACTION.The_Yin_Brotherhood,
  yssaril: FACTION.The_Yssaril_Tribes,
  argent: FACTION.The_Argent_Flight,
  empyrean: FACTION.The_Empyrean,
  mahact: FACTION.The_Mahact_Gene__Sorcerers,
  naazrokha: FACTION.The_Naaz__Rokha_Alliance,
  nomad: FACTION.The_Nomad,
  titans: FACTION.The_Titans_of_Ul,
  vulraith: FACTION.The_VuilRaith_Cabal,
  keleres: FACTION.The_Council_Keleres,
  axis: FACTION.The_Shipwrights_of_Axis,
  celdauri: FACTION.The_Celdauri_Trade_Confederation,
  cymiae: FACTION.The_Savages_of_Cymiae,
  dih_mohn: FACTION.The_Dih_Mohn_Flotilla,
  dihmohn: FACTION.The_Dih_Mohn_Flotilla,
  florzen: FACTION.The_Florzen_Profiteers,
  free_systems: FACTION.The_Free_Systems_Compact,
  freesystems: FACTION.The_Free_Systems_Compact,
  ghemina: FACTION.The_Ghemina_Raiders,
  augurs: FACTION.The_Augurs_of_Ilyxum,
  ltokk: FACTION.The_L_tokk_Khrask,
  kollecc: FACTION.The_Kollecc_Society,
  kortali: FACTION.The_Kortali_Tribunal,
  lizho: FACTION.The_Li_Zho_Dynasty,
  mirveda: FACTION.The_Mirveda_Protectorate,
  mortheus: FACTION.The_Glimmer_of_Mortheus,
  myko: FACTION.The_Myko_Mentori,
  nivyn: FACTION.The_Nivyn_Star_Kings,
  olradin: FACTION.The_Olradin_League,
  rhodun: FACTION.The_Zealots_of_Rhodun,
  roh_dhna: FACTION.Roh_Dhna_Mechatronics,
  rohdhna: FACTION.Roh_Dhna_Mechatronics,
  tnelis: FACTION.The_Tnelis_Syndicate,
  vaden: FACTION.The_Vaden_Banking_Clans,
  vaylerian: FACTION.The_Vaylerian_Scourge,
  veldyr: FACTION.The_Veldyr_Sovereignty,
  zelian: FACTION.The_Zelian_Purifier,
  bentor: FACTION.The_Bentor_Conglomerate,
  cheiran: FACTION.The_Cheiran_Hordes,
  edyn: FACTION.The_Edyn_Mandate,
  ghoti: FACTION.The_Ghoti_Wayfarers,
  gledge: FACTION.The_Gledge_Union,
  berserkers: FACTION.The_Berserkers_of_Kjalengard,
  monks: FACTION.The_Monks_of_Kolume,
  kyro: FACTION.The_Kyro_Sodality,
  lanefir: FACTION.The_Lanefir_Remnants,
  nokar: FACTION.The_Nokar_Sellships,
  drahn: FACTION.Drahn_Consortium,
  last_bastion: FACTION.Last_Bastion,
  lastbastion: FACTION.Last_Bastion,
  ralnel: FACTION.The_Ral_Nel_Consortium,
  ral_nel: FACTION.The_Ral_Nel_Consortium,
  deepwrought: FACTION.The_Deepwrought_Scholarate,
  dws: FACTION.The_Deepwrought_Scholarate,
  crimson: FACTION.The_Crimson_Rebellion,
  firmament: FACTION.The_Firmament_The_Obsidian,
}

const PLAYER_COLORS = {
  blue: 'blue',
  black: 'black',
  green: 'green',
  magenta: 'pink',
  pink: 'pink',
  purple: 'purple',
  orange: 'orange',
  red: 'red',
  yellow: 'yellow',
}

const DISCORDANT_STARS_FACTIONS = new Set([
  FACTION.The_Shipwrights_of_Axis,
  FACTION.The_Celdauri_Trade_Confederation,
  FACTION.The_Savages_of_Cymiae,
  FACTION.The_Dih_Mohn_Flotilla,
  FACTION.The_Florzen_Profiteers,
  FACTION.The_Free_Systems_Compact,
  FACTION.The_Ghemina_Raiders,
  FACTION.The_Augurs_of_Ilyxum,
  FACTION.The_L_tokk_Khrask,
  FACTION.The_Kollecc_Society,
  FACTION.The_Kortali_Tribunal,
  FACTION.The_Li_Zho_Dynasty,
  FACTION.The_Mirveda_Protectorate,
  FACTION.The_Glimmer_of_Mortheus,
  FACTION.The_Myko_Mentori,
  FACTION.The_Nivyn_Star_Kings,
  FACTION.The_Olradin_League,
  FACTION.The_Zealots_of_Rhodun,
  FACTION.Roh_Dhna_Mechatronics,
  FACTION.The_Tnelis_Syndicate,
  FACTION.The_Vaden_Banking_Clans,
  FACTION.The_Vaylerian_Scourge,
  FACTION.The_Veldyr_Sovereignty,
  FACTION.The_Zelian_Purifier,
  FACTION.The_Bentor_Conglomerate,
  FACTION.The_Cheiran_Hordes,
  FACTION.The_Edyn_Mandate,
  FACTION.The_Ghoti_Wayfarers,
  FACTION.The_Gledge_Union,
  FACTION.The_Berserkers_of_Kjalengard,
  FACTION.The_Monks_of_Kolume,
  FACTION.The_Kyro_Sodality,
  FACTION.The_Lanefir_Remnants,
  FACTION.The_Nokar_Sellships,
  FACTION.Drahn_Consortium,
])

export function getTidraftGameVersion(factions, factionGameSets = []) {
  const gameSets = Array.isArray(factionGameSets) ? factionGameSets : []
  if (
    gameSets.includes('ds') ||
    factions.some((faction) => DISCORDANT_STARS_FACTIONS.has(faction))
  ) {
    return GameVersion.DiscordantStars
  }
  if (gameSets.includes('te')) {
    return GameVersion.ThundersEdge
  }
  if (gameSets.includes('pok')) {
    return GameVersion.PoK_Codex3
  }

  return GameVersion.Base
}

export function getTidraftSlug(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('Enter a valid TIDraft game URL.')
  }

  if (
    url.protocol !== 'https:' ||
    url.port ||
    url.username ||
    url.password ||
    !['tidraft.com', 'www.tidraft.com'].includes(url.hostname)
  ) {
    throw new Error('Enter a URL from tidraft.com.')
  }

  const match = url.pathname.match(/^\/draft\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)
  if (!match) {
    throw new Error(
      'Enter a TIDraft game URL, such as https://tidraft.com/draft/example.',
    )
  }

  return match[1]
}

function decodeLoaderData(serialized) {
  let table
  try {
    table = JSON.parse(serialized)
  } catch {
    throw new Error('TIDraft returned data that could not be read.')
  }

  if (!Array.isArray(table)) {
    throw new Error('TIDraft returned an unsupported data format.')
  }

  const cache = new Map()
  const resolving = new Set()
  const resolveReference = (reference) => {
    if (reference === -5) {
      return undefined
    }
    if (reference < 0) {
      return reference === -1
        ? Number.NaN
        : reference === -2
        ? Number.POSITIVE_INFINITY
        : reference === -3
        ? Number.NEGATIVE_INFINITY
        : reference === -4
        ? -0
        : undefined
    }
    if (!Number.isInteger(reference) || reference >= table.length) {
      throw new Error('TIDraft returned an invalid data reference.')
    }
    if (cache.has(reference)) {
      return cache.get(reference)
    }
    if (resolving.has(reference)) {
      throw new Error('TIDraft returned cyclic data that could not be read.')
    }

    resolving.add(reference)
    const value = table[reference]
    let resolved
    if (Array.isArray(value)) {
      resolved = value.map(resolveReference)
    } else if (value && typeof value === 'object') {
      resolved = Object.fromEntries(
        Object.entries(value).map(([key, child]) => {
          const keyIndex = Number(key.slice(1))
          const property = table[keyIndex]
          if (typeof property !== 'string') {
            throw new Error('TIDraft returned an invalid data field.')
          }

          return [property, resolveReference(child)]
        }),
      )
    } else {
      resolved = value
    }
    resolving.delete(reference)
    cache.set(reference, resolved)

    return resolved
  }

  return resolveReference(0)
}

export function parseTidraftImport(serialized) {
  const decoded = decodeLoaderData(serialized)
  const draft = decoded?.['routes/draft.$id._index']?.data?.data
  if (
    !draft ||
    !Array.isArray(draft.players) ||
    !Array.isArray(draft.selections)
  ) {
    throw new Error('The TIDraft URL did not contain a readable game.')
  }

  const players = new Map(
    draft.players.map(({ id, name }) => [
      id,
      typeof name === 'string' ? name.trim() : '',
    ]),
  )
  const factionByPlayer = new Map()
  const colorByPlayer = new Map()
  const positionByPlayer = new Map()

  draft.selections.forEach((selection) => {
    if (!players.has(selection.playerId)) {
      return
    }
    if (selection.type === 'SELECT_FACTION' && selection.factionId) {
      factionByPlayer.set(selection.playerId, selection.factionId)
    }
    if (selection.type === 'SELECT_PLAYER_COLOR' && selection.color) {
      colorByPlayer.set(selection.playerId, selection.color.toLowerCase())
    }
    if (
      selection.type === 'SELECT_SEAT' &&
      Number.isInteger(selection.seatIdx)
    ) {
      positionByPlayer.set(selection.playerId, selection.seatIdx)
    }
  })

  const importedPlayers = []
  Array.from(factionByPlayer.entries()).forEach(
    ([playerId, factionId], importOrder) => {
      const faction = FACTION_IDS[factionId.toLowerCase()]
      if (!faction) {
        throw new Error(
          `The TIDraft faction "${factionId}" is not supported yet.`,
        )
      }
      const playerName = players.get(playerId)
      if (!playerName) {
        throw new Error('Every selected faction must have a player name.')
      }
      const selectedColor = colorByPlayer.get(playerId)
      const color = PLAYER_COLORS[selectedColor]
      if (selectedColor && !color) {
        throw new Error(
          `The TIDraft color "${selectedColor}" is not supported yet.`,
        )
      }
      const position = positionByPlayer.get(playerId)
      importedPlayers.push({
        faction,
        playerName,
        importOrder,
        ...(color ? { color } : {}),
        ...(position !== undefined ? { position } : {}),
      })
    },
  )

  if (players.size < 4 || players.size > 8) {
    throw new Error('TIDraft must have 4 to 8 players to import.')
  }
  if (importedPlayers.length !== players.size) {
    throw new Error('Every player must have a selected faction to import.')
  }
  if (
    new Set(importedPlayers.map(({ faction }) => faction)).size !==
    importedPlayers.length
  ) {
    throw new Error('TIDraft contains duplicate faction selections.')
  }

  const seatPositions = importedPlayers
    .map(({ position }) => position)
    .filter((position) => position !== undefined)
  if (
    new Set(seatPositions).size !== seatPositions.length ||
    seatPositions.some(
      (position) => position < 0 || position >= importedPlayers.length,
    )
  ) {
    throw new Error('TIDraft contains invalid table positions.')
  }

  return {
    factions: [...importedPlayers]
      .sort(
        (first, second) =>
          (first.position ?? Number.MAX_SAFE_INTEGER) -
            (second.position ?? Number.MAX_SAFE_INTEGER) ||
          first.importOrder - second.importOrder,
      )
      .map(({ faction }) => faction),
    gameVersion: getTidraftGameVersion(
      importedPlayers.map(({ faction }) => faction),
      draft.settings?.factionGameSets,
    ),
    playerNames: Object.fromEntries(
      importedPlayers.map(({ faction, playerName }) => [faction, playerName]),
    ),
    colors: Object.fromEntries(
      importedPlayers
        .filter(({ color }) => color)
        .map(({ faction, color }) => [faction, color]),
    ),
  }
}
