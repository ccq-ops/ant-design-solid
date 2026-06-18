import { describe, expect, it } from 'vitest'
import { serializeCSS } from '../index'

describe('serializeCSS', () => {
  it('serializes nested selectors deterministically', () => {
    const css = serializeCSS({ '.ads-btn': { color: 'red', '&:hover': { color: 'blue' } } })
    expect(css).toContain('.ads-btn{color:red;}')
    expect(css).toContain('.ads-btn:hover{color:blue;}')
  })

  it('keeps nested interaction selector order so active can override hover', () => {
    const css = serializeCSS({
      '.ads-btn': {
        '&:hover': { color: 'blue' },
        '&:active': { color: 'red' },
      },
    })

    expect(css.indexOf('.ads-btn:hover{color:blue;}')).toBeLessThan(
      css.indexOf('.ads-btn:active{color:red;}'),
    )
  })

  it('keeps top-level interaction selector order so active classes can override hover', () => {
    const css = serializeCSS({
      '.ads-calendar-button:hover': { color: 'blue' },
      '.ads-calendar-button-active': { color: 'red' },
    })

    expect(css.indexOf('.ads-calendar-button:hover{color:blue;}')).toBeLessThan(
      css.indexOf('.ads-calendar-button-active{color:red;}'),
    )
  })

  it('serializes keyframes at-rules without nesting step selectors', () => {
    const css = serializeCSS({
      '@keyframes adsSpinRotate': {
        to: { transform: 'rotate(360deg)' },
      },
    })

    expect(css).toBe('@keyframes adsSpinRotate{to{transform:rotate(360deg);}}')
  })

  it('keeps unitless CSS properties unitless when serializing numeric values', () => {
    const css = serializeCSS({
      '.ads-card': {
        flex: 1,
        'font-weight': 600,
        'line-height': 1.5714285714285714,
        opacity: 0.88,
        'z-index': 2,
      },
    })

    expect(css).toContain('flex:1;')
    expect(css).toContain('font-weight:600;')
    expect(css).toContain('line-height:1.5714285714285714;')
    expect(css).toContain('opacity:0.88;')
    expect(css).toContain('z-index:2;')
    expect(css).not.toContain('flex:1px;')
    expect(css).not.toContain('font-weight:600px;')
    expect(css).not.toContain('line-height:1.5714285714285714px;')
    expect(css).not.toContain('opacity:0.88px;')
    expect(css).not.toContain('z-index:2px;')
  })
})
