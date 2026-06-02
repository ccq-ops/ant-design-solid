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
