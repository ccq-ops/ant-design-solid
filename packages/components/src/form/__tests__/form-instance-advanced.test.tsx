import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Input } from '../../input'
import { Form, useForm } from '../index'

describe('FormInstance advanced getFieldsValue', () => {
  it('filters fields by touched and validating meta', () => {
    const [form] = useForm()

    render(() => (
      <Form form={form} initialValues={{ a: 'A', b: 'B' }}>
        <Form.Item name="a">
          <Input />
        </Form.Item>
        <Form.Item name="b">
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([
      { name: 'a', touched: true },
      { name: 'b', validating: true },
    ])

    expect(form.getFieldsValue({ filter: (meta) => meta.touched })).toEqual({ a: 'A' })
    expect(form.getFieldsValue(['a', 'b'], (meta) => meta.validating)).toEqual({ b: 'B' })
  })

  it('strict mode returns only registered field paths', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ user: { name: 'Ada', hidden: 'secret' } }}>
        <Form.Item name={['user', 'name']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldsValue({ strict: true })).toEqual({ user: { name: 'Ada' } })
    expect(form.getFieldsValue({})).toEqual({ user: { name: 'Ada', hidden: 'secret' } })
    expect(form.getFieldsValue({ strict: false })).toEqual({
      user: { name: 'Ada', hidden: 'secret' },
    })
    expect(form.getFieldsValue(true)).toEqual({ user: { name: 'Ada', hidden: 'secret' } })
  })
})
