import { useStyleRegister } from '@solid-ant-design/cssinjs'
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
        [`.${prefixCls}-range`]: {
          width: '240px',
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
        [`.${prefixCls}-input`]: {
          position: 'absolute',
          width: '1px',
          height: '1px',
          margin: '-1px',
          padding: '0',
          border: '0',
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-placeholder`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-selection-item`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-range .${prefixCls}-placeholder, .${prefixCls}-range .${prefixCls}-selection-item`]:
          {
            flex: '1 1 0',
            minWidth: '0',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
          },
        [`.${prefixCls}-range-separator`]: {
          flex: '0 0 auto',
          color: t.colorText,
        },
        [`.${prefixCls}-icon-stack`]: {
          position: 'relative',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          flex: '0 0 1em',
          width: '1em',
          height: '1em',
          color: t.colorTextSecondary,
        },
        [`.${prefixCls}-icon-stack .${prefixCls}-suffix`]: {
          position: 'absolute',
          inset: '0',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: 'inherit',
          transition: 'opacity 0.2s',
        },
        [`.${prefixCls}-clear`]: {
          position: 'absolute',
          inset: '0',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorTextDisabled,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
          opacity: '0',
          'pointer-events': 'none',
          transition: 'opacity 0.2s, color 0.2s',
        },
        [`.${prefixCls}-selector:hover .${prefixCls}-clear, .${prefixCls}-selector:focus-within .${prefixCls}-clear`]:
          {
            opacity: '1',
            'pointer-events': 'auto',
          },
        [`.${prefixCls}-selector:hover .${prefixCls}-icon-stack-has-clear .${prefixCls}-suffix, .${prefixCls}-selector:focus-within .${prefixCls}-icon-stack-has-clear .${prefixCls}-suffix`]:
          {
            opacity: '0',
          },
        [`.${prefixCls}-clear:hover`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-dropdown`]: {
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
        [`.${prefixCls}-footer`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.paddingXS}px`,
          margin: `${t.marginXS}px -${t.paddingXS}px -${t.paddingXS}px`,
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          'border-top': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-now-btn`]: {
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorPrimary,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': `${t.lineHeight}`,
        },
        [`.${prefixCls}-ok-btn`]: {
          minWidth: '32px',
          height: '24px',
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorPrimary}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorPrimary,
          color: '#fff',
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
      }
    },
  )
}
