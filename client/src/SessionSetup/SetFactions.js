import { useMemo, useCallback, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Container,
  Fab,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { Check } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { generatePath, useHistory } from 'react-router-dom'

import { Trans } from '../i18n'
import { SESSION_VIEW_ROUTES } from '../shared/constants'
import sessionFactory from '../shared/sessionService'
import { useFetch } from '../useFetch'
import { GameVersionPicker, useFactionsData } from '../GameComponents'
import CONFIG from '../config'
import { handleErrors } from '../shared/errorHandling'

import { PasswordProtectionDialog } from './PasswordProtectionDialog'
import {
  getTidraftSessionName,
  getTidraftSlug,
  parseTidraftImport,
} from './tidraftImport'

const useStyles = makeStyles({
  root: {
    color: 'white',
  },
  fab: {
    position: 'sticky',
    right: '1em',
    bottom: '1em',
    zIndex: 1199,
    float: 'right',
  },
  containedButton: {
    '&:not(.MuiButton-containedSecondary)': {
      backgroundColor: 'white',
    },
  },
})

export function SetFactions() {
  const classes = useStyles()

  const [gameVersion, setGameVersion] = useState()
  const [selectedFactions, setSelected] = useState([])
  const [playerNames, setPlayerNames] = useState({})
  const [colors, setColors] = useState({})
  const [sessionDisplayName, setSessionDisplayName] = useState('')
  const [tidraftImportUrl, setTidraftImportUrl] = useState('')
  const [tidraftUrl, setTidraftUrl] = useState('')
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const isSelected = useCallback(
    (factionKey) => selectedFactions.includes(factionKey),
    [selectedFactions],
  )
  const toggleSelection = useCallback(
    (factionKey) =>
      isSelected(factionKey)
        ? setSelected((selected) =>
            selected.filter((faction) => faction !== factionKey),
          )
        : setSelected((selected) => [...selected, factionKey]),
    [setSelected, isSelected],
  )

  const [passwordProtectionDialogOpen, setPasswordProtectionDialogOpen] =
    useState(false)
  const openPasswordProtectionDialog = useCallback(() => {
    setPasswordProtectionDialogOpen(true)
  }, [])

  const history = useHistory()
  const { fetch } = useFetch()
  const sessionService = useMemo(() => sessionFactory({ fetch }), [fetch])
  const createGameSession = useCallback(
    async ({ password }) => {
      setPasswordProtectionDialogOpen(false)
      const session = await sessionService.createSession({
        setupType: 'simple',
        gameVersion,
        factions: selectedFactions,
        playerNames,
        colors,
        sessionDisplayName,
        tidraftUrl: tidraftImportUrl,
        password,
      })
      history.push(
        generatePath(SESSION_VIEW_ROUTES.main, {
          sessionId: session.id,
        }),
        { secret: session.secret },
      )
    },
    [
      history,
      selectedFactions,
      sessionService,
      gameVersion,
      playerNames,
      colors,
      sessionDisplayName,
      tidraftImportUrl,
    ],
  )

  const { factions: factionsList } = useFactionsData(gameVersion)
  const importTidraftGame = useCallback(async () => {
    setImportError('')
    setImporting(true)
    try {
      const slug = getTidraftSlug(tidraftUrl.trim())
      const response = await fetch(`${CONFIG.apiUrl}/api/tidraft/${slug}`)
      const loaderData = await handleErrors(response).then((r) => r.text())
      const imported = parseTidraftImport(loaderData)
      const url = new URL(tidraftUrl.trim())

      setSelected(imported.factions)
      setPlayerNames(imported.playerNames)
      setColors(imported.colors)
      setSessionDisplayName(getTidraftSessionName(url.toString()))
      setTidraftImportUrl(`${url.origin}${url.pathname}`)
      setGameVersion(imported.gameVersion)
    } catch (error) {
      setImportError(error.message || 'Unable to import this TIDraft game.')
    } finally {
      setImporting(false)
    }
  }, [fetch, tidraftUrl])

  return (
    <>
      <GameVersionPicker onChange={setGameVersion} value={gameVersion} />

      <Box className={classes.root} mb={2}>
        <Container>
          <Typography variant="h4">
            <Trans i18nKey="sessionSetup.simple.title" />
          </Typography>
        </Container>
      </Box>

      <Box mb={4}>
        <Typography variant="h6">Import from TIDraft</Typography>
        <Typography variant="body2">
          Imports factions, player names, colors, and table order. Slices are
          not imported.
        </Typography>
        <Grid container alignItems="center" spacing={2}>
          <Grid item sm={8} xs={12}>
            <TextField
              fullWidth
              label="TIDraft game URL"
              onChange={(event) => setTidraftUrl(event.currentTarget.value)}
              value={tidraftUrl}
              variant="filled"
            />
          </Grid>
          <Grid item>
            <Button
              color="secondary"
              disabled={importing || !tidraftUrl.trim()}
              onClick={importTidraftGame}
              variant="contained"
            >
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </Grid>
          {importError && (
            <Grid item xs={12}>
              <Alert severity="error">{importError}</Alert>
            </Grid>
          )}
        </Grid>
      </Box>

      <Grid container justifyContent="center" spacing={4}>
        {factionsList.map((faction) => (
          <Grid key={faction.key} item lg={3} md={4} sm={6} xs={12}>
            <Button
              className={classes.containedButton}
              color={isSelected(faction.key) ? 'secondary' : 'default'}
              fullWidth
              onClick={() => toggleSelection(faction.key)}
              startIcon={<Avatar alt={faction.name} src={faction.image} />}
              variant="contained"
            >
              <>
                <Trans i18nKey={`factions.${faction.key}.name`} />
                {playerNames[faction.key] && ` (${playerNames[faction.key]})`}
              </>
            </Button>
          </Grid>
        ))}
      </Grid>
      <Fab
        aria-label="add"
        className={classes.fab}
        color="secondary"
        disabled={selectedFactions.length < 4 || selectedFactions.length > 8}
        onClick={openPasswordProtectionDialog}
      >
        <Check />
      </Fab>
      <PasswordProtectionDialog
        callback={createGameSession}
        onClose={() => setPasswordProtectionDialogOpen(false)}
        open={passwordProtectionDialogOpen}
      />
    </>
  )
}
