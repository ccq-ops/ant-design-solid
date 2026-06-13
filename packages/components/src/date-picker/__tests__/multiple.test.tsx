import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
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

  it('formats multiple tags with the active picker type', () => {
    render(() => <DatePicker multiple picker="month" defaultValue={[dayjs('2026-06-01')]} />)

    expect(screen.getByRole('button', { name: 'Remove 2026-06' })).toBeInTheDocument()
  })

  it('lets the multiple input fill available selector space', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <DatePicker multiple placeholder="Select multiple dates" />
      </StyleProvider>
    ))

    const input = screen.getByRole('textbox')
    const css = extractStyle(cache)

    expect(input).toHaveAttribute('placeholder', 'Select multiple dates')
    expect(css).toContain(
      '.ads-date-picker-multiple .ads-date-picker-input{flex:1 1 auto;height:24px;line-height:24px;min-width:24px;width:auto;',
    )
  })

  it('keeps suffix and clear icons fixed on the right side', () => {
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <DatePicker multiple defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-02')]} allowClear />
      </StyleProvider>
    ))

    const selector = result.container.querySelector<HTMLElement>('.ads-date-picker-selector')
    const suffix = result.container.querySelector<HTMLElement>('.ads-date-picker-suffix')
    const clear = screen.getByRole('button', { name: 'Clear date' })
    const css = extractStyle(cache)

    expect(selector).toContainElement(suffix)
    expect(selector).toContainElement(clear)
    expect(clear).toHaveClass('ads-date-picker-clear-overlay')
    expect(css).toContain('.ads-date-picker-multiple .ads-date-picker-selector{')
    expect(css).toContain('padding-right:36px;')
    expect(css).toContain(
      '.ads-date-picker-multiple .ads-date-picker-suffix{inset-inline-end:12px;position:absolute;top:50%;',
    )
    expect(css).toContain(
      '.ads-date-picker-multiple.ads-date-picker-sm .ads-date-picker-suffix{inset-inline-end:8px;',
    )
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

  it('does not render the time panel when multiple is combined with showTime at runtime', () => {
    render(() => (
      <DatePicker
        {...({ multiple: true, showTime: true } as any)}
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
      />
    ))

    expect(document.body.querySelector('.ads-date-picker-time-panel')).not.toBeInTheDocument()
  })
})
