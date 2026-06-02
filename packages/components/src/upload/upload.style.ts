import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useUploadStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Upload', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        display: 'inline-block',
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
      },
      [`.${prefixCls}-trigger`]: {
        display: 'inline-block',
        cursor: 'pointer',
      },
      [`.${prefixCls}-disabled .${prefixCls}-trigger`]: {
        cursor: 'not-allowed',
        opacity: '0.6',
      },
      [`.${prefixCls}-input`]: {
        display: 'none',
      },
      [`.${prefixCls}-list`]: {
        margin: `${t.marginXS}px 0 0`,
        padding: '0',
        'list-style': 'none',
      },
      [`.${prefixCls}-list-item`]: {
        display: 'flex',
        'align-items': 'center',
        gap: `${t.paddingXS}px`,
        minHeight: '28px',
        padding: `${Math.max(2, Math.floor(t.paddingXS / 2))}px ${t.paddingXS}px`,
        'border-radius': `${t.borderRadius}px`,
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-list-item:hover`]: {
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-file-name`]: {
        flex: '1',
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
      },
      [`.${prefixCls}-file-link`]: {
        color: t.colorText,
        'text-decoration': 'none',
      },
      [`.${prefixCls}-file-link:hover`]: {
        color: t.colorPrimary,
      },
      [`.${prefixCls}-status`]: {
        color: t.colorTextSecondary,
        'font-size': `${Math.max(12, t.fontSize - 2)}px`,
        'line-height': '1.5',
      },
      [`.${prefixCls}-list-item-error .${prefixCls}-status`]: {
        color: t.colorError,
      },
      [`.${prefixCls}-progress`]: {
        flex: '0 0 80px',
        height: '4px',
        overflow: 'hidden',
        'border-radius': '999px',
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-progress-bar`]: {
        height: '100%',
        background: t.colorPrimary,
        transition: 'width 0.2s',
      },
      [`.${prefixCls}-remove`]: {
        border: '0',
        padding: '0',
        background: 'transparent',
        color: t.colorTextDisabled,
        cursor: 'pointer',
        'font-size': `${t.fontSize}px`,
        'line-height': '1',
      },
      [`.${prefixCls}-remove:hover`]: {
        color: t.colorError,
      },
      [`.${prefixCls}-disabled .${prefixCls}-remove`]: {
        cursor: 'not-allowed',
        color: t.colorTextDisabled,
      },
    }
  })
}
