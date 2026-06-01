import type { AliasToken, ComponentTokenMap, ThemeConfig } from './types'

const overrideStore = new WeakMap<AliasToken, ThemeConfig['components']>()

export function attachComponentOverrides(token: AliasToken, components: ThemeConfig['components'] = {}): AliasToken {
  overrideStore.set(token, components)
  return token
}

export function getComponentToken<K extends keyof ComponentTokenMap>(componentName: K, token: AliasToken): ComponentTokenMap[K] {
  const defaults: ComponentTokenMap = {
    Button: { borderRadius: token.borderRadius, fontWeight: 400, primaryColor: '#fff', defaultBorderColor: token.colorBorder, paddingInline: token.padding },
    Input: { activeBorderColor: token.colorPrimary, hoverBorderColor: token.colorPrimaryHover, clearIconColor: token.colorTextDisabled, paddingInline: token.paddingSM },
    Space: { gapSmall: token.marginXS, gapMiddle: token.marginSM, gapLarge: token.margin },
    Typography: { titleMarginBottom: token.marginSM, titleFontWeight: 600, paragraphMarginBottom: token.margin },
    Grid: { columns: 24 },
  }
  const overrides = overrideStore.get(token)?.[componentName] ?? {}
  return { ...defaults[componentName], ...overrides } as ComponentTokenMap[K]
}
