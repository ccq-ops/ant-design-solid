import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePicker, RangePicker } from '..'
import type { DatePickerRef } from '../interface'

describe('DatePicker custom rendering and visual APIs', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('supports cellRender, dateRender fallback, renderExtraFooter, and panelRender', () => {
    const { unmount } = render(() => (
      <DatePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        cellRender={(current, info) => (
          <span data-testid={`cell-${current.date()}`}>{info.originNode}</span>
        )}
        renderExtraFooter={() => <span>extra footer</span>}
        panelRender={(panel) => <section aria-label="wrapped panel">{panel}</section>}
      />
    ))

    expect(screen.getByLabelText('wrapped panel')).toBeInTheDocument()
    expect(screen.getByText('extra footer')).toBeInTheDocument()
    expect(screen.getByTestId('cell-1')).toHaveTextContent('1')

    unmount()
    cleanup()
    document.body.innerHTML = ''

    render(() => (
      <DatePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        dateRender={(current) => <strong>{current.date()}</strong>}
      />
    ))

    const dateButton = screen.getByRole('button', { name: '2026-06-01' })
    expect(dateButton.querySelector('strong')).toHaveTextContent('1')
  })

  it('selects DatePicker and RangePicker presets', () => {
    const onDateChange = vi.fn()
    const onRangeChange = vi.fn()

    render(() => (
      <>
        <DatePicker
          defaultOpen
          presets={[{ label: 'Today preset', value: dayjs('2026-06-01') }]}
          onChange={onDateChange}
        />
        <RangePicker
          defaultOpen
          presets={[
            {
              label: 'June preset',
              value: [dayjs('2026-06-01'), dayjs('2026-06-30')],
            },
          ]}
          onChange={onRangeChange}
        />
      </>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Today preset' }))
    fireEvent.click(screen.getByRole('button', { name: 'June preset' }))

    const [, dateString] = onDateChange.mock.lastCall as [Dayjs, string]
    const [, rangeStrings] = onRangeChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
    ]
    expect(dateString).toBe('2026-06-01')
    expect(rangeStrings).toEqual(['2026-06-01', '2026-06-30'])
  })

  it('applies semantic classes, styles, status, variant, size, and custom icons', () => {
    const result = render(() => (
      <DatePicker
        defaultOpen
        defaultValue={dayjs('2026-06-01')}
        status="error"
        variant="filled"
        size="large"
        allowClear={{ clearIcon: <span data-testid="clear-icon">clear</span> }}
        prefix={<span data-testid="prefix-icon">prefix</span>}
        suffixIcon={<span data-testid="suffix-icon">suffix</span>}
        prevIcon={<span data-testid="prev-icon">prev</span>}
        nextIcon={<span data-testid="next-icon">next</span>}
        classNames={{ popup: 'custom-popup', input: 'custom-input' }}
        styles={{ popup: { width: '360px' } }}
      />
    ))

    const root = result.container.querySelector('.ads-date-picker')
    expect(root).toHaveClass('ads-date-picker-status-error')
    expect(root).toHaveClass('ads-date-picker-filled')
    expect(root).toHaveClass('ads-date-picker-lg')
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument()
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument()
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
    expect(screen.getByTestId('prev-icon')).toBeInTheDocument()
    expect(screen.getByTestId('next-icon')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('custom-input')

    const popup = document.body.querySelector<HTMLElement>('.ads-date-picker-dropdown')
    expect(popup).toHaveClass('custom-popup')
    expect(popup?.style.width).toBe('360px')
  })

  it('supports inputReadOnly and imperative focus/blur ref methods', () => {
    // Solid assigns component refs through JSX at runtime.
    // oxlint-disable-next-line no-unassigned-vars
    let ref: DatePickerRef | undefined
    render(() => <DatePicker inputReadOnly ref={ref} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')

    ref?.focus()
    expect(document.activeElement).toBe(input)

    ref?.blur()
    expect(document.activeElement).not.toBe(input)
  })
})
