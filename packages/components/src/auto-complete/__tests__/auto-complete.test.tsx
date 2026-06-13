import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Input } from '../../input'
import { AutoComplete } from '../index'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('AutoComplete', () => {
  const options = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
    { label: 'Gamma', value: 'gamma', disabled: true },
  ]

  it('renders placeholder and filters options while typing', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <AutoComplete placeholder="Search" options={options} onOpenChange={onOpenChange} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    expect(combobox).toHaveAttribute('placeholder', 'Search')
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.input(combobox, { target: { value: 'be' } })

    expect(combobox.value).toBe('be')
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Beta' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Alpha' })).toBeNull()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes dropdown on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <AutoComplete options={options} onOpenChange={onOpenChange} />)
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'a' } })
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('selects an option and calls callbacks', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} onChange={onChange} onSelect={onSelect} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'a' } })
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }))

    expect(combobox.value).toBe('alpha')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).toHaveBeenLastCalledWith('alpha')
    expect(onSelect).toHaveBeenCalledWith('alpha', { label: 'Alpha', value: 'alpha' })
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal('alpha')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => (
      <AutoComplete
        value={value()}
        open={open()}
        options={options}
        onChange={setValue}
        onOpenChange={onOpenChange}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    expect(combobox.value).toBe('alpha')

    fireEvent.focus(combobox)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(combobox.value).toBe('beta')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('supports filterOption=false, disabled options, clear, and keyboard handling', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <AutoComplete allowClear filterOption={false} options={options} onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'zzz' } })

    expect(screen.getByRole('option', { name: 'Alpha' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Gamma' })).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(screen.getByRole('option', { name: 'Gamma' }))
    expect(combobox.value).toBe('zzz')

    fireEvent.keyDown(combobox, { key: 'Enter' })
    expect(combobox.value).toBe('alpha')

    fireEvent.input(combobox, { target: { value: 'b' } })
    fireEvent.keyDown(combobox, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(result.getByRole('button', { name: 'clear autocomplete' }))
    expect(combobox.value).toBe('')
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('applies size status and variant modifier classes', () => {
    const result = render(() => (
      <AutoComplete
        size="large"
        status="error"
        variant="filled"
        options={[{ value: 'alpha', label: 'Alpha' }]}
      />
    ))

    const root = result.container.querySelector('.ads-auto-complete') as HTMLElement
    expect(root).toHaveClass('ads-auto-complete-large')
    expect(root).toHaveClass('ads-auto-complete-status-error')
    expect(root).toHaveClass('ads-auto-complete-filled')
  })

  it('supports object allowClear with custom icon and onClear callback', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const result = render(() => (
      <AutoComplete
        defaultValue="alpha"
        allowClear={{ clearIcon: <span data-testid="custom-clear">clear</span> }}
        options={options}
        onChange={onChange}
        onClear={onClear}
      />
    ))

    expect(result.getByTestId('custom-clear')).toBeTruthy()

    fireEvent.click(result.getByRole('button', { name: 'clear autocomplete' }))

    expect((result.getByRole('combobox') as HTMLInputElement).value).toBe('')
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('exposes focus and blur methods through ref', () => {
    let ref:
      | {
          focus: () => void
          blur: () => void
          input?: HTMLInputElement | HTMLTextAreaElement | null
          nativeElement?: HTMLElement | null
        }
      | undefined
    const result = render(() => <AutoComplete ref={(api) => (ref = api)} options={options} />)
    const combobox = result.getByRole('combobox') as HTMLInputElement

    ref?.focus()
    expect(document.activeElement).toBe(combobox)
    expect(ref?.input).toBe(combobox)
    expect(ref?.nativeElement).toBe(result.container.querySelector('.ads-auto-complete'))

    ref?.blur()
    expect(document.activeElement).not.toBe(combobox)
  })

  it('applies semantic classNames and styles from object or function configs', () => {
    const result = render(() => (
      <AutoComplete
        options={options}
        classNames={(info) => ({
          root: info.props.disabled ? 'semantic-disabled-root' : 'semantic-root',
          selector: 'semantic-selector',
          input: 'semantic-input',
          popup: 'semantic-popup',
          option: 'semantic-option',
        })}
        styles={{
          root: { width: '240px' },
          selector: { 'border-color': 'rgb(1, 2, 3)' },
          input: { color: 'rgb(4, 5, 6)' },
          popup: { background: 'rgb(7, 8, 9)' },
          option: { color: 'rgb(10, 11, 12)' },
        }}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'a' } })

    expect(result.container.querySelector('.ads-auto-complete')).toHaveClass('semantic-root')
    expect(result.container.querySelector('.ads-auto-complete-selector')).toHaveClass(
      'semantic-selector',
    )
    expect(combobox).toHaveClass('semantic-input')
    expect(screen.getByRole('listbox')).toHaveClass('semantic-popup')
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveClass('semantic-option')
    expect((result.container.querySelector('.ads-auto-complete') as HTMLElement).style.width).toBe(
      '240px',
    )
    expect((screen.getByRole('listbox') as HTMLElement).style.background).toBe('rgb(7, 8, 9)')
  })

  it('supports Solid popup aliases and deprecated React class aliases', () => {
    const result = render(() => (
      <AutoComplete
        options={options}
        popupClass="solid-popup"
        dropdownClass="solid-dropdown"
        popupClassName="react-popup"
        dropdownClassName="react-dropdown"
        dropdownStyle={{ 'max-height': '120px' }}
        dropdownRender={(originNode) => (
          <section data-testid="dropdown-render-wrapper">{originNode}</section>
        )}
        dropdownMatchSelectWidth={260}
      />
    ))
    const selector = result.container.querySelector('.ads-auto-complete-selector') as HTMLElement
    const combobox = result.getByRole('combobox') as HTMLInputElement
    vi.spyOn(selector, 'getBoundingClientRect').mockReturnValue({
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

    fireEvent.input(combobox, { target: { value: 'a' } })

    const popup = screen.getByRole('listbox') as HTMLElement
    expect(screen.getByTestId('dropdown-render-wrapper')).toBeTruthy()
    expect(popup).toHaveClass('solid-popup')
    expect(popup).toHaveClass('solid-dropdown')
    expect(popup).toHaveClass('react-popup')
    expect(popup).toHaveClass('react-dropdown')
    expect(popup.style.maxHeight).toBe('120px')
    expect(popup.style.width).toBe('260px')
  })

  it('normalizes dataSource and applies option class style and title', () => {
    const result = render(() => (
      <AutoComplete
        filterOption={false}
        dataSource={[
          'Plain',
          { value: 'object', text: 'Object Label' },
          { value: 'styled', label: 'Styled', class: 'custom-option', style: { color: 'red' } },
        ]}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)

    expect(screen.getByRole('option', { name: 'Plain' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Object Label' })).toBeTruthy()
    const styled = screen.getByRole('option', { name: 'Styled' }) as HTMLElement
    expect(styled).toHaveClass('custom-option')
    expect(styled.style.color).toBe('red')
    expect(styled).toHaveAttribute('title', 'styled')
  })

  it('uses an Input.TextArea child while preserving autocomplete behavior', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} filterOption={false} onSelect={onSelect}>
        <Input.TextArea class="custom-textarea" />
      </AutoComplete>
    ))
    const combobox = result.getByRole('combobox') as HTMLTextAreaElement

    expect(combobox.tagName).toBe('TEXTAREA')
    expect(combobox).toHaveClass('custom-textarea')
    expect(result.container.querySelector('.ads-auto-complete')).toHaveClass(
      'ads-auto-complete-customize-input',
    )

    const autoCompleteStyle = Array.from(
      document.head.querySelectorAll('style[data-ant-design-solid]'),
    )
      .map((style) => style.textContent ?? '')
      .join('\n')
    expect(autoCompleteStyle).toContain(
      '.ads-auto-complete-customize-input .ads-auto-complete-selector{background:transparent;border-color:transparent;box-shadow:none;height:auto;padding:0;}',
    )
    expect(autoCompleteStyle).toContain(
      '.ads-auto-complete.ads-auto-complete-customize-input:hover:not(.ads-auto-complete-disabled) .ads-auto-complete-selector{background:transparent;border-color:transparent;}',
    )
    expect(autoCompleteStyle).toContain(
      '.ads-auto-complete.ads-auto-complete-customize-input.ads-auto-complete-open .ads-auto-complete-selector{background:transparent;border-color:transparent;box-shadow:none;}',
    )

    fireEvent.input(combobox, { target: { value: 'a' } })
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(combobox.value).toBe('beta')
    expect(onSelect).toHaveBeenCalledWith('beta', { label: 'Beta', value: 'beta' })
  })

  it('calls showSearch.onSearch when the user types', () => {
    const onSearch = vi.fn()
    const result = render(() => <AutoComplete options={options} showSearch={{ onSearch }} />)
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'alp' } })

    expect(onSearch).toHaveBeenCalledWith('alp')
  })

  it('uses showSearch.filterOption before legacy filterOption', () => {
    const legacyFilter = vi.fn(() => false)
    const searchFilter = vi.fn((inputValue: string, option: { value: string }) =>
      option.value.includes(inputValue),
    )
    const result = render(() => (
      <AutoComplete
        options={options}
        filterOption={legacyFilter}
        showSearch={{ filterOption: searchFilter }}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'alp' } })

    expect(screen.getByRole('option', { name: 'Alpha' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Beta' })).toBeNull()
    expect(searchFilter).toHaveBeenCalled()
    expect(legacyFilter).not.toHaveBeenCalled()
  })

  it('renders notFoundContent when no filtered options match', () => {
    const result = render(() => (
      <AutoComplete options={options} notFoundContent={<span>No matches</span>} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'zzz' } })

    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByText('No matches')).toBeTruthy()
  })

  it('wraps dropdown with popupRender and calls onPopupScroll', () => {
    const onPopupScroll = vi.fn()
    const result = render(() => (
      <AutoComplete
        options={options}
        popupRender={(originNode) => <section data-testid="popup-wrapper">{originNode}</section>}
        onPopupScroll={onPopupScroll}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'a' } })

    expect(screen.getByTestId('popup-wrapper')).toBeTruthy()
    fireEvent.scroll(screen.getByRole('listbox'))
    expect(onPopupScroll).toHaveBeenCalledTimes(1)
  })

  it('navigates enabled options with arrow keys and selects the active option with enter', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} filterOption={false} onSelect={onSelect} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(combobox.value).toBe('beta')
    expect(onSelect).toHaveBeenCalledWith('beta', { label: 'Beta', value: 'beta' })
  })

  it('supports backfill while navigating with the keyboard', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} filterOption={false} backfill onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })

    expect(combobox.value).toBe('beta')
    expect(onChange).toHaveBeenLastCalledWith('beta')
  })

  it('does not select the first option on enter when defaultActiveFirstOption is false', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <AutoComplete
        options={options}
        filterOption={false}
        defaultActiveFirstOption={false}
        onSelect={onSelect}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(onSelect).not.toHaveBeenCalled()
    expect(combobox.value).toBe('')
  })

  it('calls onInputKeyDown before internal keyboard handling', () => {
    const onInputKeyDown = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} filterOption={false} onInputKeyDown={onInputKeyDown} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })

    expect(onInputKeyDown).toHaveBeenCalledTimes(1)
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <AutoComplete prefixCls="custom-auto" options={options} />)
    expect(withProp.container.querySelector('.custom-auto')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <AutoComplete options={options} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-auto-complete')).toBeTruthy()
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="city">
          <AutoComplete options={options} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'be' } })
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(form.getFieldValue('city')).toBe('beta')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ city: 'beta' })
  })
})

it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <AutoComplete zIndex={1310} options={[{ value: 'one', label: 'One' }]} />
  ))
  const selector = result.container.querySelector('.ads-auto-complete-selector') as HTMLElement
  const input = result.getByRole('combobox') as HTMLInputElement
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

  fireEvent.input(input, { target: { value: 'o' } })

  const dropdown = screen.getByRole('listbox') as HTMLElement
  expect(result.container.querySelector('.ads-auto-complete-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.top).toBe('46px')
  expect(dropdown.style.left).toBe('20px')
  expect(dropdown.style.width).toBe('200px')
  expect(dropdown.style.zIndex).toBe('1310')
  rectSpy.mockRestore()
})

it('supports popupMatchSelectWidth options', () => {
  const result = render(() => (
    <AutoComplete
      popupMatchSelectWidth={250}
      zIndex={1310}
      options={[{ value: 'one', label: 'One' }]}
    />
  ))
  const selector = result.container.querySelector('.ads-auto-complete-selector') as HTMLElement
  const input = result.getByRole('combobox') as HTMLInputElement
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

  fireEvent.input(input, { target: { value: 'o' } })

  expect((screen.getByRole('listbox') as HTMLElement).style.width).toBe('250px')
  rectSpy.mockRestore()
})
