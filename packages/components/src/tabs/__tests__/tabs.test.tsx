import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
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

  it('supports icons, extra content, gutter, style, centered, and indicator', () => {
    const result = render(() => (
      <Tabs
        centered
        tabBarGutter={16}
        tabBarStyle={{ color: 'blue' }}
        indicator={{ size: () => 20, align: 'end' }}
        tabBarExtraContent={{ left: <span>Left extra</span>, right: <span>Right extra</span> }}
        items={[
          {
            key: 'one',
            icon: <span>Icon</span>,
            label: 'One',
            children: <div>Pane one</div>,
          },
        ]}
        classNames={{ indicator: 'custom-indicator' }}
        styles={{ indicator: { width: '20px' } }}
      />
    ))

    expect(result.getByText('Icon')).toBeInTheDocument()
    expect(result.getByText('Left extra')).toBeInTheDocument()
    expect(result.getByText('Right extra')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-tabs-centered')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-tabs-nav')).toHaveStyle({
      color: 'rgb(0, 0, 255)',
    })
    expect(result.container.querySelector('.ads-tabs-nav-list')).toHaveStyle({
      gap: 'var(--ads-tabs-tab-gutter, 0)',
    })
    expect(result.container.querySelector('.ads-tabs-nav') as HTMLElement).toHaveStyle({
      '--ads-tabs-tab-gutter': '16px',
    })
    expect(result.container.querySelector('.custom-indicator')).toHaveClass(
      'ads-tabs-indicator-end',
    )
    expect(result.container.querySelector('.custom-indicator')).toHaveStyle({
      '--ads-tabs-indicator-size': '20px',
      width: '20px',
    })
  })

  it('keeps the default indicator full-size when indicator size is omitted', () => {
    const result = render(() => (
      <Tabs
        indicator={{ align: 'end' }}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))
    const indicator = result.container.querySelector('.ads-tabs-indicator') as HTMLElement

    expect(indicator).toBeInTheDocument()
    expect(indicator).not.toHaveClass('ads-tabs-indicator-end')
    expect(indicator.style.getPropertyValue('--ads-tabs-indicator-size')).toBe('')
  })

  it('moves a stable indicator element when active tab changes', () => {
    const [activeKey, setActiveKey] = createSignal('one')
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('ads-tabs-nav-list')) {
          return {
            width: 220,
            height: 40,
            x: 0,
            y: 0,
            top: 0,
            right: 220,
            bottom: 40,
            left: 0,
            toJSON: () => {},
          } as DOMRect
        }
        if (this.id.endsWith('-tab-one')) {
          return {
            width: 72,
            height: 32,
            x: 0,
            y: 0,
            top: 0,
            right: 72,
            bottom: 32,
            left: 0,
            toJSON: () => {},
          } as DOMRect
        }
        if (this.id.endsWith('-tab-two')) {
          return {
            width: 96,
            height: 32,
            x: 72,
            y: 0,
            top: 0,
            right: 168,
            bottom: 32,
            left: 72,
            toJSON: () => {},
          } as DOMRect
        }
        return {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => {},
        } as DOMRect
      })

    try {
      const result = render(() => <Tabs items={items} activeKey={activeKey()} />)
      const indicator = result.container.querySelector('.ads-tabs-indicator') as HTMLElement

      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveStyle({ transform: 'translateX(0px)', width: '72px' })

      setActiveKey('two')

      const nextIndicator = result.container.querySelector('.ads-tabs-indicator') as HTMLElement
      expect(nextIndicator).toBe(indicator)
      expect(nextIndicator).toHaveStyle({ transform: 'translateX(72px)', width: '96px' })
    } finally {
      getBoundingClientRect.mockRestore()
    }
  })

  it('enables indicator motion by default and disables it from animated props', () => {
    const defaultResult = render(() => <Tabs items={items} />)
    const disabledBooleanResult = render(() => <Tabs animated={false} items={items} />)
    const disabledObjectResult = render(() => <Tabs animated={{ inkBar: false }} items={items} />)

    expect(defaultResult.container.querySelector('.ads-tabs-indicator')).not.toHaveClass(
      'ads-tabs-indicator-no-motion',
    )
    expect(disabledBooleanResult.container.querySelector('.ads-tabs-indicator')).toHaveClass(
      'ads-tabs-indicator-no-motion',
    )
    expect(disabledObjectResult.container.querySelector('.ads-tabs-indicator')).toHaveClass(
      'ads-tabs-indicator-no-motion',
    )
  })

  it('passes measured tab size to indicator size callback and applies the result', () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('ads-tabs-tab-active')) {
          return {
            width: 72,
            height: 32,
            x: 0,
            y: 0,
            top: 0,
            right: 72,
            bottom: 32,
            left: 0,
            toJSON: () => {},
          } as DOMRect
        }
        return {
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => {},
        } as DOMRect
      })
    const indicatorSize = vi.fn((origin: number) => origin / 2)

    try {
      const result = render(() => (
        <Tabs
          indicator={{ size: indicatorSize, align: 'start' }}
          items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
        />
      ))

      const indicator = result.container.querySelector('.ads-tabs-indicator') as HTMLElement

      expect(indicatorSize).toHaveBeenCalledWith(72)
      expect(indicator).toHaveClass('ads-tabs-indicator-start')
      expect(indicator).toHaveStyle({ '--ads-tabs-indicator-size': '36px' })
    } finally {
      getBoundingClientRect.mockRestore()
    }
  })

  it('updates indicator size when ResizeObserver reports active tab layout changes', () => {
    let observerCallback: ResizeObserverCallback | undefined
    const observe = vi.fn()
    const disconnect = vi.fn()
    const originalResizeObserver = globalThis.ResizeObserver
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback
      }

      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
    }
    globalThis.ResizeObserver = MockResizeObserver as typeof ResizeObserver
    let activeWidth = 72
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const width = this.classList.contains('ads-tabs-tab-active') ? activeWidth : 0
        return {
          width,
          height: 32,
          x: 0,
          y: 0,
          top: 0,
          right: width,
          bottom: 32,
          left: 0,
          toJSON: () => {},
        } as DOMRect
      })
    const indicatorSize = vi.fn((origin: number) => origin / 2)

    try {
      const result = render(() => (
        <Tabs
          indicator={{ size: indicatorSize, align: 'center' }}
          items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
        />
      ))
      const indicator = result.container.querySelector('.ads-tabs-indicator') as HTMLElement

      expect(observe).toHaveBeenCalledWith(result.getByRole('tab', { name: 'One' }))

      activeWidth = 120
      observerCallback?.([], {} as ResizeObserver)

      expect(indicatorSize).toHaveBeenLastCalledWith(120)
      expect(indicator).toHaveStyle({ '--ads-tabs-indicator-size': '60px' })
    } finally {
      getBoundingClientRect.mockRestore()
      globalThis.ResizeObserver = originalResizeObserver
    }
  })

  it('maps single tabBarExtraContent nodes to the right side', () => {
    const result = render(() => (
      <Tabs
        tabBarExtraContent={<span>Single extra</span>}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))
    const rightExtra = result.container.querySelector('.ads-tabs-extra-content-right')

    expect(rightExtra).toHaveTextContent('Single extra')
    expect(result.container.querySelector('.ads-tabs-extra-content-left')).not.toBeInTheDocument()
  })

  it('keeps tabBarExtraContent outside the tablist role structure', () => {
    const result = render(() => (
      <Tabs
        tabBarExtraContent={{
          left: <button type="button">Left action</button>,
          right: <button type="button">Right action</button>,
        }}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))

    const tablist = result.getByRole('tablist')
    const leftAction = result.getByRole('button', { name: 'Left action' })
    const rightAction = result.getByRole('button', { name: 'Right action' })

    expect(result.container.querySelector('.ads-tabs-nav')).not.toHaveAttribute('role')
    expect(tablist).toHaveClass('ads-tabs-nav-list')
    expect(tablist.contains(leftAction)).toBe(false)
    expect(tablist.contains(rightAction)).toBe(false)
  })

  it('pins right extra content and centers only the tab track', () => {
    const result = render(() => (
      <Tabs
        centered
        tabBarExtraContent={{ right: <span>Right extra</span> }}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))

    expect(result.container.querySelector('.ads-tabs-nav')).not.toHaveClass('ads-tabs-nav-centered')
    expect(result.getByRole('tablist')).toHaveClass('ads-tabs-nav-list-centered')
    expect(result.container.querySelector('.ads-tabs-extra-content-right')).toHaveStyle({
      'margin-inline-start': 'auto',
    })
  })

  it('uses block-axis auto margin for right extra content on vertical placements', () => {
    const result = render(() => (
      <Tabs
        tabPlacement="start"
        tabBarExtraContent={{ right: <span>Right extra</span> }}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))

    expect(result.container.querySelector('.ads-tabs-extra-content-right')).toHaveStyle({
      'margin-block-start': 'auto',
      'margin-inline-start': '0px',
    })
  })

  it('keeps editable-card non-tab buttons outside the tablist while remove still works', () => {
    const onEdit = vi.fn()
    const result = render(() => (
      <Tabs
        type="editable-card"
        onEdit={onEdit}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))
    const tablist = result.getByRole('tablist')

    expect(
      Array.from(tablist.querySelectorAll('button')).filter(
        (button) => button.getAttribute('role') !== 'tab',
      ),
    ).toHaveLength(0)

    fireEvent.click(result.getByRole('button', { name: /close/i }))

    expect(onEdit).toHaveBeenCalledWith('one', 'remove')
  })

  it('supports renderTabBar with default tab bar component', () => {
    const renderTabBar = vi.fn((props, DefaultTabBar) => (
      <div data-testid="custom-bar">
        <DefaultTabBar {...props} />
      </div>
    ))

    const result = render(() => <Tabs items={items} renderTabBar={renderTabBar} />)

    expect(result.getByTestId('custom-bar')).toBeInTheDocument()
    expect(result.getByRole('tab', { name: 'One' })).toBeInTheDocument()
    expect(renderTabBar).toHaveBeenCalled()
  })

  it('moves overflowing tabs into more menu and activates hidden tabs', async () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('ads-tabs-nav-list')) {
          return {
            width: 120,
            height: 40,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: 120,
            bottom: 40,
            toJSON: () => {},
          } as DOMRect
        }
        return {
          width: 80,
          height: 32,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 80,
          bottom: 32,
          toJSON: () => {},
        } as DOMRect
      })

    try {
      const result = render(() => (
        <Tabs
          more={{ icon: <span>More tabs</span>, trigger: 'click' }}
          classNames={{ popup: { root: 'tabs-popup' } }}
          styles={{ popup: { root: { width: '240px' } } }}
          items={[
            { key: 'one', label: 'One', children: <div>Pane one</div> },
            { key: 'two', label: 'Two', children: <div>Pane two</div> },
            { key: 'three', label: 'Three', children: <div>Pane three</div> },
          ]}
        />
      ))

      await waitFor(() => {
        expect(result.queryByRole('tab', { name: 'Three' })).not.toBeInTheDocument()
      })
      fireEvent.click(result.getByRole('button', { name: /more tabs/i }))

      const menuItem = await screen.findByRole('menuitem', { name: 'Three' })
      expect(document.body.querySelector('.tabs-popup')).toHaveStyle({ width: '240px' })

      fireEvent.click(menuItem)

      await waitFor(() => {
        expect(result.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true')
      })
      expect(result.getByText('Pane three')).toBeInTheDocument()
    } finally {
      getBoundingClientRect.mockRestore()
    }
  })

  it('keeps the active tab visible when measuring overflow', async () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('ads-tabs-nav-list')) {
          return {
            width: 120,
            height: 40,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: 120,
            bottom: 40,
            toJSON: () => {},
          } as DOMRect
        }
        return {
          width: 80,
          height: 32,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 80,
          bottom: 32,
          toJSON: () => {},
        } as DOMRect
      })

    try {
      const result = render(() => (
        <Tabs
          defaultActiveKey="three"
          more={{ trigger: 'click' }}
          items={[
            { key: 'one', label: 'One', children: <div>Pane one</div> },
            { key: 'two', label: 'Two', children: <div>Pane two</div> },
            { key: 'three', label: 'Three', children: <div>Pane three</div> },
          ]}
        />
      ))

      await waitFor(() => {
        expect(result.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true')
        expect(result.queryByRole('tab', { name: 'Two' })).not.toBeInTheDocument()
      })
    } finally {
      getBoundingClientRect.mockRestore()
    }
  })

  it('reports tab scroll direction', () => {
    const onTabScroll = vi.fn()
    const result = render(() => <Tabs items={items} onTabScroll={onTabScroll} />)
    const list = result.container.querySelector('.ads-tabs-nav-list') as HTMLElement

    fireEvent.scroll(list, { target: { scrollLeft: 20 } })
    expect(onTabScroll).toHaveBeenCalledWith({ direction: 'right' })

    fireEvent.scroll(list, { target: { scrollLeft: 0 } })
    expect(onTabScroll).toHaveBeenLastCalledWith({ direction: 'left' })
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

    fireEvent.click(result.getByRole('button', { name: /add/i }))
    expect(onEdit).toHaveBeenCalledWith(expect.any(MouseEvent), 'add')

    fireEvent.click(result.getAllByRole('button', { name: /close/i })[0])
    expect(onEdit).toHaveBeenCalledWith('one', 'remove')
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(result.queryAllByRole('button', { name: /close/i })).toHaveLength(1)
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

  it('hides editable-card remove button when item closeIcon is null', () => {
    const result = render(() => (
      <Tabs
        type="editable-card"
        removeIcon={<span>Remove tab</span>}
        items={[{ key: 'one', label: 'One', closeIcon: null, children: <div>Pane one</div> }]}
      />
    ))

    expect(result.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
    expect(result.queryByRole('button', { name: /remove tab/i })).not.toBeInTheDocument()
  })

  it('keeps custom icon-only editable-card controls accessible', () => {
    const result = render(() => (
      <Tabs
        type="editable-card"
        addIcon={<span aria-hidden="true" data-testid="custom-add-icon" />}
        removeIcon={<span aria-hidden="true" data-testid="custom-remove-icon" />}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))

    expect(result.getByRole('button', { name: /add/i })).toBeInTheDocument()
    expect(result.getByRole('button', { name: /close/i })).toBeInTheDocument()
    expect(result.getByTestId('custom-add-icon')).toBeInTheDocument()
    expect(result.getByTestId('custom-remove-icon')).toBeInTheDocument()
  })

  it('lets item closeIcon override editable-card removeIcon', () => {
    const result = render(() => (
      <Tabs
        type="editable-card"
        removeIcon={<span>Global remove</span>}
        items={[
          {
            key: 'one',
            label: 'One',
            closeIcon: <span>Item remove</span>,
            children: <div>Pane one</div>,
          },
        ]}
      />
    ))

    expect(result.getByText('Item remove')).toBeInTheDocument()
    expect(result.queryByText('Global remove')).not.toBeInTheDocument()
    expect(result.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('does not activate a tab when removing it from editable-card', () => {
    const onChange = vi.fn()
    const onTabClick = vi.fn()
    const result = render(() => (
      <Tabs
        type="editable-card"
        onChange={onChange}
        onTabClick={onTabClick}
        items={[
          { key: 'one', label: 'One', children: <div>Pane one</div> },
          { key: 'two', label: 'Two', children: <div>Pane two</div> },
        ]}
      />
    ))

    fireEvent.click(result.getAllByRole('button', { name: /close/i })[1])

    expect(onTabClick).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('applies editable-card remove semantic classNames and styles to remove button', () => {
    const result = render(() => (
      <Tabs
        type="editable-card"
        classNames={{ remove: 'sem-remove' }}
        styles={{ remove: { color: 'red' } }}
        items={[{ key: 'one', label: 'One', children: <div>Pane one</div> }]}
      />
    ))

    const removeButton = result.getByRole('button', { name: /close/i })

    expect(removeButton).toHaveClass('sem-remove')
    expect(removeButton).toHaveStyle({ color: 'rgb(255, 0, 0)' })
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
    expect(topRoot.firstElementChild).toHaveClass('ads-tabs-nav')
    expect(topRoot.firstElementChild?.querySelector('[role="tablist"]')).toBeInTheDocument()

    const bottom = render(() => <Tabs items={items} tabPlacement="bottom" />)
    const bottomRoot = bottom.container.firstElementChild as HTMLElement
    expect(bottomRoot).toHaveClass('ads-tabs-bottom')
    expect(bottomRoot.lastElementChild).toHaveClass('ads-tabs-nav')
    expect(bottomRoot.lastElementChild?.querySelector('[role="tablist"]')).toBeInTheDocument()

    const start = render(() => <Tabs items={items} tabPlacement="start" />)
    const startRoot = start.container.firstElementChild as HTMLElement
    expect(startRoot).toHaveClass('ads-tabs-start')
    expect(startRoot.firstElementChild).toHaveClass('ads-tabs-nav')
    expect(startRoot.firstElementChild?.querySelector('[role="tablist"]')).toBeInTheDocument()

    const end = render(() => <Tabs items={items} tabPlacement="end" />)
    const endRoot = end.container.firstElementChild as HTMLElement
    expect(endRoot).toHaveClass('ads-tabs-end')
    expect(endRoot.lastElementChild).toHaveClass('ads-tabs-nav')
    expect(endRoot.lastElementChild?.querySelector('[role="tablist"]')).toBeInTheDocument()
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
    expect(root.lastElementChild).toHaveClass('custom-tabs-nav')
    expect(root.lastElementChild?.querySelector('[role="tablist"]')).toBeInTheDocument()
  })
})
