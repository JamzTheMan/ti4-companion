export function getMapPositionName({ mapPositions, position, suffix }) {
  const positionIndex = Number(position)
  if (!Number.isInteger(positionIndex) || positionIndex < 0) {
    return ''
  }

  const defaultNameSuffix = suffix ? ` ${suffix ?? 'on map'}` : ''

  const positionName =
    mapPositions?.[positionIndex]?.name ??
    `P${positionIndex + 1}${defaultNameSuffix}`

  return positionName
}

export function getMapPositionColor({ mapPositions, position }) {
  const positionIndex = Number(position)
  if (!Number.isInteger(positionIndex) || positionIndex < 0) {
    return null
  }

  return mapPositions?.[positionIndex]?.color ?? null
}
