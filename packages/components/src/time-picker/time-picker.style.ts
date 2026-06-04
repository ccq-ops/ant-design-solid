import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useTimePickerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['TimePicker', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'relative',
          display: 'inline-block',
          width: '160px',
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
        [`.${prefixCls}-placeholder`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-selection-item`]: {
          color: t.colorText,
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
        [`.${prefixCls}-clear:hover`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-dropdown`]: {
          position: 'absolute',
          'z-index': '1000',
          top: '100%',
          left: '0',
          minWidth: '100%',
          marginTop: `${t.marginXS}px`,
          padding: `${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-shadow': t.boxShadow,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-panel`]: {
          display: 'flex',
          gap: `${t.paddingXS}px`,
        },
        [`.${prefixCls}-column`]: {
          width: '72px',
        },
        [`.${prefixCls}-column-title`]: {
          padding: `${t.paddingXS}px ${t.paddingXS}px`,
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
          'line-height': '1.4',
          'text-transform': 'capitalize',
        },
        [`.${prefixCls}-column-list`]: {
          'max-height': '192px',
          overflow: 'auto',
        },
        [`.${prefixCls}-cell`]: {
          padding: `${t.paddingXS}px ${t.paddingXS}px`,
          'border-radius': `${t.borderRadius}px`,
          cursor: 'pointer',
          'line-height': '1.5',
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-cell:hover`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-cell-selected`]: {
          color: t.colorPrimary,
          background: t.colorFillAlter,
          'font-weight': '600',
        },
        [`.${prefixCls}-cell-disabled`]: {
          color: t.colorTextDisabled,
          background: 'transparent',
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-cell-disabled:hover`]: {
          background: 'transparent',
        },
      }
    },
  )
}
