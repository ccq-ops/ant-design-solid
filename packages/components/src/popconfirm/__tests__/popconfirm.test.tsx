import { cleanup, fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Popconfirm } from '../index'

beforeEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('Popconfirm', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('opens from trigger and confirms after confirm completes', async () => {
    const onConfirm = vi.fn(() => Promise.resolve())
    const result = render(() => (
      <Popconfirm title="Delete?" onConfirm={onConfirm}>
        <Button>Delete</Button>
      </Popconfirm>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Delete' }))
    expect(document.body).toHaveTextContent('Delete?')
    expect(document.body.querySelector('.ads-popconfirm')).toHaveClass('ads-popconfirm-bottom')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-popconfirm-buttons .ads-btn-primary')!,
    )
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(document.body).not.toHaveTextContent('Delete?'))
  })

  it('closes on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Popconfirm title="Outside?" onOpenChange={onOpenChange}>
        <Button>Open</Button>
      </Popconfirm>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Open' }))
    expect(document.body).toHaveTextContent('Outside?')

    fireEvent.pointerDown(document.body)

    expect(document.body).not.toHaveTextContent('Outside?')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('cancels and closes', () => {
    const onCancel = vi.fn()
    const result = render(() => (
      <Popconfirm title="Cancel?" onCancel={onCancel}>
        <Button>Open</Button>
      </Popconfirm>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Open' }))
    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ads-popconfirm-buttons .ads-btn:not(.ads-btn-primary)',
      )!,
    )

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Cancel?')
  })

  it('supports controlled open', () => {
    const [open, setOpen] = createSignal(true)
    render(() => (
      <Popconfirm open={open()} onOpenChange={setOpen} title="Controlled">
        <Button>Trigger</Button>
      </Popconfirm>
    ))
    expect(document.body).toHaveTextContent('Controlled')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ads-popconfirm-buttons .ads-btn:not(.ads-btn-primary)',
      )!,
    )
    expect(open()).toBe(false)
  })

  it('opens controlled popup when child click handler also opens it', async () => {
    const [open, setOpen] = createSignal(false)
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const result = render(() => (
      <Popconfirm
        open={open()}
        onOpenChange={setOpen}
        title="Controlled trigger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <Button onClick={() => setOpen(true)}>Trigger</Button>
      </Popconfirm>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Trigger' }))
    expect(open()).toBe(true)
    expect(document.body).toHaveTextContent('Controlled trigger')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-popconfirm-buttons .ads-btn-primary')!,
    )
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    expect(open()).toBe(false)
    expect(document.body).not.toHaveTextContent('Controlled trigger')

    fireEvent.click(result.getByRole('button', { name: 'Trigger' }))
    expect(open()).toBe(true)
    expect(document.body).toHaveTextContent('Controlled trigger')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ads-popconfirm-buttons .ads-btn:not(.ads-btn-primary)',
      )!,
    )
    expect(open()).toBe(false)
    expect(document.body).not.toHaveTextContent('Controlled trigger')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does not let action clicks bubble back to controlled trigger handlers', async () => {
    const [open, setOpen] = createSignal(false)
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const reopenFromBubbledAction = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('.ads-popconfirm-buttons')) {
        queueMicrotask(() => setOpen(true))
      }
    }
    document.body.addEventListener('click', reopenFromBubbledAction)

    try {
      render(() => (
        <Popconfirm
          open={open()}
          onOpenChange={setOpen}
          title="Controlled bubble"
          onConfirm={onConfirm}
          onCancel={onCancel}
        >
          <Button onClick={() => setOpen(true)}>Trigger</Button>
        </Popconfirm>
      ))

      setOpen(true)
      await waitFor(() => expect(document.body).toHaveTextContent('Controlled bubble'))

      fireEvent.click(
        document.body.querySelector<HTMLButtonElement>('.ads-popconfirm-buttons .ads-btn-primary')!,
      )
      await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
      await Promise.resolve()
      expect(open()).toBe(false)
      expect(document.body).not.toHaveTextContent('Controlled bubble')

      setOpen(true)
      await waitFor(() => expect(document.body).toHaveTextContent('Controlled bubble'))

      fireEvent.click(
        document.body.querySelector<HTMLButtonElement>(
          '.ads-popconfirm-buttons .ads-btn:not(.ads-btn-primary)',
        )!,
      )
      await Promise.resolve()
      expect(open()).toBe(false)
      expect(document.body).not.toHaveTextContent('Controlled bubble')
      expect(onCancel).toHaveBeenCalledTimes(1)
    } finally {
      document.body.removeEventListener('click', reopenFromBubbledAction)
    }
  })

  it('does not open when disabled', () => {
    const result = render(() => (
      <Popconfirm disabled title="Disabled">
        <Button>Trigger</Button>
      </Popconfirm>
    ))
    fireEvent.click(result.getByRole('button', { name: 'Trigger' }))
    expect(document.body).not.toHaveTextContent('Disabled')
  })

  it('keeps open when async confirm rejects', async () => {
    const result = render(() => (
      <Popconfirm title="Async" onConfirm={() => Promise.reject(new Error('fail'))}>
        <Button>Trigger</Button>
      </Popconfirm>
    ))
    fireEvent.click(result.getByRole('button', { name: 'Trigger' }))
    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-popconfirm-buttons .ads-btn-primary')!,
    )
    await waitFor(() => expect(document.body).toHaveTextContent('Async'))
  })

  it('positions for requested placement', () => {
    const result = render(() => (
      <Popconfirm title="Bottom" placement="bottom">
        <Button>Trigger</Button>
      </Popconfirm>
    ))
    const rect = {
      x: 10,
      y: 20,
      top: 20,
      left: 10,
      right: 110,
      bottom: 60,
      width: 100,
      height: 40,
      toJSON: () => ({}),
    }
    const trigger = result.getByRole('button', { name: 'Trigger' }).parentElement!
    const rectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(rect)

    fireEvent.click(result.getByRole('button', { name: 'Trigger' }))

    const popup = document.body.querySelector<HTMLElement>('.ads-popconfirm')!
    expect(popup).toHaveClass('ads-popconfirm-bottom')
    expect(popup.style.top).toBe('68px')
    expect(popup.style.left).toBe('60px')
    rectSpy.mockRestore()
  })
})

it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  render(() => (
    <Popconfirm title="Delete?" open zIndex={1236} getPopupContainer={() => popupContainer}>
      <button>trigger</button>
    </Popconfirm>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-popconfirm')!
  expect(overlay).toHaveTextContent('Delete?')
  expect(overlay.style.zIndex).toBe('1236')
})

it('passes click events and button props to action callbacks', async () => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(() => (
    <Popconfirm
      title="Delete?"
      open
      okText="Remove"
      cancelText="Back"
      okButtonProps={{ danger: true, class: 'ok-extra', 'aria-label': 'confirm removal' }}
      cancelButtonProps={{ disabled: true, class: 'cancel-extra' }}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <button>trigger</button>
    </Popconfirm>
  ))

  const cancelButton = document.body.querySelector<HTMLButtonElement>(
    '.ads-popconfirm-buttons .cancel-extra',
  )!
  const okButton = document.body.querySelector<HTMLButtonElement>(
    '.ads-popconfirm-buttons .ok-extra',
  )!

  expect(cancelButton).toBeDisabled()
  expect(okButton).toHaveClass('ads-btn-dangerous')
  expect(okButton).toHaveAttribute('aria-label', 'confirm removal')

  fireEvent.click(okButton)
  await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
  expect(onConfirm.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
})

it('supports okType, showCancel, icon, function content, and popup click callback', async () => {
  const onPopupClick = vi.fn()
  const onConfirm = vi.fn()
  render(() => (
    <Popconfirm
      title={() => 'Archive item?'}
      description={() => 'This can be restored later.'}
      open
      okType="dashed"
      showCancel={false}
      icon={<span data-testid="archive-icon">!</span>}
      onPopupClick={onPopupClick}
      onConfirm={onConfirm}
    >
      <button>trigger</button>
    </Popconfirm>
  ))

  const popup = document.body.querySelector<HTMLElement>('.ads-popconfirm')!
  expect(popup).toHaveTextContent('Archive item?')
  expect(popup).toHaveTextContent('This can be restored later.')
  expect(popup.querySelector('[data-testid="archive-icon"]')).toBeInTheDocument()
  expect(popup.querySelectorAll('.ads-popconfirm-buttons .ads-btn')).toHaveLength(1)

  fireEvent.click(popup.querySelector<HTMLElement>('[role="dialog"]')!)
  expect(onPopupClick).toHaveBeenCalledTimes(1)

  const okButton = popup.querySelector<HTMLButtonElement>('.ads-popconfirm-buttons .ads-btn')!
  expect(okButton).toHaveClass('ads-btn-dashed')
  fireEvent.click(okButton)
  await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
})

it('inherits popover shared placement, trigger, arrow, and semantic style APIs', async () => {
  const result = render(() => (
    <Popconfirm
      title="Shared APIs"
      description="From Popover"
      placement="bottomRight"
      trigger={['hover', 'contextMenu']}
      mouseEnterDelay={0}
      mouseLeaveDelay={0}
      arrow={{ pointAtCenter: true }}
      autoAdjustOverflow={false}
      align={{ offset: [4, 6] }}
      class="trigger-extra"
      rootClass="root-extra"
      overlayClass="overlay-extra"
      overlayStyle={{ width: '320px' }}
      overlayInnerStyle={{ padding: '12px' }}
      classNames={{
        root: 'semantic-root',
        container: 'semantic-container',
        arrow: 'semantic-arrow',
        icon: 'semantic-icon',
        title: 'semantic-title',
        description: 'semantic-description',
        buttons: 'semantic-buttons',
      }}
      styles={{
        root: { border: '1px solid rgb(1, 2, 3)' },
        container: { color: 'rgb(4, 5, 6)' },
        arrow: { background: 'rgb(7, 8, 9)' },
        icon: { color: 'rgb(10, 11, 12)' },
        title: { 'font-weight': 700 },
        description: { 'margin-top': '6px' },
        buttons: { gap: '6px' },
      }}
    >
      <Button>Hover me</Button>
    </Popconfirm>
  ))

  const trigger = result.getByText('Hover me').parentElement!
  expect(trigger).toHaveClass('trigger-extra')

  fireEvent.mouseEnter(trigger)
  await waitFor(() => expect(document.body).toHaveTextContent('Shared APIs'))

  const popup = document.body.querySelector<HTMLElement>('.ads-popconfirm')!
  expect(popup).toHaveClass(
    'ads-popconfirm-bottomRight',
    'ads-popconfirm-arrow-point-at-center',
    'root-extra',
    'overlay-extra',
    'semantic-root',
  )
  expect(popup.style.width).toBe('320px')
  expect(popup.style.border).toBe('1px solid rgb(1, 2, 3)')
  expect(popup.querySelector('.ads-popconfirm-arrow')).toHaveClass('semantic-arrow')
  expect(popup.querySelector('.ads-popconfirm-inner')).toHaveClass('semantic-container')
  expect(popup.querySelector('.ads-popconfirm-icon')).toHaveClass('semantic-icon')
  expect(popup.querySelector('.ads-popconfirm-title')).toHaveClass('semantic-title')
  expect(popup.querySelector('.ads-popconfirm-description')).toHaveClass('semantic-description')
  expect(popup.querySelector('.ads-popconfirm-buttons')).toHaveClass('semantic-buttons')

  fireEvent.contextMenu(trigger)
  expect(document.body).toHaveTextContent('Shared APIs')
})
