import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePicker, RangePicker } from '..'
import { ConfigProvider } from '../../config-provider'
import type { DatePickerRef } from '../interface'

describe('DatePicker custom rendering and visual APIs', () => {
  it('keeps selected and range endpoint text visible on hover and active states', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} />
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain(
      '.ads-date-picker-cell:not(.ads-date-picker-cell-selected):not(.ads-date-picker-cell-range-start):not(.ads-date-picker-cell-range-end):hover{background:rgba(0,0,0,0.04);',
    )
    expect(css).toContain(
      '.ads-date-picker-cell-selected:hover, .ads-date-picker-cell-selected:active{background:#1677ff;color:#ffffff;',
    )
    expect(css).toContain(
      '.ads-date-picker-cell-range-start:hover, .ads-date-picker-cell-range-start:active, .ads-date-picker-cell-range-end:hover, .ads-date-picker-cell-range-end:active{background:#1677ff;color:#ffffff;',
    )
    expect(css).not.toContain('.ads-date-picker-cell:hover{background:rgba(0,0,0,0.02);')
  })

  it('aligns week and variant picker cell styles with antd panels', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <DatePicker picker="month" defaultOpen defaultValue={dayjs('2026-06-01')} />
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain(
      '.ads-date-picker-variant-cell{align-items:center;background:transparent;display:inline-flex;height:66px;justify-content:center;width:100%;',
    )
    expect(css).toContain('.ads-date-picker-cell-inner{')
    expect(css).toContain('align-items:center;border-radius:6px;')
    expect(css).toContain('display:inline-flex;height:24px;justify-content:center;')
    expect(css).toContain('min-width:24px;padding:0 8px;')
    expect(css).toContain(
      '.ads-date-picker-variant-cell.ads-date-picker-cell-selected .ads-date-picker-cell-inner{background:#1677ff;color:#ffffff;',
    )
    expect(css).toContain(
      '.ads-date-picker-week-row:hover .ads-date-picker-cell:not(.ads-date-picker-cell-selected):not(.ads-date-picker-cell-disabled){background:rgba(0,0,0,0.04);',
    )
  })

  it('keeps suffix icon visible and overlays clear icon on selector hover', () => {
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <DatePicker
          defaultValue={dayjs('2026-06-01')}
          allowClear={{ clearIcon: <span data-testid="clear-icon">clear</span> }}
        />
      </StyleProvider>
    ))

    const selector = result.container.querySelector<HTMLElement>('.ads-date-picker-selector')
    const suffix = result.container.querySelector<HTMLElement>('.ads-date-picker-suffix')
    const clear = result.container.querySelector<HTMLElement>('.ads-date-picker-clear')
    const css = extractStyle(cache)

    expect(selector).toContainElement(suffix)
    expect(selector).toContainElement(clear)
    expect(suffix?.querySelector('svg')).toBeInTheDocument()
    expect(clear).toHaveClass('ads-date-picker-clear-overlay')
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
    expect(css).toContain('.ads-date-picker-clear-overlay{')
    expect(css).toContain('background:#ffffff;')
    expect(css).toContain('position:absolute;')
    expect(css).toContain('opacity:0;pointer-events:none;')
    expect(css).toContain(
      '.ads-date-picker-filled .ads-date-picker-clear-overlay{background:rgba(0,0,0,0.02);',
    )
    expect(css).toContain(
      '.ads-date-picker-selector:hover .ads-date-picker-clear-overlay, .ads-date-picker-selector:focus-within .ads-date-picker-clear-overlay{opacity:1;pointer-events:auto;',
    )
  })

  it('consumes DatePicker component token overrides', () => {
    const cache = createCache()
    render(() => (
      <ConfigProvider
        theme={{
          components: {
            DatePicker: {
              cellWidth: 44,
              cellActiveWithRangeBg: '#abcdef',
              timeColumnHeight: 180,
            },
          },
        }}
      >
        <StyleProvider cache={cache}>
          <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} />
        </StyleProvider>
      </ConfigProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain('width:44px')
    expect(css).toContain('background:#abcdef')
    expect(css).toContain('height:180px')
  })

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

  it('shows a default Today shortcut for DatePicker panels', () => {
    const cache = createCache()
    const onChange = vi.fn()
    render(() => (
      <StyleProvider cache={cache}>
        <DatePicker defaultOpen onChange={onChange} />
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    expect(document.body.querySelector('.ads-date-picker-footer')).toHaveClass(
      'ads-date-picker-footer-centered',
    )
    expect(css).toContain('.ads-date-picker-footer-centered{justify-content:center;')
    expect(css).toContain(
      '.ads-date-picker-footer-centered .ads-date-picker-footer-extra{justify-content:center;width:100%;',
    )
    expect(css).toContain(
      '.ads-date-picker-footer-centered .ads-date-picker-today{justify-content:center;width:100%;',
    )
    expect(css).toContain(
      '.ads-date-picker-today, .ads-date-picker-now{align-items:center;background:transparent;border:0;color:#1677ff;cursor:pointer;display:inline-flex;line-height:1;padding:0;',
    )
    expect(css).toContain(
      '.ads-date-picker-today:disabled{color:rgba(0,0,0,0.25);cursor:not-allowed;pointer-events:none;',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Today' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextString).toBe(dayjs().format('YYYY-MM-DD'))
  })

  it('disables the default Today shortcut when today is disabled', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        defaultOpen
        disabledDate={(current) => current.isSame(dayjs(), 'day')}
        onChange={onChange}
      />
    ))

    const todayButton = screen.getByRole('button', { name: 'Today' })
    expect(todayButton).toBeDisabled()

    fireEvent.click(todayButton)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('hides the default Today shortcut outside date picker panels', () => {
    const { unmount } = render(() => (
      <>
        <DatePicker picker="week" defaultOpen />
        <DatePicker picker="month" defaultOpen />
        <DatePicker picker="quarter" defaultOpen />
        <DatePicker picker="year" defaultOpen />
      </>
    ))

    expect(screen.queryByRole('button', { name: 'Today' })).toBeNull()

    unmount()
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

  it('applies variant, size, and function semantic classNames/styles slots', () => {
    const firstResult = render(() => (
      <>
        <DatePicker variant="outlined" />
        <DatePicker variant="borderless" />
        <DatePicker variant="underlined" />
        <DatePicker size="small" />
        <DatePicker size="medium" />
      </>
    ))

    const roots = firstResult.container.querySelectorAll('.ads-date-picker')
    expect(roots[0]).toHaveClass('ads-date-picker-outlined')
    expect(roots[1]).toHaveClass('ads-date-picker-borderless')
    expect(roots[2]).toHaveClass('ads-date-picker-underlined')
    expect(roots[3]).toHaveClass('ads-date-picker-sm')
    expect(roots[4]).toHaveClass('ads-date-picker-md')

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
        class="slot-root"
        classNames={(info) => ({
          root: info.props.class,
          selector: 'slot-selector',
          clear: 'slot-clear',
          cell: 'slot-cell',
          presets: 'slot-presets',
          footer: 'slot-footer',
          popup: 'slot-popup',
        })}
        styles={() => ({
          root: { width: '222px' },
          selector: { height: '44px' },
          clear: { color: 'red' },
          cell: { color: 'blue' },
          presets: { margin: '3px' },
          footer: { padding: '5px' },
          popup: { width: '333px' },
        })}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-date-picker')
    const selector = result.container.querySelector<HTMLElement>('.ads-date-picker-selector')
    const clear = result.container.querySelector<HTMLElement>('.ads-date-picker-clear')
    const presets = document.body.querySelector<HTMLElement>('.ads-date-picker-presets')
    const footer = document.body.querySelector<HTMLElement>('.ads-date-picker-footer')
    const popup = document.body.querySelector<HTMLElement>('.ads-date-picker-dropdown')
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
    expect(popup).toHaveClass('slot-popup')
    expect(popup?.style.width).toBe('333px')
  })

  it('supports RangePicker visual icons with prevIcon', () => {
    render(() => (
      <RangePicker
        defaultOpen
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        allowClear={{ clearIcon: <span data-testid="range-clear-icon">clear</span> }}
        allowEmpty={[true, true]}
        prefix={<span data-testid="range-prefix-icon">prefix</span>}
        suffixIcon={<span data-testid="range-suffix-icon">suffix</span>}
        prevIcon={<span data-testid="range-prev-icon">prev</span>}
        nextIcon={<span data-testid="range-next-icon">next</span>}
      />
    ))

    expect(screen.getByTestId('range-prefix-icon')).toBeInTheDocument()
    expect(screen.getByTestId('range-suffix-icon')).toBeInTheDocument()
    expect(screen.getAllByTestId('range-clear-icon')).toHaveLength(3)
    expect(screen.getByTestId('range-prev-icon')).toBeInTheDocument()
    expect(screen.getByTestId('range-next-icon')).toBeInTheDocument()
  })

  it('overlays the full range clear icon on the fixed suffix icon', () => {
    const result = render(() => (
      <RangePicker
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        allowClear={{ clearIcon: <span data-testid="range-clear-icon">clear</span> }}
      />
    ))

    const selector = result.container.querySelector<HTMLElement>('.ads-date-picker-selector')
    const suffix = result.container.querySelector<HTMLElement>('.ads-date-picker-suffix')
    const clearButtons = result.container.querySelectorAll<HTMLElement>('.ads-date-picker-clear')
    const fullClear = Array.from(clearButtons).find((button) =>
      button.classList.contains('ads-date-picker-clear-overlay'),
    )

    expect(selector).toContainElement(suffix)
    expect(selector).toContainElement(fullClear ?? null)
    expect(suffix?.querySelector('svg')).toBeInTheDocument()
    expect(fullClear).toHaveAttribute('aria-label', 'Clear date range')
    expect(screen.getByTestId('range-clear-icon')).toBeInTheDocument()
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

  it('localizes panel navigation button accessible labels', () => {
    render(() => (
      <DatePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        locale={{
          lang: {
            previousMonth: '上个月',
            nextMonth: '下个月',
            previousYear: '上一年',
            nextYear: '下一年',
          },
        }}
      />
    ))

    expect(screen.getByRole('button', { name: '上个月' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下个月' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一年' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一年' })).toBeInTheDocument()
  })

  it('localizes DatePicker clear button accessible label', () => {
    render(() => (
      <DatePicker
        allowClear
        defaultValue={dayjs('2026-06-01')}
        locale={{ lang: { clear: '清除' } }}
      />
    ))

    expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument()
  })

  it('localizes RangePicker clear button accessible labels', () => {
    render(() => (
      <RangePicker
        allowClear
        allowEmpty={[true, true]}
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        locale={{ lang: { clearStart: '清除开始日期', clearEnd: '清除结束日期' } }}
      />
    ))

    expect(screen.getByRole('button', { name: '清除开始日期' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清除结束日期' })).toBeInTheDocument()
  })

  it('localizes showTime now and ok panel actions', () => {
    render(() => (
      <DatePicker showTime showNow defaultOpen locale={{ lang: { now: '现在', ok: '确定' } }} />
    ))

    expect(screen.getByRole('button', { name: '现在' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument()
  })

  it('localizes showWeek column header', () => {
    render(() => (
      <DatePicker
        showWeek
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        locale={{ lang: { week: '周' } }}
      />
    ))

    expect(screen.getByText('周')).toBeInTheDocument()
  })

  it('localizes time column accessible labels', () => {
    render(() => (
      <DatePicker
        showTime
        defaultOpen
        defaultValue={dayjs('2026-06-01 09:30:00')}
        locale={{ lang: { hour: '小时', minute: '分钟', second: '秒' } }}
      />
    ))

    expect(screen.getByRole('button', { name: '小时 09' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '分钟 30' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '秒 00' })).toBeInTheDocument()
  })

  it('supports super navigation icons, onSelect, showWeek, components, and owns non-dom props', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <DatePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        showWeek
        previewValue="hover"
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
        previewValue="hover"
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
