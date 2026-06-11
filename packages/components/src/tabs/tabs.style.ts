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
        margin: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
      },
      [`.${prefixCls}-nav-list`]: {
        display: 'flex',
        'align-items': 'stretch',
        gap: `var(--ads-tabs-tab-gutter, 0)`,
      },
      [`.${prefixCls}-remove-list`]: {
        display: 'inline-flex',
        'align-items': 'center',
      },
      [`.${prefixCls}-nav-list-centered`]: {
        'justify-content': 'center',
        flex: 1,
      },
      [`.${prefixCls}-bottom .${prefixCls}-nav`]: {
        borderTop: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
      },
      [`.${prefixCls}-start .${prefixCls}-nav, .${prefixCls}-end .${prefixCls}-nav`]: {
        'flex-direction': 'column',
        borderBottom: 0,
      },
      [`.${prefixCls}-start .${prefixCls}-nav-list, .${prefixCls}-end .${prefixCls}-nav-list`]: {
        'flex-direction': 'column',
      },
      [`.${prefixCls}-start .${prefixCls}-remove-list, .${prefixCls}-end .${prefixCls}-remove-list`]:
        {
          'flex-direction': 'column',
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
      },
      [`.${prefixCls}-tab-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        marginRight: `${t.marginXS}px`,
        lineHeight: 1,
      },
      [`.${prefixCls}-indicator`]: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        left: 0,
        width: 'var(--ads-tabs-indicator-size, auto)',
        height: `${t.lineWidth * 2}px`,
        background: tabs.inkBarColor,
      },
      [`.${prefixCls}-indicator-start`]: {
        right: 'auto',
      },
      [`.${prefixCls}-indicator-center`]: {
        right: 'auto',
        left: '50%',
        transform: 'translateX(-50%)',
      },
      [`.${prefixCls}-indicator-end`]: {
        left: 'auto',
      },
      [`.${prefixCls}-bottom .${prefixCls}-indicator`]: {
        top: 0,
        bottom: 'auto',
      },
      [`.${prefixCls}-start .${prefixCls}-indicator`]: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 'auto',
        width: `${t.lineWidth * 2}px`,
        height: 'var(--ads-tabs-indicator-size, auto)',
      },
      [`.${prefixCls}-end .${prefixCls}-indicator`]: {
        top: 0,
        right: 'auto',
        bottom: 0,
        left: 0,
        width: `${t.lineWidth * 2}px`,
        height: 'var(--ads-tabs-indicator-size, auto)',
      },
      [`.${prefixCls}-start .${prefixCls}-indicator-start, .${prefixCls}-end .${prefixCls}-indicator-start`]:
        {
          bottom: 'auto',
        },
      [`.${prefixCls}-start .${prefixCls}-indicator-center, .${prefixCls}-end .${prefixCls}-indicator-center`]:
        {
          top: '50%',
          bottom: 'auto',
          transform: 'translateY(-50%)',
        },
      [`.${prefixCls}-start .${prefixCls}-indicator-end, .${prefixCls}-end .${prefixCls}-indicator-end`]:
        {
          top: 'auto',
        },
      [`.${prefixCls}-tab-active`]: {
        color: tabs.itemSelectedColor,
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
        gap: 0,
      },
      [`.${prefixCls}-card .${prefixCls}-nav-list`]: {
        gap: `var(--ads-tabs-tab-gutter, ${t.marginXS}px)`,
      },
      [`.${prefixCls}-card.${prefixCls}-start .${prefixCls}-nav-list, .${prefixCls}-card.${prefixCls}-end .${prefixCls}-nav-list`]:
        {
          gap: `var(--ads-tabs-tab-gutter, ${t.marginXS}px)`,
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
      [`.${prefixCls}-tab-remove, .${prefixCls}-add, .${prefixCls}-more`]: {
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
      [`.${prefixCls}-more`]: {
        'align-self': 'center',
      },
      [`.${prefixCls}-extra-content`]: {
        display: 'inline-flex',
        'align-items': 'center',
      },
      [`.${prefixCls}-extra-content-right`]: {
        'margin-inline-start': 'auto',
      },
      [`.${prefixCls}-start .${prefixCls}-extra-content-right, .${prefixCls}-end .${prefixCls}-extra-content-right`]:
        {
          'margin-block-start': 'auto',
          'margin-inline-start': 0,
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
