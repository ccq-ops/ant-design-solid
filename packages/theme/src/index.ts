export { defaultSeedToken } from './defaultSeedToken'
export { defaultAlgorithm, mergeTheme as baseMergeTheme } from './algorithm'
export { attachComponentOverrides, getComponentToken } from './components'
export type * from './types'

import { mergeTheme as baseMergeTheme } from './algorithm'
import { attachComponentOverrides } from './components'
import type { ThemeConfig } from './types'

export function mergeTheme(config: ThemeConfig = {}) {
  return attachComponentOverrides(baseMergeTheme(config), config.components)
}
