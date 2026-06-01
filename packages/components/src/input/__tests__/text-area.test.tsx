import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Input, TextArea } from '../index'

describe('Input.TextArea', () => {
  it('renders rows and defaultValue', () => {
    const result = render(() => <TextArea rows={4} defaultValue="hello" />)
    const textarea = result.container.querySelector('textarea') as HTMLTextAreaElement

    expect(textarea.rows).toBe(4)
    expect(textarea.value).toBe('hello')
    expect(result.container.querySelector('.ads-input-textarea')).toBeTruthy()
  })

  it('supports showCount and maxLength', () => {
    const result = render(() => <TextArea showCount maxLength={5} defaultValue="abc" />)
    const textarea = result.container.querySelector('textarea') as HTMLTextAreaElement

    expect(textarea.maxLength).toBe(5)
    expect(result.getByText('3 / 5')).toBeTruthy()

    fireEvent.input(textarea, { target: { value: 'abcd' } })

    expect(result.getByText('4 / 5')).toBeTruthy()
  })

  it('does not update or fire input when disabled', () => {
    const onInput = vi.fn()
    const result = render(() => <TextArea disabled defaultValue="locked" onInput={onInput} />)
    const textarea = result.container.querySelector('textarea') as HTMLTextAreaElement

    expect(textarea.disabled).toBe(true)
    fireEvent.input(textarea, { target: { value: 'changed' } })

    expect(onInput).not.toHaveBeenCalled()
  })

  it('is available as Input.TextArea static usage', () => {
    const result = render(() => <Input.TextArea defaultValue="static" />)
    const textarea = result.container.querySelector('textarea') as HTMLTextAreaElement

    expect(textarea.value).toBe('static')
  })
})
