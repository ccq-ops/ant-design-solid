import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useDatePickerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['DatePicker', prefixCls] },
    () => {
      const t = token()
      const dp = getComponentToken('DatePicker', t)
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
          width: '260px',
        },
        [`.${prefixCls}-range .${prefixCls}-selector`]: {
          'justify-content': 'flex-start',
        },
        [`.${prefixCls}-range-input`]: {
          'text-align': 'center',
        },
        [`.${prefixCls}-range-separator`]: {
          display: 'inline-flex',
          'align-items': 'center',
          color: t.colorTextSecondary,
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-selector`]: {
          position: 'relative',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.paddingXS}px`,
          width: '100%',
          height: `${t.controlHeight}px`,
          padding: `${dp.paddingBlock}px ${dp.paddingInline}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: dp.activeBg,
          cursor: 'pointer',
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-sm .${prefixCls}-selector`]: {
          height: `${t.controlHeightSM}px`,
          padding: `${dp.paddingBlockSM}px ${dp.paddingInlineSM}px`,
        },
        [`.${prefixCls}-md .${prefixCls}-selector`]: {
          height: `${t.controlHeight}px`,
          padding: `${dp.paddingBlock}px ${dp.paddingInline}px`,
        },
        [`.${prefixCls}-lg .${prefixCls}-selector`]: {
          height: `${t.controlHeightLG}px`,
          padding: `${dp.paddingBlockLG}px ${dp.paddingInlineLG}px`,
          'font-size': `${dp.inputFontSizeLG}px`,
        },
        [`.${prefixCls}-status-error .${prefixCls}-selector`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-warning .${prefixCls}-selector`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-borderless .${prefixCls}-selector`]: {
          borderColor: 'transparent',
          'box-shadow': 'none',
        },
        [`.${prefixCls}-filled .${prefixCls}-selector`]: {
          background: dp.addonBg,
        },
        [`.${prefixCls}-filled .${prefixCls}-clear-overlay`]: {
          background: dp.addonBg,
        },
        [`.${prefixCls}-underlined .${prefixCls}-selector`]: {
          'border-top-color': 'transparent',
          'border-left-color': 'transparent',
          'border-right-color': 'transparent',
          'border-radius': '0',
        },
        [`.${prefixCls}-open .${prefixCls}-selector`]: {
          'border-color': dp.activeBorderColor,
          'box-shadow': dp.activeShadow,
        },
        [`.${prefixCls}-disabled .${prefixCls}-selector`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-disabled .${prefixCls}-clear-overlay`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-multiple .${prefixCls}-selector`]: {
          height: 'auto',
          'min-height': `${t.controlHeight}px`,
          'justify-content': 'flex-start',
          'flex-wrap': 'wrap',
          padding: `${dp.paddingBlock}px ${dp.paddingInline}px`,
          'padding-right': `${dp.paddingInline + t.controlHeightSM}px`,
        },
        [`.${prefixCls}-multiple.${prefixCls}-sm .${prefixCls}-selector`]: {
          'padding-right': `${dp.paddingInlineSM + t.controlHeightSM}px`,
        },
        [`.${prefixCls}-multiple.${prefixCls}-lg .${prefixCls}-selector`]: {
          'padding-right': `${dp.paddingInlineLG + t.controlHeightSM}px`,
        },
        [`.${prefixCls}-multiple .${prefixCls}-input`]: {
          flex: '0 1 24px',
          width: '24px',
        },
        [`.${prefixCls}-multiple .${prefixCls}-input-empty`]: {
          flex: '1 1 auto',
          width: 'auto',
        },
        [`.${prefixCls}-multiple .${prefixCls}-suffix`]: {
          position: 'absolute',
          insetInlineEnd: `${dp.paddingInline}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        },
        [`.${prefixCls}-multiple.${prefixCls}-sm .${prefixCls}-suffix`]: {
          insetInlineEnd: `${dp.paddingInlineSM}px`,
        },
        [`.${prefixCls}-multiple.${prefixCls}-lg .${prefixCls}-suffix`]: {
          insetInlineEnd: `${dp.paddingInlineLG}px`,
        },
        [`.${prefixCls}-multiple-tags`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'flex-wrap': 'wrap',
          gap: `${t.marginXS}px`,
          'max-width': '100%',
        },
        [`.${prefixCls}-multiple-tag`]: {
          border: `${t.lineWidth}px solid ${dp.multipleItemBorderColor}`,
          'border-radius': `${t.borderRadius}px`,
          padding: `0 ${t.paddingXS}px`,
          background: dp.multipleItemBg,
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          height: `${dp.multipleItemHeight}px`,
          'line-height': `${dp.multipleItemHeight}px`,
        },
        [`.${prefixCls}-multiple-tag:hover`]: {
          borderColor: t.colorBorder,
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-input`]: {
          flex: '1 1 auto',
          minWidth: '0',
          border: '0',
          outline: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorText,
          'font-size': `${dp.inputFontSize}px`,
          'font-family': t.fontFamily,
          cursor: 'inherit',
        },
        [`.${prefixCls}-input::placeholder`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-input:disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-prefix`]: {
          display: 'inline-flex',
          'align-items': 'center',
          color: t.colorTextSecondary,
        },
        [`.${prefixCls}-suffix`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          flex: '0 0 16px',
          width: '16px',
          height: '16px',
          color: t.colorTextSecondary,
          'line-height': '1',
        },
        [`.${prefixCls}-placeholder`]: {
          color: t.colorTextDisabled,
        },
        [`.${prefixCls}-selection-item`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-clear`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: '16px',
          height: '16px',
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorTextDisabled,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-clear-overlay`]: {
          position: 'absolute',
          insetInlineEnd: `${dp.paddingInline}px`,
          top: '50%',
          'z-index': 1,
          transform: 'translateY(-50%)',
          background: dp.activeBg,
          opacity: 0,
          'pointer-events': 'none',
          transition: `opacity ${t.motionDurationMid} ${t.motionEaseInOut}, color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-selector:hover .${prefixCls}-clear-overlay, .${prefixCls}-selector:focus-within .${prefixCls}-clear-overlay`]:
          {
            opacity: 1,
            'pointer-events': 'auto',
          },
        [`.${prefixCls}-sm .${prefixCls}-clear-overlay`]: {
          insetInlineEnd: `${dp.paddingInlineSM}px`,
        },
        [`.${prefixCls}-lg .${prefixCls}-clear-overlay`]: {
          insetInlineEnd: `${dp.paddingInlineLG}px`,
        },
        [`.${prefixCls}-week-cell:not(.${prefixCls}-cell-selected):not(.${prefixCls}-cell-disabled)`]:
          {
            color: t.colorText,
          },
        [`.${prefixCls}-clear:hover`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-dropdown`]: {
          width: '280px',
          marginTop: `${t.marginXS}px`,
          padding: `${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-shadow': t.boxShadow,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-dropdown-with-time`]: {
          width: 'auto',
        },
        [`.${prefixCls}-panel-body`]: {
          display: 'flex',
        },
        [`.${prefixCls}-panel-date`]: {
          flex: '1 1 auto',
          width: '100%',
        },
        [`.${prefixCls}-presets`]: {
          display: 'flex',
          'flex-wrap': 'wrap',
          gap: `${t.marginXS}px`,
          'margin-bottom': `${t.marginSM}px`,
          'padding-bottom': `${t.paddingXS}px`,
          borderBottom: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'min-width': `${dp.presetsWidth}px`,
        },
        [`.${prefixCls}-preset`]: {
          border: '0',
          'border-radius': `${t.borderRadius}px`,
          padding: `0 ${t.paddingXS}px`,
          height: `${t.controlHeightSM}px`,
          background: 'transparent',
          color: t.colorPrimary,
          cursor: 'pointer',
        },
        [`.${prefixCls}-preset:hover`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-header`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          'margin-bottom': `${t.marginXS}px`,
        },
        [`.${prefixCls}-month-label`]: {
          'font-weight': '600',
          'line-height': '1.5',
        },
        [`.${prefixCls}-month-button`]: {
          width: '28px',
          height: '28px',
          border: '0',
          'border-radius': `${t.borderRadius}px`,
          background: 'transparent',
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-month-button:hover`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-weekdays`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          gap: `${t.marginXXS}px`,
          'margin-bottom': `${t.marginXS}px`,
        },
        [`.${prefixCls}-weekdays-with-week`]: {
          gap: `${t.marginXXS}px`,
          'grid-template-columns': `52px repeat(7, ${dp.cellHeight}px)`,
        },
        [`.${prefixCls}-week-column-header`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
        },
        [`.${prefixCls}-weekday`]: {
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
          'line-height': '28px',
          'text-align': 'center',
        },
        [`.${prefixCls}-grid`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(7, 1fr)',
          gap: `${t.marginXXS}px`,
        },
        [`.${prefixCls}-grid .${prefixCls}-cell`]: {
          width: '100%',
        },
        [`.${prefixCls}-week-grid`]: {
          display: 'block',
        },
        [`.${prefixCls}-week-rows`]: {
          display: 'flex',
          'flex-direction': 'column',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-week-row`]: {
          display: 'grid',
          'grid-template-columns': `52px repeat(7, ${dp.cellHeight}px)`,
          gap: `${t.marginXXS}px`,
          'border-radius': `${t.borderRadiusSM}px`,
        },
        [`.${prefixCls}-week-row .${prefixCls}-cell`]: {
          width: `${dp.cellHeight}px`,
        },
        [`.${prefixCls}-week-row .${prefixCls}-week-cell`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: '100%',
        },
        [`.${prefixCls}-week-row:not(.${prefixCls}-week-row-selected):hover`]: {
          background: dp.cellHoverBg,
        },
        [`.${prefixCls}-week-row-selected`]: {
          background: dp.activeBorderColor,
        },
        [`.${prefixCls}-week-row-selected .${prefixCls}-cell-selected`]: {
          background: 'transparent',
          color: t.colorBgContainer,
          'font-weight': '600',
        },
        [`.${prefixCls}-week-row-selected .${prefixCls}-cell-selected:hover, .${prefixCls}-week-row-selected .${prefixCls}-cell-selected:active`]:
          {
            background: 'transparent',
            color: t.colorBgContainer,
          },
        [`.${prefixCls}-variant-grid`]: {
          display: 'grid',
          'grid-template-columns': 'repeat(3, 1fr)',
          gap: `${t.marginXXS}px`,
          padding: `${t.paddingXXS}px 0`,
        },
        [`.${prefixCls}-variant-grid.${prefixCls}-quarter-grid`]: {
          'grid-template-columns': 'repeat(4, 1fr)',
        },
        [`.${prefixCls}-month-grid, .${prefixCls}-year-grid, .${prefixCls}-quarter-grid, .${prefixCls}-decade-grid`]:
          {
            padding: `0 ${t.paddingXS}px`,
          },
        [`.${prefixCls}-cell`]: {
          width: `${dp.cellWidth}px`,
          height: `${dp.cellHeight}px`,
          border: '0',
          'border-radius': `${t.borderRadius}px`,
          background: 'transparent',
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-cell-inner`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'min-width': `${dp.cellHeight}px`,
          height: `${dp.cellHeight}px`,
          padding: `0 ${t.paddingXS}px`,
          'border-radius': `${t.borderRadius}px`,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-cell:not(.${prefixCls}-cell-selected):not(.${prefixCls}-cell-range-start):not(.${prefixCls}-cell-range-end):hover`]:
          {
            background: dp.cellHoverBg,
          },
        [`.${prefixCls}-variant-cell`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: '100%',
          height: `${t.controlHeightLG}px`,
          background: 'transparent',
        },
        [`.${prefixCls}-variant-cell:not(.${prefixCls}-cell-selected):not(.${prefixCls}-cell-disabled):hover`]:
          {
            background: 'transparent',
          },
        [`.${prefixCls}-variant-cell:not(.${prefixCls}-cell-selected):not(.${prefixCls}-cell-disabled):hover .${prefixCls}-cell-inner`]:
          {
            background: dp.cellHoverBg,
          },
        [`.${prefixCls}-variant-cell:active`]: {
          background: 'transparent',
        },
        [`.${prefixCls}-variant-cell:active .${prefixCls}-cell-inner`]: {
          color: t.colorBgContainer,
          background: dp.activeBorderColor,
        },
        [`.${prefixCls}-variant-cell.${prefixCls}-cell-selected`]: {
          background: 'transparent',
          color: t.colorText,
          'font-weight': '400',
        },
        [`.${prefixCls}-variant-cell.${prefixCls}-cell-selected .${prefixCls}-cell-inner`]: {
          color: t.colorBgContainer,
          background: dp.activeBorderColor,
          'font-weight': '600',
        },
        [`.${prefixCls}-variant-cell.${prefixCls}-cell-selected:hover, .${prefixCls}-variant-cell.${prefixCls}-cell-selected:active`]:
          {
            background: 'transparent',
            color: t.colorText,
          },
        [`.${prefixCls}-variant-cell.${prefixCls}-cell-selected:hover .${prefixCls}-cell-inner, .${prefixCls}-variant-cell.${prefixCls}-cell-selected:active .${prefixCls}-cell-inner`]:
          {
            background: dp.activeBorderColor,
            color: t.colorBgContainer,
          },
        [`.${prefixCls}-cell:active`]: {
          color: t.colorBgContainer,
          background: dp.activeBorderColor,
        },
        [`.${prefixCls}-cell-selected`]: {
          color: t.colorBgContainer,
          background: dp.activeBorderColor,
          'font-weight': '600',
        },
        [`.${prefixCls}-cell-selected:hover, .${prefixCls}-cell-selected:active`]: {
          background: dp.activeBorderColor,
          color: t.colorBgContainer,
        },

        [`.${prefixCls}-cell-in-range`]: {
          background: dp.cellActiveWithRangeBg,
        },
        [`.${prefixCls}-cell-range-start, .${prefixCls}-cell-range-end`]: {
          color: t.colorBgContainer,
          background: dp.activeBorderColor,
          'font-weight': '600',
        },
        [`.${prefixCls}-cell-range-start:hover, .${prefixCls}-cell-range-start:active, .${prefixCls}-cell-range-end:hover, .${prefixCls}-cell-range-end:active`]:
          {
            background: dp.activeBorderColor,
            color: t.colorBgContainer,
          },
        [`.${prefixCls}-cell-today`]: {
          border: `${t.lineWidth}px solid ${dp.cellRangeBorderColor}`,
        },
        [`.${prefixCls}-cell-disabled`]: {
          color: t.colorTextDisabled,
          background: dp.cellBgDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-cell-disabled:hover`]: {
          background: 'transparent',
        },
        [`.${prefixCls}-time-panel`]: {
          display: 'flex',
          gap: `${t.marginXS}px`,
          'margin-left': `${t.marginSM}px`,
          'padding-left': `${t.paddingSM}px`,
          'border-left': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-time-column`]: {
          flex: '1 1 0',
          width: `${dp.timeColumnWidth}px`,
          height: `${dp.timeColumnHeight}px`,
          overflow: 'auto',
        },
        [`.${prefixCls}-time-column-title`]: {
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
          'line-height': '24px',
          'text-align': 'center',
        },
        [`.${prefixCls}-time-cell`]: {
          display: 'block',
          width: '100%',
          height: '28px',
          border: '0',
          'border-radius': `${t.borderRadius}px`,
          background: 'transparent',
          color: t.colorText,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-time-cell:hover`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-time-cell-selected`]: {
          color: t.colorBgContainer,
          background: t.colorPrimary,
        },
        [`.${prefixCls}-time-cell-selected:hover`]: {
          background: t.colorPrimary,
        },
        [`.${prefixCls}-time-cell-disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-time-cell-disabled:hover`]: {
          background: 'transparent',
        },
        [`.${prefixCls}-footer`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          'margin-top': `${t.marginSM}px`,
          'padding-top': `${t.paddingXS}px`,
          borderTop: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-footer-extra`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-footer-centered`]: {
          'justify-content': 'center',
        },
        [`.${prefixCls}-footer-centered .${prefixCls}-footer-extra`]: {
          width: '100%',
          'justify-content': 'center',
        },
        [`.${prefixCls}-footer-centered .${prefixCls}-today`]: {
          width: '100%',
          'justify-content': 'center',
        },
        [`.${prefixCls}-today, .${prefixCls}-now`]: {
          display: 'inline-flex',
          'align-items': 'center',
          border: '0',
          padding: '0',
          background: 'transparent',
          color: t.colorPrimary,
          cursor: 'pointer',
          'line-height': '1',
        },
        [`.${prefixCls}-today:disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-ok`]: {
          border: '0',
          'border-radius': `${t.borderRadius}px`,
          padding: `0 ${t.paddingSM}px`,
          height: `${t.controlHeightSM}px`,
          background: t.colorPrimary,
          color: t.colorBgContainer,
          cursor: 'pointer',
        },
        [`.${prefixCls}-empty-cell`]: {
          minHeight: `${dp.cellHeight}px`,
        },
      }
    },
  )
}
