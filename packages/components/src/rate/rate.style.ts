import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useRateStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Rate', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        display: 'inline-flex',
        gap: `${t.marginXS}px`,
        margin: 0,
        padding: 0,
        color: t.colorWarning,
        'font-size': `${t.fontSize + 6}px`,
        'font-family': t.fontFamily,
        'line-height': '1',
        outline: 'none',
      },
      [`.${prefixCls}-small`]: {
        'font-size': `${t.fontSize + 2}px`,
      },
      [`.${prefixCls}-large`]: {
        'font-size': `${t.fontSize + 10}px`,
      },
      [`.${prefixCls}:focus-visible`]: {
        'border-radius': t.borderRadius,
        'box-shadow': `0 0 0 2px ${t.colorPrimaryHover}`,
      },
      [`.${prefixCls}-item:focus-visible`]: {
        'border-radius': t.borderRadius,
        'box-shadow': `0 0 0 2px ${t.colorPrimaryHover}`,
        outline: 'none',
      },
      [`.${prefixCls}-disabled`]: {
        cursor: 'not-allowed',
        opacity: '0.65',
      },
      [`.${prefixCls}-item`]: {
        position: 'relative',
        display: 'inline-flex',
        'align-items': 'center',
        padding: 0,
        border: 0,
        color: t.colorTextDisabled,
        background: 'transparent',
        cursor: 'pointer',
        font: 'inherit',
        'line-height': '1',
        transition: `transform ${t.motionDurationFast} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-item:hover`]: {
        transform: 'scale(1.08)',
      },
      [`.${prefixCls}-disabled .${prefixCls}-item`]: {
        cursor: 'not-allowed',
        transform: 'none',
      },
      [`.${prefixCls}-item-full`]: {
        color: 'inherit',
      },
      [`.${prefixCls}-item-half .${prefixCls}-item-first`]: {
        color: 'inherit',
      },
      [`.${prefixCls}-item-zero`]: {
        color: t.colorTextDisabled,
      },
      [`.${prefixCls}-item-first`]: {
        position: 'absolute',
        inset: 0,
        width: '50%',
        overflow: 'hidden',
        color: 'transparent',
        'pointer-events': 'none',
      },
      [`.${prefixCls}-item-second`]: {
        color: 'inherit',
      },
      [`.${prefixCls}-item-zero .${prefixCls}-item-second`]: {
        color: t.colorTextDisabled,
      },
      [`.${prefixCls}-item-half .${prefixCls}-item-second`]: {
        color: t.colorTextDisabled,
      },
    }
  })
}
