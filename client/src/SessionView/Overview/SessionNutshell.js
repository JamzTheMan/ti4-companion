import { Grid } from '@material-ui/core'

import { useTranslation } from '../../i18n'
import { useSessionContext } from '../useSessionContext'

export function getSessionDetails(session, t) {
  return `${
    session.displayName &&
    `${session.displayName}, ${t('playersCount', {
      players: session.players?.length || session.draft?.players?.length,
    })}, ${t('vpCount', { points: session.vpCount })}${
      (session.start
        ? `, ${t('sessionView.overview.sessionStart', { when: session.start })}`
        : '')
    }`
  }`
}

export function SessionNutshell() {
  const { session } = useSessionContext()
  const { t } = useTranslation()

  return (
    <Grid
      alignItems="center"
      container
      justifyContent="center"
      spacing={1}
      style={{ color: 'white', textAlign: 'center' }}
    >
      <Grid item xs={12}>
        {getSessionDetails(session, t)}
      </Grid>
      {session.tidraftUrl && (
        <Grid item xs={12}>
          <a
            href={session.tidraftUrl}
            rel="noopener noreferrer"
            style={{ color: 'white' }}
            target="_blank"
          >
            <i>Imported from TIDraft</i>
          </a>
        </Grid>
      )}
    </Grid>
  )
}
