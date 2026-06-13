import { fireEvent, render } from '@solidjs/testing-library'
import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Input } from '../index'

describe('Input extended API', () => {
  it('calls onPressEnter when Enter is pressed', () => {
    const onPressEnter = vi.fn()
    const result = render(() => <Input onPressEnter={onPressEnter} />)
    const input = result.container.querySelector('input') as HTMLInputElement

    fireEvent.keyDown(input, { key: 'Enter' })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onPressEnter).toHaveBeenCalledOnce()
  })

  it('supports allowClear object, custom clear icon and onClear', () => {
    const onClear = vi.fn()
    const onChange = vi.fn()
    const result = render(() => (
      <Input
        defaultValue="abc"
        allowClear={{ clearIcon: <span data-testid="custom-clear">x</span> }}
        onClear={onClear}
        onChange={onChange}
      />
    ))
    const input = result.container.querySelector('input') as HTMLInputElement

    fireEvent.click(result.getByTestId('custom-clear'))

    expect(input.value).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('does not render clear button when allowClear object is disabled', () => {
    const result = render(() => <Input defaultValue="abc" allowClear={{ disabled: true }} />)

    expect(result.queryByRole('button', { name: 'clear input' })).toBeNull()
  })

  it('renders showCount with formatter and count strategy', () => {
    const result = render(() => (
      <Input
        defaultValue="aa"
        count={{ max: 3, strategy: (value) => value.length * 2 }}
        showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength}` }}
      />
    ))

    expect(result.getByText('4/3')).toBeTruthy()
    expect(result.container.querySelector('.ads-input-count-exceed')).toBeTruthy()
  })

  it('applies variant, semantic classNames and styles', () => {
    const result = render(() => (
      <Input
        variant="filled"
        classNames={{ wrapper: 'custom-wrapper', input: 'custom-input' }}
        styles={{ wrapper: { width: '123px' }, input: { color: 'red' } }}
      />
    ))
    const wrapper = result.container.querySelector('.ads-input-affix-wrapper') as HTMLElement
    const input = result.container.querySelector('input') as HTMLInputElement

    expect(wrapper).toHaveClass('ads-input-variant-filled')
    expect(wrapper).toHaveClass('custom-wrapper')
    expect(wrapper.style.width).toBe('123px')
    expect(input).toHaveClass('custom-input')
    expect(input.style.color).toBe('red')
  })

  it('uses ConfigProvider disabled and input defaults', () => {
    const result = render(() => (
      <ConfigProvider componentDisabled input={{ class: 'configured-input', variant: 'filled' }}>
        <Input defaultValue="locked" />
      </ConfigProvider>
    ))
    const input = result.getByDisplayValue('locked') as HTMLInputElement
    const wrapper = result.container.querySelector('.ads-input')!

    expect(input.disabled).toBe(true)
    expect(wrapper).toHaveClass('configured-input')
    expect(wrapper).toHaveClass('ads-input-variant-filled')
  })

  it('supports antd v6 semantic root key and function configs', () => {
    const result = render(() => (
      <Input
        defaultValue="solid"
        size="large"
        classNames={(info) => ({
          root: info.props.size === 'large' ? 'semantic-root' : 'wrong-root',
          input: 'semantic-input',
        })}
        styles={(info) => ({
          root: { width: info.props.value === 'solid' ? '234px' : '1px' },
          input: { color: 'green' },
        })}
      />
    ))
    const wrapper = result.container.querySelector('.ads-input-affix-wrapper') as HTMLElement
    const input = result.container.querySelector('input') as HTMLInputElement

    expect(wrapper).toHaveClass('semantic-root')
    expect(wrapper.style.width).toBe('234px')
    expect(input).toHaveClass('semantic-input')
    expect(input.style.color).toBe('green')
  })

  it('supports rootClassName, custom prefixCls, bordered false, and htmlSize', () => {
    const result = render(() => (
      <Input rootClassName="root-extra" prefixCls="custom-input" bordered={false} htmlSize={7} />
    ))
    const wrapper = result.container.querySelector('.custom-input-affix-wrapper') as HTMLElement
    const input = result.container.querySelector('input') as HTMLInputElement

    expect(wrapper).toHaveClass('root-extra')
    expect(wrapper).toHaveClass('custom-input-variant-borderless')
    expect(input).toHaveClass('custom-input')
    expect(input).toHaveAttribute('size', '7')
  })

  it('renders addonBefore and addonAfter around Input', () => {
    const result = render(() => (
      <Input addonBefore={<span data-testid="before">https://</span>} addonAfter=".com" />
    ))
    const wrapper = result.container.firstElementChild as HTMLElement

    expect(wrapper).toHaveClass('ads-input-group-wrapper')
    expect(result.getByTestId('before')).toBeInTheDocument()
    expect(wrapper).toHaveTextContent('.com')
    expect(wrapper.querySelector('.ads-input-affix-wrapper')).toBeInTheDocument()
  })

  it('registers addon and compact group border radius correction styles', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Input addonBefore="https://" addonAfter=".com" />
        <Input.Group compact>
          <Input defaultValue="a" />
          <Input defaultValue="b" />
        </Input.Group>
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    const rules = css.split('}').map((rule) => `${rule}}`)
    const addonFirstRule = rules.find((rule) =>
      rule.includes('.ads-input-wrapper > .ads-input-group-addon:first-child'),
    )
    const addonLastRule = rules.find((rule) =>
      rule.includes('.ads-input-wrapper > .ads-input-group-addon:last-child'),
    )
    const addonRule = rules.find((rule) => rule.includes('.ads-input-group-addon{'))
    const middleInputRule = rules.find((rule) =>
      rule.includes(
        '.ads-input-wrapper > .ads-input-affix-wrapper:not(:first-child):not(:last-child)',
      ),
    )
    const compactNotFirstRule = rules.find((rule) =>
      rule.includes('.ads-input-group-compact > .ads-input-affix-wrapper:not(:first-child)'),
    )
    const compactNotLastRule = rules.find((rule) =>
      rule.includes('.ads-input-group-compact > *:not(:last-child)'),
    )

    expect(addonRule).toContain('border-radius:6px;')
    expect(addonFirstRule).toContain('border-end-end-radius:0;')
    expect(addonFirstRule).toContain('border-start-end-radius:0;')
    expect(addonFirstRule).toContain('border-inline-end:0;')
    expect(addonLastRule).toContain('border-start-start-radius:0;')
    expect(addonLastRule).toContain('border-end-start-radius:0;')
    expect(addonLastRule).toContain('border-inline-start:0;')
    expect(middleInputRule).toContain('border-radius:0;')
    expect(compactNotFirstRule).toContain('border-start-start-radius:0;')
    expect(compactNotFirstRule).toContain('border-end-start-radius:0;')
    expect(compactNotLastRule).toContain('border-start-end-radius:0;')
    expect(compactNotLastRule).toContain('border-end-end-radius:0;')
    expect(compactNotLastRule).toContain('margin-inline-end:-1px;')
    expect(compactNotLastRule).toContain('border-inline-end-width:1px;')
  })

  it('exposes Input ref methods and native elements', () => {
    let ref:
      | {
          focus: (options?: { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' }) => void
          blur: () => void
          select: () => void
          setSelectionRange: (
            start: number,
            end: number,
            direction?: 'forward' | 'backward' | 'none',
          ) => void
          input?: HTMLInputElement | null
          nativeElement?: HTMLElement | null
        }
      | undefined
    const result = render(() => <Input ref={(next) => (ref = next)} defaultValue="solid" />)
    const wrapper = result.container.querySelector('.ads-input-affix-wrapper') as HTMLElement
    const input = result.container.querySelector('input') as HTMLInputElement

    ref?.focus({ cursor: 'all' })
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(input.value.length)

    ref?.setSelectionRange(1, 3)
    expect(input.selectionStart).toBe(1)
    expect(input.selectionEnd).toBe(3)

    ref?.blur()
    expect(document.activeElement).not.toBe(input)
    expect(ref?.input).toBe(input)
    expect(ref?.nativeElement).toBe(wrapper)
  })

  it('renders deprecated Input.Group for compact compatibility', () => {
    const result = render(() => (
      <Input.Group compact size="large" class="group-extra">
        <Input defaultValue="a" />
        <Input defaultValue="b" />
      </Input.Group>
    ))
    const group = result.container.firstElementChild as HTMLElement

    expect(group).toHaveClass('ads-input-group')
    expect(group).toHaveClass('ads-input-group-compact')
    expect(group).toHaveClass('ads-input-group-lg')
    expect(group).toHaveClass('group-extra')
    expect(group.querySelectorAll('input')).toHaveLength(2)
  })
})

describe('Input.TextArea extended API', () => {
  it('supports allowClear and showCount formatter', () => {
    const onClear = vi.fn()
    const result = render(() => (
      <Input.TextArea
        defaultValue="hello"
        allowClear
        onClear={onClear}
        showCount={{ formatter: ({ count, maxLength }) => `chars ${count}/${maxLength}` }}
        maxLength={10}
      />
    ))
    const textarea = result.container.querySelector('textarea') as HTMLTextAreaElement

    expect(result.getByText('chars 5/10')).toBeTruthy()
    fireEvent.click(result.getByRole('button', { name: 'clear textarea' }))

    expect(textarea.value).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(result.getByText('chars 0/10')).toBeTruthy()
  })

  it('applies autoSize constraints and variant semantic props', () => {
    const result = render(() => (
      <Input.TextArea
        autoSize={{ minRows: 2, maxRows: 4 }}
        variant="underlined"
        classNames={{ wrapper: 'textarea-wrapper', textarea: 'textarea-input' }}
        styles={{ wrapper: { width: '321px' }, textarea: { color: 'blue' } }}
      />
    ))
    const wrapper = result.container.querySelector('.ads-input-textarea-wrapper') as HTMLElement
    const textarea = result.container.querySelector('textarea') as HTMLTextAreaElement

    expect(wrapper).toHaveClass('ads-input-variant-underlined')
    expect(wrapper).toHaveClass('textarea-wrapper')
    expect(wrapper.style.width).toBe('321px')
    expect(textarea).toHaveClass('textarea-input')
    expect(textarea.rows).toBe(2)
    expect(textarea.style.maxHeight).not.toBe('')
    expect(textarea.style.overflowY).toBe('auto')
  })

  it('supports TextArea size, onResize, semantic root key, and ref API', () => {
    const onResize = vi.fn()
    let ref:
      | {
          focus: (options?: { preventScroll?: boolean; cursor?: 'start' | 'end' | 'all' }) => void
          blur: () => void
          resizableTextArea?: { textArea?: HTMLTextAreaElement }
          nativeElement?: HTMLElement | null
        }
      | undefined
    const result = render(() => (
      <Input.TextArea
        ref={(next) => (ref = next)}
        defaultValue="textarea"
        size="large"
        onResize={onResize}
        classNames={{ root: 'ta-root', textarea: 'ta-input' }}
        styles={{ root: { width: '345px' } }}
      />
    ))
    const wrapper = result.container.querySelector('.ads-input-textarea-wrapper') as HTMLElement
    const textarea = result.container.querySelector('textarea') as HTMLTextAreaElement

    ref?.focus({ cursor: 'all' })
    expect(document.activeElement).toBe(textarea)
    expect(textarea.selectionStart).toBe(0)
    expect(textarea.selectionEnd).toBe(textarea.value.length)
    ref?.blur()

    fireEvent(textarea, new Event('resize'))

    expect(wrapper).toHaveClass('ads-input-textarea-wrapper-lg')
    expect(wrapper).not.toHaveClass('ads-input-lg')
    expect(wrapper).toHaveClass('ta-root')
    expect(wrapper.style.width).toBe('345px')
    expect(textarea).toHaveClass('ta-input')
    expect(ref?.resizableTextArea?.textArea).toBe(textarea)
    expect(ref?.nativeElement).toBe(wrapper)
    expect(onResize).toHaveBeenCalledWith({ width: 0, height: 0 })
  })

  it('keeps large TextArea padding on the textarea instead of applying the shared input large rule to the wrapper', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Input.TextArea size="large" />
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    const inputLargeRule = css.match(/\.ads-input-lg\{[^}]*\}/)?.[0]
    const textareaLargeRule = css.match(
      /\.ads-input-textarea-wrapper-lg \.ads-input-textarea\{[^}]*\}/,
    )?.[0]

    expect(inputLargeRule).toContain('padding:7px 11px;')
    expect(textareaLargeRule).toContain('padding:7px 11px;')
    expect(textareaLargeRule).toContain('font-size:16px;')
  })
})

describe('Input.Search', () => {
  it('calls onSearch from icon click and enter key', () => {
    const onSearch = vi.fn()
    const result = render(() => <Input.Search defaultValue="solid" onSearch={onSearch} />)
    const root = result.container.firstElementChild as HTMLElement
    const input = result.container.querySelector('input') as HTMLInputElement
    const button = result.getByRole('button', { name: 'search' })

    expect(root).toHaveClass('ads-input-search')
    expect(root).not.toHaveClass('ads-input-search-with-button')
    expect(root).toHaveClass('ads-input-group-compact')
    expect(root.children[0]).toHaveClass('ads-input-affix-wrapper')
    expect(root.children[1]).toBe(button)
    expect(root.querySelector('.ads-input-group-addon')).toBeNull()
    expect(button.querySelector('svg')).toBeInTheDocument()

    fireEvent.click(button)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSearch).toHaveBeenCalledTimes(2)
    expect(onSearch.mock.calls[0][0]).toBe('solid')
    expect(onSearch.mock.calls[0][2]).toEqual({ source: 'input' })
  })

  it('renders enter button and loading state', () => {
    const result = render(() => <Input.Search defaultValue="q" enterButton="Go" loading />)

    expect(result.getByRole('button', { name: 'Go' })).toHaveClass('ads-btn')
    expect(result.getByRole('button', { name: 'Go' })).toHaveClass('ads-input-search-btn')
    expect(result.container.firstElementChild).toHaveClass('ads-input-search-with-button')
    expect(result.container.firstElementChild?.children[1]).toBe(
      result.getByRole('button', { name: 'Go' }),
    )
    expect(result.container.querySelector('.ads-input-search-loading')).toBeTruthy()
  })

  it('calls onSearch from the enter button', () => {
    const onSearch = vi.fn()
    const result = render(() => (
      <Input.Search defaultValue="q" enterButton="Go" onSearch={onSearch} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Go' }))

    expect(onSearch).toHaveBeenCalledOnce()
    expect(onSearch.mock.calls[0][0]).toBe('q')
    expect(onSearch.mock.calls[0][2]).toEqual({ source: 'input' })
  })

  it('renders Search addonAfter after the search button as a compact sibling', () => {
    const result = render(() => (
      <Input.Search enterButton="Go" addonAfter={<span data-testid="extra-addon">.com</span>} />
    ))
    const root = result.container.firstElementChild as HTMLElement
    const button = result.getByRole('button', { name: 'Go' })
    const extra = result.getByTestId('extra-addon')

    expect(root.children[1]).toBe(button)
    expect(root.children[2]).toBe(extra)
  })

  it('registers search loading icon rotation styles on loading wrappers', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Input.Search enterButton="Search" loading />
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain('@keyframes adsIconRotate{to{transform:rotate(360deg);}}')
    expect(css).toContain(
      '.ads-input-search-loading svg{animation:adsIconRotate 1s linear infinite;',
    )
  })

  it('keeps default input wrapper at middle control height instead of being inflated by inner input height', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Input />
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    const affixRule = css.match(/\.ads-input-affix-wrapper\{[^}]*\}/)?.[0]
    const inputRule = css.match(/\.ads-input\{[^}]*\}/)?.[0]

    expect(affixRule).toBeDefined()
    expect(affixRule!).toContain('height:32px;')
    expect(inputRule).toBeDefined()
    expect(inputRule!).toContain('height:100%;')
  })

  it('keeps loading enter button content horizontally aligned', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Input.Search enterButton="Search" loading />
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    const searchButtonRule = css.match(/\.ads-input-search-btn\{[^}]*\}/)?.[0]

    expect(searchButtonRule).toBeDefined()
    expect(searchButtonRule!).toContain('display:inline-flex;')
    expect(searchButtonRule!).toContain('align-items:center;')
  })

  it('aligns search and clear icons in the same suffix slot', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Input.Search allowClear defaultValue="solid" />
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    const rules = css.split('}').map((rule) => `${rule}}`)
    const iconButtonRule = rules.find(
      (rule) =>
        rule.includes('.ads-input-clear') &&
        rule.includes('.ads-input-search-icon') &&
        rule.includes('.ads-input-password-icon'),
    )
    const suffixIconRule = rules.find(
      (rule) =>
        rule.includes('.ads-input-suffix > .ads-input-search-icon') &&
        rule.includes('.ads-input-suffix > .ads-input-password-icon'),
    )

    expect(iconButtonRule).toBeDefined()
    expect(iconButtonRule!).toContain('display:inline-flex;')
    expect(iconButtonRule!).toContain('align-items:center;')
    expect(iconButtonRule!).toContain('justify-content:center;')
    expect(iconButtonRule!).toContain('width:16px;')
    expect(iconButtonRule!).toContain('height:16px;')
    expect(suffixIconRule).toBeDefined()
    expect(suffixIconRule!).toContain('margin-inline-start:0;')
  })

  it('supports inputPrefixCls and semantic button styles', () => {
    const result = render(() => (
      <Input.Search
        inputPrefixCls="custom-search"
        enterButton="Go"
        classNames={{ button: 'search-button-extra' }}
        styles={{ button: { width: '88px' } }}
      />
    ))
    const wrapper = result.container.querySelector('.custom-search-affix-wrapper') as HTMLElement
    const button = result.getByRole('button', { name: 'Go' }) as HTMLButtonElement

    expect(wrapper).toBeInTheDocument()
    expect(button).toHaveClass('ads-input-search-btn')
    expect(button).toHaveClass('search-button-extra')
    expect(button.style.width).toBe('88px')
  })
})

describe('Input.Password', () => {
  it('toggles password visibility and supports iconRender', () => {
    const result = render(() => (
      <Input.Password iconRender={(visible) => <span>{visible ? 'hide' : 'show'}</span>} />
    ))
    const input = result.container.querySelector('input') as HTMLInputElement

    expect(input.type).toBe('password')
    fireEvent.click(result.getByRole('button', { name: 'toggle password visibility' }))

    expect(input.type).toBe('text')
    expect(result.getByText('hide')).toBeTruthy()
  })

  it('does not forward Password-only props to the native input', () => {
    const result = render(() => <Input.Password action="hover" inputPrefixCls="custom-password" />)
    const input = result.container.querySelector('input') as HTMLInputElement

    expect(input).not.toHaveAttribute('action')
    expect(input).not.toHaveAttribute('inputPrefixCls')
  })

  it('supports controlled visibilityToggle', () => {
    const onVisibleChange = vi.fn()
    const result = render(() => (
      <Input.Password visibilityToggle={{ visible: true, onVisibleChange }} />
    ))
    const input = result.container.querySelector('input') as HTMLInputElement

    expect(input.type).toBe('text')
    fireEvent.click(result.getByRole('button', { name: 'toggle password visibility' }))

    expect(onVisibleChange).toHaveBeenCalledWith(false)
  })

  it('updates controlled visibility when parent signal changes after clicking custom text icon', () => {
    const Controlled = () => {
      const [visible, setVisible] = createSignal(false)
      return (
        <Input.Password
          visibilityToggle={{ visible: visible(), onVisibleChange: setVisible }}
          iconRender={(nextVisible) => <span>{nextVisible ? 'Hide' : 'Show'}</span>}
          defaultValue="controlled"
        />
      )
    }
    const result = render(() => <Controlled />)
    const input = result.container.querySelector('input') as HTMLInputElement

    expect(input.type).toBe('password')
    fireEvent.click(result.getByText('Show'))

    expect(input.type).toBe('text')
    expect(result.getByText('Hide')).toBeInTheDocument()
  })

  it('supports suffix and hover visibility action', () => {
    const result = render(() => (
      <Input.Password
        defaultValue="secret"
        action="hover"
        suffix={<span data-testid="password-suffix">safe</span>}
      />
    ))
    const input = result.container.querySelector('input') as HTMLInputElement
    const toggle = result.getByRole('button', { name: 'toggle password visibility' })

    expect(result.getByTestId('password-suffix')).toBeInTheDocument()
    expect(input.type).toBe('password')

    fireEvent.mouseEnter(toggle)
    expect(input.type).toBe('text')

    fireEvent.mouseLeave(toggle)
    expect(input.type).toBe('password')
  })

  it('wraps password suffix and visibility icon in an aligned inline container', () => {
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <Input.Password suffix={<span data-testid="password-suffix">safe</span>} />
      </StyleProvider>
    ))

    const suffixGroup = result.container.querySelector('.ads-input-password-suffix') as HTMLElement
    const css = extractStyle(cache)
    const suffixGroupRule = css.match(/\.ads-input-password-suffix\{[^}]*\}/)?.[0]

    expect(suffixGroup).toContainElement(result.getByTestId('password-suffix'))
    expect(suffixGroup).toContainElement(
      result.getByRole('button', { name: 'toggle password visibility' }),
    )
    expect(suffixGroupRule).toBeDefined()
    expect(suffixGroupRule!).toContain('display:inline-flex;')
    expect(suffixGroupRule!).toContain('align-items:center;')
  })
})

describe('Input.OTP', () => {
  it('renders length inputs, calls onInput and calls onChange when filled', () => {
    const onInput = vi.fn()
    const onChange = vi.fn()
    const result = render(() => <Input.OTP length={3} onInput={onInput} onChange={onChange} />)
    const inputs = result.container.querySelectorAll('input')

    fireEvent.input(inputs[0], { target: { value: '1' } })
    fireEvent.input(inputs[1], { target: { value: '2' } })
    fireEvent.input(inputs[2], { target: { value: '3' } })

    expect(inputs).toHaveLength(3)
    expect(onInput).toHaveBeenLastCalledWith(['1', '2', '3'])
    expect(onChange).toHaveBeenCalledWith('123')
  })

  it('supports mask, formatter and separator', () => {
    const result = render(() => (
      <Input.OTP
        length={4}
        defaultValue="1234"
        mask="•"
        formatter={(value) => value.toUpperCase()}
        separator={(index) => (index === 1 ? <span data-testid="dash">-</span> : null)}
      />
    ))
    const inputs = result.container.querySelectorAll('input')

    expect(inputs[0].value).toBe('•')
    expect(inputs[1].value).toBe('•')
    expect(result.getByTestId('dash')).toBeTruthy()
  })

  it('supports controlled value', () => {
    const Controlled = () => {
      const [value, setValue] = createSignal('12')
      return (
        <>
          <Input.OTP length={2} value={value()} onChange={setValue} />
          <span data-testid="value">{value()}</span>
        </>
      )
    }
    const result = render(() => <Controlled />)
    const inputs = result.container.querySelectorAll('input')

    fireEvent.input(inputs[1], { target: { value: '9' } })

    expect(result.getByTestId('value')).toHaveTextContent('19')
  })

  it('moves focus to the previous OTP input when Backspace is pressed on an empty input', () => {
    const result = render(() => <Input.OTP length={3} defaultValue="12" />)
    const inputs = result.container.querySelectorAll('input')

    inputs[1].focus()
    fireEvent.input(inputs[1], { target: { value: '' } })
    expect(document.activeElement).toBe(inputs[1])

    fireEvent.keyDown(inputs[1], { key: 'Backspace' })

    expect(document.activeElement).toBe(inputs[0])
  })

  it('supports OTP rootClassName, type and ref API', () => {
    let ref: { focus: () => void; blur: () => void; nativeElement?: HTMLDivElement } | undefined
    const result = render(() => (
      <Input.OTP ref={(next) => (ref = next)} rootClassName="otp-root" length={2} type="tel" />
    ))
    const root = result.container.querySelector('.ads-input-otp') as HTMLDivElement
    const inputs = result.container.querySelectorAll('input')

    ref?.focus()
    expect(document.activeElement).toBe(inputs[0])
    ref?.blur()
    expect(document.activeElement).not.toBe(inputs[0])
    expect(root).toHaveClass('otp-root')
    expect(inputs[0]).toHaveAttribute('type', 'tel')
    expect(ref?.nativeElement).toBe(root)
  })
})
