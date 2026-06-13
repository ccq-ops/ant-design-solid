import { describe, expect, it } from 'vitest'
import {
  darkAlgorithm,
  defaultAlgorithm,
  defaultSeedToken,
  getComponentToken,
  mergeTheme,
  type ThemeConfig,
} from '../index'

function expectTokenEntries(token: unknown, expected: Record<string, unknown>) {
  const tokenRecord = token as Record<string, unknown>

  for (const [key, value] of Object.entries(expected)) {
    expect(tokenRecord[key]).toBe(value)
  }
}

describe('@ant-design-solid/theme', () => {
  it('matches antd 6.4.4 default global token values', () => {
    const token = mergeTheme()

    expectTokenEntries(token, {
      blue: '#1677FF',
      purple: '#722ED1',
      colorPrimary: '#1677ff',
      colorPrimaryBg: '#e6f4ff',
      colorPrimaryHover: '#4096ff',
      colorPrimaryActive: '#0958d9',
      colorPrimaryText: '#1677ff',
      colorSuccessBg: '#f6ffed',
      colorErrorBg: '#fff2f0',
      colorWarningBg: '#fffbe6',
      colorInfoBg: '#e6f4ff',
      colorLink: '#1677ff',
      colorLinkHover: '#69b1ff',
      colorLinkActive: '#0958d9',
      colorText: 'rgba(0,0,0,0.88)',
      colorTextSecondary: 'rgba(0,0,0,0.65)',
      colorTextTertiary: 'rgba(0,0,0,0.45)',
      colorTextQuaternary: 'rgba(0,0,0,0.25)',
      colorTextDisabled: 'rgba(0,0,0,0.25)',
      colorTextPlaceholder: 'rgba(0,0,0,0.25)',
      colorTextHeading: 'rgba(0,0,0,0.88)',
      colorTextLabel: 'rgba(0,0,0,0.65)',
      colorTextDescription: 'rgba(0,0,0,0.45)',
      colorIcon: 'rgba(0,0,0,0.45)',
      colorIconHover: 'rgba(0,0,0,0.88)',
      colorBgBase: '#fff',
      colorBgLayout: '#f5f5f5',
      colorBgContainer: '#ffffff',
      colorBgElevated: '#ffffff',
      colorBgSpotlight: 'rgba(0,0,0,0.85)',
      colorBgMask: 'rgba(0,0,0,0.45)',
      colorBorder: '#d9d9d9',
      colorBorderSecondary: '#f0f0f0',
      colorSplit: 'rgba(5,5,5,0.06)',
      colorFill: 'rgba(0,0,0,0.15)',
      colorFillSecondary: 'rgba(0,0,0,0.06)',
      colorFillTertiary: 'rgba(0,0,0,0.04)',
      colorFillQuaternary: 'rgba(0,0,0,0.02)',
      colorFillAlter: 'rgba(0,0,0,0.02)',
      colorFillContent: 'rgba(0,0,0,0.06)',
      colorFillContentHover: 'rgba(0,0,0,0.15)',
      colorBgContainerDisabled: 'rgba(0,0,0,0.04)',
      fontFamilyCode: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      fontSizeHeading1: 38,
      lineHeight: 1.5714285714285714,
      lineHeightSM: 1.6666666666666667,
      lineHeightLG: 1.5,
      lineWidth: 1,
      lineWidthBold: 2,
      lineWidthFocus: 3,
      lineType: 'solid',
      borderRadius: 6,
      borderRadiusXS: 2,
      borderRadiusSM: 4,
      borderRadiusLG: 8,
      borderRadiusOuter: 4,
      sizeUnit: 4,
      sizeStep: 4,
      sizeXXS: 4,
      sizeXS: 8,
      sizeSM: 12,
      size: 16,
      sizeMS: 16,
      sizeMD: 20,
      sizeLG: 24,
      sizeXL: 32,
      sizeXXL: 48,
      controlHeight: 32,
      controlHeightXS: 16,
      controlHeightSM: 24,
      controlHeightLG: 40,
      controlInteractiveSize: 16,
      controlOutlineWidth: 2,
      controlPaddingHorizontal: 12,
      controlPaddingHorizontalSM: 8,
      paddingXXS: 4,
      paddingXS: 8,
      paddingSM: 12,
      padding: 16,
      paddingMD: 20,
      paddingLG: 24,
      paddingXL: 32,
      marginXXS: 4,
      marginXS: 8,
      marginSM: 12,
      margin: 16,
      marginMD: 20,
      marginLG: 24,
      marginXL: 32,
      marginXXL: 48,
      motionDurationFast: '0.1s',
      motionDurationMid: '0.2s',
      motionDurationSlow: '0.3s',
      screenXS: 480,
      screenSM: 576,
      screenMD: 768,
      screenLG: 992,
      screenXL: 1200,
      screenXXL: 1600,
      zIndexBase: 0,
      zIndexPopupBase: 1000,
      opacityImage: 1,
    })
  })

  it('matches antd 6.4.4 dark and override global token values', () => {
    const dark = mergeTheme({ algorithm: darkAlgorithm })
    const custom = mergeTheme({
      token: { colorPrimary: '#722ed1', borderRadius: 8, motion: false },
    })

    expectTokenEntries(dark, {
      colorPrimary: '#1668dc',
      colorPrimaryBg: '#15325b',
      colorPrimaryHover: '#3c89e8',
      colorPrimaryActive: '#1554ad',
      colorSuccessBg: '#162312',
      colorErrorBg: '#2c1618',
      colorWarningBg: '#2b2111',
      colorInfoBg: '#111a2c',
      colorText: 'rgba(255,255,255,0.85)',
      colorBgBase: '#000',
      colorBgContainer: '#141414',
      colorBgElevated: '#1f1f1f',
      colorBorder: '#424242',
      colorBorderSecondary: '#303030',
      colorFillAlter: 'rgba(255,255,255,0.04)',
    })

    expectTokenEntries(custom, {
      colorPrimary: '#722ed1',
      colorPrimaryBg: '#f9f0ff',
      colorPrimaryHover: '#9254de',
      colorPrimaryActive: '#531dab',
      borderRadius: 8,
      borderRadiusSM: 6,
      borderRadiusLG: 10,
      borderRadiusOuter: 6,
      motionDurationFast: '0s',
      motionDurationMid: '0s',
      motionDurationSlow: '0s',
    })
  })

  it('derives alias tokens from seed tokens', () => {
    const token = defaultAlgorithm({ ...defaultSeedToken, colorPrimary: '#1677ff' })

    expect(token.colorPrimary).toBe('#1677ff')
    expect(token.colorPrimaryHover).toBe('#4096ff')
    expect(token.colorPrimaryActive).toBe('#0958d9')
    expect(token.colorText).toBe('rgba(0,0,0,0.88)')
    expect(token.controlHeight).toBe(32)
  })

  it('derives dark alias tokens from seed tokens', () => {
    const token = darkAlgorithm({ ...defaultSeedToken, colorPrimary: '#1677ff' })

    expect(token.colorPrimary).toBe('#1668dc')
    expect(token.colorPrimaryHover).toBe('#3c89e8')
    expect(token.colorPrimaryActive).toBe('#1554ad')
    expect(token.colorBgBase).toBe('#000')
    expect(token.colorTextBase).toBe('#fff')
    expect(token.colorBgContainer).toBe('#141414')
    expect(token.colorBgElevated).toBe('#1f1f1f')
    expect(token.colorText).toBe('rgba(255,255,255,0.85)')
    expect(token.colorTextSecondary).toBe('rgba(255,255,255,0.65)')
    expect(token.colorTextDisabled).toBe('rgba(255,255,255,0.25)')
    expect(token.colorBorder).toBe('#424242')
    expect(token.colorBorderSecondary).toBe('#303030')
    expect(token.colorFillAlter).toBe('rgba(255,255,255,0.04)')
  })

  it('merges global and component token overrides', () => {
    const config: ThemeConfig = {
      token: { colorPrimary: '#722ed1', borderRadius: 8 },
      components: { Button: { borderRadius: 10 } },
    }

    const merged = mergeTheme(config)
    const button = getComponentToken('Button', merged)

    expect(merged.colorPrimary).toBe('#722ed1')
    expect(merged.borderRadius).toBe(8)
    expect(button.borderRadius).toBe(10)
  })

  it('applies theme algorithms and keeps token overrides', () => {
    const merged = mergeTheme({
      algorithm: darkAlgorithm,
      token: { colorPrimary: '#722ed1', borderRadius: 8 },
    })

    expect(merged.colorPrimary).toBe('#642ab5')
    expect(merged.colorPrimaryHover).toBe('#854eca')
    expect(merged.colorPrimaryActive).toBe('#51258f')
    expect(merged.borderRadius).toBe(8)
    expect(merged.colorBgContainer).toBe('#141414')
    expect(merged.colorBgElevated).toBe('#1f1f1f')
    expect(merged.colorText).toBe('rgba(255,255,255,0.85)')
  })

  it('derives form component token defaults and applies overrides', () => {
    const token = mergeTheme({
      components: {
        Form: { labelColor: '#222222' },
        Select: { optionSelectedBg: '#d6e4ff' },
        Checkbox: { checkColor: '#111111' },
        Radio: { dotSize: 10 },
        Switch: { handleSize: 16 },
        Input: { activeBorderColor: '#531dab', paddingInlineLG: 16 },
        InputNumber: { handleWidth: 28, activeBorderColor: '#722ed1' },
      },
    })

    expect(getComponentToken('Form', token).labelColor).toBe('#222222')
    expect(getComponentToken('Form', token).itemMarginBottom).toBe(24)
    expect(getComponentToken('Form', token).labelFontSize).toBe(token.fontSize)
    expect(getComponentToken('Form', token).labelHeight).toBe(token.controlHeight)
    expect(getComponentToken('Form', token).labelColonMarginInlineStart).toBe(token.marginXXS / 2)
    expect(getComponentToken('Form', token).labelColonMarginInlineEnd).toBe(token.marginXS)
    expect(getComponentToken('Form', token).inlineItemMarginBottom).toBe(0)
    expect(getComponentToken('Form', token).extraColor).toBe(token.colorTextDescription)
    expect(getComponentToken('Form', token).feedbackIconSize).toBe(token.fontSize)
    expect(getComponentToken('Form', token).feedbackIconMarginInlineStart).toBe(token.marginXS)
    expect(getComponentToken('Select', token).optionSelectedBg).toBe('#d6e4ff')
    expect(getComponentToken('Select', token).optionHeight).toBe(32)
    expect(getComponentToken('Checkbox', token).checkColor).toBe('#111111')
    expect(getComponentToken('Checkbox', token).size).toBe(16)
    expect(getComponentToken('Radio', token).dotSize).toBe(10)
    expect(getComponentToken('Radio', token).size).toBe(16)
    expect(getComponentToken('Switch', token).handleSize).toBe(16)
    expect(getComponentToken('Switch', token).trackMinWidth).toBe(44)
    expect(getComponentToken('Input', token).activeBorderColor).toBe('#531dab')
    expect(getComponentToken('Input', token).activeShadow).toBe(
      `0 0 0 ${token.controlOutlineWidth}px ${token.controlOutline}`,
    )
    expect(getComponentToken('Input', token).errorActiveShadow).toBe(
      `0 0 0 ${token.controlOutlineWidth}px ${token.colorErrorOutline}`,
    )
    expect(getComponentToken('Input', token).warningActiveShadow).toBe(
      `0 0 0 ${token.controlOutlineWidth}px ${token.colorWarningOutline}`,
    )
    expect(getComponentToken('Input', token).addonBg).toBe(token.colorFillAlter)
    expect(getComponentToken('Input', token).inputFontSize).toBe(token.fontSize)
    expect(getComponentToken('Input', token).inputFontSizeSM).toBe(token.fontSize)
    expect(getComponentToken('Input', token).inputFontSizeLG).toBe(token.fontSizeLG)
    expect(getComponentToken('Input', token).paddingBlock).toBe(4)
    expect(getComponentToken('Input', token).paddingBlockSM).toBe(0)
    expect(getComponentToken('Input', token).paddingBlockLG).toBe(7)
    expect(getComponentToken('Input', token).paddingInline).toBe(token.paddingSM - token.lineWidth)
    expect(getComponentToken('Input', token).paddingInlineLG).toBe(16)
    expect(getComponentToken('Input', token).paddingInlineSM).toBe(
      token.controlPaddingHorizontalSM - token.lineWidth,
    )
    expect(getComponentToken('InputNumber', token).handleWidth).toBe(28)
    expect(getComponentToken('InputNumber', token).activeBorderColor).toBe('#722ed1')
    expect(getComponentToken('InputNumber', token).inputFontSize).toBe(token.fontSize)
    expect(getComponentToken('InputNumber', token).paddingInline).toBe(token.paddingSM)
  })

  it('derives feedback component token defaults and applies overrides', () => {
    const token = mergeTheme({
      components: {
        Alert: { iconSize: 18 },
        Message: { noticeBorderRadius: 10 },
        Notification: { width: 420 },
        Modal: { titleFontSize: 18 },
        Drawer: { draggerSize: 10, footerPaddingBlock: 12 },
        Popconfirm: { width: 240 },
      },
    })

    expect(getComponentToken('Alert', token).iconSize).toBe(18)
    expect(getComponentToken('Alert', token).borderRadius).toBe(token.borderRadius)
    expect(getComponentToken('Message', token).noticeBorderRadius).toBe(10)
    expect(getComponentToken('Message', token).contentBg).toBe(token.colorBgElevated)
    expect(getComponentToken('Notification', token).width).toBe(420)
    expect(getComponentToken('Notification', token).bg).toBe(token.colorBgElevated)
    expect(getComponentToken('Modal', token).titleFontSize).toBe(18)
    expect(getComponentToken('Modal', token).maskBg).toBe('rgba(0, 0, 0, 0.45)')
    expect(getComponentToken('Drawer', token).zIndexPopup).toBe(1000)
    expect(getComponentToken('Drawer', token).footerPaddingBlock).toBe(12)
    expect(getComponentToken('Drawer', token).footerPaddingInline).toBe(token.paddingLG)
    expect(getComponentToken('Drawer', token).draggerSize).toBe(10)
    expect(getComponentToken('Popconfirm', token).width).toBe(240)
    expect(getComponentToken('Popconfirm', token).bg).toBe(token.colorBgElevated)
  })

  it('derives data display component token defaults and applies overrides', () => {
    const token = mergeTheme({
      components: {
        Table: { headerBg: '#fafafa', cellPadding: 20 },
        Tag: { borderRadius: 12, closeIconColor: '#111111' },
        Badge: { overflowIndicatorHeight: 24, dotSize: 8 },
        FloatButton: { size: 48, iconSize: 20 },
        Layout: { headerBg: '#10239e', triggerHeight: 56 },
      },
    })

    expect(getComponentToken('Table', token).headerBg).toBe('#fafafa')
    expect(getComponentToken('Table', token).headerColor).toBe(token.colorText)
    expect(getComponentToken('Table', token).cellPadding).toBe(20)
    expect(getComponentToken('Table', token).borderColor).toBe(token.colorBorderSecondary)

    expect(getComponentToken('Tag', token).borderRadius).toBe(12)
    expect(getComponentToken('Tag', token).defaultBg).toBe(token.colorFillAlter)
    expect(getComponentToken('Tag', token).defaultColor).toBe(token.colorText)
    expect(getComponentToken('Tag', token).closeIconColor).toBe('#111111')

    expect(getComponentToken('Badge', token).overflowIndicatorHeight).toBe(24)
    expect(getComponentToken('Badge', token).dotSize).toBe(8)
    expect(getComponentToken('Badge', token).colorBg).toBe(token.colorError)
    expect(getComponentToken('Badge', token).colorText).toBe('#ffffff')

    expect(getComponentToken('FloatButton', token).size).toBe(48)
    expect(getComponentToken('FloatButton', token).iconSize).toBe(20)
    expect(getComponentToken('FloatButton', token).insetBlockEnd).toBe(token.marginXXL)
    expect(getComponentToken('FloatButton', token).insetInlineEnd).toBe(token.marginLG)

    expect(getComponentToken('Layout', token).bodyBg).toBe(token.colorBgLayout)
    expect(getComponentToken('Layout', token).headerBg).toBe('#10239e')
    expect(getComponentToken('Layout', token).headerColor).toBe(token.colorTextLightSolid)
    expect(getComponentToken('Layout', token).headerHeight).toBe(64)
    expect(getComponentToken('Layout', token).triggerHeight).toBe(56)
    expect(getComponentToken('Layout', token).zeroTriggerWidth).toBe(40)
  })

  it('derives interaction component token defaults and applies overrides', () => {
    const token = mergeTheme({
      components: {
        Tabs: { inkBarColor: '#722ed1', horizontalItemPadding: 18 },
        Tooltip: { maxWidth: 320, bg: '#111111' },
        Dropdown: { minWidth: 180, itemHoverBg: '#f0f5ff' },
        Menu: { itemBg: '#fafafa' },
      },
    })

    expect(getComponentToken('Tabs', token).itemColor).toBe(token.colorText)
    expect(getComponentToken('Tabs', token).inkBarColor).toBe('#722ed1')
    expect(getComponentToken('Tabs', token).itemSelectedColor).toBe(token.colorPrimary)
    expect(getComponentToken('Tabs', token).itemHoverColor).toBe(token.colorPrimaryHover)
    expect(getComponentToken('Tabs', token).itemDisabledColor).toBe(token.colorTextDisabled)
    expect(getComponentToken('Tabs', token).cardBg).toBe(token.colorFillAlter)
    expect(getComponentToken('Tabs', token).horizontalItemPadding).toBe(18)
    expect(getComponentToken('Tabs', token).horizontalItemPaddingSm).toBe(token.paddingSM)
    expect(getComponentToken('Tabs', token).horizontalItemPaddingLg).toBe(token.paddingLG)
    expect(getComponentToken('Tabs', token).cardBorderColor).toBe(token.colorBorderSecondary)

    expect(getComponentToken('Tooltip', token).maxWidth).toBe(320)
    expect(getComponentToken('Tooltip', token).bg).toBe('#111111')
    expect(getComponentToken('Tooltip', token).color).toBe('#ffffff')
    expect(getComponentToken('Tooltip', token).borderRadius).toBe(token.borderRadius)
    expect(getComponentToken('Tooltip', token).paddingBlock).toBe(token.paddingXS)
    expect(getComponentToken('Tooltip', token).paddingInline).toBe(token.paddingSM)
    expect(getComponentToken('Tooltip', token).boxShadow).toBe(token.boxShadow)

    expect(getComponentToken('Dropdown', token).minWidth).toBe(180)
    expect(getComponentToken('Dropdown', token).itemHoverBg).toBe('#f0f5ff')
    expect(getComponentToken('Dropdown', token).bg).toBe(token.colorBgElevated)
    expect(getComponentToken('Dropdown', token).boxShadow).toBe(token.boxShadowSecondary)
    expect(getComponentToken('Dropdown', token).borderRadius).toBe(token.borderRadiusLG)
    expect(getComponentToken('Dropdown', token).itemColor).toBe(token.colorText)
    expect(getComponentToken('Dropdown', token).itemDisabledColor).toBe(token.colorTextDisabled)
    expect(getComponentToken('Dropdown', token).paddingBlock).toBe(
      (token.controlHeight - token.fontSize * token.lineHeight) / 2,
    )
    expect(getComponentToken('Dropdown', token).dropdownArrowDistance).toBe(
      token.sizePopupArrow / 2 + token.marginXXS,
    )
    expect(getComponentToken('Dropdown', token).dropdownEdgeChildPadding).toBe(token.paddingXXS)
    expect(getComponentToken('Dropdown', token).zIndexPopup).toBe(token.zIndexPopupBase + 50)
    expect(getComponentToken('Dropdown', token).itemPaddingBlock).toBe(
      (token.controlHeight - token.fontSize * token.lineHeight) / 2,
    )
    expect(getComponentToken('Dropdown', token).itemPaddingInline).toBe(token.paddingSM)

    expect(getComponentToken('Menu', token).itemBg).toBe('#fafafa')
    expect(getComponentToken('Menu', token).popupBg).toBe(token.colorBgElevated)
    expect(getComponentToken('Menu', token).itemHoverBg).toBe(token.colorBgTextHover)
    expect(getComponentToken('Menu', token).itemSelectedBg).toBe(token.colorPrimaryBg)
    expect(getComponentToken('Menu', token).darkItemBg).toBe('#001529')
    expect(getComponentToken('Menu', token).darkPopupBg).toBe('#001529')
    expect(getComponentToken('Menu', token).darkSubMenuItemBg).toBe('#000c17')
    expect(getComponentToken('Menu', token).darkItemColor).toBe('rgba(255,255,255,0.65)')
    expect(getComponentToken('Menu', token).darkItemHoverColor).toBe(token.colorTextLightSolid)
    expect(getComponentToken('Menu', token).darkItemSelectedBg).toBe(token.colorPrimary)
  })
  it('derives dark-compatible component token defaults', () => {
    const token = mergeTheme({ algorithm: darkAlgorithm })

    expect(getComponentToken('Select', token).optionSelectedBg).toBe('rgba(22, 119, 255, 0.2)')
    expect(getComponentToken('Alert', token).successBg).toBe('rgba(82, 196, 26, 0.12)')
    expect(getComponentToken('Alert', token).successBorderColor).toBe('rgba(82, 196, 26, 0.35)')
    expect(getComponentToken('Tag', token).successBg).toBe('rgba(82, 196, 26, 0.12)')
    expect(getComponentToken('Tag', token).successBorderColor).toBe('rgba(82, 196, 26, 0.35)')
    expect(getComponentToken('Tree', token).nodeSelectedBg).toBe('rgba(22, 119, 255, 0.2)')
  })
})
