import { cleanup, fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import dayjs, { type Dayjs } from 'dayjs'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatePicker } from '../date-picker'

describe('DatePicker dayjs value model', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('emits a dayjs value and formatted string when selecting an uncontrolled date', async () => {
    const onChange = vi.fn()
    render(() => <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.format('YYYY-MM-DD')).toBe('2026-06-15')
    expect(nextString).toBe('2026-06-15')
    expect(screen.getByRole('textbox')).toHaveValue('2026-06-15')
    await waitFor(() => expect(screen.queryByText('2026-06')).not.toBeInTheDocument())
  })

  it('renders previous and next month dates in the date panel with muted styling', () => {
    render(() => <DatePicker defaultOpen defaultPickerValue={dayjs('2021-06-01')} />)

    const previousMonthSunday = screen.getByRole('button', { name: '2021-05-30' })
    const previousMonthMonday = screen.getByRole('button', { name: '2021-05-31' })
    const nextMonthDate = screen.getByRole('button', { name: '2021-07-10' })

    expect(document.body.querySelector('.ads-date-picker-empty-cell')).toBeNull()
    expect(
      document.body.querySelectorAll('.ads-date-picker-date-grid .ads-date-picker-cell'),
    ).toHaveLength(42)
    expect(previousMonthSunday).toHaveTextContent('30')
    expect(previousMonthMonday).toHaveTextContent('31')
    expect(nextMonthDate).toHaveTextContent('10')
    expect(previousMonthSunday).toHaveClass('ads-date-picker-cell-out-of-view')
    expect(previousMonthMonday).toHaveClass('ads-date-picker-cell-out-of-view')
    expect(nextMonthDate).toHaveClass('ads-date-picker-cell-out-of-view')
  })

  it('selects a date with the first click after the input blurs to the panel', async () => {
    const onChange = vi.fn()
    render(() => <DatePicker defaultValue={dayjs('2026-06-01')} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    const date = await screen.findByRole('button', { name: '2026-06-15' })
    const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    const defaultAllowed = date.dispatchEvent(mouseDown)
    if (defaultAllowed) fireEvent.blur(input, { relatedTarget: date })
    fireEvent.mouseUp(date)
    fireEvent.click(date)

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(nextValue.format('YYYY-MM-DD')).toBe('2026-06-15')
    expect(nextString).toBe('2026-06-15')
    expect(screen.getByRole('textbox')).toHaveValue('2026-06-15')
  })

  it('does not commit a date on mouse down before the click selection event', async () => {
    const onChange = vi.fn()
    render(() => <DatePicker defaultValue={dayjs('2026-06-01')} onChange={onChange} />)

    fireEvent.focus(screen.getByRole('textbox'))
    const date = await screen.findByRole('button', { name: '2026-06-15' })
    fireEvent.mouseDown(date)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('2026-06-01')
  })

  it('updates the displayed value when controlled dayjs value changes', () => {
    function Demo() {
      const [value, setValue] = createSignal(dayjs('2026-06-01'))
      return (
        <>
          <DatePicker value={value()} />
          <button type="button" onClick={() => setValue(dayjs('2026-06-20'))}>
            Change date
          </button>
        </>
      )
    }

    render(() => <Demo />)
    expect(screen.getByRole('textbox')).toHaveValue('2026-06-01')

    fireEvent.click(screen.getByRole('button', { name: 'Change date' }))

    expect(screen.getByRole('textbox')).toHaveValue('2026-06-20')
  })

  it('displays string, array, function, and mask formats', () => {
    const value = dayjs('2026-06-01')
    render(() => (
      <>
        <DatePicker aria-label="string format" value={value} format="YYYY/MM/DD" />
        <DatePicker aria-label="array format" value={value} format={['DD.MM.YYYY', 'YYYY-MM-DD']} />
        <DatePicker
          aria-label="function format"
          value={value}
          format={(date) => `Day ${date.format('D')}`}
        />
        <DatePicker
          aria-label="mask format"
          value={value}
          format={{ format: 'MM-DD-YYYY', type: 'mask' }}
        />
      </>
    ))

    expect(screen.getByRole('textbox', { name: 'string format' })).toHaveValue('2026/06/01')
    expect(screen.getByRole('textbox', { name: 'array format' })).toHaveValue('01.06.2026')
    expect(screen.getByRole('textbox', { name: 'function format' })).toHaveValue('Day 1')
    expect(screen.getByRole('textbox', { name: 'mask format' })).toHaveValue('06-01-2026')
  })

  it('parses typed input with an array format on Enter', () => {
    const onChange = vi.fn()
    render(() => <DatePicker format={['DD/MM/YYYY', 'YYYY-MM-DD']} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.input(input, { target: { value: '15/06/2026' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.format('YYYY-MM-DD')).toBe('2026-06-15')
    expect(nextString).toBe('15/06/2026')
    expect(input).toHaveValue('15/06/2026')
  })

  it('clears to null and an empty string', () => {
    const onChange = vi.fn()
    render(() => <DatePicker defaultValue={dayjs('2026-06-01')} allowClear onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear date' }))

    expect(onChange).toHaveBeenLastCalledWith(null, '')
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('shows clear button by default and hides it with allowClear false', () => {
    const { unmount } = render(() => <DatePicker defaultValue={dayjs('2026-06-01')} />)
    expect(screen.getByRole('button', { name: 'Clear date' })).toBeInTheDocument()

    unmount()
    cleanup()
    document.body.innerHTML = ''

    render(() => <DatePicker defaultValue={dayjs('2026-06-01')} allowClear={false} />)
    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument()
  })

  it('does not emit onChange when blurring unchanged valid input', () => {
    const onChange = vi.fn()
    render(() => <DatePicker defaultValue={dayjs('2026-06-01')} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.blur(input)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes popup on outside pointer down and calls onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(() => (
      <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} onOpenChange={onOpenChange} />
    ))

    expect(screen.getByText('2026-06')).toBeInTheDocument()

    fireEvent.pointerDown(document.body)

    await waitFor(() => expect(screen.queryByText('2026-06')).not.toBeInTheDocument())
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('navigates months', () => {
    render(() => <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} />)

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('2026-07')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText('2026-06')).toBeInTheDocument()
  })

  it('does not select disabled dates and passes dayjs values to disabledDate', () => {
    const onChange = vi.fn()
    const disabledDate = vi.fn((date: Dayjs) => date.date() === 10)
    render(() => (
      <DatePicker
        defaultOpen
        defaultValue={dayjs('2026-06-01')}
        disabledDate={disabledDate}
        onChange={onChange}
      />
    ))

    const date = screen.getByRole('button', { name: '2026-06-10' })
    expect(date).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(date)

    expect(disabledDate.mock.calls.some(([value]) => dayjs.isDayjs(value))).toBe(true)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('2026-06-01')
  })

  it('passes disabledDate info and enforces minDate and maxDate', () => {
    const onChange = vi.fn()
    const disabledDate = vi.fn((date: Dayjs, info: { type: string }) => {
      return info.type === 'date' && date.date() === 10
    })
    render(() => (
      <DatePicker
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        minDate={dayjs('2026-06-05')}
        maxDate={dayjs('2026-06-20')}
        disabledDate={disabledDate}
        onChange={onChange}
      />
    ))

    const beforeMin = screen.getByRole('button', { name: '2026-06-04' })
    const disabledByCallback = screen.getByRole('button', { name: '2026-06-10' })
    const afterMax = screen.getByRole('button', { name: '2026-06-21' })

    expect(beforeMin).toHaveAttribute('aria-disabled', 'true')
    expect(disabledByCallback).toHaveAttribute('aria-disabled', 'true')
    expect(afterMax).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(disabledByCallback)

    expect(onChange).not.toHaveBeenCalled()
    expect(
      disabledDate.mock.calls.some(
        ([value, info]) => value.format('YYYY-MM-DD') === '2026-06-10' && info.type === 'date',
      ),
    ).toBe(true)
  })

  it('preserves invalid text on blur when preserveInvalidOnBlur is true', () => {
    render(() => <DatePicker preserveInvalidOnBlur />)

    const input = screen.getByRole('textbox')
    fireEvent.input(input, { target: { value: 'not a date' } })
    fireEvent.blur(input)

    expect(input).toHaveValue('not a date')
  })

  it('treats controlled null value as controlled', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker value={null} defaultOpen defaultValue={dayjs('2026-06-01')} onChange={onChange} />
    ))

    expect(screen.getByRole('textbox')).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: '2026-06-12' }))

    const [nextValue, nextString] = onChange.mock.lastCall as [Dayjs, string]
    expect(dayjs.isDayjs(nextValue)).toBe(true)
    expect(nextValue.format('YYYY-MM-DD')).toBe('2026-06-12')
    expect(nextString).toBe('2026-06-12')
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('respects controlled open state', () => {
    const onOpenChange = vi.fn()
    render(() => <DatePicker open={false} onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('combobox'))

    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(screen.queryByText(/^\d{4}-\d{2}$/)).not.toBeInTheDocument()
  })

  it('keeps popup hidden when controlled closed after requesting open', () => {
    const onOpenChange = vi.fn()
    render(() => <DatePicker open={false} onOpenChange={onOpenChange} />)

    fireEvent.focus(screen.getByRole('textbox'))

    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(document.body.querySelector('.ads-date-picker-dropdown')).toBeFalsy()
  })

  it('does not open or emit open changes when disabled trigger is clicked', () => {
    const onOpenChange = vi.fn()
    render(() => <DatePicker disabled onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('combobox'))

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByText(/^\d{4}-\d{2}$/)).not.toBeInTheDocument()
  })

  it('marks the selected date cell as pressed', () => {
    render(() => <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} />)

    expect(screen.getByRole('button', { name: '2026-06-01' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('displays a custom placeholder on the input', () => {
    render(() => <DatePicker placeholder="Pick a day" />)

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Pick a day')
  })

  it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
    const result = render(() => <DatePicker zIndex={1313} defaultValue={dayjs('2026-06-01')} />)
    const selector = result.container.querySelector('.ads-date-picker') as HTMLElement
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

    fireEvent.click(screen.getByRole('combobox'))

    const dropdown = document.body.querySelector<HTMLElement>('.ads-date-picker-dropdown')!
    expect(dropdown).toBeTruthy()
    expect(result.container.querySelector('.ads-date-picker-dropdown')).toBeFalsy()
    expect(dropdown.style.position).toBe('fixed')
    expect(dropdown.style.top).toBe('46px')
    expect(dropdown.style.left).toBe('20px')
    expect(dropdown.style.zIndex).toBe('1313')
    rectSpy.mockRestore()
  })

  it('applies Solid class to root and topRight placement class to popup', () => {
    const result = render(() => (
      <DatePicker
        class="custom-picker"
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        placement="topRight"
      />
    ))

    expect(result.container.querySelector('.ads-date-picker')).toHaveClass('custom-picker')
    expect(document.body.querySelector('.ads-date-picker-dropdown')).toHaveClass(
      'ads-date-picker-dropdown-top-right',
    )
  })

  it('delays value changes until OK when needConfirm is true', () => {
    const onChange = vi.fn()
    const onOk = vi.fn()
    render(() => (
      <DatePicker
        needConfirm
        defaultOpen
        defaultPickerValue={dayjs('2026-06-01')}
        onChange={onChange}
        onOk={onOk}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('2026-06')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    const [value, dateString] = onChange.mock.calls.at(-1)!
    expect(value.format('YYYY-MM-DD')).toBe('2026-06-15')
    expect(dateString).toBe('2026-06-15')
    expect(onOk).toHaveBeenLastCalledWith(expect.anything())
    expect(screen.queryByText('2026-06')).not.toBeInTheDocument()
  })
})
