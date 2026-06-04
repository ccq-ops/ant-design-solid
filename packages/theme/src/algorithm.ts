import { getPrimaryActive, getPrimaryHover } from './color'
import { defaultSeedToken } from './default-seed-token'
import type { AliasToken, SeedToken, ThemeAlgorithm, ThemeConfig } from './types'

export function defaultAlgorithm(seed: SeedToken): AliasToken {
  return {
    ...seed,
    colorPrimaryHover: getPrimaryHover(seed.colorPrimary),
    colorPrimaryActive: getPrimaryActive(seed.colorPrimary),
    colorText: '#1f1f1f',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    colorBgContainer: seed.colorBgBase,
    colorBgElevated: seed.colorBgBase,
    colorFillAlter: 'rgba(0, 0, 0, 0.02)',
    lineWidth: 1,
    controlHeightSM: 24,
    controlHeightLG: 40,
    paddingXS: seed.sizeUnit * 2,
    paddingSM: seed.sizeUnit * 3,
    padding: seed.sizeUnit * 4,
    paddingLG: seed.sizeUnit * 6,
    marginXS: seed.sizeUnit * 2,
    marginSM: seed.sizeUnit * 3,
    margin: seed.sizeUnit * 4,
    marginLG: seed.sizeUnit * 6,
  }
}

export function darkAlgorithm(seed: SeedToken): AliasToken {
  const darkSeed: SeedToken = {
    ...seed,
    colorBgBase: seed.colorBgBase === defaultSeedToken.colorBgBase ? '#141414' : seed.colorBgBase,
    colorTextBase:
      seed.colorTextBase === defaultSeedToken.colorTextBase ? '#ffffff' : seed.colorTextBase,
    boxShadow:
      '0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 9px 28px 8px rgba(0, 0, 0, 0.2)',
  }

  return {
    ...darkSeed,
    colorPrimaryHover: getPrimaryHover(darkSeed.colorPrimary),
    colorPrimaryActive: getPrimaryActive(darkSeed.colorPrimary),
    colorText: 'rgba(255, 255, 255, 0.88)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextDisabled: 'rgba(255, 255, 255, 0.25)',
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    colorBgContainer: darkSeed.colorBgBase,
    colorBgElevated: '#1f1f1f',
    colorFillAlter: 'rgba(255, 255, 255, 0.04)',
    lineWidth: 1,
    controlHeightSM: 24,
    controlHeightLG: 40,
    paddingXS: darkSeed.sizeUnit * 2,
    paddingSM: darkSeed.sizeUnit * 3,
    padding: darkSeed.sizeUnit * 4,
    paddingLG: darkSeed.sizeUnit * 6,
    marginXS: darkSeed.sizeUnit * 2,
    marginSM: darkSeed.sizeUnit * 3,
    margin: darkSeed.sizeUnit * 4,
    marginLG: darkSeed.sizeUnit * 6,
  }
}

function normalizeAlgorithms(algorithm: ThemeConfig['algorithm']): ThemeAlgorithm[] {
  if (!algorithm) return [defaultAlgorithm]
  return Array.isArray(algorithm) ? algorithm : [algorithm]
}

export function mergeTheme(config: ThemeConfig = {}): AliasToken {
  const seed: SeedToken = { ...defaultSeedToken, ...config.token }
  return normalizeAlgorithms(config.algorithm).reduce<AliasToken>(
    (current, algorithm) => algorithm(current),
    seed as AliasToken,
  )
}
