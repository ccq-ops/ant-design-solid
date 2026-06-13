import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Checkbox } from '../../checkbox'
import { Input } from '../../input'
import { InputNumber } from '../../input-number'
import { Radio } from '../../radio'
import { Select } from '../../select'
import { Switch } from '../../switch'
import { Form } from '../index'

describe('Form control defaults', () => {
  it('passes disabled, size, and variant to Form-integrated input controls', () => {
    const result = render(() => (
      <Form disabled size="large" variant="filled">
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <Form.Item name="amount">
          <InputNumber placeholder="amount" />
        </Form.Item>
        <Form.Item name="choice">
          <Select options={[{ label: 'A', value: 'a' }]} />
        </Form.Item>
      </Form>
    ))

    expect(result.getByPlaceholderText('username')).toBeDisabled()
    expect(result.getByPlaceholderText('username').closest('.ads-input-affix-wrapper')).toHaveClass(
      'ads-input-lg',
    )
    expect(result.getByPlaceholderText('username').closest('.ads-input-affix-wrapper')).toHaveClass(
      'ads-input-variant-filled',
    )
  })

  it('passes disabled and size to boolean controls without overriding explicit props', () => {
    const result = render(() => (
      <Form disabled size="small">
        <Form.Item name="agree" valuePropName="checked">
          <Checkbox>Agree</Checkbox>
        </Form.Item>
        <Form.Item name="enabled" valuePropName="checked">
          <Switch disabled={false} />
        </Form.Item>
        <Form.Item name="kind">
          <Radio.Group options={[{ label: 'A', value: 'a' }]} />
        </Form.Item>
      </Form>
    ))

    expect(result.getByLabelText('Agree')).toBeDisabled()
    expect(result.getByRole('switch')).not.toBeDisabled()
  })
})
