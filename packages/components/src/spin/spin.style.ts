import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useSpinStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Spin', prefixCls] }, () => {
    const t = token()
    return {
      '@keyframes adsSpinRotate': {
        to: {
          transform: 'rotate(360deg)',
        },
      },
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorPrimary,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': `${t.lineHeight}`,
        'text-align': 'center',
      },
      [`.${prefixCls}-spinning`]: {
        position: 'static',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'flex-direction': 'column',
        gap: `${t.marginXS}px`,
      },
      [`.${prefixCls}-section`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'flex-direction': 'column',
        gap: `${t.marginXS}px`,
      },
      [`.${prefixCls}-indicator`]: {
        position: 'relative',
        display: 'inline-flex',
        width: '20px',
        height: '20px',
        'align-items': 'center',
        'justify-content': 'center',
      },
      [`.${prefixCls}-dot-holder`]: {
        position: 'absolute',
        inset: 0,
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        transition: `opacity ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-dot-holder-hidden`]: {
        opacity: 0,
      },
      [`.${prefixCls}-dot`]: {
        'box-sizing': 'border-box',
        display: 'inline-block',
        width: '20px',
        height: '20px',
        'border-radius': '50%',
        border: `2px solid ${t.colorBorderSecondary}`,
        'border-top-color': t.colorPrimary,
        animation: `adsSpinRotate ${t.motionDurationMid} linear infinite`,
      },
      [`.${prefixCls}-dot-item-1, .${prefixCls}-dot-item-2, .${prefixCls}-dot-item-3, .${prefixCls}-dot-item-4`]:
        {
          display: 'none',
        },
      [`.${prefixCls}-dot-progress`]: {
        position: 'absolute',
        inset: 0,
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
      },
      [`.${prefixCls}-dot-progress svg`]: {
        width: '100%',
        height: '100%',
        transform: 'rotate(-90deg)',
      },
      [`.${prefixCls}-dot-circle`]: {
        fill: 'none',
        stroke: t.colorPrimary,
        'stroke-linecap': 'round',
        transition: `stroke-dasharray ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-dot-circle-bg`]: {
        stroke: t.colorBorderSecondary,
      },
      [`.${prefixCls}-sm .${prefixCls}-indicator, .${prefixCls}-sm .${prefixCls}-dot`]: {
        width: '14px',
        height: '14px',
        'border-width': '2px',
      },
      [`.${prefixCls}-lg .${prefixCls}-indicator, .${prefixCls}-lg .${prefixCls}-dot`]: {
        width: '32px',
        height: '32px',
        'border-width': '3px',
      },
      [`.${prefixCls}-text, .${prefixCls}-description`]: {
        color: t.colorPrimary,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-nested-loading`]: {
        position: 'relative',
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-container`]: {
        position: 'relative',
        transition: `opacity ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-container[aria-busy="true"]`]: {
        'min-height': '40px',
      },
      [`.${prefixCls}-overlay`]: {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': '4',
        background: 'rgba(255, 255, 255, 0.72)',
        'border-radius': `${t.borderRadius}px`,
      },
      [`.${prefixCls}-fullscreen`]: {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': '1000',
        background: 'rgba(255, 255, 255, 0.72)',
      },
      [`.${prefixCls}-fullscreen .${prefixCls}`]: {
        display: 'inline-flex',
      },
    }
  })
}
