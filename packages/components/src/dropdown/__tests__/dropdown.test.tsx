import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Dropdown } from '../index'
import type { DropdownTriggerInput } from '../interface'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('Dropdown', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('opens overlay on default hover trigger with default bottomLeft class', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Dropdown menu={{ items: [{ key: 'profile', label: 'Profile' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.mouseEnter(result.container.querySelector('.ads-dropdown-trigger')!)
    vi.advanceTimersByTime(160)

    expect(document.body.querySelector('.ads-dropdown')).toHaveClass('ads-dropdown-bottomLeft')
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Profile')
    vi.useRealTimers()
  })

  it('opens and closes overlay on hover trigger', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Dropdown trigger={['hover']} menu={{ items: [{ key: 'edit', label: 'Edit' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))
    const trigger = result.container.querySelector('.ads-dropdown-trigger')!

    fireEvent.mouseEnter(trigger)
    vi.advanceTimersByTime(160)
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Edit')

    fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(200)

    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
    vi.useRealTimers()
  })
  it('keeps hover overlay open when moving from trigger into the portaled overlay', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Dropdown trigger="hover" menu={{ items: [{ key: 'edit', label: 'Edit' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))
    const trigger = result.container.querySelector('.ads-dropdown-trigger')!

    fireEvent.mouseEnter(trigger)
    vi.advanceTimersByTime(160)
    const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
    expect(overlay).toBeTruthy()

    fireEvent.mouseLeave(trigger, { relatedTarget: document.body })
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Edit')

    fireEvent.mouseEnter(overlay, { relatedTarget: document.body })
    vi.advanceTimersByTime(200)

    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Edit')

    fireEvent.mouseLeave(overlay, { relatedTarget: document.body })
    vi.advanceTimersByTime(200)

    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
    vi.useRealTimers()
  })

  it('supports multiple triggers and context menu position', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Dropdown
        trigger={['click', 'contextMenu']}
        onOpenChange={onOpenChange}
        menu={{ items: [{ key: 'open', label: 'Open' }] }}
      >
        <button type="button">Actions</button>
      </Dropdown>
    ))
    const trigger = result.container.querySelector('.ads-dropdown-trigger') as HTMLElement

    fireEvent.contextMenu(trigger, { clientX: 77, clientY: 88 })

    const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
    expect(overlay).toHaveTextContent('Open')
    expect(overlay.style.left).toBe('77px')
    expect(overlay.style.top).toBe('88px')
    expect(onOpenChange).toHaveBeenLastCalledWith(true, { source: 'trigger' })

    fireEvent.click(trigger)
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { source: 'trigger' })
  })

  it('does not open when disabled', () => {
    const result = render(() => (
      <Dropdown disabled trigger={['click']} menu={{ items: [{ key: 'one', label: 'One' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)

    expect(document.body.querySelector('.ads-dropdown')).toBeFalsy()
  })

  it('calls menu onClick and closes when clicking an enabled item', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Dropdown trigger={['click']} menu={{ items: [{ key: 'delete', label: 'Delete' }], onClick }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)
    const item = document.body.querySelector<HTMLElement>('[data-menu-key="delete"]')!
    fireEvent.click(item)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'delete', domEvent: expect.any(MouseEvent) }),
    )
    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
  })

  it('passes menu source when a menu item closes the dropdown', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Dropdown
        trigger={['click']}
        onOpenChange={onOpenChange}
        menu={{ items: [{ key: 'delete', label: 'Delete' }] }}
      >
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)
    fireEvent.click(document.body.querySelector<HTMLElement>('[data-menu-key="delete"]')!)

    expect(onOpenChange).toHaveBeenLastCalledWith(false, { source: 'menu' })
  })

  it('does not call menu onClick or close when clicking a disabled item', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Dropdown
        trigger={['click']}
        menu={{ items: [{ key: 'archive', label: 'Archive', disabled: true }], onClick }}
      >
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)
    const item = document.body.querySelector<HTMLElement>('[data-menu-key="archive"]')!
    fireEvent.click(item)

    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(onClick).not.toHaveBeenCalled()
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy()
  })

  it('renders divider as a separator', () => {
    const result = render(() => (
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'new', label: 'New' },
            { key: 'divider', type: 'divider' },
            { key: 'open', label: 'Open' },
          ],
        }}
      >
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)

    expect(document.body.querySelector('[role="separator"]')).toBeTruthy()
  })

  it('supports controlled open, topRight placement, and custom prefix class', () => {
    const [open, setOpen] = createSignal(true)
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Dropdown
          open={open()}
          trigger={['click']}
          onOpenChange={(nextOpen) => setOpen(nextOpen)}
          placement="topRight"
          autoAdjustOverflow={false}
          overlayClass="extra-overlay"
          menu={{ items: [{ key: 'settings', label: 'Settings' }] }}
        >
          <button type="button">Actions</button>
        </Dropdown>
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-dropdown-trigger')).toBeTruthy()
    const overlay = document.body.querySelector('.custom-dropdown')
    expect(overlay).toHaveClass('custom-dropdown-topRight')
    expect(overlay).toHaveClass('extra-overlay')
    expect(overlay).toHaveTextContent('Settings')

    fireEvent.click(result.container.querySelector('.custom-dropdown-trigger')!)
    expect(open()).toBe(false)
  })
})

it('renders full MenuProps including submenu, icon, extra, and selectable state', () => {
  const onSelect = vi.fn()
  render(() => (
    <Dropdown
      open
      menu={{
        selectable: true,
        defaultSelectedKeys: ['profile'],
        onSelect,
        items: [
          { key: 'profile', label: 'Profile', icon: <span data-testid="profile-icon" /> },
          { key: 'billing', label: 'Billing', extra: '⌘B' },
          {
            key: 'workspace',
            label: 'Workspace',
            children: [{ key: 'team', label: 'Team' }],
          },
        ],
      }}
    >
      <button type="button">Actions</button>
    </Dropdown>
  ))

  const menu = document.body.querySelector<HTMLElement>('.ads-dropdown-menu')!
  expect(menu).toHaveTextContent('Profile')
  expect(menu.querySelector('.ads-menu-item-selected')).toHaveTextContent('Profile')
  expect(document.body.querySelector('[data-testid="profile-icon"]')).toBeInTheDocument()
  expect(menu).toHaveTextContent('⌘B')
  expect(menu).toHaveTextContent('Workspace')

  fireEvent.click(document.body.querySelector<HTMLElement>('[data-menu-key="billing"]')!)

  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: 'billing' }))
})

it('wraps popup content with popupRender and supports semantic classNames and styles', () => {
  render(() => (
    <Dropdown
      open
      popupRender={(origin) => <section data-testid="wrapped-popup">{origin}</section>}
      classNames={{ root: 'semantic-root', item: 'semantic-item' }}
      styles={{ root: { width: '240px' }, item: { color: 'red' } }}
      menu={{ items: [{ key: 'one', label: 'One' }] }}
    >
      <button type="button">Actions</button>
    </Dropdown>
  ))

  const wrapper = document.body.querySelector<HTMLElement>('[data-testid="wrapped-popup"]')!
  const overlay = wrapper.querySelector<HTMLElement>('.ads-dropdown')!
  const item = wrapper.querySelector<HTMLElement>('.ads-menu-item')!
  expect(overlay).toHaveClass('semantic-root')
  expect(overlay.style.width).toBe('240px')
  expect(item).toHaveClass('semantic-item')
  expect(item.style.color).toBe('red')
})

it('renders arrow and applies point-at-center class', () => {
  render(() => (
    <Dropdown open arrow={{ pointAtCenter: true }} menu={{ items: [{ key: 'one', label: 'One' }] }}>
      <button type="button">Actions</button>
    </Dropdown>
  ))

  expect(document.body.querySelector('.ads-dropdown-arrow')).toBeTruthy()
  expect(document.body.querySelector('.ads-dropdown')).toHaveClass(
    'ads-dropdown-arrow-point-at-center',
  )
})

it('keeps hidden popup mounted when destroyOnHidden is false', () => {
  const [open, setOpen] = createSignal(true)
  const result = render(() => (
    <Dropdown
      open={open()}
      destroyOnHidden={false}
      trigger={['click']}
      menu={{ items: [{ key: 'one', label: 'One' }] }}
    >
      <button type="button">Actions</button>
    </Dropdown>
  ))

  setOpen(false)

  const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay).toHaveClass('ads-dropdown-hidden')
  expect(overlay).toHaveAttribute('aria-hidden', 'true')
  expect(result.container.querySelector('.ads-dropdown')).toBeFalsy()
})

it('supports top and bottom placements with auto adjustment', () => {
  const result = render(() => (
    <Dropdown open placement="bottom" menu={{ items: [{ key: 'one', label: 'One' }] }}>
      <button type="button">Actions</button>
    </Dropdown>
  ))
  const trigger = result.container.querySelector('.ads-dropdown-trigger') as HTMLElement
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(50)
  const rectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 48,
    left: 20,
    right: 120,
    width: 100,
    height: 38,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  window.dispatchEvent(new Event('scroll'))

  expect(document.body.querySelector('.ads-dropdown')).toHaveClass('ads-dropdown-top')
  rectSpy.mockRestore()
})

it('honors mouse enter and leave delays', () => {
  vi.useFakeTimers()
  const result = render(() => (
    <Dropdown
      trigger={['hover']}
      mouseEnterDelay={0.3}
      mouseLeaveDelay={0.4}
      menu={{ items: [{ key: 'one', label: 'One' }] }}
    >
      <button type="button">Actions</button>
    </Dropdown>
  ))
  const trigger = result.container.querySelector('.ads-dropdown-trigger')!

  fireEvent.mouseEnter(trigger)
  vi.advanceTimersByTime(299)
  expect(document.body.querySelector('.ads-dropdown')).toBeFalsy()
  vi.advanceTimersByTime(1)
  expect(document.body.querySelector('.ads-dropdown')).toBeTruthy()

  fireEvent.mouseLeave(trigger)
  vi.advanceTimersByTime(399)
  expect(document.body.querySelector('.ads-dropdown')).toBeTruthy()
  vi.advanceTimersByTime(1)
  expect(document.body.querySelector('.ads-dropdown')).toBeFalsy()
  vi.useRealTimers()
})

it('renders Dropdown.Button with split buttons', () => {
  vi.useFakeTimers()
  const onClick = vi.fn()
  const result = render(() => (
    <Dropdown.Button
      type="primary"
      onClick={onClick}
      menu={{ items: [{ key: 'edit', label: 'Edit' }] }}
    >
      Submit
    </Dropdown.Button>
  ))

  const buttons = document.body.querySelectorAll('.ads-btn')
  const root = result.container.firstElementChild as HTMLElement
  const trigger = root.querySelector<HTMLElement>('.ads-dropdown-trigger')!
  const rightButton = trigger.querySelector<HTMLElement>('.ads-btn')!
  expect(buttons).toHaveLength(2)
  expect(root).toHaveClass('ads-dropdown-button')
  expect(root).toHaveClass('ads-space-compact')
  expect(root).toHaveClass('ads-space-compact-block')
  expect(trigger).toHaveClass('ads-dropdown-button-trigger')
  expect(rightButton).toHaveClass('ads-dropdown-button-trigger-btn')
  expect(rightButton.style.borderInlineStartColor).toBe('rgba(255, 255, 255, 0.45)')
  expect(buttons[0]).toHaveTextContent('Submit')

  fireEvent.click(buttons[0])
  expect(onClick).toHaveBeenCalledTimes(1)

  fireEvent.mouseEnter(document.body.querySelector('.ads-dropdown-trigger')!)
  vi.advanceTimersByTime(160)
  expect(document.body.querySelector('.ads-dropdown')).toHaveTextContent('Edit')
  vi.useRealTimers()
})

it('accepts legacy string trigger for Solid compatibility', () => {
  const trigger: DropdownTriggerInput = 'click'
  const result = render(() => (
    <Dropdown trigger={trigger} menu={{ items: [{ key: 'one', label: 'One' }] }}>
      <button type="button">Actions</button>
    </Dropdown>
  ))

  fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)

  expect(document.body.querySelector('.ads-dropdown')).toHaveTextContent('One')
})

it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  render(() => (
    <Dropdown
      open
      zIndex={1240}
      getPopupContainer={() => popupContainer}
      menu={{ items: [{ key: 'one', label: 'One' }] }}
    >
      <button>trigger</button>
    </Dropdown>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay).toHaveTextContent('One')
  expect(overlay.style.zIndex).toBe('1240')
})

it('renders overlay in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <Dropdown trigger={['click']} zIndex={1315} menu={{ items: [{ key: 'one', label: 'One' }] }}>
      <button type="button">Actions</button>
    </Dropdown>
  ))
  const trigger = result.container.querySelector('.ads-dropdown-trigger') as HTMLElement
  const rectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 42,
    left: 20,
    right: 220,
    width: 200,
    height: 32,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.click(trigger)

  const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay).toBeTruthy()
  expect(result.container.querySelector('.ads-dropdown')).toBeFalsy()
  expect(overlay.style.position).toBe('fixed')
  expect(overlay.style.top).toBe('46px')
  expect(overlay.style.left).toBe('20px')
  expect(overlay.style.zIndex).toBe('1315')
  rectSpy.mockRestore()
})

it('updates portaled overlay position when the page scrolls', () => {
  const result = render(() => (
    <Dropdown trigger={['click']} menu={{ items: [{ key: 'one', label: 'One' }] }}>
      <button type="button">Actions</button>
    </Dropdown>
  ))
  const trigger = result.container.querySelector('.ads-dropdown-trigger') as HTMLElement
  const rectSpy = vi
    .spyOn(trigger, 'getBoundingClientRect')
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValue({
      top: 30,
      bottom: 62,
      left: 40,
      right: 240,
      width: 200,
      height: 32,
      x: 40,
      y: 30,
      toJSON: () => ({}),
    } as DOMRect)

  fireEvent.click(trigger)

  const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay.style.top).toBe('46px')
  expect(overlay.style.left).toBe('20px')

  window.dispatchEvent(new Event('scroll'))

  expect(overlay.style.top).toBe('26px')
  expect(overlay.style.left).toBe('40px')
  rectSpy.mockRestore()
})
