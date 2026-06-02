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

  it('derives feedback component token defaults and applies overrides', () => {
    const token = mergeTheme({
      components: {
        Alert: { iconSize: 18 },
        Message: { noticeBorderRadius: 10 },
        Notification: { width: 420 },
        Modal: { titleFontSize: 18 },
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
    expect(getComponentToken('Popconfirm', token).width).toBe(240)
    expect(getComponentToken('Popconfirm', token).bg).toBe(token.colorBgElevated)
  })

  it('derives data display component token defaults and applies overrides', () => {
    const token = mergeTheme({
      components: {
        Table: { headerBg: '#fafafa', cellPadding: 20 },
        Tag: { borderRadius: 12, closeIconColor: '#111111' },
        Badge: { overflowIndicatorHeight: 24, dotSize: 8 },
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
  })

})
