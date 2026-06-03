import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Calendar } from '../calendar'

describe('Calendar', () => {
  afterEach(() => cleanup())

  it('renders a default month view with weekday headers and date cells', () => {
    render(() => <Calendar defaultValue="2026-06-15" />)

    expect(screen.getByText('2026-06')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2026-06-15' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: '2026-05-31' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2026-07-11' })).toBeInTheDocument()
  })

  it('selects an uncontrolled date and calls onSelect and onChange', () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    render(() => (
      <Calendar defaultValue="2026-06-15" onSelect={onSelect} onChange={onChange} />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))

    expect(onSelect).toHaveBeenLastCalledWith(expect.any(Date))
    expect(onChange).toHaveBeenLastCalledWith(expect.any(Date))
    expect(screen.getByRole('button', { name: '2026-06-20' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('does not call onChange when selecting the same date', () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    render(() => (
      <Calendar defaultValue="2026-06-15" onSelect={onSelect} onChange={onChange} />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))

    expect(onSelect).toHaveBeenLastCalledWith(expect.any(Date))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports controlled value updates through the parent', () => {
    function Demo() {
      const [value, setValue] = createSignal<Date | string | undefined>('2026-06-15')
      return <Calendar value={value()} onChange={(next) => setValue(next)} />
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByRole('button', { name: '2026-06-21' }))

    expect(screen.getByRole('button', { name: '2026-06-21' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('treats controlled undefined value as controlled', () => {
    const onChange = vi.fn()
    render(() => <Calendar value={undefined} defaultValue="2026-06-15" onChange={onChange} />)

    expect(screen.getByRole('button', { name: '2026-06-15' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    fireEvent.click(screen.getByRole('button', { name: '2026-06-21' }))

    expect(onChange).toHaveBeenLastCalledWith(expect.any(Date))
    expect(screen.getByRole('button', { name: '2026-06-21' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('does not select disabled dates', () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    render(() => (
      <Calendar
        defaultValue="2026-06-15"
        disabledDate={(date) => date.getDate() === 20}
        onSelect={onSelect}
        onChange={onChange}
      />
    ))

    const disabledDate = screen.getByRole('button', { name: '2026-06-20' })
    expect(disabledDate).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(disabledDate)

    expect(onSelect).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '2026-06-15' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('navigates panels and switches mode with onPanelChange', () => {
    const onPanelChange = vi.fn()
    render(() => <Calendar defaultValue="2026-06-15" onPanelChange={onPanelChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('2026-07')).toBeInTheDocument()
    expect(onPanelChange).toHaveBeenLastCalledWith(expect.any(Date), 'month')

    fireEvent.click(screen.getByRole('button', { name: 'Year mode' }))
    expect(screen.getByRole('button', { name: '2026-01' })).toBeInTheDocument()
    expect(onPanelChange).toHaveBeenLastCalledWith(expect.any(Date), 'year')
  })

  it('supports controlled mode', () => {
    function Demo() {
      const [mode, setMode] = createSignal<'month' | 'year'>('month')
      return (
        <Calendar
          defaultValue="2026-06-15"
          mode={mode()}
          onPanelChange={(_, next) => setMode(next)}
        />
      )
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByRole('button', { name: 'Year mode' }))

    expect(screen.getByRole('button', { name: '2026-01' })).toBeInTheDocument()
  })

  it('renders custom date and month cell content', () => {
    render(() => (
      <Calendar
        defaultValue="2026-06-15"
        dateCellRender={(date) => (date.getDate() === 15 ? <span>Event</span> : null)}
        monthCellRender={(date) => (date.getMonth() === 5 ? <span>Midyear</span> : null)}
      />
    ))

    expect(screen.getByText('Event')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Year mode' }))
    expect(screen.getByText('Midyear')).toBeInTheDocument()
  })

  it('supports full cell render overrides', () => {
    render(() => (
      <Calendar
        defaultValue="2026-06-15"
        dateFullCellRender={(date) =>
          date.getDate() === 15 ? <strong>Full date</strong> : date.getDate()
        }
        monthFullCellRender={(date) =>
          date.getMonth() === 5 ? (
            <strong>Full month</strong>
          ) : (
            date.toLocaleString('en-US', { month: 'short' })
          )
        }
      />
    ))

    expect(screen.getByText('Full date')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Year mode' }))
    expect(screen.getByText('Full month')).toBeInTheDocument()
  })

  it('supports custom header render callbacks', () => {
    render(() => (
      <Calendar
        defaultValue="2026-06-15"
        headerRender={({ onChange, onModeChange }) => (
          <div>
            <button type="button" onClick={() => onChange(new Date(2027, 0, 1))}>
              Jump
            </button>
            <button type="button" onClick={() => onModeChange('year')}>
              Show years
            </button>
          </div>
        )}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Jump' }))
    expect(screen.getByRole('button', { name: '2027-01-01' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show years' }))
    expect(screen.getByRole('button', { name: '2027-01' })).toBeInTheDocument()
  })

  it('applies mini and custom prefix classes', () => {
    const { container } = render(() => (
      <Calendar fullscreen={false} prefixCls="custom-calendar" defaultValue="2026-06-15" />
    ))

    expect(container.firstElementChild).toHaveClass('custom-calendar')
    expect(container.firstElementChild).toHaveClass('custom-calendar-mini')
  })
})
