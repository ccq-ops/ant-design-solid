import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useCascaderStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Cascader', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'relative',
          display: 'inline-block',
          width: '200px',
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-selector`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.paddingXS}px`,
          width: '100%',
          height: `${t.controlHeight}px`,
          padding: `0 ${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          cursor: 'pointer',
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-open .${prefixCls}-selector`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorFillAlter}`,
        },
        [`.${prefixCls}-disabled .${prefixCls}-selector`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-placeholder`]: { color: t.colorTextDisabled },
        [`.${prefixCls}-selection-item`]: {
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-clear`]: {
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorTextDisabled,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-clear:hover`]: { color: t.colorText },
        [`.${prefixCls}-dropdown`]: {
          position: 'absolute',
          'z-index': '1000',
          top: '100%',
          left: '0',
          display: 'inline-flex',
          marginTop: `${t.marginXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-shadow': '0 6px 16px rgba(0, 0, 0, 0.08)',
        },
        [`.${prefixCls}-menu`]: {
          minWidth: '120px',
          minHeight: '120px',
          margin: '0',
          padding: `${t.paddingXS}px 0`,
          'list-style': 'none',
          'border-inline-end': `${t.lineWidth}px solid ${t.colorBorder}`,
        },
        [`.${prefixCls}-menu:last-child`]: { 'border-inline-end': '0' },
        [`.${prefixCls}-menu-item`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.paddingSM}px`,
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          cursor: 'pointer',
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-menu-item:hover`]: { background: t.colorFillAlter },
        [`.${prefixCls}-menu-item-selected`]: {
          color: t.colorPrimary,
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-menu-item-active`]: { background: t.colorFillAlter },
        [`.${prefixCls}-menu-item-disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-menu-item-disabled:hover`]: { background: 'transparent' },
        [`.${prefixCls}-menu-item-expand-icon`]: {
          color: t.colorTextDisabled,
          'font-size': `${t.fontSize}px`,
        },
      }
    },
  )
}
