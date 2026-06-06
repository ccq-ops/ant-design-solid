import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePanel } from '../date-panel'
import { DatePicker } from '../date-picker'
import { MonthPanel } from '../month-panel'
import { YearPanel } from '../year-panel'

describe('DatePicker picker variants', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('selects month values with month formatting', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="month"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.format('YYYY-MM-DD')).toBe('2026-06-01')
    expect(nextString).toBe('2026-06')
    expect(screen.getByRole('textbox')).toHaveValue('2026-06')
  })

  it('uses super navigation for month picker decade jumps', () => {
    render(() => (
      <DatePicker
        picker="month"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        superNextIcon={<span>super-next</span>}
      />
    ))

    fireEvent.click(screen.getByText('super-next'))

    expect(screen.getByText('2036')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2036-06' })).toBeInTheDocument()
  })

  it('selects quarter values with quarter formatting', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="quarter"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-Q3' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.quarter()).toBe(3)
    expect(nextString).toBe('2026-Q3')
  })

  it('selects year values with year formatting', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="year"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2028' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.year()).toBe(2028)
    expect(nextString).toBe('2028')
  })

  it('selects week values from week picker cells', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="week"
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    expect(screen.getByText('Week')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '2026-week-24' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.week()).toBe(24)
    expect(nextString.startsWith('2026-')).toBe(true)
  })

  it('keeps controlled pickerValue visible while reporting panel navigation', () => {
    const onPanelChange = vi.fn()
    render(() => (
      <DatePicker defaultOpen pickerValue={dayjs('2026-06-01')} onPanelChange={onPanelChange} />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))

    const [nextViewValue, nextMode] = onPanelChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextViewValue)).toBe(true)
    expect(nextViewValue.format('YYYY-MM-DD')).toBe('2026-07-01')
    expect(nextMode).toBe('date')
    expect(screen.getByText('2026-06')).toBeInTheDocument()
  })

  it('places week controls at the start of each rendered week row', () => {
    render(() => <DatePicker picker="week" defaultOpen defaultPickerValue={dayjs('2026-06-01')} />)

    const week23 = screen.getByRole('button', { name: '2026-week-23' })
    const june1 = screen.getByRole('button', { name: '2026-06-01' })
    const week24 = screen.getByRole('button', { name: '2026-week-24' })
    const june7 = screen.getByRole('button', { name: '2026-06-07' })

    expect(week23.compareDocumentPosition(june1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(week24.compareDocumentPosition(june7) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('does not change when disabled month cells are clicked', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="month"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        disabledDate={(date) => date.month() === 5}
        onChange={onChange}
      />
    ))

    const disabledMonth = screen.getByRole('button', { name: '2026-06' })
    expect(disabledMonth).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(disabledMonth)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not change when disabled quarter cells are clicked', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="quarter"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        disabledDate={(date) => date.quarter() === 3}
        onChange={onChange}
      />
    ))

    const disabledQuarter = screen.getByRole('button', { name: '2026-Q3' })
    expect(disabledQuarter).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(disabledQuarter)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not change when disabled year cells are clicked', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="year"
        defaultOpen
        defaultPickerValue={dayjs('2026-01-01')}
        disabledDate={(date) => date.year() === 2028}
        onChange={onChange}
      />
    ))

    const disabledYear = screen.getByRole('button', { name: '2028' })
    expect(disabledYear).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(disabledYear)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not change when disabled week cells are clicked', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        picker="week"
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        disabledDate={(date) => date.week() === 24}
        onChange={onChange}
      />
    ))

    const disabledWeek = screen.getByRole('button', { name: '2026-week-24' })
    expect(disabledWeek).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(disabledWeek)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not call DatePanel onSelect for disabled date and week cells', () => {
    const onSelect = vi.fn()
    render(() => (
      <DatePanel
        prefixCls="test-picker"
        picker="week"
        viewDate={dayjs('2026-06-01')}
        disabledDate={(date, info) =>
          (info.type === 'week' && date.week() === 24) ||
          (info.type === 'week' && date.format('YYYY-MM-DD') === '2026-06-10')
        }
        onSelect={onSelect}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-week-24' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does not call MonthPanel onSelect for disabled month and quarter cells', () => {
    const onSelect = vi.fn()
    const { unmount } = render(() => (
      <MonthPanel
        prefixCls="test-picker"
        picker="month"
        viewDate={dayjs('2026-01-01')}
        disabledDate={(date) => date.month() === 5}
        onSelect={onSelect}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06' }))
    expect(onSelect).not.toHaveBeenCalled()

    unmount()
    render(() => (
      <MonthPanel
        prefixCls="test-picker"
        picker="quarter"
        viewDate={dayjs('2026-01-01')}
        disabledDate={(date) => date.quarter() === 3}
        onSelect={onSelect}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-Q3' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does not call YearPanel onSelect for disabled year cells', () => {
    const onSelect = vi.fn()
    render(() => (
      <YearPanel
        prefixCls="test-picker"
        viewDate={dayjs('2026-01-01')}
        disabledDate={(date) => date.year() === 2028}
        onSelect={onSelect}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2028' }))

    expect(onSelect).not.toHaveBeenCalled()
  })
})
