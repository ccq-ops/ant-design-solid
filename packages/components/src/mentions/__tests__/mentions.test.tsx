import { createCache, StyleProvider } from '@solid-ant-design/cssinjs'
import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Mentions } from '../index'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('Mentions', () => {
  const options = [
    { label: 'Alice', value: 'alice' },
    { label: 'Bob', value: 'bob' },
    { label: 'Charlie', value: 'charlie', disabled: true },
  ]

  it('opens suggestions after prefix and filters options by search text', () => {
    const onSearch = vi.fn()
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Mentions
        placeholder="Mention someone"
        options={options}
        onSearch={onSearch}
        onOpenChange={onOpenChange}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    expect(textarea).toHaveAttribute('placeholder', 'Mention someone')
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.input(textarea, { target: { value: 'hello @a' } })

    expect(textarea.value).toBe('hello @a')
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Alice' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Bob' })).toBeNull()
    expect(onSearch).toHaveBeenLastCalledWith('a', '@')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes suggestions on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Mentions defaultValue="hello @a" options={options} onOpenChange={onOpenChange} />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('selects an option and inserts the mention into the textarea', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <Mentions defaultValue="hello @a" options={options} onChange={onChange} onSelect={onSelect} />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    fireEvent.click(screen.getByRole('option', { name: 'Alice' }))

    expect(textarea.value).toBe('hello @alice ')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).toHaveBeenLastCalledWith('hello @alice ')
    expect(onSelect).toHaveBeenCalledWith({ label: 'Alice', value: 'alice' }, '@')
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal('hi @')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => (
      <Mentions
        value={value()}
        open={open()}
        options={options}
        onChange={setValue}
        onOpenChange={onOpenChange}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    expect(textarea.value).toBe('hi @')

    fireEvent.focus(textarea)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Bob' }))

    expect(textarea.value).toBe('hi @bob ')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('registers compact dropdown and clear button styles', () => {
    document.head.innerHTML = ''
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <Mentions allowClear defaultValue="Hello @alice " options={options} />
      </StyleProvider>
    ))

    expect(result.getByRole('button', { name: 'clear mentions' })).toBeTruthy()

    const styles = Array.from(document.head.querySelectorAll('style[data-ant-design-solid]'))
      .map((style) => style.textContent ?? '')
      .join('\n')
    expect(styles).toContain('.ads-mentions-clear')
    expect(styles).toContain('position:absolute;')
    expect(styles).toContain('.ads-mentions-dropdown')
    expect(styles).toContain('padding:2px 0;')
    expect(styles).toContain('border-radius:4px;')
    expect(styles).toContain('.ads-mentions-item')
    expect(styles).toContain('font-size:13px;')
    expect(styles).toContain('line-height:20px;')
    expect(styles).toContain('padding:2px 8px;')
  })

  it('supports multiple prefixes, disabled options, clear, and keyboard handling', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Mentions
        allowClear
        defaultValue="ask #zzz"
        prefix={['@', '#']}
        filterOption={false}
        options={options}
        onChange={onChange}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)

    expect(screen.getByRole('option', { name: 'Alice' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Charlie' })).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(screen.getByRole('option', { name: 'Charlie' }))
    expect(textarea.value).toBe('ask #zzz')

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toBe('ask #alice ')

    fireEvent.input(textarea, { target: { value: 'ask @b' } })
    fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(result.getByRole('button', { name: 'clear mentions' }))
    expect(textarea.value).toBe('')
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('honors validateSearch and split when selecting mentions', () => {
    const result = render(() => (
      <Mentions
        defaultValue="mail @"
        split=","
        options={options}
        validateSearch={(search) => !search.includes('.')}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.input(textarea, { target: { value: 'mail @a.b' } })
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.input(textarea, { target: { value: 'mail @a' } })
    fireEvent.click(screen.getByRole('option', { name: 'Alice' }))
    expect(textarea.value).toBe('mail @alice,')
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Mentions prefixCls="custom-mentions" options={options} />)
    expect(withProp.container.querySelector('.custom-mentions')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Mentions options={options} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-mentions')).toBeTruthy()
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="comment">
          <Mentions options={options} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.input(textarea, { target: { value: 'hello @a' } })
    fireEvent.click(screen.getByRole('option', { name: 'Alice' }))

    expect(form.getFieldValue('comment')).toBe('hello @alice ')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ comment: 'hello @alice ' })
  })

  it('supports size, status, variant, rootClass, popupClass, and semantic classNames/styles', () => {
    const result = render(() => (
      <Mentions
        defaultValue="hello @"
        options={options}
        size="large"
        status="error"
        variant="filled"
        rootClass="mentions-root-extra"
        popupClass="mentions-popup-extra"
        classNames={{
          root: 'mentions-root-slot',
          textarea: 'mentions-textarea-slot',
          popup: 'mentions-popup-slot',
          option: 'mentions-option-slot',
        }}
        styles={{
          root: { width: '320px' },
          textarea: { color: 'red' },
          popup: { 'max-height': '120px' },
          option: { 'font-weight': '700' },
        }}
      />
    ))
    const root = result.container.querySelector('.ads-mentions') as HTMLElement
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)

    const popup = screen.getByRole('listbox') as HTMLElement
    const option = screen.getByRole('option', { name: 'Alice' }) as HTMLElement

    expect(root).toHaveClass('ads-mentions-large')
    expect(root).toHaveClass('ads-mentions-status-error')
    expect(root).toHaveClass('ads-mentions-filled')
    expect(root).toHaveClass('mentions-root-extra')
    expect(root).toHaveClass('mentions-root-slot')
    expect(root.style.width).toBe('320px')
    expect(textarea).toHaveClass('mentions-textarea-slot')
    expect(textarea.style.color).toBe('red')
    expect(popup).toHaveClass('mentions-popup-extra')
    expect(popup).toHaveClass('mentions-popup-slot')
    expect(popup.style.maxHeight).toBe('120px')
    expect(option).toHaveClass('mentions-option-slot')
    expect(option.style.fontWeight).toBe('700')
  })

  it('renders loading and not found content in the popup', () => {
    const loadingResult = render(() => (
      <Mentions defaultValue="hello @" loading options={options} />
    ))
    fireEvent.focus(loadingResult.getByRole('textbox'))
    expect(screen.getByRole('option', { name: /loading/i })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    cleanup()

    const emptyResult = render(() => (
      <Mentions defaultValue="hello @z" options={options} notFoundContent={<span>No match</span>} />
    ))
    fireEvent.focus(emptyResult.getByRole('textbox'))
    expect(screen.getByText('No match')).toBeTruthy()
  })

  it('supports top placement and popup scroll callback', () => {
    const onPopupScroll = vi.fn()
    const result = render(() => (
      <Mentions
        placement="top"
        defaultValue="hello @"
        options={options}
        onPopupScroll={onPopupScroll}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement
    const rectSpy = vi.spyOn(textarea, 'getBoundingClientRect').mockReturnValue({
      top: 80,
      bottom: 120,
      left: 20,
      right: 220,
      width: 200,
      height: 40,
      x: 20,
      y: 80,
      toJSON: () => ({}),
    } as DOMRect)
    const spanRectSpy = vi
      .spyOn(HTMLSpanElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLSpanElement) {
        if (this.getAttribute('data-mentions-caret') === 'true') {
          return {
            top: 92,
            bottom: 110,
            left: 44,
            right: 44,
            width: 0,
            height: 18,
            x: 44,
            y: 92,
            toJSON: () => ({}),
          } as DOMRect
        }
        return new DOMRect()
      })

    fireEvent.focus(textarea)

    const popup = screen.getByRole('listbox') as HTMLElement
    expect(popup.style.bottom).toBe('678px')

    fireEvent.scroll(popup)
    expect(onPopupScroll).toHaveBeenCalledTimes(1)
    spanRectSpy.mockRestore()
    rectSpy.mockRestore()
  })

  it('supports allowClear object, custom clear icon, onClear, showCount, count, autoSize, and onPressEnter', () => {
    const onClear = vi.fn()
    const onPressEnter = vi.fn()
    const result = render(() => (
      <Mentions
        defaultValue="hello"
        allowClear={{ clearIcon: <span data-testid="custom-clear">x</span> }}
        onClear={onClear}
        showCount
        count={{ max: 10 }}
        autoSize={{ minRows: 2, maxRows: 4 }}
        onPressEnter={onPressEnter}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    expect(textarea).toHaveAttribute('rows', '2')
    expect(textarea.style.maxHeight).toBe('96px')
    expect(textarea.style.resize).toBe('none')
    expect(screen.getByText('5 / 10')).toBeTruthy()

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onPressEnter).toHaveBeenCalledTimes(1)

    fireEvent.click(result.getByTestId('custom-clear'))
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(textarea.value).toBe('')
    expect(screen.getByText('0 / 10')).toBeTruthy()
  })

  it('moves active option with arrow keys and selects it with enter', () => {
    const result = render(() => <Mentions defaultValue="hello @" options={options} />)
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })

    expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toBe('hello @bob ')
  })

  it('supports Mentions.Option children and static getMentions', () => {
    const result = render(() => (
      <Mentions defaultValue="hello @" filterOption={false}>
        <Mentions.Option value="solid">Solid</Mentions.Option>
        <Mentions.Option value="disabled" disabled>
          Disabled
        </Mentions.Option>
      </Mentions>
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)

    expect(screen.getByRole('option', { name: 'Solid' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Disabled' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(Mentions.getMentions('Hi @alice and #topic ', { prefix: ['@', '#'] })).toEqual([
      { prefix: '@', value: 'alice' },
      { prefix: '#', value: 'topic' },
    ])
  })
})

it('renders dropdown in a portal with fixed positioning, content width, and explicit zIndex', () => {
  const result = render(() => (
    <Mentions zIndex={1311} defaultValue="hello @" options={[{ value: 'one', label: 'One' }]} />
  ))
  const textarea = result.getByRole('textbox') as HTMLTextAreaElement
  const rectSpy = vi.spyOn(textarea, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 50,
    left: 20,
    right: 220,
    width: 200,
    height: 40,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)
  const spanRectSpy = vi
    .spyOn(HTMLSpanElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLSpanElement) {
      if (this.getAttribute('data-mentions-caret') === 'true') {
        return {
          top: 28,
          bottom: 46,
          left: 74,
          right: 74,
          width: 0,
          height: 18,
          x: 74,
          y: 28,
          toJSON: () => ({}),
        } as DOMRect
      }
      return new DOMRect()
    })

  fireEvent.focus(textarea)

  const dropdown = screen.getByRole('listbox') as HTMLElement
  expect(result.container.querySelector('.ads-mentions-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.top).toBe('48px')
  expect(dropdown.style.left).toBe('74px')
  expect(dropdown.style.width).toBe('')
  expect(dropdown.style.zIndex).toBe('1311')
  spanRectSpy.mockRestore()
  rectSpy.mockRestore()
})

it('positions dropdown at the active mention trigger instead of the textarea edge', () => {
  const result = render(() => (
    <Mentions zIndex={1311} defaultValue="hello @" options={[{ value: 'one', label: 'One' }]} />
  ))
  const textarea = result.getByRole('textbox') as HTMLTextAreaElement
  const rectSpy = vi.spyOn(textarea, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 50,
    left: 20,
    right: 420,
    width: 400,
    height: 40,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)
  const appendSpy = vi.spyOn(document.body, 'appendChild')
  const originalSpanRect = HTMLSpanElement.prototype.getBoundingClientRect
  vi.spyOn(HTMLSpanElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLSpanElement) {
      if (this.getAttribute('data-mentions-caret') === 'true') {
        return {
          top: 30,
          bottom: 48,
          left: 96,
          right: 96,
          width: 0,
          height: 18,
          x: 96,
          y: 30,
          toJSON: () => ({}),
        } as DOMRect
      }
      return originalSpanRect.call(this)
    },
  )

  fireEvent.focus(textarea)

  const mirror = appendSpy.mock.calls
    .map(([node]) => node)
    .find(
      (node): node is HTMLDivElement =>
        node instanceof HTMLDivElement && node.getAttribute('data-mentions-measure') === 'true',
    )
  expect(mirror).toBeTruthy()

  const dropdown = screen.getByRole('listbox') as HTMLElement
  expect(dropdown.style.left).toBe('96px')
  expect(dropdown.style.top).toBe('50px')

  vi.mocked(HTMLSpanElement.prototype.getBoundingClientRect).mockRestore()
  appendSpy.mockRestore()
  rectSpy.mockRestore()
})
