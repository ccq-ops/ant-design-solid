import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useAlertStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Alert', prefixCls] }, () => {
    const t = token()
    const at = getComponentToken('Alert', t)
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        position: 'relative',
        display: 'flex',
        'align-items': 'center',
        width: '100%',
        padding: at.defaultPadding ?? at.padding,
        color: t.colorText,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
        'border-radius': at.borderRadius,
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        'word-wrap': 'break-word',
      },
      [`.${prefixCls}-with-description`]: { padding: at.withDescriptionPadding },
      [`.${prefixCls}-banner`]: {
        'border-radius': 0,
        border: '0 !important',
      },
      [`.${prefixCls}-filled`]: { 'border-color': 'transparent' },
      [`.${prefixCls}-success`]: {
        background: at.successBg,
        borderColor: at.successBorderColor,
        [`.${prefixCls}-icon`]: { color: t.colorSuccess },
      },
      [`.${prefixCls}-info`]: {
        background: at.infoBg,
        borderColor: at.infoBorderColor,
        [`.${prefixCls}-icon`]: { color: t.colorInfo },
      },
      [`.${prefixCls}-warning`]: {
        background: at.warningBg,
        borderColor: at.warningBorderColor,
        [`.${prefixCls}-icon`]: { color: t.colorWarning },
      },
      [`.${prefixCls}-error`]: {
        background: at.errorBg,
        borderColor: at.errorBorderColor,
        [`.${prefixCls}-icon`]: { color: t.colorError },
      },
      [`.${prefixCls}-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'margin-inline-end': t.marginXS,
        'font-size': at.iconSize,
        'line-height': 0,
      },
      [`.${prefixCls}-with-description .${prefixCls}-icon`]: {
        'align-items': 'flex-start',
        'margin-inline-end': t.marginSM,
        'font-size': at.withDescriptionIconSize,
      },
      [`.${prefixCls}-section`]: { flex: 1, 'min-width': 0 },
      [`.${prefixCls}-title`]: { color: t.colorTextHeading },
      [`.${prefixCls}-with-description .${prefixCls}-title`]: {
        display: 'block',
        'margin-bottom': t.marginXS,
        color: t.colorTextHeading,
        'font-size': t.fontSizeLG,
      },
      [`.${prefixCls}-description`]: {
        display: 'block',
        color: t.colorText,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
      },
      [`.${prefixCls}-actions`]: { 'margin-inline-start': t.marginXS },
      [`.${prefixCls}-close-icon`]: {
        'margin-inline-start': t.marginXS,
        border: 0,
        padding: 0,
        overflow: 'hidden',
        'font-size': t.fontSizeIcon,
        'line-height': t.fontSizeIcon,
        background: 'transparent',
        color: t.colorTextSecondary,
        cursor: 'pointer',
      },
      [`.${prefixCls}-motion-leave`]: {
        overflow: 'hidden',
        opacity: 1,
        transition: 'max-height 0.3s, opacity 0.3s, padding-top 0.3s, padding-bottom 0.3s',
      },
      [`.${prefixCls}-motion-leave-active`]: {
        'max-height': 0,
        'padding-top': 0,
        'padding-bottom': 0,
        opacity: 0,
      },
    }
  })
}
