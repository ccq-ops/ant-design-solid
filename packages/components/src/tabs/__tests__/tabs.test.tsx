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
  it('accepts and filters antd 6 tabs-owned props while preserving solid class naming', () => {
    const onTabClick = vi.fn()
    const result = render(() => (
      <Tabs
        class="root-class"
        items={[{ key: 'one', label: 'One' }]}
        tabPlacement="start"
        destroyOnHidden
        animated={{ inkBar: true, tabPane: false }}
        centered
        indicator={{ size: 12, align: 'center' }}
        tabBarGutter={8}
        tabBarStyle={{ color: 'blue' }}
        tabBarExtraContent={<span>Extra</span>}
        classNames={{ popup: { root: 'popup-root' } }}
        styles={{ popup: { root: { color: 'red' } } }}
        more={{ trigger: 'click' }}
        hideAdd
        onTabClick={onTabClick}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement

    expect(root).toHaveClass('root-class')
    expect(root).not.toHaveAttribute('tabPlacement')
    expect(root).not.toHaveAttribute('destroyOnHidden')
    expect(root).not.toHaveAttribute('animated')
    expect(root).not.toHaveAttribute('centered')
    expect(root).not.toHaveAttribute('indicator')
    expect(root).not.toHaveAttribute('tabBarGutter')
    expect(root).not.toHaveAttribute('tabBarStyle')
    expect(root).not.toHaveAttribute('tabBarExtraContent')
    expect(root).not.toHaveAttribute('classNames')
    expect(root).not.toHaveAttribute('styles')
    expect(root).not.toHaveAttribute('more')
    expect(root).not.toHaveAttribute('hideAdd')
    expect(root).not.toHaveAttribute('onTabClick')
    expect(Object.prototype.hasOwnProperty.call(root, 'onTabClick')).toBe(false)
    expect(result.getByRole('tab', { name: 'One' })).toBeInTheDocument()
  })

  it('renders labels and active pane', () => {
    const result = render(() => <Tabs items={items} />)

    expect(result.getByRole('tab', { name: 'One' })).toBeInTheDocument()
    expect(result.getByRole('tab', { name: 'Two' })).toBeInTheDocument()
    expect(result.getByRole('tab', { name: 'Disabled' })).toBeInTheDocument()
    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders inactive panes lazily and supports forceRender', () => {
    const result = render(() => (
      <Tabs
        items={[
          { key: 'one', label: 'One', children: <div>Pane one</div> },
          { key: 'two', label: 'Two', forceRender: true, children: <div>Pane two</div> },
          { key: 'three', label: 'Three', children: <div>Pane three</div> },
        ]}
      />
    ))

    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.getByText('Pane two')).toBeInTheDocument()
    expect(result.queryByText('Pane three')).not.toBeInTheDocument()
  })

  it('keeps visited inactive panes mounted and hidden by default', () => {
    const result = render(() => <Tabs items={items} />)

    expect(result.queryByText('Pane two')).not.toBeInTheDocument()

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(getPane(result.getByText('Pane two'))).not.toHaveClass('ads-tabs-tabpane-hidden')

    fireEvent.click(result.getByRole('tab', { name: 'One' }))
    expect(getPane(result.getByText('Pane two'))).toHaveClass('ads-tabs-tabpane-hidden')
    expect(getPane(result.getByText('Pane two'))).toHaveAttribute('hidden')
  })

  it('supports item destroyOnHidden', () => {
    const result = render(() => (
      <Tabs
        items={[
          { key: 'one', label: 'One', children: <div>Pane one</div> },
          { key: 'two', label: 'Two', destroyOnHidden: true, children: <div>Pane two</div> },
        ]}
      />
    ))

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(result.queryByText('Pane one')).toBeInTheDocument()
    fireEvent.click(result.getByRole('tab', { name: 'One' }))
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
  })

  it('lets destroyOnHidden remove inactive forceRender panes', () => {
    const result = render(() => (
      <Tabs
        destroyOnHidden
        items={[
          { key: 'one', label: 'One', children: <div>Pane one</div> },
          { key: 'two', label: 'Two', forceRender: true, children: <div>Pane two</div> },
        ]}
      />
    ))

    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
  })

  it('lets item destroyOnHidden remove inactive forceRender panes', () => {
    const result = render(() => (
      <Tabs
        items={[
          { key: 'one', label: 'One', children: <div>Pane one</div> },
          {
            key: 'two',
            label: 'Two',
            forceRender: true,
            destroyOnHidden: true,
            children: <div>Pane two</div>,
          },
        ]}
      />
    ))

    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
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

  it('fires onTabClick for active tabs and onChange only when active changes', () => {
    const onTabClick = vi.fn()
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} onTabClick={onTabClick} onChange={onChange} />)

    fireEvent.click(result.getByRole('tab', { name: 'One' }))
    expect(onTabClick).toHaveBeenCalledWith('one', expect.any(MouseEvent))
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(onTabClick).toHaveBeenLastCalledWith('two', expect.any(MouseEvent))
    expect(onChange).toHaveBeenCalledWith('two')
  })

  it('fires onTabClick with KeyboardEvent for keyboard activation', () => {
    const onTabClick = vi.fn<(activeKey: string, event: MouseEvent | KeyboardEvent) => void>()
    const result = render(() => <Tabs items={items} onTabClick={onTabClick} />)

    fireEvent.keyDown(result.getByRole('tab', { name: 'One' }), { key: 'ArrowRight' })

    expect(onTabClick).toHaveBeenCalledWith('two', expect.any(KeyboardEvent))
  })

  it('supports editable-card add and remove actions', () => {
    const onEdit = vi.fn()
    const result = render(() => (
      <Tabs
        type="editable-card"
        onEdit={onEdit}
        addIcon={<span>Add tab</span>}
        removeIcon={<span>Remove tab</span>}
        items={[
          { key: 'one', label: 'One', children: <div>Pane one</div> },
          { key: 'two', label: 'Two', closable: false, children: <div>Pane two</div> },
        ]}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: /add tab/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.any(MouseEvent), 'add')

    fireEvent.click(result.getAllByRole('button', { name: /remove tab/i })[0])
    expect(onEdit).toHaveBeenCalledWith('one', 'remove')
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(result.queryAllByRole('button', { name: /remove tab/i })).toHaveLength(1)
  })

  it('supports hideAdd and item closeIcon false', () => {
    const result = render(() => (
      <Tabs
        type="editable-card"
        hideAdd
        items={[{ key: 'one', label: 'One', closeIcon: false, children: <div>Pane one</div> }]}
      />
    ))

    expect(result.queryByRole('button', { name: /add/i })).not.toBeInTheDocument()
    expect(result.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  it('controlled mode calls onChange without changing active pane by itself', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} activeKey="one" onChange={onChange} />)

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))

    expect(onChange).toHaveBeenCalledWith('two')
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
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
    const onTabClick = vi.fn()
    const result = render(() => <Tabs items={items} onChange={onChange} onTabClick={onTabClick} />)
    const disabledTab = result.getByRole('tab', { name: 'Disabled' })

    expect(disabledTab).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(disabledTab)

    expect(onChange).not.toHaveBeenCalled()
    expect(onTabClick).not.toHaveBeenCalled()
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.queryByText('Disabled pane')).not.toBeInTheDocument()
  })

  it('destroyInactiveTabPane removes inactive pane from DOM', () => {
    const result = render(() => <Tabs items={items} destroyInactiveTabPane />)

    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))

    expect(result.queryByText('Pane one')).not.toBeInTheDocument()
    expect(result.getByText('Pane two')).toBeInTheDocument()
  })

  it('destroyOnHidden removes inactive pane from DOM globally', () => {
    const result = render(() => <Tabs items={items} destroyOnHidden />)

    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))

    expect(result.queryByText('Pane one')).not.toBeInTheDocument()
    expect(result.getByText('Pane two')).toBeInTheDocument()

    fireEvent.click(result.getByRole('tab', { name: 'One' }))

    expect(result.getByText('Pane one')).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
  })

  it('uses tabPlacement as the placement class and order', () => {
    const top = render(() => <Tabs items={items} tabPlacement="top" />)
    const topRoot = top.container.firstElementChild as HTMLElement
    expect(topRoot).toHaveClass('ads-tabs-top')
    expect(topRoot.firstElementChild).toHaveAttribute('role', 'tablist')

    const bottom = render(() => <Tabs items={items} tabPlacement="bottom" />)
    const bottomRoot = bottom.container.firstElementChild as HTMLElement
    expect(bottomRoot).toHaveClass('ads-tabs-bottom')
    expect(bottomRoot.lastElementChild).toHaveAttribute('role', 'tablist')

    const start = render(() => <Tabs items={items} tabPlacement="start" />)
    const startRoot = start.container.firstElementChild as HTMLElement
    expect(startRoot).toHaveClass('ads-tabs-start')
    expect(startRoot.firstElementChild).toHaveAttribute('role', 'tablist')

    const end = render(() => <Tabs items={items} tabPlacement="end" />)
    const endRoot = end.container.firstElementChild as HTMLElement
    expect(endRoot).toHaveClass('ads-tabs-end')
    expect(endRoot.lastElementChild).toHaveAttribute('role', 'tablist')
  })

  it('applies semantic classNames and styles', () => {
    const result = render(() => (
      <Tabs
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div>, class: 'item-pane' }]}
        classNames={{
          root: 'sem-root',
          header: 'sem-header',
          item: 'sem-item',
          content: 'sem-content',
        }}
        styles={{
          root: { color: 'red' },
          header: { background: 'blue' },
          item: { margin: '1px' },
          content: { color: 'green' },
        }}
        style={{ width: '123px' }}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    const header = result.container.querySelector('.sem-header')
    const item = result.getByRole('tab', { name: 'One' })
    const content = result.container.querySelector('.sem-content')

    expect(root).toHaveClass('sem-root')
    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)', width: '123px' })
    expect(header).toBeInTheDocument()
    expect(header).toHaveStyle({ background: 'rgb(0, 0, 255)' })
    expect(item).toHaveClass('sem-item')
    expect(item).toHaveStyle({ margin: '1px' })
    expect(result.getByText('Pane one').closest('[role="tabpanel"]')).toHaveClass('item-pane')
    expect(content).toHaveStyle({ color: 'rgb(0, 128, 0)' })
  })

  it('keeps semantic root styles when root style is a string', () => {
    const result = render(() => (
      <Tabs items={items} styles={{ root: { color: 'red' } }} style="width: 123px;" />
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root).toHaveStyle({ color: 'rgb(255, 0, 0)', width: '123px' })
  })

  it('uses defaultActiveKey when it matches a non-disabled item', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="two" />)

    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
    expect(result.queryByText('Pane one')).not.toBeInTheDocument()
    expect(getPane(result.getByText('Pane two'))).not.toHaveClass('ads-tabs-tabpane-hidden')
  })

  it('falls back to first non-disabled item when defaultActiveKey is disabled', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="disabled" />)

    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.queryByText('Disabled pane')).not.toBeInTheDocument()
  })

  it('falls back to first non-disabled item when defaultActiveKey is unknown', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="unknown" />)

    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(getPane(result.getByText('Pane one'))).not.toHaveClass('ads-tabs-tabpane-hidden')
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
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
    expect(result.queryByText('Second pane')).not.toBeInTheDocument()
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

  it('links tabs and panels with aria attributes', () => {
    const result = render(() => <Tabs items={items} />)
    const oneTab = result.getByRole('tab', { name: 'One' })
    const twoTab = result.getByRole('tab', { name: 'Two' })
    const onePane = getPane(result.getByText('Pane one'))

    expect(oneTab.id).toBeTruthy()
    expect(onePane.id).toBeTruthy()
    expect(oneTab).toHaveAttribute('aria-controls', onePane.id)
    expect(onePane).toHaveAttribute('aria-labelledby', oneTab.id)
    expect(twoTab).not.toHaveAttribute('aria-controls')

    fireEvent.click(twoTab)
    expect(twoTab).toHaveAttribute('aria-controls', getPane(result.getByText('Pane two')).id)
    expect(getPane(result.getByText('Pane one'))).toHaveAttribute('hidden')
    expect(getPane(result.getByText('Pane one'))).toHaveAttribute('aria-hidden', 'true')
  })

  it('supports keyboard navigation and skips disabled tabs', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} onChange={onChange} />)

    fireEvent.keyDown(result.getByRole('tab', { name: 'One' }), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith('two')
    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(result.getByRole('tab', { name: 'Two' }), { key: 'ArrowRight' })
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(result.getByRole('tab', { name: 'One' }), { key: 'End' })
    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(result.getByRole('tab', { name: 'Two' }), { key: 'Home' })
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('recovers uncontrolled active key when items change', () => {
    const [dynamicItems, setDynamicItems] = createSignal<typeof items>([])
    const result = render(() => <Tabs items={dynamicItems()} />)

    expect(result.queryAllByRole('tab')).toHaveLength(0)
    setDynamicItems(items)

    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByText('Pane one')).toBeInTheDocument()
  })

  it('does not keep removed and re-added tabs marked as visited', () => {
    const [dynamicItems, setDynamicItems] = createSignal(items)
    const result = render(() => <Tabs items={dynamicItems()} />)

    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(result.getByText('Pane two')).toBeInTheDocument()

    fireEvent.click(result.getByRole('tab', { name: 'One' }))
    expect(getPane(result.getByText('Pane two'))).toHaveAttribute('aria-hidden', 'true')

    setDynamicItems([items[0]])
    expect(result.queryByRole('tab', { name: 'Two' })).not.toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()

    setDynamicItems(items)
    expect(result.getByRole('tab', { name: 'Two' })).toBeInTheDocument()
    expect(result.queryByText('Pane two')).not.toBeInTheDocument()
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
