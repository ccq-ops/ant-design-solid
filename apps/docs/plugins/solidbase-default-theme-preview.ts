import type { Plugin } from 'vite'

const previewStyleFile = '/@kobalte/solidbase/dist/default-theme/mdx-components.module.css'
const previewStageInnerSelector = '.preview-stage-inner'
const allowedPreviewStageInnerProperties = new Set(['min-height', 'padding'])

export function stripPreviewStageInnerStyles(css: string) {
  return css.replace(/\.preview-stage-inner\s*\{[^}]*\}/g, (rule) => {
    const body = rule.slice(rule.indexOf('{') + 1, rule.lastIndexOf('}'))
    const declarations = body
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .filter((declaration) => {
        const separatorIndex = declaration.indexOf(':')
        const property = declaration.slice(0, separatorIndex).trim()
        return allowedPreviewStageInnerProperties.has(property)
      })

    return `${previewStageInnerSelector} {\n\t${declarations.join(';\n\t')};\n}`
  })
}

export function solidbaseDefaultThemePreview(): Plugin {
  return {
    name: 'solidbase-default-theme-preview',
    enforce: 'pre',
    transform(code, id) {
      const filePath = id.split('?')[0]

      if (!filePath.includes(previewStyleFile)) {
        return
      }

      return {
        code: stripPreviewStageInnerStyles(code),
        map: null,
      }
    },
  }
}
