import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import dayjs, { type Dayjs } from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePicker } from '../date-picker'

function formatValues(values: Dayjs[]): string[] {
  return values.map((value) => value.format('YYYY-MM-DD'))
}

describe('DatePicker multiple selection', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('adds and removes multiple date values', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        multiple
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-12' }))

    let [values, dateStrings] = onChange.mock.lastCall as [Dayjs[], string[]]
    expect(formatValues(values)).toEqual(['2026-06-10', '2026-06-12'])
    expect(dateStrings).toEqual(['2026-06-10', '2026-06-12'])

    fireEvent.click(screen.getByRole('button', { name: 'Remove 2026-06-10' }))

    ;[values, dateStrings] = onChange.mock.lastCall as [Dayjs[], string[]]
    expect(formatValues(values)).toEqual(['2026-06-12'])
    expect(dateStrings).toEqual(['2026-06-12'])
  })

  it('supports tagRender', () => {
    render(() => (
      <DatePicker
        multiple
        defaultValue={[dayjs('2026-06-10')]}
        tagRender={({ label, onClose }) => (
          <button type="button" onClick={onClose}>
            tag:{label}
          </button>
        )}
      />
    ))

    expect(screen.getByRole('button', { name: 'tag:2026-06-10' })).toBeInTheDocument()
  })

  it('keeps insertion order when order is false', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        multiple
        order={false}
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))
    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))

    const [, dateStrings] = onChange.mock.lastCall as [Dayjs[], string[]]
    expect(dateStrings).toEqual(['2026-06-20', '2026-06-10'])
  })

  it('delays multiple onChange until OK when needConfirm is true', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        multiple
        needConfirm
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))

    expect(onChange).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [, dateStrings] = onChange.mock.lastCall as [Dayjs[], string[]]
    expect(dateStrings).toEqual(['2026-06-10'])
  })
})
