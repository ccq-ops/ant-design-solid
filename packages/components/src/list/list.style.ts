import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useListStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['List', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
      },
      [`.${prefixCls}-header, .${prefixCls}-footer`]: {
        padding: `${t.padding}px 0`,
      },
      [`.${prefixCls}-items`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-item`]: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        gap: `${t.margin}px`,
        margin: 0,
        padding: `${t.padding}px 0`,
        color: t.colorText,
      },
      [`.${prefixCls}-item-main`]: {
        flex: 1,
        'min-width': 0,
      },
      [`.${prefixCls}-item-extra`]: {
        'margin-inline-start': `${t.margin}px`,
      },
      [`.${prefixCls}-item-actions`]: {
        display: 'flex',
        'align-items': 'center',
        gap: `${t.marginSM}px`,
        margin: 0,
        'margin-inline-start': `${t.margin}px`,
        padding: 0,
        color: t.colorTextSecondary,
        'list-style': 'none',
      },
      [`.${prefixCls}-item-action`]: {
        display: 'inline-flex',
        'align-items': 'center',
      },
      [`.${prefixCls}-item-meta`]: {
        display: 'flex',
        flex: 1,
        'align-items': 'flex-start',
        'min-width': 0,
        gap: `${t.marginSM}px`,
      },
      [`.${prefixCls}-item-meta-avatar`]: {
        flex: 'none',
      },
      [`.${prefixCls}-item-meta-content`]: {
        flex: 1,
        'min-width': 0,
      },
      [`.${prefixCls}-item-meta-title`]: {
        color: t.colorText,
        'font-weight': 500,
        'margin-bottom': `${Math.max(2, Math.floor(t.marginXS / 2))}px`,
      },
      [`.${prefixCls}-item-meta-description`]: {
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-empty, .${prefixCls}-loading`]: {
        padding: `${t.padding}px 0`,
        color: t.colorTextSecondary,
        'text-align': 'center',
      },
      [`.${prefixCls}-split .${prefixCls}-item`]: {
        'border-bottom': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-split .${prefixCls}-item:last-child`]: {
        'border-bottom': 0,
      },
      [`.${prefixCls}-bordered`]: {
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        'border-radius': `${t.borderRadius}px`,
      },
      [`.${prefixCls}-bordered .${prefixCls}-header, .${prefixCls}-bordered .${prefixCls}-footer, .${prefixCls}-bordered .${prefixCls}-empty, .${prefixCls}-bordered .${prefixCls}-loading`]:
        {
          padding: `${t.padding}px ${t.padding}px`,
        },
      [`.${prefixCls}-bordered .${prefixCls}-item`]: {
        padding: `${t.padding}px ${t.padding}px`,
      },
      [`.${prefixCls}-bordered .${prefixCls}-header`]: {
        'border-bottom': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-bordered .${prefixCls}-footer`]: {
        'border-top': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-large .${prefixCls}-header, .${prefixCls}-large .${prefixCls}-footer, .${prefixCls}-large .${prefixCls}-item, .${prefixCls}-large .${prefixCls}-empty, .${prefixCls}-large .${prefixCls}-loading`]:
        {
          padding: `${t.paddingLG}px ${t.padding}px`,
        },
      [`.${prefixCls}-small .${prefixCls}-header, .${prefixCls}-small .${prefixCls}-footer, .${prefixCls}-small .${prefixCls}-item, .${prefixCls}-small .${prefixCls}-empty, .${prefixCls}-small .${prefixCls}-loading`]:
        {
          padding: `${t.paddingXS}px ${t.padding}px`,
        },
      [`.${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-large .${prefixCls}-header, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-large .${prefixCls}-footer, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-large .${prefixCls}-item, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-large .${prefixCls}-empty, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-large .${prefixCls}-loading`]:
        {
          padding: `${t.paddingLG}px 0`,
        },
      [`.${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-small .${prefixCls}-header, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-small .${prefixCls}-footer, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-small .${prefixCls}-item, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-small .${prefixCls}-empty, .${prefixCls}:not(.${prefixCls}-bordered).${prefixCls}-small .${prefixCls}-loading`]:
        {
          padding: `${t.paddingXS}px 0`,
        },
    }
  })
}
