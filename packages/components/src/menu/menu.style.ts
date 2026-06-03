import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useMenuStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Menu', prefixCls] }, () => {
    const t = token()
    const itemHeight = t.controlHeightLG
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: `${Math.max(2, Math.floor(t.paddingXS / 2))}px`,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'list-style': 'none',
        background: t.colorBgContainer,
      },
      [`.${prefixCls}-horizontal`]: {
        display: 'flex',
        'align-items': 'center',
        'border-bottom': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-vertical, .${prefixCls}-inline`]: {
        display: 'block',
        width: '100%',
      },
      [`.${prefixCls}-inline-collapsed`]: {
        width: `${itemHeight + t.paddingXS * 2}px`,
      },
      [`.${prefixCls}-item, .${prefixCls}-submenu-title`]: {
        position: 'relative',
        display: 'flex',
        'align-items': 'center',
        gap: `${t.marginSM}px`,
        'min-height': `${itemHeight}px`,
        margin: `${Math.max(2, Math.floor(t.marginXS / 2))}px 0`,
        padding: `0 ${t.padding}px`,
        color: t.colorText,
        'border-radius': `${t.borderRadius}px`,
        cursor: 'pointer',
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}, color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': {
          color: t.colorPrimary,
          background: t.colorFillAlter,
        },
      },
      [`.${prefixCls}-horizontal > .${prefixCls}-item, .${prefixCls}-horizontal > .${prefixCls}-submenu`]:
        {
          margin: `0 ${Math.max(2, Math.floor(t.marginXS / 2))}px`,
        },
      [`.${prefixCls}-item-selected`]: {
        color: t.colorPrimary,
        background: t.colorFillAlter,
        'font-weight': 500,
      },
      [`.${prefixCls}-item-disabled, .${prefixCls}-submenu-disabled > .${prefixCls}-submenu-title`]:
        {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
          '&:hover': {
            color: t.colorTextDisabled,
            background: 'transparent',
          },
        },
      [`.${prefixCls}-item-icon`]: {
        flex: 'none',
        display: 'inline-flex',
        'align-items': 'center',
      },
      [`.${prefixCls}-title-content`]: {
        flex: 1,
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
      },
      [`.${prefixCls}-submenu`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-submenu-arrow`]: {
        flex: 'none',
        transition: `transform ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-submenu-open > .${prefixCls}-submenu-title .${prefixCls}-submenu-arrow`]: {
        transform: 'rotate(90deg)',
      },
      [`.${prefixCls}-submenu-list`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-submenu-list-hidden`]: {
        display: 'none',
      },
      [`.${prefixCls}-submenu-list .${prefixCls}-item, .${prefixCls}-submenu-list .${prefixCls}-submenu-title`]:
        {
          'padding-inline-start': `${t.paddingLG + t.padding}px`,
        },
      [`.${prefixCls}-item-group`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-item-group-title`]: {
        padding: `${t.paddingXS}px ${t.padding}px`,
        color: t.colorTextSecondary,
        'font-size': `${Math.max(12, t.fontSize - 2)}px`,
      },
      [`.${prefixCls}-item-group-list`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-item-divider`]: {
        height: `${t.lineWidth}px`,
        margin: `${t.marginXS}px ${t.marginSM}px`,
        overflow: 'hidden',
        'line-height': 0,
        background: t.colorBorderSecondary,
      },
      [`.${prefixCls}-inline-collapsed .${prefixCls}-title-content, .${prefixCls}-inline-collapsed .${prefixCls}-submenu-arrow, .${prefixCls}-inline-collapsed .${prefixCls}-item-group-title`]:
        {
          display: 'none',
        },
      [`.${prefixCls}-inline-collapsed .${prefixCls}-item, .${prefixCls}-inline-collapsed .${prefixCls}-submenu-title`]:
        {
          'justify-content': 'center',
          padding: 0,
        },
    }
  })
}
