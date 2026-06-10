import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Form, useForm } from '../../form'
import { Switch } from '../index'

describe('Switch', () => {
  it('supports controlled checked state', () => {
    const [checked, setChecked] = createSignal(true)
    const onChange = vi.fn()
    const result = render(() => <Switch checked={checked()} onChange={onChange} />)
    const button = result.getByRole('switch')

    expect(button).toHaveAttribute('aria-checked', 'true')
    expect(result.container.querySelector('.ads-switch-checked')).toBeTruthy()

    setChecked(false)

    expect(button).toHaveAttribute('aria-checked', 'false')
    expect(result.container.querySelector('.ads-switch-checked')).toBeFalsy()
  })

  it('toggles from defaultChecked when uncontrolled', () => {
    const onChange = vi.fn()
    const result = render(() => <Switch defaultChecked onChange={onChange} />)
    const button = result.getByRole('switch')

    expect(button).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-checked', 'false')
    expect(onChange).toHaveBeenCalledWith(false, expect.any(MouseEvent))
  })

  it('does not toggle or fire onChange when disabled or loading', () => {
    const disabledChange = vi.fn()
    const disabledResult = render(() => (
      <Switch disabled defaultChecked onChange={disabledChange} />
    ))
    const disabledButton = disabledResult.getByRole('switch') as HTMLButtonElement

    expect(disabledButton.disabled).toBe(true)
    fireEvent.click(disabledButton)
    expect(disabledButton).toHaveAttribute('aria-checked', 'true')
    expect(disabledChange).not.toHaveBeenCalled()

    const loadingChange = vi.fn()
    const loadingResult = render(() => <Switch loading defaultChecked onChange={loadingChange} />)
    const loadingButton = loadingResult.getByRole('switch') as HTMLButtonElement

    expect(loadingButton.disabled).toBe(true)
    expect(loadingResult.container.querySelector('.ads-switch-loading')).toBeTruthy()
    fireEvent.click(loadingButton)
    expect(loadingButton).toHaveAttribute('aria-checked', 'true')
    expect(loadingChange).not.toHaveBeenCalled()
  })

  it('registers track and movable handle styles', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Switch checkedChildren="On" unCheckedChildren="Off" />
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain('.ads-switch::after')
    expect(css).toContain('width:18px;')
    expect(css).toContain('height:18px;')
    expect(css).toContain('left:calc(100% - 20px);')
    expect(css).toContain('.ads-switch-checked .ads-switch-inner')
  })

  it('renders checkedChildren, unCheckedChildren, and size class', () => {
    const result = render(() => (
      <Switch size="small" checkedChildren="On" unCheckedChildren="Off" />
    ))
    const button = result.getByRole('switch')

    expect(result.container.querySelector('.ads-switch-sm')).toBeTruthy()
    expect(button).toHaveTextContent('Off')

    fireEvent.click(button)

    expect(button).toHaveTextContent('On')
  })

  it('integrates with Form.Item checked semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="enabled" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const button = result.getByRole('switch')

    expect(button).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(button)

    expect(form.getFieldValue('enabled')).toBe(true)
    expect(button).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ enabled: true })
  })

  it('updates Form.Item checked value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="enabled" valuePropName="checked" trigger="onBlur">
          <Switch />
        </Form.Item>
      </Form>
    ))
    const button = result.getByRole('switch')

    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-checked', 'true')
    expect(form.getFieldValue('enabled')).toBeUndefined()

    fireEvent.blur(button)

    expect(form.getFieldValue('enabled')).toBe(true)
  })
})
