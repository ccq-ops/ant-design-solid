import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePicker } from '../date-picker'

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
})
