import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTagStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tag', prefixCls] }, () => {
    const t = token()
    const tag = getComponentToken('Tag', t)
    return {
      [`.${prefixCls}`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: 4,
        'box-sizing': 'border-box',
        margin: 0,
        'padding-inline': tag.paddingInline,
        color: tag.defaultColor,
        'font-size': tag.fontSize,
        'line-height': tag.lineHeight,
        'white-space': 'nowrap',
        background: tag.defaultBg,
        border: `${t.lineWidth}px solid ${tag.borderColor}`,
        'border-radius': tag.borderRadius,
      },
      [`.${prefixCls}-borderless`]: { borderColor: 'transparent' },
      [`.${prefixCls}-has-color`]: {
        color: 'var(--ads-tag-custom-color)',
        background: 'color-mix(in srgb, var(--ads-tag-custom-color) 10%, transparent)',
        borderColor: 'color-mix(in srgb, var(--ads-tag-custom-color) 35%, transparent)',
      },
      [`.${prefixCls}-success`]: {
        color: t.colorSuccess,
        background: tag.successBg,
        borderColor: tag.successBorderColor,
      },
      [`.${prefixCls}-warning`]: {
        color: t.colorWarning,
        background: tag.warningBg,
        borderColor: tag.warningBorderColor,
      },
      [`.${prefixCls}-error`]: {
        color: t.colorError,
        background: tag.errorBg,
        borderColor: tag.errorBorderColor,
      },
      [`.${prefixCls}-processing`]: {
        color: t.colorInfo,
        background: tag.processingBg,
        borderColor: tag.processingBorderColor,
      },
      [`.${prefixCls}-close`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        padding: 0,
        color: tag.closeIconColor,
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        'font-size': 12,
        'line-height': 1,
      },
    }
  })
}
