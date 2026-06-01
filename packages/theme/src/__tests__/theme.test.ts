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

  it('derives form component token defaults and applies overrides', () => {
    const token = mergeTheme({
      components: {
        Form: { labelColor: '#222222' },
        Select: { optionSelectedBg: '#d6e4ff' },
        Checkbox: { checkColor: '#111111' },
        Radio: { dotSize: 10 },
        Switch: { handleSize: 16 },
      },
    })

    expect(getComponentToken('Form', token).labelColor).toBe('#222222')
    expect(getComponentToken('Form', token).itemMarginBottom).toBe(24)
    expect(getComponentToken('Select', token).optionSelectedBg).toBe('#d6e4ff')
    expect(getComponentToken('Select', token).optionHeight).toBe(32)
    expect(getComponentToken('Checkbox', token).checkColor).toBe('#111111')
    expect(getComponentToken('Checkbox', token).size).toBe(16)
    expect(getComponentToken('Radio', token).dotSize).toBe(10)
    expect(getComponentToken('Radio', token).size).toBe(16)
    expect(getComponentToken('Switch', token).handleSize).toBe(16)
    expect(getComponentToken('Switch', token).trackMinWidth).toBe(44)
  })
})
