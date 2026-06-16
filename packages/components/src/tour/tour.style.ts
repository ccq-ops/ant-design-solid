import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useTourStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tour', prefixCls] }, () => {
    const t = token()
    const tt = getComponentToken('Tour', t)
    return {
      [`.${prefixCls}-root`]: {
        position: 'relative',
      },
      [`.${prefixCls}-mask`]: {
        position: 'fixed',
        inset: 0,
        background: tt.maskBg,
      },
      [`.${prefixCls}-mask-target`]: {
        position: 'fixed',
        'box-shadow': `0 0 0 9999px ${tt.maskBg}`,
        'border-radius': tt.targetBorderRadius,
        'pointer-events': 'none',
      },
      [`.${prefixCls}`]: {
        position: 'fixed',
        width: tt.width,
        color: t.colorText,
        background: tt.bg,
        'border-radius': tt.borderRadius,
        'box-shadow': tt.boxShadow,
        outline: 0,
      },
      [`.${prefixCls}-primary`]: {
        color: '#fff',
        background: t.colorPrimary,
      },
      [`.${prefixCls}-primary .${prefixCls}-title`]: {
        color: '#fff',
      },
      [`.${prefixCls}-primary .${prefixCls}-description`]: {
        color: 'rgba(255, 255, 255, 0.85)',
      },
      [`.${prefixCls}-primary .${prefixCls}-indicators`]: {
        color: 'rgba(255, 255, 255, 0.75)',
      },
      [`.${prefixCls}-primary .${prefixCls}-close`]: {
        color: 'rgba(255, 255, 255, 0.85)',
      },
      [`.${prefixCls}-inner`]: {
        position: 'relative',
        padding: `${tt.padding}px`,
      },
      [`.${prefixCls}-cover`]: {
        'margin-bottom': t.margin,
      },
      [`.${prefixCls}-cover img, .${prefixCls}-cover video`]: {
        display: 'block',
        width: '100%',
        'border-radius': t.borderRadius,
      },
      [`.${prefixCls}-close`]: {
        position: 'absolute',
        top: t.paddingSM,
        right: t.paddingSM,
        border: 0,
        background: 'transparent',
        color: t.colorTextSecondary,
        cursor: 'pointer',
        'font-size': t.fontSize + 4,
        'line-height': 1,
      },
      [`.${prefixCls}-title`]: {
        'padding-right': t.paddingLG,
        color: t.colorText,
        'font-size': t.fontSize + 2,
        'font-weight': 600,
      },
      [`.${prefixCls}-description`]: {
        'margin-top': t.marginSM,
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-footer`]: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        gap: t.marginSM,
        'margin-top': t.margin,
      },
      [`.${prefixCls}-indicators`]: {
        color: t.colorTextSecondary,
        'font-size': t.fontSize - 1,
      },
      [`.${prefixCls}-buttons`]: {
        display: 'flex',
        gap: t.marginSM,
      },
      [`.${prefixCls}-arrow`]: {
        position: 'absolute',
        width: 10,
        height: 10,
        background: tt.bg,
        transform: 'rotate(45deg)',
      },
      [`.${prefixCls}-top .${prefixCls}-arrow`]: {
        bottom: -5,
        left: '50%',
        'margin-left': -5,
      },
      [`.${prefixCls}-bottom .${prefixCls}-arrow`]: {
        top: -5,
        left: '50%',
        'margin-left': -5,
      },
      [`.${prefixCls}-left .${prefixCls}-arrow`]: {
        right: -5,
        top: '50%',
        'margin-top': -5,
      },
      [`.${prefixCls}-right .${prefixCls}-arrow`]: {
        left: -5,
        top: '50%',
        'margin-top': -5,
      },
    }
  })
}
