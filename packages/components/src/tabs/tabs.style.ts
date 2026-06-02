import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTabsStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tabs', prefixCls] }, () => {
    const t = token()
    const tabs = getComponentToken('Tabs', t)
    return {
      [`.${prefixCls}`]: {
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
      },
      [`.${prefixCls}-nav`]: {
        display: 'flex',
        gap: 0,
        margin: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
      },
      [`.${prefixCls}-bottom .${prefixCls}-nav`]: {
        borderTop: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
      },
      [`.${prefixCls}-tab`]: {
        position: 'relative',
        margin: 0,
        padding: `${t.paddingSM}px ${tabs.horizontalItemPadding}px`,
        color: tabs.itemColor,
        'font-size': 'inherit',
        'font-family': 'inherit',
        lineHeight: t.lineHeight,
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': { color: tabs.itemHoverColor },
        '&::after': {
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0,
          height: `${t.lineWidth * 2}px`,
          background: 'transparent',
          content: '""',
        },
      },
      [`.${prefixCls}-bottom .${prefixCls}-tab::after`]: {
        top: 0,
        bottom: 'auto',
      },
      [`.${prefixCls}-tab-active`]: {
        color: tabs.itemSelectedColor,
        '&::after': { background: tabs.inkBarColor },
      },
      [`.${prefixCls}-tab-disabled`]: {
        color: `${tabs.itemDisabledColor} !important`,
        cursor: 'not-allowed',
      },
      [`.${prefixCls}-small .${prefixCls}-tab`]: {
        padding: `${t.paddingXS}px ${tabs.horizontalItemPaddingSm}px`,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-large .${prefixCls}-tab`]: {
        padding: `${t.padding}px ${tabs.horizontalItemPaddingLg}px`,
        'font-size': `${t.fontSize + 2}px`,
      },
      [`.${prefixCls}-card .${prefixCls}-nav`]: {
        gap: `${t.marginXS}px`,
      },
      [`.${prefixCls}-card .${prefixCls}-tab`]: {
        background: tabs.cardBg,
        border: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
        'border-radius': `${t.borderRadius}px ${t.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-card.${prefixCls}-bottom .${prefixCls}-tab`]: {
        borderTop: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `0 0 ${t.borderRadius}px ${t.borderRadius}px`,
      },
      [`.${prefixCls}-content`]: {
        padding: `${t.padding}px 0`,
      },
      [`.${prefixCls}-tabpane-hidden`]: {
        display: 'none',
      },
    }
  })
}
