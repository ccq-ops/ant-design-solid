import { generate, presetPalettes, presetPrimaryColors } from '@ant-design/colors'
import { FastColor } from '@ant-design/fast-color'

import { defaultSeedToken, presetColorKeys } from './default-seed-token'
import type { AliasToken, SeedToken, ThemeAlgorithm, ThemeConfig } from './types'

type ColorPalette = Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, string>

function getDefaultAlphaColor(baseColor: string, alpha: number) {
  return new FastColor(baseColor).setA(alpha).toRgbString()
}

function getDefaultSolidColor(baseColor: string, brightness: number) {
  return new FastColor(baseColor).darken(brightness).toHexString()
}

function getDarkSolidColor(baseColor: string, brightness: number) {
  return new FastColor(baseColor).lighten(brightness).toHexString()
}

function isStableColor(color: number) {
  return color >= 0 && color <= 255
}

function getAlphaColor(frontColor: string, backgroundColor: string) {
  const { r: frontR, g: frontG, b: frontB, a: originAlpha } = new FastColor(frontColor).toRgb()

  if (originAlpha < 1) return frontColor

  const { r: backgroundR, g: backgroundG, b: backgroundB } = new FastColor(backgroundColor).toRgb()

  for (let frontAlpha = 0.01; frontAlpha <= 1; frontAlpha += 0.01) {
    const r = Math.round((frontR - backgroundR * (1 - frontAlpha)) / frontAlpha)
    const g = Math.round((frontG - backgroundG * (1 - frontAlpha)) / frontAlpha)
    const b = Math.round((frontB - backgroundB * (1 - frontAlpha)) / frontAlpha)

    if (isStableColor(r) && isStableColor(g) && isStableColor(b)) {
      return new FastColor({
        r,
        g,
        b,
        a: Math.round(frontAlpha * 100) / 100,
      }).toRgbString()
    }
  }

  return new FastColor({ r: frontR, g: frontG, b: frontB, a: 1 }).toRgbString()
}

function getLineHeight(fontSize: number) {
  return (fontSize + 8) / fontSize
}

function getFontSizes(base: number) {
  const fontSizes = Array.from({ length: 10 }).map((_, index) => {
    const i = index - 1
    const baseSize = base * Math.E ** (i / 5)
    const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize)
    return Math.floor(intSize / 2) * 2
  })
  fontSizes[1] = base

  return fontSizes.map((size) => ({ size, lineHeight: getLineHeight(size) }))
}

function genFontMapToken(fontSize: number) {
  const fontSizePairs = getFontSizes(fontSize)
  const fontSizes = fontSizePairs.map((pair) => pair.size)
  const lineHeights = fontSizePairs.map((pair) => pair.lineHeight)
  const fontSizeMD = fontSizes[1]
  const fontSizeSM = fontSizes[0]
  const fontSizeLG = fontSizes[2]
  const lineHeight = lineHeights[1]
  const lineHeightSM = lineHeights[0]
  const lineHeightLG = lineHeights[2]

  return {
    fontSizeSM,
    fontSize: fontSizeMD,
    fontSizeLG,
    fontSizeXL: fontSizes[3],
    fontSizeHeading1: fontSizes[6],
    fontSizeHeading2: fontSizes[5],
    fontSizeHeading3: fontSizes[4],
    fontSizeHeading4: fontSizes[3],
    fontSizeHeading5: fontSizes[2],
    lineHeight,
    lineHeightLG,
    lineHeightSM,
    fontHeight: Math.round(lineHeight * fontSizeMD),
    fontHeightLG: Math.round(lineHeightLG * fontSizeLG),
    fontHeightSM: Math.round(lineHeightSM * fontSizeSM),
    lineHeightHeading1: lineHeights[6],
    lineHeightHeading2: lineHeights[5],
    lineHeightHeading3: lineHeights[4],
    lineHeightHeading4: lineHeights[3],
    lineHeightHeading5: lineHeights[2],
  }
}

function genSizeMapToken(token: SeedToken) {
  const { sizeUnit, sizeStep } = token

  return {
    sizeXXL: sizeUnit * (sizeStep + 8),
    sizeXL: sizeUnit * (sizeStep + 4),
    sizeLG: sizeUnit * (sizeStep + 2),
    sizeMD: sizeUnit * (sizeStep + 1),
    sizeMS: sizeUnit * sizeStep,
    size: sizeUnit * sizeStep,
    sizeSM: sizeUnit * (sizeStep - 1),
    sizeXS: sizeUnit * (sizeStep - 2),
    sizeXXS: sizeUnit * (sizeStep - 3),
  }
}

function genControlHeight(token: SeedToken) {
  const { controlHeight } = token

  return {
    controlHeightSM: controlHeight * 0.75,
    controlHeightXS: controlHeight * 0.5,
    controlHeightLG: controlHeight * 1.25,
  }
}

function genRadius(radiusBase: number) {
  let radiusLG = radiusBase
  let radiusSM = radiusBase
  let radiusXS = radiusBase
  let radiusOuter = radiusBase

  if (radiusBase < 6 && radiusBase >= 5) {
    radiusLG = radiusBase + 1
  } else if (radiusBase < 16 && radiusBase >= 6) {
    radiusLG = radiusBase + 2
  } else if (radiusBase >= 16) {
    radiusLG = 16
  }

  if (radiusBase < 7 && radiusBase >= 5) {
    radiusSM = 4
  } else if (radiusBase < 8 && radiusBase >= 7) {
    radiusSM = 5
  } else if (radiusBase < 14 && radiusBase >= 8) {
    radiusSM = 6
  } else if (radiusBase < 16 && radiusBase >= 14) {
    radiusSM = 7
  } else if (radiusBase >= 16) {
    radiusSM = 8
  }

  if (radiusBase < 6 && radiusBase >= 2) {
    radiusXS = 1
  } else if (radiusBase >= 6) {
    radiusXS = 2
  }

  if (radiusBase > 4 && radiusBase < 8) {
    radiusOuter = 4
  } else if (radiusBase >= 8) {
    radiusOuter = 6
  }

  return {
    borderRadius: radiusBase,
    borderRadiusXS: radiusXS,
    borderRadiusSM: radiusSM,
    borderRadiusLG: radiusLG,
    borderRadiusOuter: radiusOuter,
  }
}

function genCommonMapToken(token: SeedToken) {
  const { motionUnit, motionBase, borderRadius, lineWidth } = token

  return {
    motionDurationFast: `${(motionBase + motionUnit).toFixed(1)}s`,
    motionDurationMid: `${(motionBase + motionUnit * 2).toFixed(1)}s`,
    motionDurationSlow: `${(motionBase + motionUnit * 3).toFixed(1)}s`,
    lineWidthBold: lineWidth + 1,
    ...genRadius(borderRadius),
  }
}

function generateDefaultColorPalettes(baseColor: string): ColorPalette {
  const colors = generate(baseColor)

  return {
    1: colors[0],
    2: colors[1],
    3: colors[2],
    4: colors[3],
    5: colors[4],
    6: colors[5],
    7: colors[6],
    8: colors[4],
    9: colors[5],
    10: colors[6],
  }
}

function generateDarkColorPalettes(baseColor: string): ColorPalette {
  const colors = generate(baseColor, { theme: 'dark' })

  return {
    1: colors[0],
    2: colors[1],
    3: colors[2],
    4: colors[3],
    5: colors[6],
    6: colors[5],
    7: colors[4],
    8: colors[6],
    9: colors[5],
    10: colors[4],
  }
}

function generateDefaultNeutralColorPalettes(bgBaseColor: string, textBaseColor: string) {
  const colorBgBase = bgBaseColor || '#fff'
  const colorTextBase = textBaseColor || '#000'
  const colorShadow = '#000'

  return {
    colorBgBase,
    colorTextBase,
    colorShadow,
    colorText: getDefaultAlphaColor(colorTextBase, 0.88),
    colorTextSecondary: getDefaultAlphaColor(colorTextBase, 0.65),
    colorTextTertiary: getDefaultAlphaColor(colorTextBase, 0.45),
    colorTextQuaternary: getDefaultAlphaColor(colorTextBase, 0.25),
    colorFill: getDefaultAlphaColor(colorTextBase, 0.15),
    colorFillSecondary: getDefaultAlphaColor(colorTextBase, 0.06),
    colorFillTertiary: getDefaultAlphaColor(colorTextBase, 0.04),
    colorFillQuaternary: getDefaultAlphaColor(colorTextBase, 0.02),
    colorBgSolid: getDefaultAlphaColor(colorTextBase, 1),
    colorBgSolidHover: getDefaultAlphaColor(colorTextBase, 0.75),
    colorBgSolidActive: getDefaultAlphaColor(colorTextBase, 0.95),
    colorBgLayout: getDefaultSolidColor(colorBgBase, 4),
    colorBgContainer: getDefaultSolidColor(colorBgBase, 0),
    colorBgElevated: getDefaultSolidColor(colorBgBase, 0),
    colorBgSpotlight: getDefaultAlphaColor(colorTextBase, 0.85),
    colorBgBlur: 'transparent',
    colorBorder: getDefaultSolidColor(colorBgBase, 15),
    colorBorderDisabled: getDefaultSolidColor(colorBgBase, 15),
    colorBorderSecondary: getDefaultSolidColor(colorBgBase, 6),
  }
}

function generateDarkNeutralColorPalettes(bgBaseColor: string, textBaseColor: string) {
  const colorBgBase = bgBaseColor || '#000'
  const colorTextBase = textBaseColor || '#fff'
  const colorShadow = 'rgba(255, 255, 255, 0.2)'

  return {
    colorBgBase,
    colorTextBase,
    colorShadow,
    colorText: getDefaultAlphaColor(colorTextBase, 0.85),
    colorTextSecondary: getDefaultAlphaColor(colorTextBase, 0.65),
    colorTextTertiary: getDefaultAlphaColor(colorTextBase, 0.45),
    colorTextQuaternary: getDefaultAlphaColor(colorTextBase, 0.25),
    colorFill: getDefaultAlphaColor(colorTextBase, 0.18),
    colorFillSecondary: getDefaultAlphaColor(colorTextBase, 0.12),
    colorFillTertiary: getDefaultAlphaColor(colorTextBase, 0.08),
    colorFillQuaternary: getDefaultAlphaColor(colorTextBase, 0.04),
    colorBgSolid: getDefaultAlphaColor(colorTextBase, 0.95),
    colorBgSolidHover: getDefaultAlphaColor(colorTextBase, 1),
    colorBgSolidActive: getDefaultAlphaColor(colorTextBase, 0.9),
    colorBgElevated: getDarkSolidColor(colorBgBase, 12),
    colorBgContainer: getDarkSolidColor(colorBgBase, 8),
    colorBgLayout: getDarkSolidColor(colorBgBase, 0),
    colorBgSpotlight: getDarkSolidColor(colorBgBase, 26),
    colorBgBlur: getDefaultAlphaColor(colorTextBase, 0.04),
    colorBorder: getDarkSolidColor(colorBgBase, 26),
    colorBorderDisabled: getDarkSolidColor(colorBgBase, 26),
    colorBorderSecondary: getDarkSolidColor(colorBgBase, 19),
  }
}

function genColorMapToken(
  seed: SeedToken,
  generateColorPalettes: (baseColor: string) => ColorPalette,
  generateNeutralColorPalettes: (
    bgBaseColor: string,
    textBaseColor: string,
  ) => Record<string, string>,
) {
  const primaryColors = generateColorPalettes(seed.colorPrimary)
  const successColors = generateColorPalettes(seed.colorSuccess)
  const warningColors = generateColorPalettes(seed.colorWarning)
  const errorColors = generateColorPalettes(seed.colorError)
  const infoColors = generateColorPalettes(seed.colorInfo)
  const neutralColors = generateNeutralColorPalettes(seed.colorBgBase, seed.colorTextBase)
  const colorLink = seed.colorLink || seed.colorInfo
  const linkColors = generateColorPalettes(colorLink)
  const colorErrorBgFilledHover = new FastColor(errorColors[1])
    .mix(new FastColor(errorColors[3]), 50)
    .toHexString()
  const presetColorTokens: Record<string, string> = {}

  presetColorKeys.forEach((colorKey) => {
    const colorBase = seed[colorKey] as string
    if (colorBase) {
      const colorPalette = generateColorPalettes(colorBase)
      presetColorTokens[`${colorKey}Hover`] = colorPalette[5]
      presetColorTokens[`${colorKey}Active`] = colorPalette[7]
    }
  })

  return {
    ...neutralColors,
    colorPrimaryBg: primaryColors[1],
    colorPrimaryBgHover: primaryColors[2],
    colorPrimaryBorder: primaryColors[3],
    colorPrimaryBorderHover: primaryColors[4],
    colorPrimaryHover: primaryColors[5],
    colorPrimary: primaryColors[6],
    colorPrimaryActive: primaryColors[7],
    colorPrimaryTextHover: primaryColors[8],
    colorPrimaryText: primaryColors[9],
    colorPrimaryTextActive: primaryColors[10],
    colorSuccessBg: successColors[1],
    colorSuccessBgHover: successColors[2],
    colorSuccessBorder: successColors[3],
    colorSuccessBorderHover: successColors[4],
    colorSuccessHover: successColors[4],
    colorSuccess: successColors[6],
    colorSuccessActive: successColors[7],
    colorSuccessTextHover: successColors[8],
    colorSuccessText: successColors[9],
    colorSuccessTextActive: successColors[10],
    colorErrorBg: errorColors[1],
    colorErrorBgHover: errorColors[2],
    colorErrorBgFilledHover,
    colorErrorBgActive: errorColors[3],
    colorErrorBorder: errorColors[3],
    colorErrorBorderHover: errorColors[4],
    colorErrorHover: errorColors[5],
    colorError: errorColors[6],
    colorErrorActive: errorColors[7],
    colorErrorTextHover: errorColors[8],
    colorErrorText: errorColors[9],
    colorErrorTextActive: errorColors[10],
    colorWarningBg: warningColors[1],
    colorWarningBgHover: warningColors[2],
    colorWarningBorder: warningColors[3],
    colorWarningBorderHover: warningColors[4],
    colorWarningHover: warningColors[4],
    colorWarning: warningColors[6],
    colorWarningActive: warningColors[7],
    colorWarningTextHover: warningColors[8],
    colorWarningText: warningColors[9],
    colorWarningTextActive: warningColors[10],
    colorInfoBg: infoColors[1],
    colorInfoBgHover: infoColors[2],
    colorInfoBorder: infoColors[3],
    colorInfoBorderHover: infoColors[4],
    colorInfoHover: infoColors[4],
    colorInfo: infoColors[6],
    colorInfoActive: infoColors[7],
    colorInfoTextHover: infoColors[8],
    colorInfoText: infoColors[9],
    colorInfoTextActive: infoColors[10],
    colorLinkHover: linkColors[4],
    colorLink: linkColors[6],
    colorLinkActive: linkColors[7],
    ...presetColorTokens,
    colorBgMask: new FastColor('#000').setA(0.45).toRgbString(),
    colorWhite: '#fff',
  }
}

function genPresetPalettes(token: SeedToken, dark = false) {
  const result: Record<string, string> = {}

  presetColorKeys.forEach((colorKey) => {
    const colorValue = token[colorKey] as string
    const colors =
      !dark && colorValue === presetPrimaryColors[colorKey]
        ? presetPalettes[colorKey]
        : generate(colorValue, dark ? { theme: 'dark' } : undefined)

    colors.forEach((color, index) => {
      result[`${colorKey}-${index + 1}`] = color
      result[`${colorKey}${index + 1}`] = color
    })
  })

  return result
}

function formatToken(derivativeToken: AliasToken, override: Partial<AliasToken> = {}): AliasToken {
  const overrideTokens = { ...override }

  Object.keys(defaultSeedToken).forEach((token) => {
    delete overrideTokens[token]
  })

  const mergedToken = { ...derivativeToken, ...overrideTokens } as AliasToken
  const shadowBaseColor = new FastColor(mergedToken.colorShadow)
  const shadowBaseAlpha = shadowBaseColor.a
  const getShadowColor = (alpha: number) =>
    shadowBaseColor
      .clone()
      .setA(shadowBaseAlpha * alpha)
      .toRgbString()
  const screenXS = 480
  const screenSM = 576
  const screenMD = 768
  const screenLG = 992
  const screenXL = 1200
  const screenXXL = 1600
  const screenXXXL = 1920

  if (mergedToken.motion === false) {
    mergedToken.motionDurationFast = '0s'
    mergedToken.motionDurationMid = '0s'
    mergedToken.motionDurationSlow = '0s'
  }

  return {
    ...mergedToken,
    colorFillContent: mergedToken.colorFillSecondary,
    colorFillContentHover: mergedToken.colorFill,
    colorFillAlter: mergedToken.colorFillQuaternary,
    colorBgContainerDisabled: mergedToken.colorFillTertiary,
    colorBorderBg: mergedToken.colorBgContainer,
    colorSplit: getAlphaColor(mergedToken.colorBorderSecondary, mergedToken.colorBgContainer),
    colorTextPlaceholder: mergedToken.colorTextQuaternary,
    colorTextDisabled: mergedToken.colorTextQuaternary,
    colorTextHeading: mergedToken.colorText,
    colorTextLabel: mergedToken.colorTextSecondary,
    colorTextDescription: mergedToken.colorTextTertiary,
    colorTextLightSolid: mergedToken.colorWhite,
    colorHighlight: mergedToken.colorError,
    colorBgTextHover: mergedToken.colorFillSecondary,
    colorBgTextActive: mergedToken.colorFill,
    colorIcon: mergedToken.colorTextTertiary,
    colorIconHover: mergedToken.colorText,
    colorErrorOutline: getAlphaColor(mergedToken.colorErrorBg, mergedToken.colorBgContainer),
    colorWarningOutline: getAlphaColor(mergedToken.colorWarningBg, mergedToken.colorBgContainer),
    colorErrorAffix: mergedToken.colorError,
    colorWarningAffix: mergedToken.colorWarning,
    fontSizeIcon: mergedToken.fontSizeSM,
    lineWidthFocus: mergedToken.lineWidth * 3,
    lineWidth: mergedToken.lineWidth,
    controlOutlineWidth: mergedToken.lineWidth * 2,
    controlInteractiveSize: mergedToken.controlHeight / 2,
    controlItemBgHover: mergedToken.colorFillTertiary,
    controlItemBgActive: mergedToken.colorPrimaryBg,
    controlItemBgActiveHover: mergedToken.colorPrimaryBgHover,
    controlItemBgActiveDisabled: mergedToken.colorFill,
    controlTmpOutline: mergedToken.colorFillQuaternary,
    controlOutline: getAlphaColor(mergedToken.colorPrimaryBg, mergedToken.colorBgContainer),
    lineType: mergedToken.lineType,
    borderRadius: mergedToken.borderRadius,
    borderRadiusXS: mergedToken.borderRadiusXS,
    borderRadiusSM: mergedToken.borderRadiusSM,
    borderRadiusLG: mergedToken.borderRadiusLG,
    fontWeightStrong: 600,
    opacityLoading: 0.65,
    linkDecoration: 'none',
    linkHoverDecoration: 'none',
    linkFocusDecoration: 'none',
    controlPaddingHorizontal: 12,
    controlPaddingHorizontalSM: 8,
    paddingXXS: mergedToken.sizeXXS,
    paddingXS: mergedToken.sizeXS,
    paddingSM: mergedToken.sizeSM,
    padding: mergedToken.size,
    paddingMD: mergedToken.sizeMD,
    paddingLG: mergedToken.sizeLG,
    paddingXL: mergedToken.sizeXL,
    paddingContentHorizontalLG: mergedToken.sizeLG,
    paddingContentVerticalLG: mergedToken.sizeMS,
    paddingContentHorizontal: mergedToken.sizeMS,
    paddingContentVertical: mergedToken.sizeSM,
    paddingContentHorizontalSM: mergedToken.size,
    paddingContentVerticalSM: mergedToken.sizeXS,
    marginXXS: mergedToken.sizeXXS,
    marginXS: mergedToken.sizeXS,
    marginSM: mergedToken.sizeSM,
    margin: mergedToken.size,
    marginMD: mergedToken.sizeMD,
    marginLG: mergedToken.sizeLG,
    marginXL: mergedToken.sizeXL,
    marginXXL: mergedToken.sizeXXL,
    boxShadow: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowSecondary: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowTertiary: `
      0 1px 2px 0 ${getShadowColor(0.05)},
      0 1px 6px -1px ${getShadowColor(0.03)},
      0 2px 4px 0 ${getShadowColor(0.03)}
    `,
    screenXS,
    screenXSMin: screenXS,
    screenXSMax: screenSM - 1,
    screenSM,
    screenSMMin: screenSM,
    screenSMMax: screenMD - 1,
    screenMD,
    screenMDMin: screenMD,
    screenMDMax: screenLG - 1,
    screenLG,
    screenLGMin: screenLG,
    screenLGMax: screenXL - 1,
    screenXL,
    screenXLMin: screenXL,
    screenXLMax: screenXXL - 1,
    screenXXL,
    screenXXLMin: screenXXL,
    screenXXLMax: screenXXXL - 1,
    screenXXXL,
    screenXXXLMin: screenXXXL,
    boxShadowPopoverArrow: `2px 2px 5px ${getShadowColor(0.05)}`,
    dropShadowPopover: `drop-shadow(0 6px 16px ${getShadowColor(
      0.08,
    )}) drop-shadow(0 3px 6px ${getShadowColor(0.12)}) drop-shadow(0 9px 28px ${getShadowColor(
      0.05,
    )})`,
    boxShadowCard: `
      0 1px 2px -2px ${getShadowColor(0.16)},
      0 3px 6px 0 ${getShadowColor(0.12)},
      0 5px 12px 4px ${getShadowColor(0.09)}
    `,
    boxShadowDrawerRight: `
      -6px 0 16px 0 ${getShadowColor(0.08)},
      -3px 0 6px -4px ${getShadowColor(0.12)},
      -9px 0 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowDrawerLeft: `
      6px 0 16px 0 ${getShadowColor(0.08)},
      3px 0 6px -4px ${getShadowColor(0.12)},
      9px 0 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowDrawerUp: `
      0 6px 16px 0 ${getShadowColor(0.08)},
      0 3px 6px -4px ${getShadowColor(0.12)},
      0 9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowDrawerDown: `
      0 -6px 16px 0 ${getShadowColor(0.08)},
      0 -3px 6px -4px ${getShadowColor(0.12)},
      0 -9px 28px 8px ${getShadowColor(0.05)}
    `,
    boxShadowTabsOverflowLeft: `inset 10px 0 8px -8px ${getShadowColor(0.08)}`,
    boxShadowTabsOverflowRight: `inset -10px 0 8px -8px ${getShadowColor(0.08)}`,
    boxShadowTabsOverflowTop: `inset 0 10px 8px -8px ${getShadowColor(0.08)}`,
    boxShadowTabsOverflowBottom: `inset 0 -10px 8px -8px ${getShadowColor(0.08)}`,
    ...overrideTokens,
  } as AliasToken
}

function deriveDefault(seed: SeedToken): AliasToken {
  ;(presetPrimaryColors as Record<string, string>).pink = presetPrimaryColors.magenta
  ;(presetPalettes as Record<string, string[]>).pink = presetPalettes.magenta

  const token = {
    ...seed,
    ...genPresetPalettes(seed),
    ...genColorMapToken(seed, generateDefaultColorPalettes, generateDefaultNeutralColorPalettes),
    ...genFontMapToken(seed.fontSize),
    ...genSizeMapToken(seed),
    ...genControlHeight(seed),
    ...genCommonMapToken(seed),
  } as AliasToken

  return token
}

export function defaultAlgorithm(seed: SeedToken): AliasToken {
  return formatToken(deriveDefault(seed))
}

export function darkAlgorithm(seed: SeedToken, mapToken?: AliasToken): AliasToken {
  const mergedMapToken = mapToken ?? deriveDefault(seed)
  const colorMapToken = genColorMapToken(
    seed,
    generateDarkColorPalettes,
    generateDarkNeutralColorPalettes,
  )
  const presetColorHoverActiveTokens: Record<string, string> = {}

  presetColorKeys.forEach((colorKey) => {
    const colorBase = seed[colorKey] as string
    if (colorBase) {
      const colorPalette = generateDarkColorPalettes(colorBase)
      presetColorHoverActiveTokens[`${colorKey}Hover`] = colorPalette[7]
      presetColorHoverActiveTokens[`${colorKey}Active`] = colorPalette[5]
    }
  })

  return formatToken({
    ...mergedMapToken,
    ...genPresetPalettes(seed, true),
    ...colorMapToken,
    ...presetColorHoverActiveTokens,
    colorPrimaryBg: colorMapToken.colorPrimaryBorder,
    colorPrimaryBgHover: colorMapToken.colorPrimaryBorderHover,
  } as AliasToken)
}

function normalizeAlgorithms(algorithm: ThemeConfig['algorithm']): ThemeAlgorithm[] {
  if (!algorithm) return [defaultAlgorithm]
  return Array.isArray(algorithm) ? algorithm : [algorithm]
}

export function mergeTheme(config: ThemeConfig = {}): AliasToken {
  const seed = { ...defaultSeedToken, ...config.token } as SeedToken
  const algorithms = normalizeAlgorithms(config.algorithm)
  const derived = algorithms.reduce<AliasToken | undefined>((current, algorithm) => {
    if (!current) return algorithm(seed)
    return algorithm(seed, current)
  }, undefined)

  return formatToken(derived ?? defaultAlgorithm(seed), config.token as Partial<AliasToken>)
}
