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
        'text-decoration': 'none',
        transition: `all ${t.motionDurationFast} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-filled`]: {
        background: tag.defaultBg,
        borderColor: 'transparent',
      },
      [`.${prefixCls}-outlined`]: {
        background: tag.defaultBg,
      },
      [`.${prefixCls}-solid`]: {
        color: '#ffffff',
        background: t.colorText,
        borderColor: t.colorText,
      },
      [`.${prefixCls}-borderless`]: { borderColor: 'transparent' },
      [`.${prefixCls}-has-color.${prefixCls}-outlined, .${prefixCls}-has-color.${prefixCls}-filled`]:
        {
          color: 'var(--ads-tag-custom-color)',
          background: 'color-mix(in srgb, var(--ads-tag-custom-color) 10%, transparent)',
          borderColor: 'color-mix(in srgb, var(--ads-tag-custom-color) 35%, transparent)',
        },
      [`.${prefixCls}-has-color.${prefixCls}-solid`]: {
        color: '#ffffff',
        background: 'var(--ads-tag-custom-color)',
        borderColor: 'var(--ads-tag-custom-color)',
      },
      [`.${prefixCls}-icon`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'line-height': 1,
      },
      [`.${prefixCls}-blue`]: {
        color: t.colorInfo,
        background: tag.processingBg,
        borderColor: tag.processingBorderColor,
      },
      [`.${prefixCls}-blue.${prefixCls}-solid`]: {
        color: '#ffffff',
        background: t.colorInfo,
        borderColor: t.colorInfo,
      },
      [`.${prefixCls}-green`]: {
        color: 'var(--ads-tag-custom-color)',
        background: 'color-mix(in srgb, var(--ads-tag-custom-color, #52c41a) 10%, transparent)',
        borderColor: 'color-mix(in srgb, var(--ads-tag-custom-color, #52c41a) 35%, transparent)',
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
      [`.${prefixCls}-success.${prefixCls}-solid`]: {
        color: '#ffffff',
        background: t.colorSuccess,
        borderColor: t.colorSuccess,
      },
      [`.${prefixCls}-warning.${prefixCls}-solid`]: {
        color: '#ffffff',
        background: t.colorWarning,
        borderColor: t.colorWarning,
      },
      [`.${prefixCls}-error.${prefixCls}-solid`]: {
        color: '#ffffff',
        background: t.colorError,
        borderColor: t.colorError,
      },
      [`.${prefixCls}-processing.${prefixCls}-solid`]: {
        color: '#ffffff',
        background: t.colorInfo,
        borderColor: t.colorInfo,
      },
      [`.${prefixCls}-disabled`]: {
        color: t.colorTextDisabled,
        background: tag.defaultBg,
        borderColor: tag.borderColor,
        cursor: 'not-allowed',
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
      [`.${prefixCls}-disabled .${prefixCls}-close`]: {
        cursor: 'not-allowed',
      },
      [`.${prefixCls}-checkable`]: {
        cursor: 'pointer',
        background: 'transparent',
        borderColor: 'transparent',
      },
      [`.${prefixCls}-checkable-checked`]: {
        color: '#ffffff',
        background: t.colorPrimary,
        borderColor: t.colorPrimary,
      },
      [`.${prefixCls}-checkable-disabled`]: {
        color: t.colorTextDisabled,
        cursor: 'not-allowed',
      },
      [`.${prefixCls}-checkable-group`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: t.marginXS,
        'flex-wrap': 'wrap',
      },
      [`.${prefixCls}-checkable-group-disabled`]: {
        cursor: 'not-allowed',
      },
    }
  })
}
