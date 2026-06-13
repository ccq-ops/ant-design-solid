import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form } from '../index'

describe('Form.Item v6 APIs', () => {
  it('applies htmlFor and renders a label placeholder when label is null', () => {
    const result = render(() => (
      <Form>
        <Form.Item label="Username" htmlFor="username-input">
          <Input id="username-input" />
        </Form.Item>
        <Form.Item label={null}>
          <Input placeholder="aligned" />
        </Form.Item>
      </Form>
    ))

    expect(result.getByText('Username').closest('label')).toHaveAttribute('for', 'username-input')
    expect(result.getByPlaceholderText('aligned').closest('.ads-form-item')).toBeInTheDocument()
  })

  it('overrides item layout and applies semantic slots', () => {
    const result = render(() => (
      <Form layout="horizontal">
        <Form.Item
          layout="vertical"
          label="Username"
          classNames={{
            root: 'item-root',
            label: 'item-label',
            content: 'item-content',
            extra: 'item-extra',
          }}
          styles={{ content: { color: 'rgb(4, 5, 6)' } }}
          extra="Extra"
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByText('Username').closest('.ads-form-item')).toHaveClass(
      'ads-form-item-vertical',
    )
    expect(result.getByText('Username').closest('.ads-form-item')).toHaveClass('item-root')
    expect(result.getByText('Username').closest('label')).toHaveClass('item-label')
    expect(result.getByText('Extra')).toHaveClass('item-extra')
  })

  it('interpolates validateMessages and messageVariables', async () => {
    const result = render(() => (
      <Form validateMessages={{ required: '${label} needs ${another}' }}>
        <Form.Item
          label="Username"
          name="username"
          messageVariables={{ another: 'attention' }}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result.getByText('Username needs attention')).toBeInTheDocument())
  })

  it('renders feedback icon when hasFeedback is enabled', async () => {
    const result = render(() => (
      <Form feedbackIcons={{ error: <span data-testid="form-error-icon">E</span> }}>
        <Form.Item name="username" hasFeedback rules={[{ required: true, message: 'Required' }]}>
          <Input />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result.getByTestId('form-error-icon')).toBeInTheDocument())
  })

  it('renders function requiredMark output', () => {
    const result = render(() => (
      <Form
        requiredMark={(label, info) => (
          <span data-testid="mark">{info.required ? 'R' : label}</span>
        )}
      >
        <Form.Item label="Username" name="username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByTestId('mark')).toHaveTextContent('R')
  })
})
