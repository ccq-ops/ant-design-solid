import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'
import { getComponentToken } from '@ant-design-solid/theme'

export function useAutoCompleteStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['AutoComplete', prefixCls] },
    () => {
      const t = token()
      const at = getComponentToken('AutoComplete', t)
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
          padding: `${at.paddingBlock}px ${at.paddingInline}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}:hover:not(.${prefixCls}-disabled) .${prefixCls}-selector`]: {
          'border-color': at.hoverBorderColor,
          background: at.hoverBg,
        },
        [`.${prefixCls}-open .${prefixCls}-selector`]: {
          'border-color': at.activeBorderColor,
          background: at.activeBg,
          'box-shadow': at.activeShadow,
        },
        [`.${prefixCls}-customize-input .${prefixCls}-selector`]: {
          padding: '0',
          'border-color': 'transparent',
          background: 'transparent',
          'box-shadow': 'none',
          height: 'auto',
        },
        [`.${prefixCls}.${prefixCls}-customize-input:hover:not(.${prefixCls}-disabled) .${prefixCls}-selector`]:
          {
            'border-color': 'transparent',
            background: 'transparent',
          },
        [`.${prefixCls}.${prefixCls}-customize-input.${prefixCls}-open .${prefixCls}-selector`]: {
          'border-color': 'transparent',
          background: 'transparent',
          'box-shadow': 'none',
        },
        [`.${prefixCls}.${prefixCls}-customize-input .${prefixCls}-selector`]: {
          'border-color': 'transparent',
          background: 'transparent',
          'box-shadow': 'none',
          padding: '0',
          height: 'auto',
        },
        [`.${prefixCls}-small .${prefixCls}-selector`]: {
          height: `${t.controlHeightSM}px`,
          padding: `${at.paddingBlockSM}px ${at.paddingInlineSM}px`,
        },
        [`.${prefixCls}-large .${prefixCls}-selector`]: {
          height: `${t.controlHeightLG}px`,
          padding: `${at.paddingBlockLG}px ${at.paddingInlineLG}px`,
        },
        [`.${prefixCls}-customize-input.${prefixCls}-small .${prefixCls}-selector`]: {
          padding: '0',
          height: 'auto',
        },
        [`.${prefixCls}-customize-input.${prefixCls}-large .${prefixCls}-selector`]: {
          padding: '0',
          height: 'auto',
        },
        [`.${prefixCls}-status-error .${prefixCls}-selector`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-error.${prefixCls}-open .${prefixCls}-selector`]: {
          'box-shadow': at.errorActiveShadow,
        },
        [`.${prefixCls}-status-warning .${prefixCls}-selector`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-status-warning.${prefixCls}-open .${prefixCls}-selector`]: {
          'box-shadow': at.warningActiveShadow,
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
          'font-size': `${at.inputFontSize}px`,
          'line-height': `${t.lineHeight}`,
        },
        [`.${prefixCls}-small .${prefixCls}-input`]: {
          'font-size': `${at.inputFontSizeSM}px`,
        },
        [`.${prefixCls}-large .${prefixCls}-input`]: {
          'font-size': `${at.inputFontSizeLG}px`,
        },
        [`.${prefixCls}-input:disabled`]: { cursor: 'not-allowed' },
        [`.${prefixCls}-clear`]: {
          border: '0',
          padding: '0',
          background: 'transparent',
          color: at.clearIconColor,
          cursor: 'pointer',
          'font-size': `${t.fontSize}px`,
          'line-height': '1',
        },
        [`.${prefixCls}-dropdown`]: {
          marginTop: `${t.marginXS}px`,
          padding: `${t.paddingXS}px 0`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgElevated,
          'box-shadow': t.boxShadow,
        },
        [`.${prefixCls}-item`]: {
          display: 'flex',
          'align-items': 'center',
          'min-height': `${at.optionHeight}px`,
          padding: `0 ${at.optionPadding}px`,
          cursor: 'pointer',
        },
        [`.${prefixCls}-item:hover`]: { background: at.optionActiveBg },
        [`.${prefixCls}-item-active`]: { background: at.optionActiveBg },
        [`.${prefixCls}-item[aria-selected="true"]`]: { background: at.optionSelectedBg },
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
