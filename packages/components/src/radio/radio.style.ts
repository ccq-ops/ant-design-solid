import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useRadioStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Radio', prefixCls] }, () => {
    const t = token()
    const radio = getComponentToken('Radio', t)
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        display: 'inline-flex',
        'align-items': 'center',
        gap: `${t.paddingXS}px`,
        'margin-inline-end': `${radio.wrapperMarginInlineEnd}px`,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        cursor: 'pointer',
      },
      [`.${prefixCls}:last-child`]: { 'margin-inline-end': 0 },
      [`.${prefixCls}-input`]: { cursor: 'pointer' },
      [`.${prefixCls}-disabled`]: { color: t.colorTextDisabled, cursor: 'not-allowed' },
      [`.${prefixCls}-disabled .${prefixCls}-input`]: { cursor: 'not-allowed' },
      [`.${prefixCls}-group`]: { display: 'inline-flex', gap: '12px', 'align-items': 'center' },
      [`.${prefixCls}-group-vertical`]: {
        'flex-direction': 'column',
        'align-items': 'flex-start',
      },
      [`.${prefixCls}-group-horizontal`]: { 'flex-direction': 'row' },
      [`.${prefixCls}-group-block`]: { display: 'flex', width: '100%' },
      [`.${prefixCls}-group-button`]: { gap: 0 },
      [`.${prefixCls}-group-button-compact .${prefixCls}-button-wrapper + .${prefixCls}-button-wrapper`]:
        {
          'margin-inline-start': `-${t.lineWidth}px`,
        },
      [`.${prefixCls}-group-button.${prefixCls}-group-block .${prefixCls}-button-wrapper`]: {
        flex: 1,
        'justify-content': 'center',
      },
      [`.${prefixCls}-group-small .${prefixCls}-button-wrapper`]: {
        height: t.controlHeightSM,
        'line-height': t.controlHeightSM,
        padding: `0 ${t.paddingXS}px`,
      },
      [`.${prefixCls}-group-large .${prefixCls}-button-wrapper`]: {
        height: t.controlHeightLG,
        'line-height': t.controlHeightLG,
        padding: `0 ${t.paddingLG}px`,
      },
      [`.${prefixCls}-button-wrapper`]: {
        padding: `0 ${radio.buttonPaddingInline}px`,
        height: t.controlHeight,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-inline-start-width': 0,
        'line-height': t.controlHeight,
        color: radio.buttonColor,
        background: radio.buttonBg,
      },
      [`.${prefixCls}-button-wrapper:first-child`]: {
        'border-inline-start-width': `${t.lineWidth}px`,
        'border-start-start-radius': t.borderRadius,
        'border-end-start-radius': t.borderRadius,
      },
      [`.${prefixCls}-button-wrapper:last-child`]: {
        'border-start-end-radius': t.borderRadius,
        'border-end-end-radius': t.borderRadius,
      },
      [`.${prefixCls}-button-wrapper-checked`]: {
        color: t.colorPrimary,
        borderColor: t.colorPrimary,
        background: radio.buttonCheckedBg,
        'z-index': 1,
      },
      [`.${prefixCls}-button-wrapper-disabled`]: {
        color: t.colorTextDisabled,
        background: t.colorBgContainerDisabled,
        borderColor: t.colorBorderDisabled,
      },
      [`.${prefixCls}-button-wrapper-disabled.${prefixCls}-button-wrapper-checked`]: {
        color: radio.buttonCheckedColorDisabled,
        background: radio.buttonCheckedBgDisabled,
        borderColor: t.colorBorderDisabled,
      },
      [`.${prefixCls}-button-wrapper-checked:not(:first-child)`]: {
        'box-shadow': `inset ${t.lineWidth}px 0 0 ${t.colorPrimary}`,
      },
      [`.${prefixCls}-group-solid .${prefixCls}-button-wrapper-checked`]: {
        color: radio.buttonSolidCheckedColor,
        background: radio.buttonSolidCheckedBg,
        borderColor: radio.buttonSolidCheckedBg,
      },
      [`.${prefixCls}-group-solid .${prefixCls}-button-wrapper-checked:not(.${prefixCls}-button-wrapper-disabled):hover`]:
        {
          background: radio.buttonSolidCheckedHoverBg,
          borderColor: radio.buttonSolidCheckedHoverBg,
        },
      [`.${prefixCls}-group-solid .${prefixCls}-button-wrapper-checked:not(.${prefixCls}-button-wrapper-disabled):active`]:
        {
          background: radio.buttonSolidCheckedActiveBg,
          borderColor: radio.buttonSolidCheckedActiveBg,
        },
      [`.${prefixCls}-group-solid .${prefixCls}-button-wrapper-disabled.${prefixCls}-button-wrapper-checked`]:
        {
          color: radio.buttonCheckedColorDisabled,
          background: radio.buttonCheckedBgDisabled,
          borderColor: t.colorBorderDisabled,
        },
      [`.${prefixCls}-input::after`]: {
        background: radio.radioBgColor,
      },
      [`.${prefixCls}-disabled .${prefixCls}-input::after`]: {
        background: radio.dotColorDisabled,
      },
    }
  })
}
