import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Segmented } from '../index'

describe('Segmented', () => {
  it('renders primitive and object options', () => {
    const result = render(() => (
      <Segmented
        options={[
          'Daily',
          { label: <span>Weekly</span>, value: 'weekly', icon: <span data-testid="icon">W</span> },
          30,
        ]}
      />
    ))
    expect(result.getByRole('radiogroup').className).toContain('ads-segmented')
    expect(result.getByRole('radio', { name: 'Daily' })).toBeInTheDocument()
    expect(result.getByRole('radio', { name: 'Weekly' })).toBeInTheDocument()
    expect(result.getByRole('radio', { name: '30' })).toBeInTheDocument()
    expect(result.getByTestId('icon')).toBeInTheDocument()
  })

  it('selects the first enabled option by default', () => {
    const result = render(() => (
      <Segmented options={[{ label: 'Disabled', value: 'disabled', disabled: true }, 'Enabled']} />
    ))
    expect(result.getByRole('radio', { name: 'Enabled' })).toHaveAttribute('aria-checked', 'true')
  })

  it('supports uncontrolled click selection and onChange', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Segmented options={['A', 'B']} defaultValue="A" onChange={onChange} />
    ))
    fireEvent.click(result.getByRole('radio', { name: 'B' }))
    expect(result.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenCalledWith('B')
    fireEvent.click(result.getByRole('radio', { name: 'B' }))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('supports controlled value', () => {
    function Example() {
      const [value, setValue] = createSignal<string | number>('A')
      return <Segmented options={['A', 'B']} value={value()} onChange={setValue} />
    }
    const result = render(() => <Example />)
    fireEvent.click(result.getByRole('radio', { name: 'B' }))
    expect(result.getByRole('radio', { name: 'B' })).toHaveAttribute('aria-checked', 'true')
  })

  it('prevents root-disabled and option-disabled selection', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Segmented
        options={['A', { label: 'B', value: 'B', disabled: true }]}
        defaultValue="A"
        onChange={onChange}
      />
    ))
    fireEvent.click(result.getByRole('radio', { name: 'B' }))
    expect(result.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true')
    const disabledResult = render(() => (
      <Segmented disabled options={['A', 'B']} defaultValue="A" onChange={onChange} />
    ))
    fireEvent.click(disabledResult.getByRole('radio', { name: 'B' }))
    expect(disabledResult.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports keyboard Arrow/Home/End selection', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Segmented
        options={['A', { label: 'B', value: 'B', disabled: true }, 'C']}
        defaultValue="A"
        onChange={onChange}
      />
    ))
    const a = result.getByRole('radio', { name: 'A' })
    fireEvent.keyDown(a, { key: 'ArrowRight' })
    expect(result.getByRole('radio', { name: 'C' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.keyDown(result.getByRole('radio', { name: 'C' }), { key: 'Home' })
    expect(result.getByRole('radio', { name: 'A' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.keyDown(result.getByRole('radio', { name: 'A' }), { key: 'End' })
    expect(result.getByRole('radio', { name: 'C' })).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('supports block, size and custom prefixCls', () => {
    const result = render(() => (
      <Segmented prefixCls="custom-segmented" block size="large" options={['A', 'B']} />
    ))
    const root = result.getByRole('radiogroup')
    expect(root.className).toContain('custom-segmented')
    expect(root.className).toContain('custom-segmented-block')
    expect(root.className).toContain('custom-segmented-lg')
  })

  it('uses ConfigProvider prefix', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Segmented options={['A', 'B']} />
      </ConfigProvider>
    ))
    expect(result.getByRole('radiogroup').className).toContain('custom-segmented')
  })
})
