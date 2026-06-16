import { TextDecoder, TextEncoder } from 'node:util'
import { vi } from 'vitest'

const textEncoder = new TextEncoder()
const textEncoderUint8Array = textEncoder.encode('').constructor

Object.defineProperty(globalThis, 'TextEncoder', {
  configurable: true,
  writable: true,
  value: TextEncoder,
})

Object.defineProperty(globalThis, 'Uint8Array', {
  configurable: true,
  writable: true,
  value: textEncoderUint8Array,
})

Object.defineProperty(globalThis, 'TextDecoder', {
  configurable: true,
  writable: true,
  value: TextDecoder,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
