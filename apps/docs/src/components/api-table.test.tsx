import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ApiTable } from './api-table'

const rows = [
  {
    property: 'disabled',
    description: 'Disables user interaction.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'children',
    description: 'Content rendered inside the component.',
    type: 'JSX.Element',
  },
]

describe('ApiTable', () => {
  it('renders accessible table headers and row content', () => {
    const result = render(() => <ApiTable rows={rows} aria-label="Button API" />)

    expect(result.getByRole('table', { name: 'Button API' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Property' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Default' })).toBeInTheDocument()
    expect(result.getByText('disabled')).toBeInTheDocument()
    expect(result.getByText('Disables user interaction.')).toBeInTheDocument()
    expect(result.getByText('boolean')).toBeInTheDocument()
    expect(result.getByText('false')).toBeInTheDocument()
  })

  it('uses a dash when defaultValue is omitted', () => {
    const result = render(() => <ApiTable rows={rows} />)

    expect(result.getByText('children')).toBeInTheDocument()
    expect(result.getAllByText('-').length).toBeGreaterThan(0)
  })
})
