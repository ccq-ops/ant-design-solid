import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTourStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tour', prefixCls] }, () => {
    const t = token()
    const tt = getComponentToken('Tour', t)
    return {
      [`.${prefixCls}-root`]: {
        position: 'relative',
        'z-index': tt.zIndex,
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
      [`.${prefixCls}-inner`]: {
        position: 'relative',
        padding: `${tt.padding}px`,
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
      [`.${prefixCls}-btn`]: {
        height: t.controlHeightSM,
        padding: `0 ${t.paddingSM}px`,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        background: t.colorBgContainer,
        color: t.colorText,
        'border-radius': t.borderRadius,
        cursor: 'pointer',
      },
      [`.${prefixCls}-primary-btn`]: {
        border: `${t.lineWidth}px solid ${t.colorPrimary}`,
        background: t.colorPrimary,
        color: '#fff',
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
