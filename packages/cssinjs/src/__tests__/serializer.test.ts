import { describe, expect, it } from 'vitest'
import { serializeCSS } from '../index'

describe('serializeCSS', () => {
  it('serializes nested selectors deterministically', () => {
    const css = serializeCSS({ '.ads-btn': { color: 'red', '&:hover': { color: 'blue' } } })
    expect(css).toContain('.ads-btn{color:red;}')
    expect(css).toContain('.ads-btn:hover{color:blue;}')
  })
})
