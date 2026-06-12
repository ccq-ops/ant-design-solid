import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Segmented } from '../index'

describe('Segmented', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

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

  it('supports orientation, vertical, shape, name, rootClass and medium size', () => {
    const result = render(() => (
      <Segmented
        rootClass="root-extra"
        orientation="vertical"
        vertical={false}
        shape="round"
        size="medium"
        name="period"
        options={['Daily', 'Weekly']}
      />
    ))
    const root = result.getByRole('radiogroup')
    expect(root).toHaveClass('ads-segmented-vertical')
    expect(root).toHaveClass('ads-segmented-shape-round')
    expect(root).toHaveClass('root-extra')
    expect(root).not.toHaveClass('ads-segmented-sm')
    expect(root).not.toHaveClass('ads-segmented-lg')
    expect(result.getByRole('radio', { name: 'Daily' })).toHaveAttribute('name', 'period')
  })

  it('lets vertical fall back to vertical orientation', () => {
    const result = render(() => <Segmented vertical options={['A', 'B']} />)
    expect(result.getByRole('radiogroup')).toHaveClass('ads-segmented-vertical')
  })

  it('supports semantic classes and styles as objects or functions', () => {
    const objectResult = render(() => (
      <Segmented
        options={[{ label: 'List', value: 'list', icon: <span>icon</span> }]}
        classNames={{
          root: 'root-slot',
          item: 'item-slot',
          icon: 'icon-slot',
          label: 'label-slot',
        }}
        styles={{ root: { color: 'red' }, item: { color: 'blue' }, icon: { color: 'green' } }}
      />
    ))
    expect(objectResult.getByRole('radiogroup')).toHaveClass('root-slot')
    expect(objectResult.getByRole('radio', { name: 'List' })).toHaveClass('item-slot')
    expect(objectResult.getByText('icon').closest('.ads-segmented-item-icon')).toHaveClass(
      'icon-slot',
    )
    expect(objectResult.getByText('List')).toHaveClass('label-slot')
    expect(objectResult.getByRole('radiogroup').style.color).toBe('red')
    expect(objectResult.getByRole('radio', { name: 'List' }).style.color).toBe('blue')
    expect(
      (objectResult.getByText('icon').closest('.ads-segmented-item-icon') as HTMLElement).style
        .color,
    ).toBe('green')

    const functionResult = render(() => (
      <Segmented
        block
        options={['A']}
        classNames={({ props }) => ({ root: props.block ? 'block-root' : undefined })}
        styles={({ props }) => ({ label: { color: props.block ? 'purple' : 'black' } })}
      />
    ))
    expect(functionResult.getByRole('radiogroup')).toHaveClass('block-root')
    expect(functionResult.getByText('A').style.color).toBe('purple')
  })

  it('supports option class and tooltip', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Segmented
        options={[{ label: 'Map', value: 'map', class: 'map-option', tooltip: 'Map view' }]}
      />
    ))
    const item = result.getByRole('radio', { name: 'Map' })
    expect(item).toHaveClass('map-option')
    fireEvent.mouseEnter(result.container.querySelector('.ads-tooltip-trigger')!)
    vi.advanceTimersByTime(100)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Map view')
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
