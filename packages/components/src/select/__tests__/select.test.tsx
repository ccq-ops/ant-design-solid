import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Select } from '../index'

describe('Select', () => {
  const options = [
    { label: 'Alpha', value: 'a' },
    { label: 'Beta', value: 'b' },
  ]

  it('renders placeholder and opens/closes dropdown', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Select placeholder="Pick one" options={options} onOpenChange={onOpenChange} />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Pick one')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('selects an option and calls onChange', () => {
    const onChange = vi.fn()
    const result = render(() => <Select placeholder="Pick" options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).toHaveBeenCalledWith('b', { label: 'Beta', value: 'b' })
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal('a')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => (
      <Select
        value={value()}
        open={open()}
        options={options}
        onOpenChange={onOpenChange}
        onChange={(next) => setValue(next as string)}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(combobox)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
  })

  it('clears value with allowClear', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Select allowClear defaultValue="a" options={options} onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(result.getByRole('button', { name: 'clear selection' }))

    expect(combobox).not.toHaveTextContent('Alpha')
    expect(onChange).toHaveBeenCalledWith(undefined, undefined)
  })

  it('does not open or clear when disabled', () => {
    const onOpenChange = vi.fn()
    const onChange = vi.fn()
    const result = render(() => (
      <Select
        disabled
        allowClear
        defaultValue="a"
        options={options}
        onOpenChange={onOpenChange}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(combobox)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(result.queryByRole('button', { name: 'clear selection' })).toBeNull()
  })

  it('closes dropdown on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <Select options={options} onOpenChange={onOpenChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('closes with Escape and selects first enabled option with Enter', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Select
        options={[{ label: 'Disabled', value: 'x', disabled: true }, ...options]}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(combobox).toHaveTextContent('Alpha')
    expect(onChange).toHaveBeenCalledWith('a', { label: 'Alpha', value: 'a' })
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Select prefixCls="custom-select" options={options} />)
    expect(withProp.container.querySelector('.custom-select')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Select options={options} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-select')).toBeTruthy()
  })

  it('updates Form.Item value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ choice: 'a' }}>
        <Form.Item name="choice" trigger="onBlur">
          <Select options={options} />
        </Form.Item>
      </Form>
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(form.getFieldValue('choice')).toBe('a')

    fireEvent.focusOut(combobox, { relatedTarget: document.body })

    expect(form.getFieldValue('choice')).toBe('b')
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="choice">
          <Select options={options} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(form.getFieldValue('choice')).toBe('b')
    expect(combobox).toHaveTextContent('Beta')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ choice: 'b' })
  })

  it('filters searchable options and controls search text', () => {
    const onSearch = vi.fn()
    const result = render(() => (
      <Select showSearch placeholder="Search" options={options} onSearch={onSearch} />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.input(result.getByRole('textbox'), { target: { value: 'bet' } })

    expect(onSearch).toHaveBeenCalledWith('bet')
    expect(screen.queryByRole('option', { name: 'Alpha' })).toBeNull()
    expect(screen.getByRole('option', { name: 'Beta' })).toBeTruthy()
  })

  it('supports multiple selection and deselection callbacks', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const onDeselect = vi.fn()
    const result = render(() => (
      <Select
        mode="multiple"
        options={options}
        onChange={onChange}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(screen.getAllByRole('option', { name: 'Alpha' }).at(-1)!)
    fireEvent.click(screen.getAllByRole('option', { name: 'Beta' }).at(-1)!)

    expect(onSelect).toHaveBeenCalledWith('a', { label: 'Alpha', value: 'a' })
    expect(onChange).toHaveBeenLastCalledWith(
      ['a', 'b'],
      [
        expect.objectContaining({ label: 'Alpha', value: 'a' }),
        expect.objectContaining({ label: 'Beta', value: 'b' }),
      ],
    )
    expect(combobox).toHaveTextContent('Alpha')
    expect(combobox).toHaveTextContent('Beta')

    fireEvent.click(result.getByRole('button', { name: 'remove Alpha' }))

    expect(onDeselect).toHaveBeenCalledWith('a', { label: 'Alpha', value: 'a' })
    expect(onChange).toHaveBeenLastCalledWith(
      ['b'],
      [expect.objectContaining({ label: 'Beta', value: 'b' })],
    )
  })

  it('allows multiple selections to grow vertically without clipping wrapped tags', () => {
    render(() => <Select mode="multiple" options={options} />)

    const selectStyle = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .find((styleText) => styleText.includes('.ads-select-multiple'))

    const multipleSelectorRule = selectStyle?.match(
      /\.ads-select-multiple \.ads-select-selector\{[^}]*\}/,
    )?.[0]

    expect(multipleSelectorRule).toBeDefined()
    expect(multipleSelectorRule!).toContain('height:auto;')
    expect(multipleSelectorRule!).toContain('min-height:32px;')
    expect(multipleSelectorRule!).toContain('overflow:visible;')
  })

  it('places the multiple search input inside the wrapped selection flow', () => {
    const result = render(() => <Select mode="multiple" options={options} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)

    const searchInput = result.getByRole('textbox')
    const overflow = result.container.querySelector('.ads-select-selection-overflow')

    expect(overflow).toContainElement(searchInput)
  })

  it('supports tags tokenization and labelInValue output', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Select
        mode="tags"
        labelInValue
        tokenSeparators={[',']}
        options={options}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.input(result.getByRole('textbox'), { target: { value: 'Gamma,Delta' } })

    expect(onChange).toHaveBeenLastCalledWith(
      [
        { value: 'Gamma', label: 'Gamma' },
        { value: 'Delta', label: 'Delta' },
      ],
      [expect.objectContaining({ value: 'Gamma' }), expect.objectContaining({ value: 'Delta' })],
    )
    expect(combobox).toHaveTextContent('Gamma')
    expect(combobox).toHaveTextContent('Delta')
  })

  it('does not create a tag from plain search text until Enter is pressed', () => {
    const onChange = vi.fn()
    const result = render(() => <Select mode="tags" tokenSeparators={[',']} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.input(result.getByRole('textbox'), { target: { value: 'G' } })

    expect(onChange).not.toHaveBeenCalled()
    expect(combobox).not.toHaveTextContent('G')

    fireEvent.keyDown(result.getByRole('textbox'), { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith(
      ['G'],
      [expect.objectContaining({ label: 'G', value: 'G' })],
    )
    expect(combobox).toHaveTextContent('G')
  })

  it('supports grouped options, custom field names, and optionRender', () => {
    const result = render(() => (
      <Select
        open
        fieldNames={{ label: 'name', value: 'id', options: 'items', groupLabel: 'group' }}
        options={[
          {
            group: 'Letters',
            items: [
              { name: 'Alpha', id: 'a' },
              { name: 'Beta', id: 'b' },
            ],
          },
        ]}
        optionRender={(option) => <span>Custom {option.label}</span>}
      />
    ))

    expect(screen.getByText('Letters')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Custom Alpha' })).toBeTruthy()
    expect(result.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
  })

  it('supports popup rendering, appearance props, clear callback, and ref methods', () => {
    const onClear = vi.fn()
    const ref: { current?: { focus: () => void; blur: () => void } } = {}
    const result = render(() => (
      <Select
        ref={ref}
        open
        allowClear={{ clearIcon: <span>clear</span> }}
        defaultValue="a"
        options={options}
        size="large"
        status="error"
        variant="filled"
        prefix={<span>pre</span>}
        suffixIcon={<span>suf</span>}
        popupClassName="popup-extra"
        dropdownStyle={{ width: '240px' }}
        popupRender={(origin) => <div data-testid="wrapped-popup">{origin}</div>}
        onClear={onClear}
      />
    ))

    const root = result.container.querySelector('.ads-select')!
    expect(root).toHaveClass('ads-select-large')
    expect(root).toHaveClass('ads-select-status-error')
    expect(root).toHaveClass('ads-select-filled')
    expect(result.getByText('pre')).toBeTruthy()
    expect(result.getByText('suf')).toBeTruthy()
    expect(screen.getByTestId('wrapped-popup')).toBeTruthy()
    expect(document.body.querySelector('.popup-extra')).toBeTruthy()
    expect((document.body.querySelector('.popup-extra') as HTMLElement).style.width).toBe('240px')

    ref.current?.focus()
    expect(document.activeElement).toBe(result.getByRole('combobox'))
    ref.current?.blur()
    expect(document.activeElement).not.toBe(result.getByRole('combobox'))

    fireEvent.click(result.getByRole('button', { name: 'clear selection' }))
    expect(onClear).toHaveBeenCalled()
  })

  it('uses compact arrow and hides selected label while searching', () => {
    const result = render(() => (
      <Select showSearch defaultValue="b" placeholder="Search fruit" options={options} />
    ))
    const combobox = result.getByRole('combobox')
    const arrow = result.container.querySelector('.ads-select-arrow') as HTMLElement

    expect(arrow).toBeTruthy()
    expect(arrow.querySelector('svg')).toHaveAttribute('width', '0.8em')

    fireEvent.click(combobox)

    expect(result.getByRole('textbox')).toBeTruthy()
    expect(combobox).not.toHaveTextContent('Beta')
    expect(arrow).toHaveClass('ads-select-arrow-open')
  })

  it('keeps placeholder on one line and renders small tag close buttons', () => {
    const placeholderResult = render(() => (
      <Select mode="multiple" placeholder="Search without arrow" options={options} />
    ))
    const result = render(() => (
      <Select
        mode="multiple"
        placeholder="Search without arrow"
        defaultValue={['a']}
        options={options}
      />
    ))
    const placeholder = placeholderResult.container.querySelector(
      '.ads-select-placeholder',
    ) as HTMLElement
    const closeButton = result.getByRole('button', { name: 'remove Alpha' })

    expect(placeholder).toBeTruthy()
    expect(closeButton).toHaveClass('ads-select-tag-close')
  })

  it('uses stable selector sizing before and after clearing', () => {
    const result = render(() => (
      <Select allowClear defaultValue="a" placeholder="Pick one" options={options} />
    ))
    const selector = result.container.querySelector('.ads-select-selector') as HTMLElement

    expect(selector).toBeTruthy()
    expect(selector.style.height).toBe('')
    fireEvent.click(result.getByRole('button', { name: 'clear selection' }))

    expect(selector).toHaveTextContent('Pick one')
  })

  it('keeps the selector from adding inline line-box height to the root', () => {
    render(() => <Select options={options} />)

    const selectStyle = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .find((styleText) => styleText.includes('.ads-select'))

    const selectorRule = selectStyle?.match(/(?:^|\n)(\.ads-select-selector\{[^}]*\})/)?.[1]

    expect(selectorRule).toContain('display:flex;')
    expect(selectorRule).toContain('height:32px;')
  })
})

it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <Select zIndex={1301} options={[{ value: 'one', label: 'One' }]} style={{ width: '200px' }} />
  ))
  const selector = result.container.querySelector('.ads-select-selector') as HTMLElement
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

  const dropdown = Array.from(
    document.body.querySelectorAll<HTMLElement>('.ads-select-dropdown'),
  ).find((element) => element.textContent?.includes('One'))!
  expect(dropdown).toBeTruthy()
  expect(result.container.querySelector('.ads-select-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.top).toBe('46px')
  expect(dropdown.style.left).toBe('20px')
  expect(dropdown.style.width).toBe('200px')
  expect(dropdown.style.zIndex).toBe('1301')
  rectSpy.mockRestore()
})

it('updates portal dropdown position when the page scrolls', () => {
  const result = render(() => <Select options={[{ value: 'one', label: 'One' }]} />)
  const selector = result.container.querySelector('.ads-select-selector') as HTMLElement
  const rectSpy = vi
    .spyOn(selector, 'getBoundingClientRect')
    .mockReturnValueOnce({
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
    .mockReturnValueOnce({
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
    .mockReturnValue({
      top: 30,
      bottom: 62,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 30,
      toJSON: () => ({}),
    } as DOMRect)

  fireEvent.click(selector)

  expect(
    Array.from(document.body.querySelectorAll<HTMLElement>('.ads-select-dropdown')).find(
      (element) => element.textContent?.includes('One'),
    )!.style.top,
  ).toBe('46px')

  window.dispatchEvent(new Event('scroll'))
  expect(rectSpy).toHaveBeenCalledTimes(3)
  const updatedDropdown = Array.from(
    document.body.querySelectorAll<HTMLElement>('.ads-select-dropdown'),
  ).find((element) => element.textContent?.includes('One') && element.style.top === '66px')!
  expect(updatedDropdown).toBeTruthy()
  rectSpy.mockRestore()
})
