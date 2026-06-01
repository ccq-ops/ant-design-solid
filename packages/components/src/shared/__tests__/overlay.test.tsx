import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createSignal, onCleanup } from 'solid-js'
import { InternalPortal } from '../portal'
import { allocateZIndex, resetZIndexForTests } from '../z-index'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../overlay'

describe('shared overlay helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetZIndexForTests()
  })

  it('allocates deterministic z-index values', () => {
    expect(allocateZIndex()).toBe(1000)
    expect(allocateZIndex()).toBe(1010)
  })

  it('renders portal content into document.body', () => {
    render(() => <InternalPortal><div data-testid="portal-child">Portal child</div></InternalPortal>)
    expect(document.body.querySelector('[data-testid="portal-child"]')).toHaveTextContent('Portal child')
  })

  it('adds and removes Escape keydown handlers', () => {
    const onEscape = vi.fn()
    const result = render(() => {
      const [enabled, setEnabled] = createSignal(true)
      const cleanup = addDocumentKeydown((event) => {
        if (event.key === 'Escape' && enabled()) onEscape()
      })
      onCleanup(cleanup)
      return <button onClick={() => setEnabled(false)}>disable</button>
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)

    fireEvent.click(result.getByRole('button', { name: 'disable' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)

    result.unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('locks and unlocks body scroll with nesting', () => {
    lockBodyScroll()
    lockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('')
  })
})
