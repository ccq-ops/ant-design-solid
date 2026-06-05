import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useAutoCompleteStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['AutoComplete', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'relative',
          display: 'inline-block',
          width: '180px',
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-selector`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.paddingXS}px`,
          width: '100%',
          height: `${t.controlHeight}px`,
          padding: `0 ${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-open .${prefixCls}-selector`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorFillAlter}`,
        },
        [`.${prefixCls}-small .${prefixCls}-selector`]: {
          height: `${t.controlHeightSM}px`,
        },
        [`.${prefixCls}-large .${prefixCls}-selector`]: {
          height: `${t.controlHeightLG}px`,
        },
        [`.${prefixCls}-status-error .${prefixCls}-selector`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-warning .${prefixCls}-selector`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-borderless .${prefixCls}-selector`]: {
          borderColor: 'transparent',
        },
        [`.${prefixCls}-filled .${prefixCls}-selector`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-underlined .${prefixCls}-selector`]: {
          borderTopColor: 'transparent',
          borderInlineEndColor: 'transparent',
          borderInlineStartColor: 'transparent',
          borderRadius: '0',
        },
        [`.${prefixCls}-disabled .${prefixCls}-selector`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-input`]: {
          flex: '1',
          minWidth: '0',
          border: '0',
          outline: 'none',
          padding: '0',
          background: 'transparent',
          color: 'inherit',
          'font-size': 'inherit',
        },
        [`.${prefixCls}-input:disabled`]: { cursor: 'not-allowed' },
        [`.${prefixCls}-clear`]: {
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
        },
        [`.${prefixCls}-item`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          cursor: 'pointer',
        },
        [`.${prefixCls}-item:hover`]: { background: t.colorFillAlter },
        [`.${prefixCls}-item-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
        [`.${prefixCls}-item-disabled:hover`]: { background: 'transparent' },
        [`.${prefixCls}-empty`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          color: t.colorTextDisabled,
        },
      }
    },
  )
}
