import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useMentionsStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Mentions', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-textarea`]: {
          display: 'block',
          width: '100%',
          minHeight: `${t.controlHeight * 2}px`,
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: 'inherit',
          'font-size': 'inherit',
          'font-family': 'inherit',
          outline: 'none',
          resize: 'vertical',
          'box-sizing': 'border-box',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        },
        [`.${prefixCls}-small .${prefixCls}-textarea`]: {
          minHeight: `${t.controlHeightSM * 2}px`,
          padding: `${Math.max(2, t.paddingXS - 2)}px ${t.paddingSM}px`,
        },
        [`.${prefixCls}-large .${prefixCls}-textarea`]: {
          minHeight: `${t.controlHeightLG * 2}px`,
          padding: `${t.paddingSM}px ${t.padding}px`,
          'font-size': `${t.fontSize + 2}px`,
        },
        [`.${prefixCls}-textarea:focus`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorFillAlter}`,
        },
        [`.${prefixCls}-open .${prefixCls}-textarea`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorFillAlter}`,
        },
        [`.${prefixCls}-disabled .${prefixCls}-textarea`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-status-error .${prefixCls}-textarea`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-warning .${prefixCls}-textarea`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-borderless .${prefixCls}-textarea`]: {
          'border-color': 'transparent',
          'box-shadow': 'none',
        },
        [`.${prefixCls}-filled .${prefixCls}-textarea`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-underlined .${prefixCls}-textarea`]: {
          'border-top': 0,
          'border-inline-start': 0,
          'border-inline-end': 0,
          'border-radius': 0,
        },
        [`.${prefixCls}-clear`]: {
          position: 'absolute',
          top: `${t.paddingXS}px`,
          right: `${t.paddingSM}px`,
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorTextDisabled,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-dropdown`]: {
          marginTop: `${Math.max(2, t.marginXS / 2)}px`,
          padding: '2px 0',
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${Math.max(4, t.borderRadius - 2)}px`,
          background: t.colorBgContainer,
          'box-shadow': t.boxShadow,
          'box-sizing': 'border-box',
          minWidth: '120px',
          overflow: 'auto',
          maxHeight: '256px',
        },
        [`.${prefixCls}-item`]: {
          padding: '2px 8px',
          cursor: 'pointer',
          'font-size': '13px',
          'line-height': '20px',
          'min-height': '24px',
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-item:hover, .${prefixCls}-item-active`]: { background: t.colorFillAlter },
        [`.${prefixCls}-item-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
        [`.${prefixCls}-item-disabled:hover`]: { background: 'transparent' },
        [`.${prefixCls}-empty`]: {
          padding: `${t.paddingSM}px`,
          color: t.colorTextDisabled,
          'text-align': 'center',
        },
        [`.${prefixCls}-count`]: {
          display: 'block',
          color: t.colorTextDisabled,
          'font-size': `${Math.max(12, t.fontSize - 2)}px`,
          'text-align': 'end',
          marginTop: `${t.marginXS}px`,
        },
        [`.${prefixCls}-count-exceed .${prefixCls}-textarea`]: {
          'border-color': t.colorError,
        },
      }
    },
  )
}
