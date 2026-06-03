import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useInputNumberStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['InputNumber', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          display: 'inline-flex',
          'align-items': 'stretch',
          width: '120px',
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          background: t.colorBgContainer,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          transition: `border-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
          '&:hover': { 'border-color': t.colorPrimaryHover },
        },
        [`.${prefixCls}-focused`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorFillAlter}`,
        },
        [`.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
          '&:hover': { 'border-color': t.colorBorder },
        },
        [`.${prefixCls}-status-error`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-warning`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-input`]: {
          flex: '1 1 auto',
          width: '100%',
          minWidth: 0,
          padding: `${t.paddingXS}px ${t.paddingXS}px`,
          color: 'inherit',
          'font-size': 'inherit',
          'font-family': 'inherit',
          'line-height': String(t.lineHeight),
          background: 'transparent',
          border: 0,
          outline: 0,
          appearance: 'textfield',
        },
        [`.${prefixCls}-input::-webkit-outer-spin-button, .${prefixCls}-input::-webkit-inner-spin-button`]:
          {
            margin: 0,
            appearance: 'none',
          },
        [`.${prefixCls}-controls`]: {
          display: 'inline-flex',
          'flex-direction': 'column',
          width: '22px',
          'border-left': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-handler`]: {
          flex: '1 1 0',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: 0,
          color: t.colorTextSecondary,
          'font-size': '10px',
          'line-height': '1',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          '&:hover': { color: t.colorPrimary },
          '&:disabled': {
            color: t.colorTextDisabled,
            cursor: 'not-allowed',
          },
        },
        [`.${prefixCls}-handler-up`]: {
          'border-bottom': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-sm`]: {
          width: '100px',
          'font-size': `${Math.max(t.fontSize - 2, 12)}px`,
        },
        [`.${prefixCls}-sm .${prefixCls}-input`]: {
          padding: `1px ${t.paddingXS}px`,
        },
        [`.${prefixCls}-lg`]: {
          width: '140px',
          'font-size': `${t.fontSize + 2}px`,
        },
        [`.${prefixCls}-lg .${prefixCls}-input`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
        },
      }
    },
  )
}
