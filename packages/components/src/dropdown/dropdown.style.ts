import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useDropdownStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Dropdown', prefixCls] }, () => {
    const t = token()
    const dt = getComponentToken('Dropdown', t)
    return {
      [`.${prefixCls}-trigger`]: {
        display: 'inline-block',
      },
      [`.${prefixCls}`]: {
        position: 'fixed',
        'z-index': 1050,
        'min-width': dt.minWidth,
        background: dt.bg,
        'box-shadow': dt.boxShadow,
        'border-radius': dt.borderRadius,
      },
      [`.${prefixCls}-menu`]: {
        margin: 0,
        padding: `${t.paddingXS / 2}px 0`,
        'list-style': 'none',
      },
      [`.${prefixCls}-menu-item`]: {
        margin: 0,
        padding: `${dt.itemPaddingBlock}px ${dt.itemPaddingInline}px`,
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
    }
  })
}
