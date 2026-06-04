import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function usePopoverStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Popover', prefixCls] },
    () => {
      const t = token()
      const popoverToken = getComponentToken('Popover', t)
      return {
        [`.${prefixCls}-trigger`]: {
          display: 'inline-block',
        },
        [`.${prefixCls}`]: {
          position: 'fixed',
          'z-index': 1030,
          'min-width': popoverToken.minWidth,
          'max-width': popoverToken.maxWidth,
          color: t.colorText,
          background: popoverToken.bg,
          'border-radius': popoverToken.borderRadius,
          'box-shadow': popoverToken.boxShadow,
        },
        [`.${prefixCls}-inner`]: {
          padding: `${popoverToken.paddingBlock}px ${popoverToken.paddingInline}px`,
        },
        [`.${prefixCls}-title`]: {
          color: t.colorText,
          'font-weight': 600,
          'margin-bottom': t.marginXS,
        },
        [`.${prefixCls}-content`]: {
          color: t.colorText,
        },
      }
    },
  )
}
