import * as Icons from '@ant-design-solid/solid-icons'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import {
  IconGrid,
  IconSearch,
  allIcons,
  filledIcons,
  outlinedIcons,
  twoToneIcons,
} from '../../components/icon-list'

const iconExportNames = Object.keys(Icons)
  .filter(
    (name) => name.endsWith('Outlined') || name.endsWith('Filled') || name.endsWith('TwoTone'),
  )
  .sort()

describe('icon docs metadata', () => {
  it('keeps icon docs examples free of fixed demo colors', () => {
    const source = readFileSync(join(process.cwd(), 'src/routes/components/icon.mdx'), 'utf8')

    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}|hotpink/)
  })

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

  it('renders the icon search with default outlined categories and theme switching', () => {
    const result = render(() => <IconSearch />)

    expect(result.getByPlaceholderText('Search icons')).toBeInTheDocument()
    expect(result.getByRole('radio', { name: /outlined/i })).toHaveAttribute('aria-checked', 'true')
    expect(result.getByRole('heading', { name: 'Directional Icons' })).toBeInTheDocument()
    expect(result.getByText('HomeOutlined')).toBeInTheDocument()

    fireEvent.click(result.getByRole('radio', { name: /filled/i }))

    expect(result.getByRole('radio', { name: /filled/i })).toHaveAttribute('aria-checked', 'true')
    expect(result.getByText('HomeFilled')).toBeInTheDocument()
    expect(result.queryByText('HomeOutlined')).not.toBeInTheDocument()
  })

  it('filters icons by name and JSX-like search input', () => {
    const result = render(() => <IconSearch />)
    const search = result.getByPlaceholderText('Search icons')

    fireEvent.input(search, { target: { value: 'home' } })

    expect(result.getByText('HomeOutlined')).toBeInTheDocument()
    expect(result.queryByText('SmileOutlined')).not.toBeInTheDocument()

    fireEvent.input(search, { target: { value: '<SmileOutlined />' } })

    expect(result.getByText('SmileOutlined')).toBeInTheDocument()
    expect(result.queryByText('HomeOutlined')).not.toBeInTheDocument()
  })

  it('copies JSX usage when an icon tile is clicked', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.assign(navigator, { clipboard: { writeText } })
    const result = render(() => <IconSearch />)

    fireEvent.click(result.getByRole('button', { name: 'Copy HomeOutlined' }))

    expect(writeText).toHaveBeenCalledWith('<HomeOutlined />')
    await waitFor(() => expect(result.getByText('Copied!')).toBeInTheDocument())
  })
})
