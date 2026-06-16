import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

function toThemeMaskBackground(color: string, alpha = 0.88) {
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

export function useQRCodeStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['QRCode', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        position: 'relative',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        padding: `${t.paddingXS}px`,
        'border-radius': `${t.borderRadius}px`,
        overflow: 'hidden',
      },
      [`.${prefixCls}-bordered`]: {
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-svg`]: {
        display: 'block',
      },
      [`.${prefixCls}-status`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        background: toThemeMaskBackground(t.colorBgContainer),
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'text-align': 'center',
      },
    }
  })
}
