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
      [`.${prefixCls}-drag`]: {
        display: 'block',
      },
      [`.${prefixCls}-trigger`]: {
        display: 'inline-block',
        cursor: 'pointer',
      },
      [`.${prefixCls}-drag .${prefixCls}-trigger`]: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'flex-direction': 'column',
        gap: `${t.paddingXS}px`,
        padding: `${t.paddingLG}px`,
        border: `${t.lineWidth}px dashed ${t.colorBorder}`,
        'border-radius': `${t.borderRadius}px`,
        background: t.colorFillAlter,
        transition: 'border-color 0.2s, background 0.2s',
      },
      [`.${prefixCls}-drag-hover .${prefixCls}-trigger`]: {
        borderColor: t.colorPrimary,
      },
      [`.${prefixCls}-drag-icon`]: {
        color: t.colorPrimary,
        'font-size': `${t.fontSize * 2}px`,
        'line-height': '1',
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
      [`.${prefixCls}-list-picture .${prefixCls}-list-item`]: {
        minHeight: '66px',
      },
      [`.${prefixCls}-list-picture-card .${prefixCls}-list`]: {
        display: 'flex',
        'flex-wrap': 'wrap',
        gap: `${t.paddingXS}px`,
      },
      [`.${prefixCls}-list-picture-card .${prefixCls}-list-item, .${prefixCls}-list-picture-circle .${prefixCls}-list-item`]:
        {
          width: '102px',
          height: '102px',
          'align-items': 'center',
          'justify-content': 'center',
          'flex-direction': 'column',
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
        },
      [`.${prefixCls}-list-picture-circle .${prefixCls}-list-item`]: {
        'border-radius': '50%',
      },
      [`.${prefixCls}-list-item:hover`]: {
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-icon`]: {
        flex: '0 0 auto',
        width: '48px',
        height: '48px',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        color: t.colorTextSecondary,
        'font-size': `${Math.round(t.fontSize * 1.5)}px`,
      },
      [`.${prefixCls}-thumbnail`]: {
        width: '100%',
        height: '100%',
        'object-fit': 'cover',
        'border-radius': `${t.borderRadius}px`,
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
      [`.${prefixCls}-extra`]: {
        color: t.colorTextSecondary,
        'font-size': `${Math.max(12, t.fontSize - 2)}px`,
      },
      [`.${prefixCls}-actions`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: `${Math.max(2, Math.floor(t.paddingXS / 2))}px`,
      },
      [`.${prefixCls}-preview, .${prefixCls}-download, .${prefixCls}-remove`]: {
        border: '0',
        padding: '0',
        background: 'transparent',
        color: t.colorTextDisabled,
        cursor: 'pointer',
        'font-size': `${t.fontSize}px`,
        'line-height': '1',
      },
      [`.${prefixCls}-preview:hover, .${prefixCls}-download:hover`]: {
        color: t.colorPrimary,
      },
      [`.${prefixCls}-remove:hover`]: {
        color: t.colorError,
      },
      [`.${prefixCls}-disabled .${prefixCls}-preview, .${prefixCls}-disabled .${prefixCls}-download, .${prefixCls}-disabled .${prefixCls}-remove`]:
        {
          cursor: 'not-allowed',
          color: t.colorTextDisabled,
        },
    }
  })
}
