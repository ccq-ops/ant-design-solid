import { defineTheme } from '@kobalte/solidbase/config'
import defaultTheme from '@kobalte/solidbase/default-theme'
import type { DefaultThemeConfig } from '@kobalte/solidbase/default-theme'

export const docsTheme = defineTheme<DefaultThemeConfig>({
  extends: defaultTheme,
  componentsPath: new URL('./', import.meta.url).href,
})
