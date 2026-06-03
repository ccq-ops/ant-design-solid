import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useTimelineStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Timeline', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
          'list-style': 'none',
        },
        [`.${prefixCls}-item`]: {
          position: 'relative',
          display: 'grid',
          'grid-template-columns': '120px 20px 1fr',
          'column-gap': `${t.marginXS}px`,
          'min-height': '48px',
          padding: `0 0 ${t.padding}px`,
        },
        [`.${prefixCls}-item-right`]: {
          'grid-template-columns': '1fr 20px 120px',
        },
        [`.${prefixCls}-item-tail`]: {
          position: 'absolute',
          top: '14px',
          bottom: 0,
          left: '129px',
          borderLeft: `1px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-item-right .${prefixCls}-item-tail`]: {
          left: 'auto',
          right: '129px',
        },
        [`.${prefixCls}-item:last-child .${prefixCls}-item-tail`]: {
          display: 'none',
        },
        [`.${prefixCls}-item-label`]: {
          color: t.colorTextSecondary,
          'text-align': 'end',
        },
        [`.${prefixCls}-item-right .${prefixCls}-item-label`]: {
          'grid-column': 3,
          'grid-row': 1,
          'text-align': 'start',
        },
        [`.${prefixCls}-item-head`]: {
          'grid-column': 2,
          'grid-row': 1,
          display: 'flex',
          'justify-content': 'center',
          'padding-top': '4px',
          'z-index': 1,
        },
        [`.${prefixCls}-item-content`]: {
          'grid-column': 3,
          'grid-row': 1,
          'min-width': 0,
        },
        [`.${prefixCls}-item-right .${prefixCls}-item-content`]: {
          'grid-column': 1,
          'text-align': 'end',
        },
        [`.${prefixCls}-item-dot`]: {
          display: 'inline-flex',
          width: '10px',
          height: '10px',
          'box-sizing': 'border-box',
          'border-radius': '50%',
          border: `2px solid ${t.colorPrimary}`,
          background: t.colorBgContainer,
          'align-items': 'center',
          'justify-content': 'center',
        },
        [`.${prefixCls}-item-dot-blue`]: {
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-item-dot-green`]: {
          'border-color': t.colorSuccess,
        },
        [`.${prefixCls}-item-dot-red`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-item-dot-gray`]: {
          'border-color': t.colorTextDisabled,
        },
        [`.${prefixCls}-item-pending .${prefixCls}-item-dot`]: {
          'border-style': 'dashed',
        },
      }
    },
  )
}
