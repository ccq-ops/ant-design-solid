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

  it('selects DatePicker and RangePicker presets including callback values', () => {
    const onDateChange = vi.fn()
    const onCallbackDateChange = vi.fn()
    const onRangeChange = vi.fn()
    const onCallbackRangeChange = vi.fn()

    render(() => (
      <>
        <DatePicker
          defaultOpen
          presets={[{ label: 'Today preset', value: dayjs('2026-06-01') }]}
          onChange={onDateChange}
        />
        <DatePicker
          defaultOpen
          presets={[{ label: 'Tomorrow preset', value: () => dayjs('2026-06-02') }]}
          onChange={onCallbackDateChange}
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
        <RangePicker
          defaultOpen
          presets={[
            {
              label: 'Callback June preset',
              value: [() => dayjs('2026-06-01'), () => dayjs('2026-06-30')],
            },
          ]}
          onChange={onCallbackRangeChange}
        />
      </>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Today preset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tomorrow preset' }))
    fireEvent.click(screen.getByRole('button', { name: 'June preset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Callback June preset' }))

    const [, dateString] = onDateChange.mock.lastCall as [Dayjs, string]
    const [, callbackDateString] = onCallbackDateChange.mock.lastCall as [Dayjs, string]
    const [, rangeStrings] = onRangeChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
    ]
    const [, callbackRangeStrings] = onCallbackRangeChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
    ]
    expect(dateString).toBe('2026-06-01')
    expect(callbackDateString).toBe('2026-06-02')
    expect(rangeStrings).toEqual(['2026-06-01', '2026-06-30'])
    expect(callbackRangeStrings).toEqual(['2026-06-01', '2026-06-30'])
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

  it('applies bordered, variant, size, and all semantic classNames/styles slots', () => {
    const firstResult = render(() => (
      <>
        <DatePicker bordered={false} />
        <DatePicker variant="outlined" />
        <DatePicker variant="borderless" />
        <DatePicker variant="underlined" />
        <DatePicker size="small" />
      </>
    ))

    const roots = firstResult.container.querySelectorAll('.ads-date-picker')
    expect(roots[0]).toHaveClass('ads-date-picker-borderless')
    expect(roots[1]).toHaveClass('ads-date-picker-outlined')
    expect(roots[2]).toHaveClass('ads-date-picker-borderless')
    expect(roots[3]).toHaveClass('ads-date-picker-underlined')
    expect(roots[4]).toHaveClass('ads-date-picker-sm')

    cleanup()
    document.body.innerHTML = ''

    const result = render(() => (
      <DatePicker
        defaultOpen
        defaultValue={dayjs('2026-06-01')}
        allowClear
        presets={[{ label: 'Slot preset', value: dayjs('2026-06-02') }]}
        renderExtraFooter={() => <span>slot footer</span>}
        cellRender={(current, info) => (
          <span data-testid={`slot-cell-${current.date()}`}>{info.originNode}</span>
        )}
        classNames={{
          root: 'slot-root',
          selector: 'slot-selector',
          clear: 'slot-clear',
          cell: 'slot-cell',
          presets: 'slot-presets',
          footer: 'slot-footer',
        }}
        styles={{
          root: { width: '222px' },
          selector: { height: '44px' },
          clear: { color: 'red' },
          cell: { color: 'blue' },
          presets: { margin: '3px' },
          footer: { padding: '5px' },
        }}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-date-picker')
    const selector = result.container.querySelector<HTMLElement>('.ads-date-picker-selector')
    const clear = result.container.querySelector<HTMLElement>('.ads-date-picker-clear')
    const presets = document.body.querySelector<HTMLElement>('.ads-date-picker-presets')
    const footer = document.body.querySelector<HTMLElement>('.ads-date-picker-footer')
    const cell = screen.getByRole('button', { name: '2026-06-01' })

    expect(root).toHaveClass('slot-root')
    expect(root?.style.width).toBe('222px')
    expect(selector).toHaveClass('slot-selector')
    expect(selector?.style.height).toBe('44px')
    expect(clear).toHaveClass('slot-clear')
    expect(clear?.style.color).toBe('red')
    expect(cell).toHaveClass('slot-cell')
    expect(cell.style.color).toBe('blue')
    expect(presets).toHaveClass('slot-presets')
    expect(presets?.style.margin).toBe('3px')
    expect(footer).toHaveClass('slot-footer')
    expect(footer?.style.padding).toBe('5px')
  })

  it('supports previousIcon alias and RangePicker visual icons', () => {
    render(() => (
      <RangePicker
        defaultOpen
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        allowClear={{ clearIcon: <span data-testid="range-clear-icon">clear</span> }}
        allowEmpty={[true, true]}
        prefix={<span data-testid="range-prefix-icon">prefix</span>}
        suffixIcon={<span data-testid="range-suffix-icon">suffix</span>}
        previousIcon={<span data-testid="range-prev-icon">prev</span>}
        nextIcon={<span data-testid="range-next-icon">next</span>}
      />
    ))

    expect(screen.getByTestId('range-prefix-icon')).toBeInTheDocument()
    expect(screen.getByTestId('range-suffix-icon')).toBeInTheDocument()
    expect(screen.getAllByTestId('range-clear-icon')).toHaveLength(2)
    expect(screen.getByTestId('range-prev-icon')).toBeInTheDocument()
    expect(screen.getByTestId('range-next-icon')).toBeInTheDocument()
  })

  it('passes originNode to month and year cellRender', () => {
    const { unmount } = render(() => (
      <DatePicker
        picker="month"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        cellRender={(current, info) => (
          <span data-testid={`month-cell-${current.month()}`}>{info.originNode}</span>
        )}
      />
    ))

    expect(screen.getByTestId('month-cell-5')).toHaveTextContent('2026-06')

    unmount()
    cleanup()
    document.body.innerHTML = ''

    render(() => (
      <DatePicker
        picker="year"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        cellRender={(current, info) => (
          <span data-testid={`year-cell-${current.year()}`}>{info.originNode}</span>
        )}
      />
    ))

    expect(screen.getByTestId('year-cell-2026')).toHaveTextContent('2026')
  })

  it('passes active range metadata to RangePicker cellRender', () => {
    render(() => (
      <RangePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        cellRender={(current, info) =>
          current.format('YYYY-MM-DD') === '2026-06-01' ? (
            <span data-testid="range-cell">{info.range}</span>
          ) : (
            info.originNode
          )
        }
      />
    ))

    expect(screen.getByTestId('range-cell')).toHaveTextContent('start')

    fireEvent.focus(screen.getAllByRole('textbox')[1])

    expect(screen.getByTestId('range-cell')).toHaveTextContent('end')
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

  it('supports RangePicker inputReadOnly and imperative focus/blur ref methods', () => {
    // Solid assigns component refs through JSX at runtime.
    // oxlint-disable-next-line no-unassigned-vars
    let ref: DatePickerRef | undefined
    render(() => <RangePicker inputReadOnly ref={ref} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveAttribute('readonly')

    ref?.focus()
    expect(document.activeElement).toBe(inputs[0])

    ref?.blur()
    expect(document.activeElement).not.toBe(inputs[0])
  })

  it('supports super navigation icons, onSelect, showWeek, components, and owns non-dom props', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <DatePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        showWeek
        previewValue={dayjs('2026-06-10')}
        onSelect={onSelect}
        superPrevIcon={<span data-testid="super-prev-icon">super prev</span>}
        superNextIcon={<span data-testid="super-next-icon">super next</span>}
        components={{
          input: (props) => (
            <div data-testid="custom-input-wrapper">
              <input
                aria-label={props.ariaLabel ?? 'custom input'}
                value={props.value}
                ref={props.inputRef}
                onInput={props.onInput}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                onKeyDown={props.onKeyDown}
              />
            </div>
          ),
          panel: (props) => <section aria-label="components panel">{props.children}</section>,
          unsupported: () => <span data-testid="unsupported-component" />,
        }}
      />
    ))

    const root = result.container.firstElementChild
    expect(root).not.toHaveAttribute('previewValue')
    expect(root).not.toHaveAttribute('components')
    expect(screen.getByTestId('custom-input-wrapper')).toBeInTheDocument()
    expect(screen.getByLabelText('components panel')).toBeInTheDocument()
    expect(screen.queryByTestId('unsupported-component')).not.toBeInTheDocument()
    expect(screen.getByTestId('super-prev-icon')).toBeInTheDocument()
    expect(screen.getByTestId('super-next-icon')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    const [selected] = onSelect.mock.lastCall as [Dayjs]
    expect(selected.format('YYYY-MM-DD')).toBe('2026-06-15')
  })

  it('uses super navigation icons for DatePicker year jumps', () => {
    render(() => (
      <DatePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        superPrevIcon={<span>super-prev</span>}
        superNextIcon={<span>super-next</span>}
      />
    ))

    fireEvent.click(screen.getByText('super-next'))

    expect(screen.getByText('2027-06')).toBeInTheDocument()

    fireEvent.click(screen.getByText('super-prev'))

    expect(screen.getByText('2026-06')).toBeInTheDocument()
  })

  it('uses super navigation icons for RangePicker date mode year jumps', () => {
    render(() => (
      <RangePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        superNextIcon={<span>range-super-next</span>}
      />
    ))

    fireEvent.click(screen.getByText('range-super-next'))

    expect(screen.getByText('2027-06')).toBeInTheDocument()
  })

  it('does not forward common owned props from RangePicker to the root DOM element', () => {
    const result = render(() => (
      <RangePicker
        previewValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        components={{
          input: (props) => <input aria-label="range custom input" ref={props.inputRef} />,
        }}
        superPrevIcon={<span />}
        superNextIcon={<span />}
      />
    ))

    expect(result.container.firstElementChild).not.toHaveAttribute('previewValue')
    expect(result.container.firstElementChild).not.toHaveAttribute('components')
    expect(result.container.firstElementChild).not.toHaveAttribute('superPrevIcon')
    expect(result.container.firstElementChild).not.toHaveAttribute('superNextIcon')
  })
})
