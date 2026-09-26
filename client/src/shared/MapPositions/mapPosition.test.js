import { getMapPositionColor, getMapPositionName } from './mapPosition'

describe('map position helpers', () => {
  it('returns imported table positions', () => {
    const mapPositions = [{ name: 'red', color: '#ff0000' }]

    expect(getMapPositionName({ mapPositions, position: 0 })).toBe('red')
    expect(getMapPositionColor({ mapPositions, position: 0 })).toBe('#ff0000')
  })

  it('handles unset and out-of-range positions', () => {
    const mapPositions = [{ name: 'red', color: '#ff0000' }]

    expect(getMapPositionName({ mapPositions, position: -1 })).toBe('')
    expect(getMapPositionColor({ mapPositions, position: -1 })).toBeNull()
    expect(getMapPositionName({ mapPositions, position: 3 })).toBe('P4')
    expect(getMapPositionColor({ mapPositions, position: 3 })).toBeNull()
  })
})
