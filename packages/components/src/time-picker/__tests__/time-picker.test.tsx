import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TimePicker } from '../time-picker'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('TimePicker', () => {
  it('selects an uncontrolled time and calls onChange', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))

    expect(onChange).toHaveBeenLastCalledWith('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')
  })

  it('supports HH:mm format without seconds', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen format="HH:mm" onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '10 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '30 minutes' }))

    expect(onChange).toHaveBeenLastCalledWith('10:30')
    expect(screen.queryByText('seconds')).not.toBeInTheDocument()
  })

  it('supports controlled value', () => {
    function Demo() {
      const [value, setValue] = createSignal('01:02:03')
      return <TimePicker value={value()} defaultOpen onChange={(next) => next && setValue(next)} />
    }

    render(() => <Demo />)
    expect(screen.getByRole('combobox')).toHaveTextContent('01:02:03')
    fireEvent.click(screen.getByRole('option', { name: '04 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '06 seconds' }))
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
        defaultValue="12:00:00"
        allowClear
        onChange={onChange}
        onOpenChange={onOpenChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined)

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

    expect(onChange).toHaveBeenLastCalledWith('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('Select time')
  })

  it('resets draft parts when controlled value becomes undefined', () => {
    const onChange = vi.fn()

    function Demo() {
      const [value, setValue] = createSignal<string | undefined>('01:02:03')
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
  expect(dropdown.style.width).toBe('200px')
  expect(dropdown.style.zIndex).toBe('1303')
  rectSpy.mockRestore()
})
