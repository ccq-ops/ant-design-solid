import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as DatePickerIndex from '..'
import * as DatePickerModule from '../date-picker'

const formatRange = (value: [Dayjs | null, Dayjs | null] | null) =>
  value?.map((date) => date?.format('YYYY-MM-DD') ?? '') ?? null

describe('RangePicker', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('is exported as a named export and as DatePicker.RangePicker', () => {
    expect(DatePickerModule.RangePicker).toBeTypeOf('function')
    expect(DatePickerModule.DatePicker.RangePicker).toBe(DatePickerModule.RangePicker)
    expect(DatePickerIndex.RangePicker).toBe(DatePickerModule.RangePicker)
    expect(DatePickerIndex.DatePicker.RangePicker).toBe(DatePickerModule.RangePicker)
  })

  it('selects an ordered date range from two calendar clicks', () => {
    const onCalendarChange = vi.fn()
    const onChange = vi.fn()
    render(() => (
      <DatePickerModule.RangePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onCalendarChange={onCalendarChange}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))

    expect(onCalendarChange).toHaveBeenCalledTimes(1)
    const [calendarDates, calendarStrings, calendarInfo] = onCalendarChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
      { range: string },
    ]
    expect(formatRange(calendarDates)).toEqual(['2026-06-20', ''])
    expect(calendarStrings).toEqual(['2026-06-20', ''])
    expect(calendarInfo).toEqual({ range: 'start' })
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))

    expect(onCalendarChange).toHaveBeenCalledTimes(2)
    const [changedCalendarDates, changedCalendarStrings, changedCalendarInfo] = onCalendarChange
      .mock.lastCall as [[Dayjs | null, Dayjs | null], [string, string], { range: string }]
    expect(formatRange(changedCalendarDates)).toEqual(['2026-06-10', '2026-06-20'])
    expect(changedCalendarStrings).toEqual(['2026-06-10', '2026-06-20'])
    expect(changedCalendarInfo).toEqual({ range: 'end' })

    const [changedDates, changedStrings] = onChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
    ]
    expect(formatRange(changedDates)).toEqual(['2026-06-10', '2026-06-20'])
    expect(changedStrings).toEqual(['2026-06-10', '2026-06-20'])
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('2026-06-10')
    expect(inputs[1]).toHaveValue('2026-06-20')
  })

  it('keeps reverse selection order when order is false', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePickerModule.RangePicker
        order={false}
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))

    const [changedDates, changedStrings] = onChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
    ]
    expect(formatRange(changedDates)).toEqual(['2026-06-20', '2026-06-10'])
    expect(changedStrings).toEqual(['2026-06-20', '2026-06-10'])
  })

  it('clears only the allowed empty start value', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePickerModule.RangePicker
        allowClear
        allowEmpty={[true, false]}
        defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Clear start date' }))

    const [changedDates, changedStrings] = onChange.mock.lastCall as [
      [Dayjs | null, Dayjs | null],
      [string, string],
    ]
    expect(formatRange(changedDates)).toEqual(['', '2026-06-15'])
    expect(changedStrings).toEqual(['', '2026-06-15'])
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('')
    expect(inputs[1]).toHaveValue('2026-06-15')
  })

  it('passes range metadata to focus and blur callbacks', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(() => <DatePickerModule.RangePicker onFocus={onFocus} onBlur={onBlur} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.focus(inputs[0])
    fireEvent.blur(inputs[0])
    fireEvent.focus(inputs[1])
    fireEvent.blur(inputs[1])

    expect(onFocus.mock.calls[0][1]).toEqual({ range: 'start' })
    expect(onBlur.mock.calls[0][1]).toEqual({ range: 'start' })
    expect(onFocus.mock.calls[1][1]).toEqual({ range: 'end' })
    expect(onBlur.mock.calls[1][1]).toEqual({ range: 'end' })
  })

  it('marks completed range start, end, and in-range cells', () => {
    render(() => (
      <DatePickerModule.RangePicker
        defaultOpen
        defaultValue={[dayjs('2026-06-10'), dayjs('2026-06-15')]}
        defaultPickerValue={dayjs('2026-06-01')}
      />
    ))

    expect(screen.getByRole('button', { name: '2026-06-10' })).toHaveClass(
      'ads-date-picker-cell-range-start',
    )
    expect(screen.getByRole('button', { name: '2026-06-15' })).toHaveClass(
      'ads-date-picker-cell-range-end',
    )
    expect(screen.getByRole('button', { name: '2026-06-12' })).toHaveClass(
      'ads-date-picker-cell-in-range',
    )
  })

  it('previews the in-range cells while hovering after selecting a start date', () => {
    render(() => (
      <DatePickerModule.RangePicker defaultOpen defaultPickerValue={dayjs('2026-06-01')} />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
    fireEvent.mouseEnter(screen.getByRole('button', { name: '2026-06-15' }))

    expect(screen.getByRole('button', { name: '2026-06-12' })).toHaveClass(
      'ads-date-picker-cell-in-range',
    )
  })

  it('renders a custom separator and disables the configured end input', () => {
    render(() => (
      <DatePickerModule.RangePicker separator={<span>to</span>} disabled={[false, true]} />
    ))

    expect(screen.getByText('to')).toBeInTheDocument()
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).not.toBeDisabled()
    expect(inputs[1]).toBeDisabled()
  })
})
