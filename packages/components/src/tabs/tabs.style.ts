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
      [`.${prefixCls}-top, .${prefixCls}-bottom`]: {
        display: 'flex',
        'flex-direction': 'column',
      },
      [`.${prefixCls}-start, .${prefixCls}-end`]: {
        display: 'flex',
        'align-items': 'stretch',
      },
      [`.${prefixCls}-end`]: {
        'flex-direction': 'row',
      },
      [`.${prefixCls}-nav`]: {
        display: 'flex',
        'align-items': 'stretch',
        gap: 0,
        margin: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
      },
      [`.${prefixCls}-bottom .${prefixCls}-nav`]: {
        borderTop: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
      },
      [`.${prefixCls}-start .${prefixCls}-nav, .${prefixCls}-end .${prefixCls}-nav`]: {
        'flex-direction': 'column',
        borderBottom: 0,
      },
      [`.${prefixCls}-tab-wrap`]: {
        display: 'inline-flex',
        'align-items': 'stretch',
        margin: 0,
      },
      [`.${prefixCls}-start .${prefixCls}-nav`]: {
        borderRight: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
      },
      [`.${prefixCls}-end .${prefixCls}-nav`]: {
        borderLeft: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
      },
      [`.${prefixCls}-tab`]: {
        position: 'relative',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
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
      [`.${prefixCls}-start .${prefixCls}-tab::after`]: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 'auto',
        width: `${t.lineWidth * 2}px`,
        height: 'auto',
      },
      [`.${prefixCls}-end .${prefixCls}-tab::after`]: {
        top: 0,
        right: 'auto',
        bottom: 0,
        left: 0,
        width: `${t.lineWidth * 2}px`,
        height: 'auto',
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
      [`.${prefixCls}-card.${prefixCls}-start .${prefixCls}-nav, .${prefixCls}-card.${prefixCls}-end .${prefixCls}-nav`]:
        {
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
      [`.${prefixCls}-card.${prefixCls}-start .${prefixCls}-tab`]: {
        borderRight: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `${t.borderRadius}px 0 0 ${t.borderRadius}px`,
      },
      [`.${prefixCls}-card.${prefixCls}-end .${prefixCls}-tab`]: {
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderLeft: 0,
        'border-radius': `0 ${t.borderRadius}px ${t.borderRadius}px 0`,
      },
      [`.${prefixCls}-editable-card .${prefixCls}-tab-wrap`]: {
        background: tabs.cardBg,
        border: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
        'border-radius': `${t.borderRadius}px ${t.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-editable-card .${prefixCls}-tab`]: {
        background: 'transparent',
        border: 0,
        paddingRight: `${t.paddingXS}px`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-bottom .${prefixCls}-tab-wrap`]: {
        borderTop: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `0 0 ${t.borderRadius}px ${t.borderRadius}px`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-start .${prefixCls}-tab-wrap`]: {
        borderRight: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `${t.borderRadius}px 0 0 ${t.borderRadius}px`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-end .${prefixCls}-tab-wrap`]: {
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderLeft: 0,
        'border-radius': `0 ${t.borderRadius}px ${t.borderRadius}px 0`,
      },
      [`.${prefixCls}-tab-remove, .${prefixCls}-add`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        width: `${t.controlHeightSM}px`,
        height: `${t.controlHeightSM}px`,
        margin: 'auto 0',
        padding: 0,
        color: tabs.itemColor,
        'font-size': `${t.fontSize}px`,
        'font-family': 'inherit',
        lineHeight: 1,
        background: 'transparent',
        border: 0,
        'border-radius': `${t.borderRadius / 2}px`,
        cursor: 'pointer',
        transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}, background ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': {
          color: tabs.itemHoverColor,
          background: t.colorFillAlter,
        },
        '&:focus-visible': {
          outline: `${t.lineWidth}px solid ${t.colorPrimary}`,
          'outline-offset': '2px',
        },
      },
      [`.${prefixCls}-tab-remove`]: {
        marginRight: `${t.paddingXS}px`,
      },
      [`.${prefixCls}-add`]: {
        'align-self': 'center',
        border: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
      },
      [`.${prefixCls}-content`]: {
        padding: `${t.padding}px 0`,
        flex: 1,
      },
      [`.${prefixCls}-start .${prefixCls}-content`]: {
        padding: `0 0 0 ${t.padding}px`,
      },
      [`.${prefixCls}-end .${prefixCls}-content`]: {
        padding: `0 ${t.padding}px 0 0`,
      },
      [`.${prefixCls}-tabpane-hidden`]: {
        display: 'none',
      },
    }
  })
}
