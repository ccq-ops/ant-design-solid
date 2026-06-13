import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePicker, RangePicker } from '..'

describe('DatePicker showTime', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('commits selected date and time after OK for a single picker', () => {
    const onChange = vi.fn()
    const onOk = vi.fn()
    render(() => (
      <DatePicker
        showTime
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
        onOk={onOk}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hour 09' }))
    fireEvent.click(screen.getByRole('button', { name: 'Minute 30' }))

    expect(onChange).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-06-15 09:30:00')
    expect(nextString).toBe('2026-06-15 09:30:00')
    expect(onOk).toHaveBeenLastCalledWith(nextValue)
  })

  it('uses the default date panel as the left showTime panel', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <DatePicker
          showTime
          defaultOpen
          defaultPickerValue={dayjs('2026-06-01')}
          components={{
            panel: (props) => (
              <section data-testid="custom-panel" aria-label="custom panel">
                {props.children}
              </section>
            ),
          }}
        />
      </StyleProvider>
    ))

    const dropdown = document.body.querySelector<HTMLElement>('.ads-date-picker-dropdown')
    const panelBody = document.body.querySelector<HTMLElement>('.ads-date-picker-panel-body')
    const header = document.body.querySelector<HTMLElement>('.ads-date-picker-header')
    const datePanel = document.body.querySelector<HTMLElement>('.ads-date-picker-panel-date')
    const timePanel = document.body.querySelector<HTMLElement>('.ads-date-picker-time-panel')
    const css = extractStyle(cache)

    expect(dropdown).toHaveClass('ads-date-picker-dropdown-with-time')
    expect(datePanel).toContainElement(header)
    expect(datePanel).toContainElement(screen.getByTestId('custom-panel'))
    expect(screen.getByTestId('custom-panel')).not.toContainElement(timePanel)
    expect(screen.getByTestId('custom-panel').children).toHaveLength(2)
    expect(screen.getByTestId('custom-panel').children[0]).toHaveClass('ads-date-picker-weekdays')
    expect(screen.getByTestId('custom-panel').children[1]).toHaveClass('ads-date-picker-grid')
    expect(datePanel).toContainElement(screen.getByRole('button', { name: '2026-06-15' }))
    expect(panelBody).toHaveClass('ads-date-picker-panel-body-with-time')
    expect(panelBody).toContainElement(timePanel)
    expect(Array.from(panelBody?.children ?? [])).toEqual([datePanel, timePanel])
    expect(css).toContain('.ads-date-picker-panel-body-with-time{display:flex;')
    expect(css).not.toContain('.ads-date-picker-panel-body-with-time{align-items:stretch;')
    expect(css).toContain('.ads-date-picker-panel-date{flex:0 0 256px;width:256px;')
    expect(css).toContain('.ads-date-picker-time-panel{border-left:')
    expect(css).not.toContain('.ads-date-picker-time-panel{display:flex;gap:8px;margin-top:')
  })

  it('keeps the header outside the panel body when showTime is disabled', () => {
    render(() => <DatePicker defaultOpen defaultPickerValue={dayjs('2026-06-01')} />)

    const dropdown = document.body.querySelector<HTMLElement>('.ads-date-picker-dropdown')
    const panelBody = document.body.querySelector<HTMLElement>('.ads-date-picker-panel-body')
    const header = document.body.querySelector<HTMLElement>('.ads-date-picker-header')

    expect(dropdown?.children[0]).toBe(header)
    expect(panelBody).not.toContainElement(header)
  })

  it('keeps the default date panel stacked when showTime is disabled', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <DatePicker defaultOpen defaultPickerValue={dayjs('2026-06-01')} />
      </StyleProvider>
    ))

    const panelBody = document.body.querySelector<HTMLElement>('.ads-date-picker-panel-body')
    const css = extractStyle(cache)

    expect(panelBody).not.toHaveClass('ads-date-picker-panel-body-with-time')
    expect(Array.from(panelBody?.children ?? [])).toHaveLength(2)
    expect(panelBody?.children[0]).toHaveClass('ads-date-picker-weekdays')
    expect(panelBody?.children[1]).toHaveClass('ads-date-picker-grid')
    expect(css).not.toContain('.ads-date-picker-panel-body{display:flex;')
    expect(css).toContain('.ads-date-picker-panel-body-with-time{display:flex;')
  })

  it('marks disabled time options as disabled and prevents selection', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        showTime
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        disabledTime={() => ({ disabledHours: () => [9] })}
        onChange={onChange}
      />
    ))

    const disabledHour = screen.getByRole('button', { name: 'Hour 09' })
    expect(disabledHour).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(disabledHour)
    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [nextValue] = onChange.mock.lastCall as [Dayjs, string]
    expect(nextValue.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-06-15 00:00:00')
  })

  it('supports showNow quick selection before OK', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-20T10:15:30'))
    const onChange = vi.fn()
    render(() => <DatePicker showTime showNow defaultOpen onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextString).toBe(nextValue.format('YYYY-MM-DD HH:mm:ss'))
  })

  it('commits selected date range and time after OK for a range picker', () => {
    const onChange = vi.fn()
    render(() => (
      <RangePicker
        showTime
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hour 08' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [dates, dateStrings] = onChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
    ]
    expect(dates[0]?.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-06-10 00:00:00')
    expect(dates[1]?.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-06-15 08:00:00')
    expect(dateStrings).toEqual(['2026-06-10 00:00:00', '2026-06-15 08:00:00'])
  })

  it('uses side-specific RangePicker showTime.defaultOpenValue seeds', () => {
    const onChange = vi.fn()
    render(() => (
      <RangePicker
        showTime={{
          defaultOpenValue: [dayjs('2026-01-01 07:15:00'), dayjs('2026-01-01 18:45:00')],
        }}
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onChange.mock.calls.at(-1)![1]).toEqual(['2026-06-10 07:15:00', '2026-06-15 18:45:00'])
  })

  it('applies RangePicker time edits only to the focused side', () => {
    const onChange = vi.fn()
    render(() => (
      <RangePicker
        showTime
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))
    const [startInput] = screen.getAllByRole('textbox')
    fireEvent.focus(startInput)
    fireEvent.click(screen.getByRole('button', { name: 'Hour 08' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onChange.mock.calls.at(-1)![1]).toEqual(['2026-06-10 08:00:00', '2026-06-15 00:00:00'])
  })

  it('passes active partial and from date to RangePicker disabledTime', () => {
    const disabledTime = vi.fn(
      (_date: Dayjs | null, _partial: 'start' | 'end', _info: { from?: Dayjs }) => ({}),
    )
    render(() => (
      <RangePicker
        showTime
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        disabledTime={disabledTime}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))

    expect(
      disabledTime.mock.calls.some(
        (call) => call[1] === 'end' && call[2]?.from?.format('YYYY-MM-DD') === '2026-06-10',
      ),
    ).toBe(true)
  })
})
