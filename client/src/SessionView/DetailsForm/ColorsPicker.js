import { Typography, Grid, TextField } from '@material-ui/core'

import { useTranslation, Trans } from '../../i18n'
import { ColorPicker } from '../../shared/ColorPicker'
import PlayerFlag from '../PlayerFlag'

export function ColorsPicker({
  colors,
  players,
  onChange,
  playerNames,
  onPlayerNamesChange,
  disabled,
}) {
  const { t } = useTranslation()

  return (
    <>
      <Grid item xs={12}>
        <Typography>
          <Trans i18nKey="sessionDetails.colorsPicker.sectionTitle" />
        </Typography>
      </Grid>
      {players.map(({ faction: factionKey, playerName }) => (
        <Grid
          key={factionKey}
          item
          md={3}
          sm={6}
          style={{ display: 'flex' }}
          xs={12}
        >
          <PlayerFlag
            disabled
            factionKey={factionKey}
            height="56px"
            selected
            width="66px"
          />
          <TextField
            color="secondary"
            disabled={disabled}
            label={t(`factions.${factionKey}.name`)}
            onChange={(event) =>
              onPlayerNamesChange((oldNames) => ({
                ...oldNames,
                [factionKey]: event.currentTarget.value,
              }))
            }
            value={playerNames[factionKey] ?? playerName ?? ''}
            variant="filled"
          />
          <ColorPicker
            color={colors[factionKey] || null}
            disabled={disabled}
            onChange={(value) => {
              onChange((oldColors) => {
                const factionWithThisColor = Object.entries(oldColors).find(
                  ([, colorName]) => colorName === value,
                )

                return {
                  ...oldColors,
                  ...(factionWithThisColor
                    ? { [factionWithThisColor[0]]: '' }
                    : {}),
                  [factionKey]: value,
                }
              })
            }}
            style={{ marginLeft: '0.3em' }}
          />
        </Grid>
      ))}
    </>
  )
}
