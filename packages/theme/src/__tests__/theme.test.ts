import { describe, expect, it } from 'vitest'
import {
  defaultAlgorithm,
  defaultSeedToken,
  getComponentToken,
  mergeTheme,
  type ThemeConfig,
} from '../index'

describe('@ant-design-solid/theme', () => {
  it('derives alias tokens from seed tokens', () => {
    const token = defaultAlgorithm({ ...defaultSeedToken, colorPrimary: '#1677ff' })

    expect(token.colorPrimary).toBe('#1677ff')
    expect(token.colorPrimaryHover).toBe('#4096ff')
    expect(token.colorPrimaryActive).toBe('#0958d9')
    expect(token.colorText).toBe('#1f1f1f')
    expect(token.controlHeight).toBe(32)
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
})
