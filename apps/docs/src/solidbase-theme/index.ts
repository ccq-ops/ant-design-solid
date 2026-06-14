import { defineTheme } from '@kobalte/solidbase/config'

export type AntDesignSolidThemeConfig = {
  nav?: Array<{ text: string; link: string }>
}

export const antDesignSolidTheme = defineTheme<AntDesignSolidThemeConfig>({
  componentsPath: new URL('./', import.meta.url).href,
})
