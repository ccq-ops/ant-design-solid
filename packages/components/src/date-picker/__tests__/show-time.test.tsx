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

  it('places the time panel to the right of the date panel', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <DatePicker showTime defaultOpen defaultPickerValue={dayjs('2026-06-01')} />
      </StyleProvider>
    ))

    const dropdown = document.body.querySelector<HTMLElement>('.ads-date-picker-dropdown')
    const panelBody = document.body.querySelector<HTMLElement>('.ads-date-picker-panel-body')
    const datePanel = document.body.querySelector<HTMLElement>('.ads-date-picker-panel-date')
    const timePanel = document.body.querySelector<HTMLElement>('.ads-date-picker-time-panel')
    const css = extractStyle(cache)

    expect(dropdown).toHaveClass('ads-date-picker-dropdown-with-time')
    expect(datePanel).toContainElement(screen.getByRole('button', { name: '2026-06-15' }))
    expect(panelBody).toContainElement(timePanel)
    expect(Array.from(panelBody?.children ?? [])).toEqual([datePanel, timePanel])
    expect(css).toContain('.ads-date-picker-panel-body{display:flex;')
    expect(css).not.toContain('.ads-date-picker-panel-body{align-items:stretch;')
    expect(css).toContain('.ads-date-picker-panel-date{flex:1 1 auto;width:100%;')
    expect(css).toContain('.ads-date-picker-time-panel{border-left:')
    expect(css).not.toContain('.ads-date-picker-time-panel{display:flex;gap:8px;margin-top:')
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
