import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Collapse } from '../index'

const items = [
  { key: 'one', label: 'Panel one', children: <div>Content one</div> },
  { key: 'two', label: 'Panel two', children: <div>Content two</div> },
  {
    key: 'disabled',
    label: 'Disabled panel',
    disabled: true,
    children: <div>Disabled content</div>,
  },
]

function getPanel(element: HTMLElement) {
  const panel = element.closest('.ads-collapse-item')
  expect(panel).not.toBeNull()
  return panel as HTMLElement
}

describe('Collapse', () => {
  it('renders items closed by default with accessible buttons and regions', () => {
    const result = render(() => <Collapse items={items} />)

    expect(result.getByRole('button', { name: 'Panel one' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(result.getByRole('button', { name: 'Panel two' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(result.getByText('Content one').closest('[role="region"]')).toHaveAttribute('hidden')
    expect(result.getByText('Content two').closest('[role="region"]')).toHaveAttribute('hidden')
    expect(getPanel(result.getByText('Panel one'))).toHaveClass('ads-collapse-item')
  })

  it('uncontrolled click toggles panels and calls onChange with active keys', () => {
    const onChange = vi.fn()
    const result = render(() => <Collapse items={items} onChange={onChange} />)

    fireEvent.click(result.getByRole('button', { name: 'Panel one' }))

    expect(onChange).toHaveBeenCalledWith(['one'])
    expect(result.getByRole('button', { name: 'Panel one' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(result.getByText('Content one').closest('[role="region"]')).not.toHaveAttribute('hidden')

    fireEvent.click(result.getByRole('button', { name: 'Panel two' }))

    expect(onChange).toHaveBeenLastCalledWith(['one', 'two'])
    expect(result.getByRole('button', { name: 'Panel two' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    fireEvent.click(result.getByRole('button', { name: 'Panel one' }))

    expect(onChange).toHaveBeenLastCalledWith(['two'])
    expect(result.getByRole('button', { name: 'Panel one' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('controlled mode calls onChange without changing active panels by itself', () => {
    const onChange = vi.fn()
    const result = render(() => <Collapse items={items} activeKey={['one']} onChange={onChange} />)

    fireEvent.click(result.getByRole('button', { name: 'Panel two' }))

    expect(onChange).toHaveBeenCalledWith(['one', 'two'])
    expect(result.getByRole('button', { name: 'Panel one' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(result.getByRole('button', { name: 'Panel two' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('controlled mode updates when activeKey signal changes', () => {
    const [activeKey, setActiveKey] = createSignal<string | string[]>(['one'])
    const result = render(() => <Collapse items={items} activeKey={activeKey()} />)

    setActiveKey(['two'])

    expect(result.getByRole('button', { name: 'Panel one' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(result.getByRole('button', { name: 'Panel two' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('uses defaultActiveKey for initial uncontrolled state', () => {
    const result = render(() => <Collapse items={items} defaultActiveKey="two" />)

    expect(result.getByRole('button', { name: 'Panel two' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(result.getByText('Content two').closest('[role="region"]')).not.toHaveAttribute('hidden')
  })

  it('accordion mode keeps a single active panel and returns a string key', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Collapse items={items} accordion defaultActiveKey="one" onChange={onChange} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Panel two' }))

    expect(onChange).toHaveBeenCalledWith('two')
    expect(result.getByRole('button', { name: 'Panel one' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(result.getByRole('button', { name: 'Panel two' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    fireEvent.click(result.getByRole('button', { name: 'Panel two' }))

    expect(onChange).toHaveBeenLastCalledWith(undefined)
    expect(result.getByRole('button', { name: 'Panel two' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('disabled item does not toggle or call onChange', () => {
    const onChange = vi.fn()
    const result = render(() => <Collapse items={items} onChange={onChange} />)
    const disabledButton = result.getByRole('button', { name: 'Disabled panel' })

    expect(disabledButton).toHaveAttribute('disabled')
    fireEvent.click(disabledButton)

    expect(onChange).not.toHaveBeenCalled()
    expect(disabledButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('collapsible icon only toggles from icon and header only toggles from header button', () => {
    const onChange = vi.fn()
    const customItems = [
      { key: 'icon', label: 'Icon only', children: 'Icon content', collapsible: 'icon' as const },
      {
        key: 'header',
        label: 'Header only',
        children: 'Header content',
        collapsible: 'header' as const,
      },
    ]
    const result = render(() => <Collapse items={customItems} onChange={onChange} />)

    fireEvent.click(result.getByRole('button', { name: 'Icon only' }))
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.click(result.getByLabelText('Toggle Icon only'))
    expect(onChange).toHaveBeenCalledWith(['icon'])

    fireEvent.click(result.getByLabelText('Toggle Header only'))
    expect(onChange).toHaveBeenCalledTimes(1)

    fireEvent.click(result.getByRole('button', { name: 'Header only' }))
    expect(onChange).toHaveBeenLastCalledWith(['icon', 'header'])
  })

  it('supports keyboard toggling with Enter and Space', () => {
    const result = render(() => <Collapse items={items} />)
    const first = result.getByRole('button', { name: 'Panel one' })
    const second = result.getByRole('button', { name: 'Panel two' })

    fireEvent.keyDown(first, { key: 'Enter' })
    expect(first).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(second, { key: ' ' })
    expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  it('applies variants, expand icon position, custom prefix, and extra class', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Collapse
          items={items}
          bordered={false}
          ghost
          expandIconPosition="end"
          class="extra-collapse"
        />
      </ConfigProvider>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('custom-collapse')
    expect(root.className).toContain('custom-collapse-borderless')
    expect(root.className).toContain('custom-collapse-ghost')
    expect(root.className).toContain('custom-collapse-icon-position-end')
    expect(root.className).toContain('extra-collapse')
  })
})
