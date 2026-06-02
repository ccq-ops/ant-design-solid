import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTooltipStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Tooltip', prefixCls] },
    () => {
      const t = token()
      const tooltipToken = getComponentToken('Tooltip', t)
      return {
        [`.${prefixCls}-trigger`]: {
          display: 'inline-block',
        },
        [`.${prefixCls}`]: {
          position: 'fixed',
          'z-index': 1070,
          'max-width': tooltipToken.maxWidth,
          padding: `${tooltipToken.paddingBlock}px ${tooltipToken.paddingInline}px`,
          color: tooltipToken.color,
          background: tooltipToken.bg,
          'border-radius': tooltipToken.borderRadius,
          'box-shadow': tooltipToken.boxShadow,
          'pointer-events': 'none',
        },
      }
    },
  )
}
