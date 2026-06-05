import { useStyleRegister } from '@ant-design-solid/cssinjs'
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
        [`.${prefixCls}-clear`]: {
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
          marginTop: `${t.marginXS}px`,
          padding: `${t.paddingXS}px 0`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-shadow': t.boxShadow,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-item`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          cursor: 'pointer',
        },
        [`.${prefixCls}-item:hover`]: { background: t.colorFillAlter },
        [`.${prefixCls}-item-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
        [`.${prefixCls}-item-disabled:hover`]: { background: 'transparent' },
      }
    },
  )
}
