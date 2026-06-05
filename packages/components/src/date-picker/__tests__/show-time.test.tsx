import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
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
    expect(dates[0]?.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-06-10 08:00:00')
    expect(dates[1]?.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-06-15 08:00:00')
    expect(dateStrings).toEqual(['2026-06-10 08:00:00', '2026-06-15 08:00:00'])
  })

  it('uses RangePicker showTime.defaultOpenValue as the initial time seed', () => {
    const onChange = vi.fn()
    render(() => (
      <RangePicker
        showTime={{
          defaultOpenValue: [dayjs('2026-01-01 07:15:00'), dayjs('2026-01-01 07:15:00')],
        }}
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onChange.mock.calls.at(-1)![1]).toEqual(['2026-06-10 07:15:00', '2026-06-15 07:15:00'])
  })
})
