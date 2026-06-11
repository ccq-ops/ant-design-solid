import * as Icons from '@ant-design-solid/icons'
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { IconGrid, allIcons, filledIcons, outlinedIcons, twoToneIcons } from '../../components/icon-list'

const iconExportNames = Object.keys(Icons)
  .filter(
    (name) => name.endsWith('Outlined') || name.endsWith('Filled') || name.endsWith('TwoTone'),
  )
  .sort()

describe('icon docs metadata', () => {
  it('lists every generated icon export exactly once', () => {
    const metadataNames = allIcons.map((icon) => icon.name).sort()

    expect(metadataNames).toEqual(iconExportNames)
    expect(new Set(metadataNames).size).toBe(metadataNames.length)
    expect(metadataNames).toHaveLength(831)
  })

  it('groups icons by generated component suffix', () => {
    expect(outlinedIcons).toHaveLength(447)
    expect(filledIcons).toHaveLength(234)
    expect(twoToneIcons).toHaveLength(150)

    expect(outlinedIcons.every((icon) => icon.category === 'Outlined')).toBe(true)
    expect(filledIcons.every((icon) => icon.category === 'Filled')).toBe(true)
    expect(twoToneIcons.every((icon) => icon.category === 'TwoTone')).toBe(true)
  })

  it('renders icon grid tiles with svg icons and component names', () => {
    const result = render(() => <IconGrid title="Outlined" icons={outlinedIcons.slice(0, 3)} />)

    expect(result.getByRole('heading', { name: 'Outlined' })).toBeInTheDocument()
    expect(result.getByText(outlinedIcons[0].name)).toBeInTheDocument()
    expect(result.container.querySelectorAll('svg')).toHaveLength(3)
  })
})
