import { canUseDom } from './portal'

let scrollLockCount = 0
let previousBodyOverflow = ''

export function addDocumentKeydown(handler: (event: KeyboardEvent) => void) {
  if (!canUseDom()) return () => {}
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}

export function addDocumentPointerDown(handler: (event: PointerEvent) => void) {
  if (!canUseDom()) return () => {}
  document.addEventListener('pointerdown', handler)
  return () => document.removeEventListener('pointerdown', handler)
}

export function lockBodyScroll() {
  if (!canUseDom()) return
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount += 1
}

export function unlockBodyScroll() {
  if (!canUseDom() || scrollLockCount === 0) return
  scrollLockCount -= 1
  if (scrollLockCount === 0) document.body.style.overflow = previousBodyOverflow
}
