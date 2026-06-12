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
        [`.${prefixCls}-selection-overflow`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${Math.max(2, Math.floor(t.paddingXS / 2))}px`,
          'min-width': '0',
          flex: '1',
        },
        [`.${prefixCls}-tag`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${Math.max(2, Math.floor(t.paddingXS / 2))}px`,
          height: `${Math.max(20, t.controlHeightSM - 4)}px`,
          padding: `0 ${Math.max(2, Math.floor(t.paddingXS / 2))}px`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorFillAlter,
          'line-height': '1',
        },
        [`.${prefixCls}-tag-label`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'min-width': '0',
        },
        [`.${prefixCls}-tag-close`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: '14px',
          height: '14px',
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorTextSecondary,
          cursor: 'pointer',
          'font-size': '10px',
          'line-height': '1',
        },
        [`.${prefixCls}-tag-close svg`]: {
          width: '10px',
          height: '10px',
        },
        [`.${prefixCls}-suffix`]: {
          position: 'relative',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: '16px',
          height: '16px',
          flex: 'none',
          color: t.colorTextSecondary,
          'line-height': '1',
        },
        [`.${prefixCls}-arrow, .${prefixCls}-clear`]: {
          position: 'absolute',
          inset: '0',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: '16px',
          height: '16px',
          'line-height': '1',
          transition: 'opacity 0.2s ease',
        },
        [`.${prefixCls}-arrow`]: {
          color: t.colorTextSecondary,
          opacity: '1',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-clear`]: {
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorTextDisabled,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          opacity: '0',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-clear svg`]: {
          width: '1em',
          height: '1em',
        },
        [`.${prefixCls}-has-clear:hover .${prefixCls}-arrow, .${prefixCls}-has-clear .${prefixCls}-selector:focus-within .${prefixCls}-arrow`]:
          {
            opacity: '0',
          },
        [`.${prefixCls}-has-clear:hover .${prefixCls}-clear, .${prefixCls}-has-clear .${prefixCls}-selector:focus-within .${prefixCls}-clear`]:
          {
            opacity: '1',
            'pointer-events': 'auto',
          },
        [`.${prefixCls}-disabled .${prefixCls}-clear`]: {
          cursor: 'not-allowed',
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
