import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePicker } from '../date-picker'

describe('DatePicker', () => {
  afterEach(() => cleanup())

  it('selects an uncontrolled date and calls onChange', () => {
    const onChange = vi.fn()
    render(() => <DatePicker defaultOpen defaultValue="2026-06-01" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))

    expect(onChange).toHaveBeenLastCalledWith(expect.any(Date), '2026-06-15')
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-06-15')
    expect(screen.queryByText('2026-06')).not.toBeInTheDocument()
  })

  it('supports controlled value', () => {
    function Demo() {
      const [value, setValue] = createSignal<Date | string | undefined>('2026-06-01')
      return <DatePicker value={value()} defaultOpen onChange={(next) => setValue(next)} />
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-06-20')
  })

  it('navigates months', () => {
    render(() => <DatePicker defaultOpen defaultValue="2026-06-01" />)

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('2026-07')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText('2026-06')).toBeInTheDocument()
  })

  it('does not select disabled dates', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        defaultOpen
        defaultValue="2026-06-01"
        disabledDate={(date) => date.getDate() === 10}
        onChange={onChange}
      />
    ))

    const date = screen.getByRole('button', { name: '2026-06-10' })
    expect(date).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(date)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-06-01')
  })

  it('clears value and closes with Escape', () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    render(() => (
      <DatePicker
        defaultOpen
        defaultValue="2026-06-01"
        allowClear
        onChange={onChange}
        onOpenChange={onOpenChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Clear date' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined, '')
    expect(screen.getByRole('combobox')).toHaveTextContent('Select date')

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('treats controlled undefined value as controlled', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker value={undefined} defaultOpen defaultValue="2026-06-01" onChange={onChange} />
    ))

    expect(screen.getByRole('combobox')).toHaveTextContent('Select date')
    fireEvent.click(screen.getByRole('button', { name: '2026-06-12' }))

    expect(onChange).toHaveBeenLastCalledWith(expect.any(Date), '2026-06-12')
    expect(screen.getByRole('combobox')).toHaveTextContent('Select date')
  })

  it('respects controlled open state', () => {
    const onOpenChange = vi.fn()
    render(() => <DatePicker open={false} onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('combobox'))

    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(screen.queryByText(/^\d{4}-\d{2}$/)).not.toBeInTheDocument()
  })

  it('formats Date values with local date getters', () => {
    render(() => <DatePicker defaultValue={new Date(2026, 0, 5)} format="YYYY/MM/DD" />)

    expect(screen.getByRole('combobox')).toHaveTextContent('2026/01/05')
  })
})
