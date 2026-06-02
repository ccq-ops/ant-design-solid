import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Dropdown } from '../index'

describe('Dropdown', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('opens overlay on click trigger with default bottomLeft class', () => {
    const result = render(() => (
      <Dropdown menu={{ items: [{ key: 'profile', label: 'Profile' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)

    expect(document.body.querySelector('.ads-dropdown')).toHaveClass('ads-dropdown-bottomLeft')
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Profile')
  })

  it('opens and closes overlay on hover trigger', () => {
    const result = render(() => (
      <Dropdown trigger="hover" menu={{ items: [{ key: 'edit', label: 'Edit' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))
    const trigger = result.container.querySelector('.ads-dropdown-trigger')!

    fireEvent.mouseEnter(trigger)
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Edit')

    fireEvent.mouseLeave(trigger)
    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
  })

  it('calls menu onClick and closes when clicking an enabled item', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Dropdown menu={{ items: [{ key: 'delete', label: 'Delete' }], onClick }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)
    const item = document.body.querySelector<HTMLElement>('[data-menu-key="delete"]')!
    fireEvent.click(item)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith({ key: 'delete', domEvent: expect.any(MouseEvent) })
    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
  })

  it('does not call menu onClick or close when clicking a disabled item', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Dropdown menu={{ items: [{ key: 'archive', label: 'Archive', disabled: true }], onClick }}>
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
          onOpenChange={setOpen}
          placement="topRight"
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
