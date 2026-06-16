import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useCalendarStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Calendar', prefixCls] },
    () => {
      const t = token()
      const ct = getComponentToken('Calendar', t)
      return {
        [`.${prefixCls}`]: {
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          background: String(ct?.fullBg ?? t.colorBgContainer),
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-fullscreen`]: {
          width: '100%',
        },
        [`.${prefixCls}-mini`]: {
          width: '320px',
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadiusLG}px`,
        },
        [`.${prefixCls}-header`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.marginXS}px`,
          padding: `${t.paddingSM}px ${t.padding}px`,
          'border-bottom': `${t.lineWidth}px solid ${t.colorSplit}`,
          background: String(ct?.fullPanelBg ?? t.colorBgContainer),
        },
        [`.${prefixCls}-title`]: {
          'font-weight': '600',
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
        },
        [`.${prefixCls}-header-actions`]: {
          display: 'inline-flex',
          gap: `${t.marginXS}px`,
          'align-items': 'center',
          'flex-shrink': 0,
        },
        [`.${prefixCls}-mini .${prefixCls}-header`]: {
          gap: `${t.marginXXS}px`,
          padding: `${t.paddingXS}px`,
        },
        [`.${prefixCls}-mini .${prefixCls}-header-actions`]: {
          gap: `${t.marginXXS}px`,
        },
        [`.${prefixCls}-button`]: {
          height: '28px',
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-button:hover`]: {
          color: t.colorPrimary,
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-button-active`]: {
          color: t.colorBgContainer,
          background: t.colorPrimary,
          'border-color': t.colorPrimary,
        },
        [`.${prefixCls}-body`]: {
          padding: `${t.paddingSM}px`,
          background: String(ct?.fullBg ?? t.colorBgContainer),
        },
        [`.${prefixCls}-mini .${prefixCls}-body`]: {
          'min-height': `${ct?.miniContentHeight ?? 256}px`,
          padding: `${t.paddingXS}px`,
        },
        [`.${prefixCls}-weekdays`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          'margin-bottom': `${t.marginXS}px`,
        },
        [`.${prefixCls}-weekdays-show-week`]: {
          'grid-template-columns': '48px repeat(7, 1fr)',
        },
        [`.${prefixCls}-weekday`]: {
          color: t.colorTextSecondary,
          'text-align': 'center',
          'line-height': '28px',
        },
        [`.${prefixCls}-date-grid`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-date-grid-show-week`]: {
          'grid-template-columns': '48px repeat(7, 1fr)',
        },
        [`.${prefixCls}-year-grid`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(3, 1fr)',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-cell`]: {
          minHeight: '64px',
          width: '100%',
          padding: `${t.paddingXS}px`,
          border: `${t.lineWidth}px solid transparent`,
          'border-radius': `${t.borderRadius}px`,
          background: 'transparent',
          color: t.colorText,
          cursor: 'pointer',
          'text-align': 'left',
          'font-size': `${t.fontSize}px`,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-week-number`]: {
          minHeight: '64px',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          color: t.colorTextSecondary,
          'font-size': `${t.fontSizeSM}px`,
        },
        [`.${prefixCls}-mini .${prefixCls}-cell`]: {
          minHeight: '38px',
          padding: `${t.paddingXXS}px`,
          'text-align': 'center',
          overflow: 'hidden',
          'overflow-wrap': 'anywhere',
        },
        [`.${prefixCls}-mini .${prefixCls}-date-grid`]: {
          gap: `${t.marginXXS}px`,
        },
        [`.${prefixCls}-mini .${prefixCls}-year-grid`]: {
          gap: `${t.marginXXS}px`,
        },
        [`.${prefixCls}-mini .${prefixCls}-weekdays`]: {
          'margin-bottom': `${t.marginXXS}px`,
        },
        [`.${prefixCls}-cell:hover`]: {
          background: t.controlItemBgHover,
        },
        [`.${prefixCls}-cell-selected`]: {
          border: `${t.lineWidth}px solid ${t.colorPrimary}`,
          background: String(ct?.itemActiveBg ?? t.colorPrimaryBg),
        },
        [`.${prefixCls}-cell-today`]: {
          color: t.colorPrimary,
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
        [`.${prefixCls}-cell-outside`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-date-value`]: {
          display: 'block',
          'line-height': '20px',
        },
        [`.${prefixCls}-month-value`]: {
          display: 'block',
          'line-height': '20px',
        },
        [`.${prefixCls}-cell-content`]: {
          'margin-top': `${t.marginXS}px`,
          color: t.colorTextSecondary,
          'font-size': `${Math.max(t.fontSize - 2, 10)}px`,
        },
      }
    },
  )
}
