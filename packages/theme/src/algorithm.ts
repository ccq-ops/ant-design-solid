import { getPrimaryActive, getPrimaryHover } from './color'
import { defaultSeedToken } from './defaultSeedToken'
import type { AliasToken, SeedToken, ThemeConfig } from './types'

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

export function mergeTheme(config: ThemeConfig = {}): AliasToken {
  return defaultAlgorithm({ ...defaultSeedToken, ...config.token })
}
