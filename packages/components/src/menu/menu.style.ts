import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useMenuStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Menu', prefixCls] }, () => {
    const t = token()
    const menu = getComponentToken('Menu', t)
    const itemHeight = 40
    const horizontalHeight = 46
    const collapsedWidth = 80
    const itemRadius = t.borderRadiusLG
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: `${t.paddingXXS}px`,
        color: menu.itemColor,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'list-style': 'none',
        background: menu.itemBg,
        outline: 'none',
      },
      [`.${prefixCls}-dark`]: {
        color: menu.darkItemColor,
        background: menu.darkItemBg,
      },
      [`.${prefixCls}-horizontal`]: {
        display: 'flex',
        'align-items': 'center',
        padding: 0,
        'line-height': `${horizontalHeight}px`,
        'border-bottom': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-vertical, .${prefixCls}-inline`]: {
        display: 'block',
        width: '100%',
      },
      [`.${prefixCls}-inline-collapsed`]: {
        width: `${collapsedWidth}px`,
      },
      [`.${prefixCls}-item, .${prefixCls}-submenu-title`]: {
        position: 'relative',
        display: 'flex',
        'align-items': 'center',
        gap: `${t.marginXS}px`,
        'min-height': `${itemHeight}px`,
        margin: `${t.marginXXS}px 0`,
        padding: `0 ${t.padding}px`,
        color: menu.itemColor,
        'border-radius': `${itemRadius}px`,
        cursor: 'pointer',
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}, color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-item:hover, .${prefixCls}-submenu-title:hover`]: {
        color: menu.itemHoverColor,
        background: menu.itemHoverBg,
      },
      [`.${prefixCls}-horizontal > .${prefixCls}-item, .${prefixCls}-horizontal > .${prefixCls}-submenu`]:
        {
          margin: `0 ${t.marginXS}px`,
          'border-radius': 0,
        },
      [`.${prefixCls}-horizontal > .${prefixCls}-item, .${prefixCls}-horizontal > .${prefixCls}-submenu > .${prefixCls}-submenu-title, .${prefixCls}-horizontal > .${prefixCls}-overflowed-indicator`]:
        {
          'min-height': `${horizontalHeight}px`,
          height: `${horizontalHeight}px`,
          margin: 0,
          padding: `0 ${t.padding}px`,
          color: menu.itemColor,
          'border-radius': 0,
          background: 'transparent',
          'line-height': `${horizontalHeight}px`,
        },
      [`.${prefixCls}-horizontal > .${prefixCls}-item:hover, .${prefixCls}-horizontal > .${prefixCls}-submenu:hover > .${prefixCls}-submenu-title, .${prefixCls}-horizontal > .${prefixCls}-overflowed-indicator:hover`]:
        {
          color: menu.itemSelectedColor,
          background: 'transparent',
        },
      [`.${prefixCls}-item-selected`]: {
        color: menu.itemSelectedColor,
        background: menu.itemSelectedBg,
        'font-weight': 500,
      },
      [`.${prefixCls}-inline .${prefixCls}-item-selected::after, .${prefixCls}-vertical .${prefixCls}-item-selected::after`]:
        {
          position: 'absolute',
          inset: `0 0 0 auto`,
          width: 0,
          border: 0,
          'border-inline-end': `3px solid ${menu.itemSelectedColor}`,
          content: '""',
        },
      [`.${prefixCls}-horizontal > .${prefixCls}-item::after, .${prefixCls}-horizontal > .${prefixCls}-submenu::after`]:
        {
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0,
          border: 0,
          'border-bottom': `${t.lineWidthBold}px solid transparent`,
          transition: `border-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
          content: '""',
        },
      [`.${prefixCls}-horizontal > .${prefixCls}-item:hover::after, .${prefixCls}-horizontal > .${prefixCls}-submenu:hover::after, .${prefixCls}-horizontal > .${prefixCls}-item-selected::after, .${prefixCls}-horizontal > .${prefixCls}-submenu-open::after`]:
        {
          'border-bottom-color': menu.itemSelectedColor,
        },
      [`.${prefixCls}-horizontal > .${prefixCls}-item-selected`]: {
        color: menu.itemSelectedColor,
        background: 'transparent',
      },
      [`.${prefixCls}-item-danger`]: {
        color: t.colorError,
      },
      [`.${prefixCls}-item-danger:hover`]: {
        color: t.colorErrorHover,
        background: t.colorErrorBg,
      },
      [`.${prefixCls}-item-danger.${prefixCls}-item-selected`]: {
        color: t.colorError,
        background: t.colorErrorBg,
      },
      [`.${prefixCls}-item-disabled, .${prefixCls}-submenu-disabled > .${prefixCls}-submenu-title`]:
        {
          color: menu.itemDisabledColor,
          background: 'transparent',
          cursor: 'not-allowed',
        },
      [`.${prefixCls}-item-disabled:hover, .${prefixCls}-submenu-disabled > .${prefixCls}-submenu-title:hover`]:
        {
          color: menu.itemDisabledColor,
          background: 'transparent',
        },
      [`.${prefixCls}-item-icon`]: {
        flex: 'none',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'min-width': `${t.fontSizeLG}px`,
        'font-size': `${t.fontSizeLG}px`,
      },
      [`.${prefixCls}-title-content`]: {
        flex: 1,
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
      },
      [`.${prefixCls}-item-extra`]: {
        flex: 'none',
        color: menu.groupTitleColor,
        'font-size': `${Math.max(12, t.fontSize - 2)}px`,
      },
      [`.${prefixCls}-submenu`]: {
        position: 'relative',
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
      [`.${prefixCls}-submenu-popup`]: {
        'box-sizing': 'border-box',
        'min-width': '160px',
        padding: `${t.paddingXXS}px`,
        color: menu.itemColor,
        background: menu.popupBg,
        'border-radius': `${t.borderRadiusLG}px`,
        'box-shadow': t.boxShadowSecondary,
      },
      [`.${prefixCls}-submenu-list-hidden`]: {
        display: 'none',
      },
      [`.${prefixCls}-submenu-hidden`]: {
        display: 'none',
      },
      [`.${prefixCls}-submenu-list .${prefixCls}-item, .${prefixCls}-submenu-list .${prefixCls}-submenu-title`]:
        {
          'border-radius': `${t.borderRadiusSM}px`,
        },
      [`.${prefixCls}-item-group`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-item-group-title`]: {
        height: `${t.controlHeightSM}px`,
        padding: `${t.paddingXXS}px ${t.padding}px`,
        color: menu.groupTitleColor,
        'font-size': `${t.fontSizeSM}px`,
        'line-height': `${t.controlHeightSM - t.paddingXXS * 2}px`,
      },
      [`.${prefixCls}-item-group-list`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-item-divider`]: {
        height: `${t.lineWidth}px`,
        margin: `${t.marginXS}px ${t.margin}px`,
        overflow: 'hidden',
        'line-height': 0,
        background: t.colorBorderSecondary,
      },
      [`.${prefixCls}-item-divider-dashed`]: {
        height: 0,
        border: 0,
        'border-top': `${t.lineWidth}px dashed ${t.colorBorderSecondary}`,
        background: 'transparent',
      },
      [`.${prefixCls}-overflowed-indicator`]: {
        flex: 'none',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'min-height': `${horizontalHeight}px`,
        padding: `0 ${t.padding}px`,
        cursor: 'pointer',
      },
      [`.${prefixCls}-inline-collapsed .${prefixCls}-title-content, .${prefixCls}-inline-collapsed .${prefixCls}-submenu-arrow, .${prefixCls}-inline-collapsed .${prefixCls}-item-group-title`]:
        {
          display: 'none',
        },
      [`.${prefixCls}-inline-collapsed .${prefixCls}-item, .${prefixCls}-inline-collapsed .${prefixCls}-submenu-title`]:
        {
          width: `${itemHeight}px`,
          height: `${itemHeight}px`,
          margin: `${t.marginXXS}px auto`,
          'justify-content': 'center',
          padding: 0,
        },
      [`.${prefixCls}-inline-collapsed .${prefixCls}-item-icon`]: {
        margin: 0,
        'font-size': `${t.fontSizeXL}px`,
      },
      [`.${prefixCls}-dark .${prefixCls}-item, .${prefixCls}-dark .${prefixCls}-submenu-title`]: {
        color: menu.darkItemColor,
      },
      [`.${prefixCls}-dark .${prefixCls}-item:hover, .${prefixCls}-dark .${prefixCls}-submenu-title:hover`]:
        {
          color: menu.darkItemHoverColor,
          background: 'transparent',
        },
      [`.${prefixCls}-dark .${prefixCls}-item-selected`]: {
        color: menu.darkItemSelectedColor,
        background: menu.darkItemSelectedBg,
      },
      [`.${prefixCls}-dark .${prefixCls}-item-selected::after`]: {
        'border-color': menu.darkItemSelectedColor,
      },
      [`.${prefixCls}-dark .${prefixCls}-submenu-popup`]: {
        color: menu.darkItemColor,
        background: menu.darkPopupBg,
      },
      [`.${prefixCls}-dark .${prefixCls}-item-group-title`]: {
        color: menu.darkGroupTitleColor,
      },
      [`.${prefixCls}-dark .${prefixCls}-item-divider`]: {
        background: menu.darkItemDividerBg,
      },
      [`.${prefixCls}-dark .${prefixCls}-item-disabled, .${prefixCls}-dark .${prefixCls}-submenu-disabled > .${prefixCls}-submenu-title`]:
        {
          color: menu.darkItemDisabledColor,
        },
      [`.${prefixCls}-dark .${prefixCls}-item-danger`]: {
        color: t.colorError,
      },
      [`.${prefixCls}-dark .${prefixCls}-item-danger:hover`]: {
        color: t.colorErrorHover,
      },
    }
  })
}
