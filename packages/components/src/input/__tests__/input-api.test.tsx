import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
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
})

describe('Input.Search', () => {
  it('calls onSearch from icon click and enter key', () => {
    const onSearch = vi.fn()
    const result = render(() => <Input.Search defaultValue="solid" onSearch={onSearch} />)
    const input = result.container.querySelector('input') as HTMLInputElement

    fireEvent.click(result.getByRole('button', { name: 'search' }))
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSearch).toHaveBeenCalledTimes(2)
    expect(onSearch.mock.calls[0][0]).toBe('solid')
    expect(onSearch.mock.calls[0][2]).toEqual({ source: 'input' })
  })

  it('renders enter button and loading state', () => {
    const onSearch = vi.fn()
    const result = render(() => (
      <Input.Search defaultValue="q" enterButton="Go" loading onSearch={onSearch} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Go' }))

    expect(result.getByRole('button', { name: 'Go' })).toHaveClass('ads-input-search-button')
    expect(result.container.querySelector('.ads-input-search-loading')).toBeTruthy()
    expect(onSearch).toHaveBeenCalledOnce()
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
})
