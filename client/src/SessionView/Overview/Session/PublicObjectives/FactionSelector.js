import { useCallback } from 'react'
import { Grid } from '@material-ui/core'

import PlayerFlag from '../../../PlayerFlag'

function FactionSelector({ disabled, factions, value, onChange, size }) {
  const clicked = useCallback(
    (factionKey, selected) => {
      if (selected) {
        onChange({ factionKey, event: 'selected' })

        return
      }

      onChange({ factionKey, event: 'deselected' })
    },
    [onChange],
  )

  return (
    <Grid
      container
      direction={size === 'small' ? 'row' : 'column'}
      style={
        size === 'small'
          ? {
              display: 'grid',
              flexShrink: 0,
              gridTemplateColumns: 'repeat(2, 2.8em)',
              width: '5.6em',
            }
          : undefined
      }
    >
      {factions.map((factionKey) => (
        <PlayerFlag
          key={factionKey}
          disabled={disabled}
          factionKey={factionKey}
          height={{ small: '2.6em', fullscreen: '3.3vh' }[size] || '2em'}
          onClick={() => clicked(factionKey, !value.includes(factionKey))}
          selected={value.includes(factionKey)}
          width={size === 'small' ? '2.6em' : 'auto'}
        />
      ))}
    </Grid>
  )
}

export default FactionSelector
