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
    render(() => <Calendar defaultValue="2026-06-15" onSelect={onSelect} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))

    expect(onSelect).toHaveBeenLastCalledWith(expect.any(Date), { source: 'date' })
    expect(onChange).toHaveBeenLastCalledWith(expect.any(Date))
    expect(screen.getByRole('button', { name: '2026-06-20' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('does not call onChange when selecting the same date', () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    render(() => <Calendar defaultValue="2026-06-15" onSelect={onSelect} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))

    expect(onSelect).toHaveBeenLastCalledWith(expect.any(Date), { source: 'date' })
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

  it('supports v6 cellRender info for date and month cells', () => {
    const cellRender = vi.fn((date: Date, info) => (
      <span>
        {info.type}:{info.originNode}:{date.getDate()}
      </span>
    ))
    render(() => <Calendar defaultValue="2026-06-15" cellRender={cellRender} />)

    expect(screen.getByText('date:15:15')).toBeInTheDocument()
    expect(cellRender).toHaveBeenCalledWith(
      expect.any(Date),
      expect.objectContaining({
        prefixCls: 'ads-calendar',
        today: expect.any(Date),
        type: 'date',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Year mode' }))

    expect(screen.getByText('month:Jun:1')).toBeInTheDocument()
  })

  it('supports v6 fullCellRender info overrides', () => {
    render(() => (
      <Calendar
        defaultValue="2026-06-15"
        fullCellRender={(date, info) =>
          info.type === 'date' && date.getDate() === 15 ? (
            <strong>v6 full date</strong>
          ) : (
            info.originNode
          )
        }
      />
    ))

    expect(screen.getByText('v6 full date')).toBeInTheDocument()
  })

  it('passes select source info when selecting dates and months', () => {
    const onSelect = vi.fn()
    render(() => <Calendar defaultValue="2026-06-15" onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))
    expect(onSelect).toHaveBeenLastCalledWith(expect.any(Date), { source: 'date' })

    fireEvent.click(screen.getByRole('button', { name: 'Year mode' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-07' }))
    expect(onSelect).toHaveBeenLastCalledWith(expect.any(Date), { source: 'month' })
  })

  it('disables dates outside validRange', () => {
    const onSelect = vi.fn()
    render(() => (
      <Calendar
        defaultValue="2026-06-15"
        validRange={['2026-06-10', '2026-06-20']}
        onSelect={onSelect}
      />
    ))

    const beforeRange = screen.getByRole('button', { name: '2026-06-09' })
    const inRange = screen.getByRole('button', { name: '2026-06-10' })
    const afterRange = screen.getByRole('button', { name: '2026-06-21' })

    expect(beforeRange).toHaveAttribute('aria-disabled', 'true')
    expect(inRange).toHaveAttribute('aria-disabled', 'false')
    expect(afterRange).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(afterRange)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('renders week numbers when showWeek is true', () => {
    render(() => <Calendar defaultValue="2026-06-15" showWeek />)

    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(document.querySelector('.ads-calendar-week-number')).toHaveTextContent('22')
  })

  it('applies semantic classNames and styles', () => {
    const { container } = render(() => (
      <Calendar
        defaultValue="2026-06-15"
        rootClassName="calendar-root"
        classNames={{
          root: 'semantic-root',
          header: 'semantic-header',
          body: 'semantic-body',
          content: 'semantic-content',
          item: 'semantic-item',
          itemContent: 'semantic-item-content',
        }}
        styles={{
          root: { color: 'rgb(1, 2, 3)' },
          header: { color: 'rgb(4, 5, 6)' },
          body: { color: 'rgb(7, 8, 9)' },
          content: { color: 'rgb(10, 11, 12)' },
          item: { color: 'rgb(13, 14, 15)' },
          itemContent: { color: 'rgb(16, 17, 18)' },
        }}
        dateCellRender={(date) => (date.getDate() === 15 ? <span>Content</span> : null)}
      />
    ))

    expect(container.firstElementChild).toHaveClass('calendar-root')
    expect(container.firstElementChild).toHaveClass('semantic-root')
    expect(container.querySelector('.semantic-header')).toHaveStyle({ color: 'rgb(4, 5, 6)' })
    expect(container.querySelector('.semantic-body')).toHaveStyle({ color: 'rgb(7, 8, 9)' })
    expect(container.querySelector('.semantic-content')).toHaveStyle({ color: 'rgb(10, 11, 12)' })
    expect(screen.getByRole('button', { name: '2026-06-15' })).toHaveClass('semantic-item')
    expect(screen.getByText('Content').parentElement).toHaveClass('semantic-item-content')
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

  it('supports v6 custom header render callback names', () => {
    render(() => (
      <Calendar
        defaultValue="2026-06-15"
        headerRender={({ type, onChange, onTypeChange }) => (
          <div>
            <span>Panel type: {type}</span>
            <button type="button" onClick={() => onChange(new Date(2028, 0, 1))}>
              Jump v6
            </button>
            <button type="button" onClick={() => onTypeChange('year')}>
              Show years v6
            </button>
          </div>
        )}
      />
    ))

    expect(screen.getByText('Panel type: month')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Jump v6' }))
    expect(screen.getByRole('button', { name: '2028-01-01' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show years v6' }))
    expect(screen.getByRole('button', { name: '2028-01' })).toBeInTheDocument()
  })

  it('applies mini and custom prefix classes', () => {
    const { container } = render(() => (
      <Calendar fullscreen={false} prefixCls="custom-calendar" defaultValue="2026-06-15" />
    ))

    expect(container.firstElementChild).toHaveClass('custom-calendar')
    expect(container.firstElementChild).toHaveClass('custom-calendar-mini')
  })

  it('does not fix mini body height so month grids and custom cells stay inside the card', () => {
    render(() => <Calendar fullscreen={false} defaultValue="2026-06-15" />)

    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styleText).not.toMatch(
      /\.ads-calendar-mini\s+\.ads-calendar-body[^}]*(?:^|[;{])height:\s*256px/,
    )
    expect(styleText).toMatch(/\.ads-calendar-mini\s+\.ads-calendar-body[^}]*min-height:/)
  })

  it('keeps the calendar header title on one line', () => {
    render(() => <Calendar fullscreen={false} defaultValue="2026-06-15" />)

    const styleText = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styleText).toMatch(/\.ads-calendar-title[^}]*white-space:nowrap/)
  })
})
