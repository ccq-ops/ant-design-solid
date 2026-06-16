import { getComponentToken } from '@solid-ant-design/theme'
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useFloatButtonStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['FloatButton', prefixCls] },
    () => {
      const t = token()
      const floatButton = getComponentToken('FloatButton', t)
      const size = `${floatButton.size}px`
      const gap = `${t.paddingXXS / 2}px`
      const offsetCircle = `${(t.controlHeight / 2) * ((Math.SQRT2 - 1) / Math.SQRT2)}px`
      const offsetSquare = `${t.borderRadius * ((Math.SQRT2 - 1) / Math.SQRT2)}px`
      const groupPrefixCls = `${prefixCls}-group`
      const listPrefixCls = `${groupPrefixCls}-list`

      return {
        [`.${prefixCls}`]: {
          position: 'fixed',
          right: `${floatButton.insetInlineEnd}px`,
          bottom: `${floatButton.insetBlockEnd}px`,
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'flex-direction': 'column',
          gap,
          width: size,
          'min-height': size,
          height: 'auto',
          margin: 0,
          padding: `${t.paddingXXS}px 0`,
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
          'word-break': 'break-word',
          'white-space': 'normal',
          'z-index': t.zIndexPopupBase,
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
          '&:empty': {
            display: 'none',
          },
          '&:hover': {
            color: t.colorPrimary,
            'box-shadow': t.boxShadow,
          },
          '&:focus-visible': {
            outline: `${t.lineWidth * 2}px solid ${t.colorPrimaryHover}`,
            'outline-offset': `${t.marginXS}px`,
          },
        },
        [`.${prefixCls}.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorBgContainerDisabled,
          cursor: 'not-allowed',
          '&:hover': {
            color: t.colorTextDisabled,
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
        [`.${prefixCls}:not(.${prefixCls}-individual)`]: {
          position: 'relative',
          right: 'auto',
          bottom: 'auto',
          'z-index': 'auto',
          'box-shadow': 'none',
        },
        [`.${prefixCls}-icon`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'font-size': `${t.fontSize + 2}px`,
          'line-height': 1,
        },
        [`.${prefixCls}-icon-only .${prefixCls}-icon`]: {
          'font-size': `${floatButton.iconSize}px`,
        },
        [`.${prefixCls}-content`]: {
          'font-size': `${t.fontSizeSM}px`,
          'text-align': 'center',
        },
        [`.${prefixCls}.${prefixCls} .${prefixCls}-badge`]: {
          position: 'absolute',
          top: 0,
          right: 0,
        },
        [`.${prefixCls}.${prefixCls} .${prefixCls}-badge:not(.${prefixCls}-badge-dot)`]: {
          transform: 'translate(50%, -50%)',
        },
        [`.${prefixCls}-circle .${prefixCls}-badge`]: {
          'margin-top': offsetCircle,
          'margin-right': offsetCircle,
        },
        [`.${prefixCls}-square .${prefixCls}-badge-dot`]: {
          'margin-top': offsetSquare,
          'margin-right': offsetSquare,
        },
        [`.${groupPrefixCls}`]: {
          position: 'fixed',
          right: `${floatButton.insetInlineEnd}px`,
          bottom: `${floatButton.insetBlockEnd}px`,
          display: 'inline-flex',
          'flex-direction': 'column',
          gap: `${t.padding}px`,
          'z-index': t.zIndexPopupBase,
        },
        [`.${groupPrefixCls} .${prefixCls}`]: {
          position: 'relative',
          right: 'auto',
          bottom: 'auto',
        },
        [`.${listPrefixCls}`]: {
          display: 'inline-flex',
          'flex-direction': 'column',
          gap: `${t.padding}px`,
          'border-radius': `${t.borderRadiusLG}px`,
        },
        [`.${groupPrefixCls}:not(.${groupPrefixCls}-individual) .${listPrefixCls}`]: {
          gap: 0,
          'box-shadow': t.boxShadow,
        },
        [`.${groupPrefixCls}-menu-mode .${listPrefixCls}`]: {
          position: 'absolute',
        },
        [`.${groupPrefixCls}-top .${listPrefixCls}`]: {
          bottom: `calc(${size} + ${t.padding}px)`,
        },
        [`.${groupPrefixCls}-bottom .${listPrefixCls}`]: {
          top: `calc(${size} + ${t.padding}px)`,
        },
        [`.${groupPrefixCls}-left`]: {
          'flex-direction': 'row',
        },
        [`.${groupPrefixCls}-left .${listPrefixCls}`]: {
          right: `calc(${size} + ${t.padding}px)`,
          'flex-direction': 'row',
        },
        [`.${groupPrefixCls}-right`]: {
          'flex-direction': 'row',
        },
        [`.${groupPrefixCls}-right .${listPrefixCls}`]: {
          left: `calc(${size} + ${t.padding}px)`,
          'flex-direction': 'row',
        },
      }
    },
  )
}
