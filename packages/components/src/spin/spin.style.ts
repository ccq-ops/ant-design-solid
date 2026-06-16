import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

function toThemeMaskBackground(color: string, alpha = 0.72) {
  const hexMatch = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim())
  if (!hexMatch) return color

  const raw = hexMatch[1]
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : raw
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${r},${g},${b},${alpha})`
}

export function useSpinStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Spin', prefixCls] }, () => {
    const t = token()
    const maskBackground = toThemeMaskBackground(t.colorBgContainer)
    return {
      '@keyframes adsSpinRotate': {
        to: {
          transform: 'rotate(405deg)',
        },
      },
      '@keyframes adsSpinMove': {
        to: {
          opacity: 1,
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
        position: 'relative',
        transform: 'rotate(45deg)',
        animation: 'adsSpinRotate 1.2s linear infinite',
      },
      [`.${prefixCls}-dot-item`]: {
        position: 'absolute',
        display: 'block',
        width: '9px',
        height: '9px',
        'border-radius': '50%',
        background: t.colorPrimary,
        transform: 'scale(0.75)',
        opacity: 0.3,
        animation: 'adsSpinMove 1s linear infinite alternate',
      },
      [`.${prefixCls}-dot-item-1`]: {
        top: 0,
        left: 0,
        'animation-delay': '0s',
      },
      [`.${prefixCls}-dot-item-2`]: {
        top: 0,
        right: 0,
        'animation-delay': '0.4s',
      },
      [`.${prefixCls}-dot-item-3`]: {
        right: 0,
        bottom: 0,
        'animation-delay': '0.8s',
      },
      [`.${prefixCls}-dot-item-4`]: {
        bottom: 0,
        left: 0,
        'animation-delay': '1.2s',
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
      },
      [`.${prefixCls}-sm .${prefixCls}-dot-item`]: {
        width: '6px',
        height: '6px',
      },
      [`.${prefixCls}-lg .${prefixCls}-indicator, .${prefixCls}-lg .${prefixCls}-dot`]: {
        width: '32px',
        height: '32px',
      },
      [`.${prefixCls}-lg .${prefixCls}-dot-item`]: {
        width: '14px',
        height: '14px',
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
        background: maskBackground,
        'border-radius': `${t.borderRadius}px`,
      },
      [`.${prefixCls}-fullscreen`]: {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': '1000',
        background: maskBackground,
      },
      [`.${prefixCls}-fullscreen .${prefixCls}`]: {
        display: 'inline-flex',
      },
    }
  })
}
