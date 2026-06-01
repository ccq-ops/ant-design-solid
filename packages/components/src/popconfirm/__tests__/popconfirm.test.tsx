import { cleanup, fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Popconfirm } from '../index'

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
    expect(document.body.querySelector('.ads-popconfirm')).toHaveClass('ads-popconfirm-top')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-popconfirm-buttons .ads-btn-primary')!,
    )
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(document.body).not.toHaveTextContent('Delete?'))
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
    expect(popup.style.left).toBe('10px')
    rectSpy.mockRestore()
  })
})
