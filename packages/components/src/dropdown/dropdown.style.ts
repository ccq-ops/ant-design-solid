import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useDropdownStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Dropdown', prefixCls] },
    () => {
      const t = token()
      const dt = getComponentToken('Dropdown', t)
      const buttonCls = prefixCls.replace(/-dropdown$/, '-btn')
      return {
        [`.${prefixCls}-trigger`]: {
          display: 'inline-block',
        },
        [`.${prefixCls}-trigger-disabled`]: {
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-button`]: {
          width: 'auto',
        },
        [`.${prefixCls}-button-trigger`]: {
          display: 'inline-flex',
          'align-items': 'stretch',
        },
        [`.${prefixCls}-button-trigger:not(:first-child)`]: {
          'margin-left': `-${t.lineWidth}px`,
        },
        [`.${prefixCls}-button-trigger > .${buttonCls}`]: {
          height: '100%',
        },
        [`.${prefixCls}-button-trigger > .${prefixCls}-button-trigger-btn`]: {
          'border-top-left-radius': 0,
          'border-bottom-left-radius': 0,
        },
        [`.${prefixCls}-button-trigger > .${prefixCls}-button-trigger-btn${buttonCls}-primary:not([disabled])`]:
          {
            'border-inline-start-color': 'rgba(255, 255, 255, 0.45)',
          },
        [`.${prefixCls}-button-trigger > .${prefixCls}-button-trigger-btn${buttonCls}-dangerous:not([disabled])`]:
          {
            'border-inline-start-color': t.colorErrorHover,
          },
        [`.${prefixCls}-button > .${buttonCls}:first-child:not(:last-child)`]: {
          'border-top-right-radius': 0,
          'border-bottom-right-radius': 0,
        },
        [`.${prefixCls}`]: {
          position: 'fixed',
          display: 'block',
          'min-width': `${dt.minWidth}px`,
          background: 'transparent',
          'border-radius': `${dt.borderRadius}px`,
          outline: 'none',
        },
        [`.${prefixCls}-hidden`]: {
          display: 'none',
        },
        [`.${prefixCls}-menu`]: {
          margin: 0,
          padding: `${dt.dropdownEdgeChildPadding}px`,
          'list-style': 'none',
          background: dt.bg,
          'background-clip': 'padding-box',
          'border-radius': `${dt.borderRadius}px`,
          'box-shadow': dt.boxShadow,
          outline: 'none',
        },
        [`.${prefixCls}-menu:empty`]: {
          padding: 0,
          'box-shadow': 'none',
        },
        [`.${prefixCls}-menu.ads-menu`]: {
          margin: 0,
          background: dt.bg,
        },
        [`.${prefixCls}-menu .ads-menu-item, .${prefixCls}-menu .ads-menu-submenu-title`]: {
          margin: 0,
          padding: `${dt.paddingBlock}px ${t.controlPaddingHorizontal}px`,
          color: dt.itemColor,
          'font-size': `${t.fontSize}px`,
          'line-height': t.lineHeight,
          'border-radius': `${t.borderRadiusSM}px`,
          cursor: 'pointer',
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-menu .ads-menu-item:hover, .${prefixCls}-menu .ads-menu-submenu-title:hover`]:
          {
            background: dt.itemHoverBg,
          },
        [`.${prefixCls}-menu .ads-menu-item-disabled, .${prefixCls}-menu .ads-menu-submenu-disabled > .ads-menu-submenu-title`]:
          {
            color: dt.itemDisabledColor,
            cursor: 'not-allowed',
          },
        [`.${prefixCls}-menu .ads-menu-item-disabled:hover, .${prefixCls}-menu .ads-menu-submenu-disabled > .ads-menu-submenu-title:hover`]:
          {
            color: dt.itemDisabledColor,
            background: dt.bg,
          },
        [`.${prefixCls}-menu .ads-menu-item-selected`]: {
          color: t.colorPrimary,
          background: t.controlItemBgActive,
        },
        [`.${prefixCls}-menu .ads-menu-item-selected:hover`]: {
          background: t.controlItemBgActiveHover,
        },
        [`.${prefixCls}-menu .ads-menu-item-danger`]: {
          color: t.colorError,
        },
        [`.${prefixCls}-menu .ads-menu-item-danger:hover`]: {
          color: t.colorErrorHover,
          background: t.colorErrorBg,
        },
        [`.${prefixCls}-menu .ads-menu-item-icon`]: {
          'min-width': `${t.fontSize}px`,
          'margin-inline-end': `${t.marginXS}px`,
          'font-size': `${t.fontSizeSM}px`,
        },
        [`.${prefixCls}-menu .ads-menu-item-extra`]: {
          'padding-inline-start': `${t.padding}px`,
          'margin-inline-start': 'auto',
          'font-size': `${t.fontSizeSM}px`,
          color: t.colorTextDescription,
        },
        [`.${prefixCls}-menu .ads-menu-item-group-title`]: {
          padding: `${dt.paddingBlock}px ${t.controlPaddingHorizontal}px`,
          color: t.colorTextDescription,
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-menu .ads-menu-item-divider`]: {
          height: `${t.lineWidth}px`,
          margin: `${t.marginXXS}px 0`,
          overflow: 'hidden',
          'line-height': 0,
          background: t.colorSplit,
        },
        [`.${prefixCls}-menu-item`]: {
          margin: 0,
          padding: `${dt.paddingBlock}px ${t.controlPaddingHorizontal}px`,
          color: dt.itemColor,
          cursor: 'pointer',
          'white-space': 'nowrap',
          transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}`,
          '&:hover': {
            background: dt.itemHoverBg,
          },
        },
        [`.${prefixCls}-menu-item-disabled`]: {
          color: dt.itemDisabledColor,
          cursor: 'not-allowed',
          '&:hover': {
            background: 'transparent',
          },
        },
        [`.${prefixCls}-menu-divider`]: {
          margin: `${t.marginXS / 2}px 0`,
          padding: 0,
          height: t.lineWidth,
          overflow: 'hidden',
          'line-height': 0,
          background: t.colorBorderSecondary,
        },
        [`.${prefixCls}-arrow`]: {
          position: 'absolute',
          width: `${t.sizePopupArrow}px`,
          height: `${t.sizePopupArrow}px`,
          background: dt.bg,
          transform: 'rotate(45deg)',
          'box-shadow': t.boxShadowPopoverArrow,
          'z-index': -1,
        },
        [`.${prefixCls}-top .${prefixCls}-arrow, .${prefixCls}-topLeft .${prefixCls}-arrow, .${prefixCls}-topRight .${prefixCls}-arrow`]:
          {
            bottom: `${-(t.sizePopupArrow / 2)}px`,
          },
        [`.${prefixCls}-bottom .${prefixCls}-arrow, .${prefixCls}-bottomLeft .${prefixCls}-arrow, .${prefixCls}-bottomRight .${prefixCls}-arrow`]:
          {
            top: `${-(t.sizePopupArrow / 2)}px`,
          },
        [`.${prefixCls}-top .${prefixCls}-arrow, .${prefixCls}-bottom .${prefixCls}-arrow`]: {
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        },
        [`.${prefixCls}-topLeft .${prefixCls}-arrow, .${prefixCls}-bottomLeft .${prefixCls}-arrow`]:
          {
            left: `${dt.dropdownArrowDistance}px`,
          },
        [`.${prefixCls}-topRight .${prefixCls}-arrow, .${prefixCls}-bottomRight .${prefixCls}-arrow`]:
          {
            right: `${dt.dropdownArrowDistance}px`,
          },
        [`.${prefixCls}-arrow-point-at-center .${prefixCls}-arrow`]: {
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        },
      }
    },
  )
}
