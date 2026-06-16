import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function usePopconfirmStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Popconfirm', prefixCls] },
    () => {
      const t = token()
      const pt = getComponentToken('Popconfirm', t)
      return {
        [`.${prefixCls}-trigger`]: {
          display: 'inline-block',
        },
        [`.${prefixCls}`]: {
          position: 'fixed',
          width: pt.width,
          color: t.colorText,
          background: pt.bg,
          'border-radius': pt.borderRadius,
          'box-shadow': pt.boxShadow,
          transition: 'opacity 0.2s',
        },
        [`.${prefixCls}-hidden`]: {
          opacity: 0,
          visibility: 'hidden',
        },
        [`.${prefixCls}-inner`]: {
          position: 'relative',
          'z-index': 1,
          padding: 12,
          'border-radius': pt.borderRadius,
          background: 'inherit',
        },
        [`.${prefixCls}-body`]: {
          width: '100%',
        },
        [`.${prefixCls}-message`]: {
          display: 'flex',
          gap: t.marginXS,
          'align-items': 'flex-start',
          'margin-bottom': t.marginXS,
        },
        [`.${prefixCls}-icon`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          flex: 'none',
          color: t.colorWarning,
          height: t.fontSize * t.lineHeight,
          'line-height': 1,
          'font-size': t.fontSize,
        },
        [`.${prefixCls}-icon svg`]: {
          display: 'block',
        },
        [`.${prefixCls}-text`]: {
          flex: 1,
          'min-width': 0,
        },
        [`.${prefixCls}-arrow`]: {
          position: 'absolute',
          width: 8,
          height: 8,
          background: 'inherit',
          transform: 'rotate(45deg)',
        },
        [`.${prefixCls}-title`]: { 'font-weight': 600 },
        [`.${prefixCls}-description`]: { color: t.colorText, 'margin-top': t.marginXS / 2 },
        [`.${prefixCls}-buttons`]: {
          display: 'flex',
          'justify-content': 'flex-end',
          gap: t.marginXS,
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
