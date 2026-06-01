import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../index'

describe('Input', () => {
  it('renders placeholder and supports uncontrolled input', () => {
    const onInput = vi.fn()
    const result = render(() => <Input placeholder="请输入" defaultValue="a" onInput={onInput} />)
    const input = result.getByPlaceholderText('请输入') as HTMLInputElement
    expect(input.value).toBe('a')
    fireEvent.input(input, { target: { value: 'abc' } })
    expect(onInput).toHaveBeenCalledOnce()
  })
  it('renders prefix, suffix, status and allowClear', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Input
        status="error"
        prefix={<span data-testid="prefix">P</span>}
        suffix="RMB"
        defaultValue="100"
        allowClear
        onChange={onChange}
      />
    ))
    expect(result.getByTestId('prefix')).toHaveTextContent('P')
    expect(result.getByText('RMB')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-input-status-error')).toBeTruthy()
    fireEvent.click(result.getByRole('button', { name: 'clear input' }))
    expect((result.container.querySelector('input') as HTMLInputElement).value).toBe('')
    expect(onChange).toHaveBeenCalledOnce()
  })
})
