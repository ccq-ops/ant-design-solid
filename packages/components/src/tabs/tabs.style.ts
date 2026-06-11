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
        position: 'relative',
        display: 'flex',
        flex: 1,
        'min-width': 0,
        'align-items': 'stretch',
        overflow: 'hidden',
        gap: `var(--ads-tabs-tab-gutter, 0)`,
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
        'min-width': 'auto',
        'min-height': 0,
      },
      [`.${prefixCls}-start .${prefixCls}-tab-wrap, .${prefixCls}-end .${prefixCls}-tab-wrap`]: {
        display: 'flex',
        'align-items': 'stretch',
      },
      [`.${prefixCls}-start .${prefixCls}-tab, .${prefixCls}-end .${prefixCls}-tab`]: {
        flex: 1,
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
        right: 'auto',
        bottom: 0,
        left: 0,
        width: '0',
        height: `${t.lineWidth * 2}px`,
        background: tabs.inkBarColor,
        'pointer-events': 'none',
        transition: `transform ${t.motionDurationMid} ${t.motionEaseInOut}, width ${t.motionDurationMid} ${t.motionEaseInOut}, height ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-indicator-no-motion`]: {
        transition: 'none',
      },
      [`.${prefixCls}-bottom .${prefixCls}-indicator`]: {
        top: 0,
        bottom: 'auto',
      },
      [`.${prefixCls}-start .${prefixCls}-indicator`]: {
        top: 0,
        right: `-${t.lineWidth}px`,
        bottom: 'auto',
        left: 'auto',
        width: `${t.lineWidth * 2}px`,
        height: '0',
      },
      [`.${prefixCls}-end .${prefixCls}-indicator`]: {
        top: 0,
        right: 'auto',
        bottom: 'auto',
        left: `-${t.lineWidth}px`,
        width: `${t.lineWidth * 2}px`,
        height: '0',
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
        'align-items': 'center',
        background: tabs.cardBg,
        border: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
        'border-radius': `${t.borderRadius}px ${t.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-editable-card .${prefixCls}-tab-wrap-active`]: {
        background: t.colorBgContainer,
      },
      [`.${prefixCls}-editable-card .${prefixCls}-tab`]: {
        background: 'transparent',
        border: 0,
        paddingRight: `${t.paddingXS}px`,
      },
      [`.${prefixCls}-editable-card .${prefixCls}-tab-remove`]: {
        width: 'auto',
        height: 'auto',
        marginRight: `${t.paddingXS}px`,
        color: t.colorTextSecondary,
        background: 'transparent',
        border: 0,
        '&:hover': {
          color: tabs.itemHoverColor,
          background: 'transparent',
        },
      },
      [`.${prefixCls}-editable-card .${prefixCls}-add`]: {
        background: tabs.cardBg,
        border: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
        'border-radius': `${t.borderRadius}px ${t.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-bottom .${prefixCls}-tab-wrap`]: {
        borderTop: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `0 0 ${t.borderRadius}px ${t.borderRadius}px`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-bottom .${prefixCls}-add`]: {
        borderTop: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `0 0 ${t.borderRadius}px ${t.borderRadius}px`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-start .${prefixCls}-tab-wrap`]: {
        borderRight: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `${t.borderRadius}px 0 0 ${t.borderRadius}px`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-start .${prefixCls}-add`]: {
        borderRight: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `${t.borderRadius}px 0 0 ${t.borderRadius}px`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-end .${prefixCls}-tab-wrap`]: {
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderLeft: 0,
        'border-radius': `0 ${t.borderRadius}px ${t.borderRadius}px 0`,
      },
      [`.${prefixCls}-editable-card.${prefixCls}-end .${prefixCls}-add`]: {
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
      [`.${prefixCls}-more-wrap`]: {
        position: 'relative',
        background: t.colorBgContainer,
        'z-index': 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 1,
          'box-shadow': `-${t.paddingXS}px 0 ${t.paddingXS}px -${t.paddingXS}px ${t.colorBorderSecondary}`,
          'pointer-events': 'none',
        },
      },
      [`.${prefixCls}-nav .${prefixCls}-more-wrap`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'align-self': 'stretch',
        'min-width': `${tabs.horizontalItemPadding * 2 + t.fontSize}px`,
      },
      [`.${prefixCls}-more`]: {
        'align-self': 'stretch',
        width: 'auto',
        'min-width': `${t.controlHeightSM}px`,
        height: '100%',
        padding: `0 ${t.paddingXS}px`,
        background: t.colorBgContainer,
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
