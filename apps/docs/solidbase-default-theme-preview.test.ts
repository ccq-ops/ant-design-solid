import { describe, expect, it } from 'vitest'
import { stripPreviewStageInnerStyles } from './solidbase-default-theme-preview'

describe('solidbase default theme preview styles', () => {
  it('keeps only min-height and padding on preview stage inner rules', () => {
    const css = [
      '.preview-stage-inner {',
      '\tmin-height: 14rem;',
      '\tpadding: clamp(1rem, 4vw, 2.5rem);',
      '\tdisplay: flex;',
      '\talign-items: center;',
      '\tjustify-content: center;',
      '\toverflow-x: auto;',
      '}',
      '@media screen and (max-width: 40rem) {',
      '\t.preview-stage-inner {',
      '\t\tmin-height: 10rem;',
      '\t\tpadding: 1rem;',
      '\t\talign-items: stretch;',
      '\t}',
      '}',
    ].join('\n')

    const result = stripPreviewStageInnerStyles(css)

    expect(result).toContain('min-height: 14rem;')
    expect(result).toContain('padding: clamp(1rem, 4vw, 2.5rem);')
    expect(result).toContain('min-height: 10rem;')
    expect(result).toContain('padding: 1rem;')
    expect(result).not.toContain('display: flex')
    expect(result).not.toContain('align-items')
    expect(result).not.toContain('justify-content')
    expect(result).not.toContain('overflow-x')
  })
})
