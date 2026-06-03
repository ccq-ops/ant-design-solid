import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useFloatButtonStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['FloatButton', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'fixed',
          right: `${t.marginLG}px`,
          bottom: `${t.marginLG}px`,
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'flex-direction': 'column',
          gap: `${t.marginXS}px`,
          width: `${t.controlHeightLG + t.paddingSM}px`,
          height: `${t.controlHeightLG + t.paddingSM}px`,
          padding: `${t.paddingXS}px`,
          color: t.colorText,
          background: t.colorBgElevated,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': '50%',
          'box-shadow': t.boxShadow,
          cursor: 'pointer',
          'text-decoration': 'none',
          'font-family': t.fontFamily,
          'font-size': `${t.fontSize}px`,
          'line-height': '1.2',
          'z-index': 100,
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
          '&:hover': {
            color: t.colorPrimary,
            'box-shadow': t.boxShadow,
          },
          '&:focus-visible': {
            outline: `${t.lineWidth * 2}px solid ${t.colorPrimaryHover}`,
            'outline-offset': `${t.marginXS}px`,
          },
        },
        [`.${prefixCls}-primary`]: {
          color: '#fff',
          background: t.colorPrimary,
          border: `${t.lineWidth}px solid ${t.colorPrimary}`,
          '&:hover': {
            color: '#fff',
            background: t.colorPrimaryHover,
          },
        },
        [`.${prefixCls}-square`]: {
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-icon`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'font-size': `${t.fontSize + 2}px`,
        },
        [`.${prefixCls}-description`]: {
          'font-size': `${t.fontSize - 2}px`,
          'text-align': 'center',
        },
        [`.${prefixCls}-group`]: {
          position: 'fixed',
          right: `${t.marginLG}px`,
          bottom: `${t.marginLG}px`,
          display: 'inline-flex',
          'flex-direction': 'column',
          gap: `${t.marginXS}px`,
          'z-index': 100,
        },
        [`.${prefixCls}-group .${prefixCls}`]: {
          position: 'static',
          right: 'auto',
          bottom: 'auto',
        },
      }
    },
  )
}
