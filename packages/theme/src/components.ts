import type { AliasToken, ComponentTokenMap, ThemeConfig } from './types'

const overrideStore = new WeakMap<AliasToken, ThemeConfig['components']>()

export function attachComponentOverrides(
  token: AliasToken,
  components: ThemeConfig['components'] = {},
): AliasToken {
  overrideStore.set(token, components)
  return token
}

export function getComponentToken<K extends keyof ComponentTokenMap>(
  componentName: K,
  token: AliasToken,
): ComponentTokenMap[K] {
  const defaults: ComponentTokenMap = {
    Button: {
      borderRadius: token.borderRadius,
      fontWeight: 400,
      primaryColor: '#fff',
      defaultBorderColor: token.colorBorder,
      paddingInline: token.padding,
    },
    Input: {
      activeBorderColor: token.colorPrimary,
      hoverBorderColor: token.colorPrimaryHover,
      clearIconColor: token.colorTextDisabled,
      paddingInline: token.paddingSM,
    },
    Space: { gapSmall: token.marginXS, gapMiddle: token.marginSM, gapLarge: token.margin },
    Typography: {
      titleMarginBottom: token.marginSM,
      titleFontWeight: 600,
      paragraphMarginBottom: token.margin,
    },
    Grid: { columns: 24 },
    Form: {
      labelColor: token.colorText,
      labelRequiredMarkColor: token.colorError,
      itemMarginBottom: token.marginLG,
      verticalLabelPadding: token.paddingXS,
      explainColor: token.colorError,
    },
    Select: {
      optionHeight: token.controlHeight,
      optionPadding: token.paddingSM,
      optionSelectedBg: '#e6f4ff',
      optionActiveBg: token.colorFillAlter,
      clearIconColor: token.colorTextDisabled,
    },
    Checkbox: {
      size: 16,
      borderRadius: token.borderRadius / 2,
      checkColor: '#ffffff',
    },
    Radio: {
      size: 16,
      dotSize: 8,
    },
    Switch: {
      trackHeight: 22,
      trackMinWidth: 44,
      handleSize: 18,
    },
    Alert: {
      padding: token.paddingSM,
      borderRadius: token.borderRadius,
      withDescriptionPadding: token.padding,
      iconSize: 16,
    },
    Message: {
      noticePadding: token.paddingSM,
      noticeBorderRadius: token.borderRadius,
      contentBg: token.colorBgElevated,
      contentShadow: token.boxShadow,
    },
    Notification: {
      width: 384,
      padding: token.padding,
      borderRadius: token.borderRadius,
      bg: token.colorBgElevated,
      boxShadow: token.boxShadow,
    },
    Modal: {
      contentBg: token.colorBgElevated,
      headerBg: token.colorBgElevated,
      titleColor: token.colorText,
      titleFontSize: token.fontSize + 2,
      borderRadius: token.borderRadius,
      boxShadow: token.boxShadow,
      maskBg: 'rgba(0, 0, 0, 0.45)',
    },
    Popconfirm: {
      width: 280,
      padding: token.padding,
      borderRadius: token.borderRadius,
      bg: token.colorBgElevated,
      boxShadow: token.boxShadow,
    },
    Table: {
      headerBg: token.colorFillAlter,
      headerColor: token.colorText,
      rowHoverBg: token.colorFillAlter,
      borderColor: token.colorBorderSecondary,
      cellPadding: token.padding,
      cellPaddingSm: token.paddingSM,
      cellPaddingLg: token.paddingLG,
      borderRadius: token.borderRadius,
      emptyColor: token.colorTextSecondary,
    },
    Tag: {
      defaultBg: token.colorFillAlter,
      defaultColor: token.colorText,
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius / 2,
      paddingInline: token.paddingXS,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      closeIconColor: token.colorTextSecondary,
    },
    Badge: {
      overflowIndicatorHeight: 20,
      overflowIndicatorHeightSm: 14,
      dotSize: 6,
      textFontSize: 12,
      textFontSizeSm: 10,
      colorBg: token.colorError,
      colorText: '#ffffff',
      statusSize: 6,
    },
  }
  const overrides = overrideStore.get(token)?.[componentName] ?? {}
  return { ...defaults[componentName], ...overrides } as ComponentTokenMap[K]
}
