import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TimePickerRef } from '../interface'
import { TimePicker } from '../time-picker'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('TimePicker', () => {
  it('shows Now and OK actions by default', () => {
    render(() => <TimePicker defaultOpen />)

    expect(screen.getByRole('button', { name: 'Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })

  it('commits draft selection only after OK by default', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(time.format('HH:mm:ss')).toBe('09:05:07')
    expect(timeString).toBe('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')
  })

  it('previews draft selection while open and restores selected value when closed without OK', () => {
    const onChange = vi.fn()
    render(() => (
      <TimePicker defaultOpen defaultValue={dayjs('2026-06-11 01:02:03')} onChange={onChange} />
    ))

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox', { name: 'hours' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('01:02:03')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes the panel after OK confirmation', () => {
    const onOpenChange = vi.fn()
    render(() => <TimePicker defaultOpen onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(screen.queryByRole('listbox', { name: 'hours' })).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('commits and closes from the Now action without OK', () => {
    const now = dayjs('2026-06-11 15:16:17')
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(now.valueOf())
    const onChange = vi.fn()
    const onOpenChange = vi.fn()

    render(() => <TimePicker defaultOpen onChange={onChange} onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Now' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(time.format('HH:mm:ss')).toBe('15:16:17')
    expect(timeString).toBe('15:16:17')
    expect(screen.queryByRole('listbox', { name: 'hours' })).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    nowSpy.mockRestore()
  })

  it('hides the Now action when showNow is false', () => {
    render(() => <TimePicker defaultOpen showNow={false} />)

    expect(screen.queryByRole('button', { name: 'Now' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })

  it('emits dayjs values and formatted strings for uncontrolled selection', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(time)).toBe(true)
    expect(time.format('HH:mm:ss')).toBe('09:05:07')
    expect(timeString).toBe('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')
  })

  it('supports dayjs controlled values', () => {
    function Demo() {
      const [value, setValue] = createSignal(dayjs('2026-06-11 01:02:03'))
      return (
        <TimePicker
          value={value()}
          defaultOpen
          onChange={(next) => {
            if (next) setValue(next)
          }}
        />
      )
    }

    render(() => <Demo />)
    expect(screen.getByRole('combobox')).toHaveTextContent('01:02:03')
    fireEvent.click(screen.getByRole('option', { name: '04 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '06 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('04:05:06')
  })

  it('supports v6 time option props', () => {
    const clearIcon = <span data-testid="custom-clear">x</span>
    render(() => (
      <TimePicker
        defaultOpen
        defaultValue={dayjs('2026-06-11 12:00:00')}
        allowClear={{ clearIcon }}
        hourStep={3}
        hideDisabledOptions
        disabledTime={() => ({
          disabledHours: () => [9],
          disabledMinutes: (hour) => (hour === 12 ? [15] : []),
        })}
      />
    ))

    expect(screen.getByTestId('custom-clear')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '01 hours' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '09 hours' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '15 minutes' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: '12 hours' })).toBeInTheDocument()
  })

  it('shows clear by default when a single picker has a value', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultValue={dayjs('2026-06-11 12:00:00')} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }))

    expect(onChange).toHaveBeenLastCalledWith(null, '')
    expect(screen.getByRole('combobox')).toHaveTextContent('Select time')
  })

  it('does not show default clear when allowClear is false', () => {
    render(() => <TimePicker defaultValue={dayjs('2026-06-11 12:00:00')} allowClear={false} />)

    expect(screen.queryByRole('button', { name: 'Clear time' })).not.toBeInTheDocument()
  })

  it('stacks clear and suffix icons in the single picker selector', () => {
    const result = render(() => (
      <TimePicker defaultValue={dayjs('2026-06-11 12:00:00')} suffixIcon={<span>UTC</span>} />
    ))

    const stack = result.container.querySelector('.ads-time-picker-icon-stack')

    expect(stack).toBeInTheDocument()
    expect(stack).toContainElement(result.container.querySelector('.ads-time-picker-suffix'))
    expect(stack).toContainElement(result.container.querySelector('.ads-time-picker-clear'))
  })

  it('stacks clear and suffix icons in the range picker selector', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <TimePicker.RangePicker
        defaultValue={[dayjs('2026-06-11 09:00:00'), dayjs('2026-06-11 18:00:00')]}
        suffixIcon={<span>UTC</span>}
        onChange={onChange}
      />
    ))

    const stack = result.container.querySelector('.ads-time-picker-icon-stack')

    expect(stack).toBeInTheDocument()
    expect(stack).toContainElement(result.container.querySelector('.ads-time-picker-suffix'))
    expect(stack).toContainElement(result.container.querySelector('.ads-time-picker-clear'))
    expect(screen.getByText('UTC')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }))

    expect(onChange).toHaveBeenLastCalledWith([null, null], ['', ''])
    expect(screen.getByRole('combobox')).toHaveTextContent('Start time')
    expect(screen.getByRole('combobox')).toHaveTextContent('End time')
  })

  it('does not show range clear when allowClear is false', () => {
    const result = render(() => (
      <TimePicker.RangePicker
        defaultValue={[dayjs('2026-06-11 09:00:00'), dayjs('2026-06-11 18:00:00')]}
        allowClear={false}
      />
    ))

    expect(result.container.querySelector('.ads-time-picker-suffix')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear time' })).not.toBeInTheDocument()
  })

  it('exposes focus and blur ref methods', () => {
    let ref: TimePickerRef | undefined
    render(() => <TimePicker ref={(next) => (ref = next)} />)

    ref?.focus()
    expect(document.activeElement).toBe(screen.getByRole('combobox'))
    ref?.blur()
    expect(document.activeElement).not.toBe(screen.getByRole('combobox'))
    expect(ref?.nativeElement).toBeTruthy()
  })

  it('confirms range picker sides one at a time before committing the range', () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    render(() => (
      <TimePicker.RangePicker defaultOpen onChange={onChange} onOpenChange={onOpenChange} />
    ))

    expect(screen.getAllByRole('listbox')).toHaveLength(3)
    expect(screen.getByRole('group', { name: 'start time selection' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: '18 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '30 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '00 seconds' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveTextContent('18:30:00')
    expect(screen.getByRole('combobox')).toHaveTextContent('End time')

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('listbox')).toHaveLength(3)
    expect(screen.getByRole('group', { name: 'end time selection' })).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('18:30:00')

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '15 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '00 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [times, timeStrings] = onChange.mock.lastCall as [[Dayjs, Dayjs], [string, string]]
    expect(times[0].format('HH:mm:ss')).toBe('09:15:00')
    expect(times[1].format('HH:mm:ss')).toBe('18:30:00')
    expect(timeStrings).toEqual(['09:15:00', '18:30:00'])
    expect(screen.getByRole('combobox')).toHaveTextContent('09:15:00')
    expect(screen.getByRole('combobox')).toHaveTextContent('18:30:00')
    expect(screen.queryByRole('listbox', { name: 'hours' })).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('keeps range placeholders on one line with enough default width', () => {
    const result = render(() => (
      <TimePicker.RangePicker placeholder={['Shift start', 'Shift end']} />
    ))

    const root = result.container.firstElementChild as HTMLElement
    const placeholders = result.container.querySelectorAll('.ads-time-picker-placeholder')
    const separator = result.container.querySelector('.ads-time-picker-range-separator')

    expect(root).toHaveClass('ads-time-picker-range')
    expect(getComputedStyle(root).width).toBe('240px')
    expect(placeholders).toHaveLength(2)
    for (const placeholder of placeholders) {
      expect(getComputedStyle(placeholder).whiteSpace).toBe('nowrap')
      expect(getComputedStyle(placeholder).overflow).toBe('hidden')
      expect(getComputedStyle(placeholder).textOverflow).toBe('ellipsis')
    }
    expect(getComputedStyle(separator as Element).flex).toBe('0 0 auto')
  })

  it('supports Now in range picker confirmation flow', () => {
    const firstNow = dayjs('2026-06-11 08:09:10')
    const secondNow = dayjs('2026-06-11 18:19:20')
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(firstNow.valueOf())
    const onChange = vi.fn()
    const onOpenChange = vi.fn()

    render(() => (
      <TimePicker.RangePicker defaultOpen onChange={onChange} onOpenChange={onOpenChange} />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Now' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveTextContent('08:09:10')
    expect(screen.getByRole('combobox')).toHaveTextContent('End time')

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(screen.getByRole('group', { name: 'end time selection' })).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()

    nowSpy.mockReturnValue(secondNow.valueOf())
    fireEvent.click(screen.getByRole('button', { name: 'Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [times, timeStrings] = onChange.mock.lastCall as [[Dayjs, Dayjs], [string, string]]
    expect(times[0].format('HH:mm:ss')).toBe('08:09:10')
    expect(times[1].format('HH:mm:ss')).toBe('18:19:20')
    expect(timeStrings).toEqual(['08:09:10', '18:19:20'])
    expect(screen.queryByRole('listbox', { name: 'hours' })).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    nowSpy.mockRestore()
  })

  it('hides Now in range picker when showNow is false', () => {
    render(() => <TimePicker.RangePicker defaultOpen showNow={false} />)

    expect(screen.queryByRole('button', { name: 'Now' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })

  it('delays single value changes until OK when needConfirm is true', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen needConfirm onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(time.format('HH:mm:ss')).toBe('09:05:07')
    expect(timeString).toBe('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')
  })

  it('supports cellRender and semantic classNames/styles', () => {
    const result = render(() => (
      <TimePicker
        defaultOpen
        popupClassName="legacy-popup"
        popupStyle={{ width: '320px' }}
        classNames={{
          root: 'custom-root',
          selector: 'custom-selector',
          popup: 'custom-popup',
          cell: 'custom-cell',
          footer: 'custom-footer',
        }}
        styles={{
          root: { width: '180px' },
          selector: { 'border-color': 'red' },
          popup: { color: 'blue' },
          cell: { 'font-weight': 700 },
          footer: { 'text-align': 'right' },
        }}
        renderExtraFooter={() => <span>Footer</span>}
        cellRender={(current, info) => (
          <span data-testid={`${info.subType}-${current}`}>{info.originNode}</span>
        )}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    const selector = result.container.querySelector('.ads-time-picker-selector') as HTMLElement
    const popup = document.body.querySelector('.ads-time-picker-dropdown') as HTMLElement
    const cell = screen.getByTestId('hour-0').closest('.ads-time-picker-cell') as HTMLElement
    const footer = document.body.querySelector('.ads-time-picker-footer') as HTMLElement

    expect(root).toHaveClass('custom-root')
    expect(root.style.width).toBe('180px')
    expect(selector).toHaveClass('custom-selector')
    expect(selector.style.borderColor).toBe('red')
    expect(popup).toHaveClass('custom-popup')
    expect(popup).toHaveClass('legacy-popup')
    expect(popup.style.width).toBe('320px')
    expect(popup.style.color).toBe('blue')
    expect(cell).toHaveClass('custom-cell')
    expect(cell.style.fontWeight).toBe('700')
    expect(footer).toHaveClass('custom-footer')
    expect(footer.style.textAlign).toBe('right')
  })

  it('supports inputReadOnly via an internal input mirror', () => {
    render(() => <TimePicker inputReadOnly />)

    expect(screen.getByRole('textbox', { hidden: true })).toHaveAttribute('readonly')
  })

  it('keeps the internal input mirror visually hidden', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <TimePicker defaultValue={dayjs('2026-06-11 12:00:00')} />
        <TimePicker.RangePicker
          defaultValue={[dayjs('2026-06-11 09:00:00'), dayjs('2026-06-11 18:00:00')]}
        />
      </StyleProvider>
    ))

    const inputs = screen.getAllByRole('textbox', { hidden: true })
    const css = extractStyle(cache)

    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue('12:00:00')
    expect(inputs[1]).toHaveValue('09:00:00 - 18:00:00')
    expect(css).toContain(
      '.ads-time-picker-input{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;white-space:nowrap;width:1px;',
    )
  })

  it('supports changeOnScroll by selecting the scrolled option', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen changeOnScroll onChange={onChange} />)

    fireEvent.scroll(screen.getByRole('listbox', { name: 'hours' }), {
      target: { scrollTop: 9 * 32 },
    })
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(time.format('HH:mm:ss')).toBe('09:05:07')
    expect(timeString).toBe('09:05:07')
  })

  it('selects an uncontrolled time and calls onChange', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(time.format('HH:mm:ss')).toBe('09:05:07')
    expect(timeString).toBe('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')
  })

  it('supports HH:mm format without seconds', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen format="HH:mm" onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '10 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '30 minutes' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(time.format('HH:mm')).toBe('10:30')
    expect(timeString).toBe('10:30')
    expect(screen.queryByText('seconds')).not.toBeInTheDocument()
  })

  it('supports controlled value', () => {
    function Demo() {
      const [value, setValue] = createSignal(dayjs('2026-06-11 01:02:03'))
      return <TimePicker value={value()} defaultOpen onChange={(next) => next && setValue(next)} />
    }

    render(() => <Demo />)
    expect(screen.getByRole('combobox')).toHaveTextContent('01:02:03')
    fireEvent.click(screen.getByRole('option', { name: '04 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '06 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('04:05:06')
  })

  it('does not select disabled time cells', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen disabledHours={() => [9]} onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears value and closes with Escape', () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    render(() => (
      <TimePicker
        defaultOpen
        defaultValue={dayjs('2026-06-11 12:00:00')}
        allowClear
        onChange={onChange}
        onOpenChange={onOpenChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }))
    expect(onChange).toHaveBeenLastCalledWith(null, '')

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('closes dropdown on outside pointer down', () => {
    const onOpenChange = vi.fn()
    render(() => <TimePicker defaultOpen onOpenChange={onOpenChange} />)

    expect(screen.getByRole('listbox', { name: 'hours' })).toBeInTheDocument()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox', { name: 'hours' })).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('supports controlled open state', () => {
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))

    render(() => <TimePicker open={open()} onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('combobox'))

    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('listbox', { name: 'hours' })).toBeInTheDocument()
  })

  it('treats value={undefined} as controlled', () => {
    const onChange = vi.fn()

    render(() => <TimePicker value={undefined} defaultOpen onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [time, timeString] = onChange.mock.lastCall as [Dayjs, string]
    expect(time.format('HH:mm:ss')).toBe('09:05:07')
    expect(timeString).toBe('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('Select time')
  })

  it('resets draft parts when controlled value becomes undefined', () => {
    const onChange = vi.fn()

    function Demo() {
      const [value, setValue] = createSignal<Dayjs | undefined>(dayjs('2026-06-11 01:02:03'))
      return (
        <>
          <button type="button" onClick={() => setValue(undefined)}>
            Clear externally
          </button>
          <TimePicker value={value()} defaultOpen onChange={onChange} />
        </>
      )
    }

    render(() => <Demo />)
    expect(screen.getByRole('combobox')).toHaveTextContent('01:02:03')

    fireEvent.click(screen.getByRole('button', { name: 'Clear externally' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('Select time')

    fireEvent.click(screen.getByRole('option', { name: '04 hours' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('combobox')).toHaveTextContent('Select time')
  })

  it('uses listbox roles only for time columns', () => {
    render(() => <TimePicker defaultOpen />)

    expect(screen.queryByRole('listbox', { name: 'Time selection' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('listbox')).toHaveLength(3)
    expect(screen.getByRole('listbox', { name: 'hours' })).toBeInTheDocument()
    expect(screen.getByRole('listbox', { name: 'minutes' })).toBeInTheDocument()
    expect(screen.getByRole('listbox', { name: 'seconds' })).toBeInTheDocument()
  })

  it('normalizes and clamps provided values', () => {
    render(() => <TimePicker value="31:99:70" />)

    expect(screen.getByRole('combobox')).toHaveTextContent('23:59:59')
  })
})

it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => <TimePicker zIndex={1303} />)
  const selector = result.container.querySelector('.ads-time-picker-selector') as HTMLElement
  const rectSpy = vi.spyOn(selector, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 42,
    left: 20,
    right: 220,
    width: 200,
    height: 32,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.click(selector)

  const dropdown = document.body.querySelector<HTMLElement>('.ads-time-picker-dropdown')!
  expect(dropdown).toBeTruthy()
  expect(result.container.querySelector('.ads-time-picker-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.top).toBe('46px')
  expect(dropdown.style.left).toBe('20px')
  expect(dropdown.style.width).toBe('')
  expect(dropdown.style.minWidth).toBe('200px')
  expect(dropdown.style.zIndex).toBe('1303')
  rectSpy.mockRestore()
})
