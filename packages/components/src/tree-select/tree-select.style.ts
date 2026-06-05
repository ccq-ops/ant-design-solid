import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useTreeSelectStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['TreeSelect', prefixCls] },
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
        [`.${prefixCls}-dropdown`]: {
          left: '0',
          right: '0',
          marginTop: `${t.marginXS}px`,
          padding: `${t.paddingXS}px 0`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-shadow': t.boxShadow,
        },
        [`.${prefixCls}-tree`]: { margin: '0', padding: '0', 'list-style': 'none' },
        [`.${prefixCls}-tree-node`]: {
          display: 'flex',
          'align-items': 'center',
          gap: `${t.paddingXS}px`,
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          cursor: 'pointer',
        },
        [`.${prefixCls}-tree-node:hover`]: { background: t.colorFillAlter },
        [`.${prefixCls}-tree-node-selected`]: {
          color: t.colorPrimary,
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-tree-node-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
        [`.${prefixCls}-tree-node-disabled:hover`]: { background: 'transparent' },
        [`.${prefixCls}-expand`]: {
          border: '0',
          padding: '0',
          width: '16px',
          background: 'transparent',
          cursor: 'pointer',
        },
        [`.${prefixCls}-indent`]: { display: 'inline-block' },
      }
    },
  )
}
