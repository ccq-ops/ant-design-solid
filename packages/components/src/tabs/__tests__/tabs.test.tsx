import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tabs } from '../index'

const items = [
  { key: 'one', label: 'One', children: <div>Pane one</div> },
  { key: 'two', label: 'Two', children: <div>Pane two</div> },
  {
    key: 'disabled',
    label: 'Disabled',
    disabled: true,
    children: <div>Disabled pane</div>,
  },
]

function getPane(element: HTMLElement) {
  const pane = element.closest('[role="tabpanel"]')
  expect(pane).not.toBeNull()
  return pane as HTMLElement
}

describe('Tabs', () => {
  it('renders labels and active pane', () => {
    const result = render(() => <Tabs items={items} />)

    expect(result.getByRole('tab', { name: 'One' })).toBeInTheDocument()
    expect(result.getByRole('tab', { name: 'Two' })).toBeInTheDocument()
    expect(result.getByRole('tab', { name: 'Disabled' })).toBeInTheDocument()
    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(getPane(result.getByText('Pane two'))).toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('uncontrolled switching calls onChange and updates active pane', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} onChange={onChange} />)

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))

    expect(onChange).toHaveBeenCalledWith('two')
    expect(getPane(result.getByText('Pane one'))).toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Pane two'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
  })

  it('controlled mode calls onChange without changing active pane by itself', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} activeKey="one" onChange={onChange} />)

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))

    expect(onChange).toHaveBeenCalledWith('two')
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Pane two'))).toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('controlled mode updates when activeKey signal changes', () => {
    const [activeKey, setActiveKey] = createSignal('one')
    const result = render(() => <Tabs items={items} activeKey={activeKey()} />)

    setActiveKey('two')

    expect(getPane(result.getByText('Pane one'))).toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Pane two'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
  })

  it('disabled tab does not activate', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} onChange={onChange} />)
    const disabledTab = result.getByRole('tab', { name: 'Disabled' })

    expect(disabledTab).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(disabledTab)

    expect(onChange).not.toHaveBeenCalled()
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Disabled pane'))).toHaveClass('ads-tabs-tabpane-hidden')
  })

  it('destroyInactiveTabPane removes inactive pane from DOM', () => {
    const result = render(() => <Tabs items={items} destroyInactiveTabPane />)

    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))

    expect(result.queryByText('Pane one')).not.toBeInTheDocument()
    expect(result.getByText('Pane two')).toBeInTheDocument()
  })

  it('uses defaultActiveKey when it matches a non-disabled item', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="two" />)

    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
    expect(getPane(result.getByText('Pane one'))).toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Pane two'))).not.toHaveClass('ads-tabs-tabpane-hidden')
  })

  it('falls back to first non-disabled item when defaultActiveKey is disabled', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="disabled" />)

    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Disabled pane'))).toHaveClass('ads-tabs-tabpane-hidden')
  })

  it('falls back to first non-disabled item when defaultActiveKey is unknown', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="unknown" />)

    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Pane two'))).toHaveClass('ads-tabs-tabpane-hidden')
  })

  it('falls back to first item when all items are disabled', () => {
    const allDisabledItems = [
      { key: 'first', label: 'First', disabled: true, children: <div>First pane</div> },
      { key: 'second', label: 'Second', disabled: true, children: <div>Second pane</div> },
    ]
    const result = render(() => <Tabs items={allDisabledItems} />)

    expect(result.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-disabled', 'true')
    expect(getPane(result.getByText('First pane'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Second pane'))).toHaveClass('ads-tabs-tabpane-hidden')
  })

  it('renders no tab and no pane for empty items', () => {
    const result = render(() => <Tabs items={[]} />)

    expect(result.queryAllByRole('tab')).toHaveLength(0)
    expect(result.queryAllByRole('tabpanel')).toHaveLength(0)
  })

  it('does not call onChange when clicking the already-active enabled tab', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} onChange={onChange} />)

    fireEvent.click(result.getByRole('tab', { name: 'One' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
  })

  it('bottom/card/large/custom prefix classes apply', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Tabs items={items} tabPosition="bottom" type="card" size="large" class="extra-tabs" />
      </ConfigProvider>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('custom-tabs')
    expect(root.className).toContain('custom-tabs-bottom')
    expect(root.className).toContain('custom-tabs-card')
    expect(root.className).toContain('custom-tabs-large')
    expect(root.className).toContain('extra-tabs')
    expect(root.lastElementChild).toHaveAttribute('role', 'tablist')
  })
})
