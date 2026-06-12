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
          'max-width': tooltipToken.maxWidth,
          color: tooltipToken.color,
          background: tooltipToken.bg,
          'border-radius': tooltipToken.borderRadius,
          'box-shadow': tooltipToken.boxShadow,
          'pointer-events': 'none',
          transition: 'opacity 0.2s',
        },
        [`.${prefixCls}-hidden`]: {
          opacity: 0,
          visibility: 'hidden',
        },
        [`.${prefixCls}-inner`]: {
          position: 'relative',
          'z-index': 1,
          padding: `${tooltipToken.paddingBlock}px ${tooltipToken.paddingInline}px`,
          'border-radius': tooltipToken.borderRadius,
          background: 'inherit',
        },
        [`.${prefixCls}-arrow`]: {
          position: 'absolute',
          width: 8,
          height: 8,
          background: 'inherit',
          transform: 'rotate(45deg)',
        },
        [`.${prefixCls}-top .${prefixCls}-arrow, .${prefixCls}-topLeft .${prefixCls}-arrow, .${prefixCls}-topRight .${prefixCls}-arrow`]:
          {
            bottom: -4,
          },
        [`.${prefixCls}-bottom .${prefixCls}-arrow, .${prefixCls}-bottomLeft .${prefixCls}-arrow, .${prefixCls}-bottomRight .${prefixCls}-arrow`]:
          {
            top: -4,
          },
        [`.${prefixCls}-left .${prefixCls}-arrow, .${prefixCls}-leftTop .${prefixCls}-arrow, .${prefixCls}-leftBottom .${prefixCls}-arrow`]:
          {
            right: -4,
          },
        [`.${prefixCls}-right .${prefixCls}-arrow, .${prefixCls}-rightTop .${prefixCls}-arrow, .${prefixCls}-rightBottom .${prefixCls}-arrow`]:
          {
            left: -4,
          },
        [`.${prefixCls}-top .${prefixCls}-arrow, .${prefixCls}-bottom .${prefixCls}-arrow`]: {
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
        },
        [`.${prefixCls}-topLeft .${prefixCls}-arrow, .${prefixCls}-bottomLeft .${prefixCls}-arrow`]:
          {
            left: 12,
          },
        [`.${prefixCls}-topRight .${prefixCls}-arrow, .${prefixCls}-bottomRight .${prefixCls}-arrow`]:
          {
            right: 12,
          },
        [`.${prefixCls}-left .${prefixCls}-arrow, .${prefixCls}-right .${prefixCls}-arrow`]: {
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
        },
        [`.${prefixCls}-leftTop .${prefixCls}-arrow, .${prefixCls}-rightTop .${prefixCls}-arrow`]: {
          top: 12,
        },
        [`.${prefixCls}-leftBottom .${prefixCls}-arrow, .${prefixCls}-rightBottom .${prefixCls}-arrow`]:
          {
            bottom: 12,
          },
        [`.${prefixCls}-arrow-point-at-center .${prefixCls}-arrow`]: {
          left: '50%',
          top: '50%',
        },
      }
    },
  )
}
