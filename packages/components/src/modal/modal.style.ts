import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useModalStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Modal', prefixCls] }, () => {
    const t = token()
    const mt = getComponentToken('Modal', t)
    return {
      [`.${prefixCls}-root`]: { position: 'relative', 'z-index': 1000 },
      [`.${prefixCls}-mask`]: { position: 'fixed', inset: 0, background: mt.maskBg },
      [`.${prefixCls}-wrap`]: { position: 'fixed', inset: 0, overflow: 'auto', outline: 0 },
      [`.${prefixCls}-centered`]: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      },
      [`.${prefixCls}`]: {
        position: 'relative',
        top: 100,
        margin: '0 auto',
        padding: `0 0 ${t.paddingLG}px`,
        width: 520,
      },
      [`.${prefixCls}-centered .${prefixCls}`]: { top: 0 },
      [`.${prefixCls}-content`]: {
        position: 'relative',
        background: mt.contentBg,
        'border-radius': mt.borderRadius,
        'box-shadow': mt.boxShadow,
      },
      [`.${prefixCls}-header`]: {
        padding: `${t.padding}px ${t.paddingLG}px`,
        background: mt.headerBg,
        'border-radius': `${mt.borderRadius}px ${mt.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-title`]: {
        color: mt.titleColor,
        'font-size': mt.titleFontSize,
        'font-weight': 600,
      },
      [`.${prefixCls}-body`]: { padding: t.paddingLG, color: t.colorText },
      [`.${prefixCls}-footer`]: {
        display: 'flex',
        'justify-content': 'flex-end',
        gap: t.marginSM,
        padding: `${t.paddingSM}px ${t.paddingLG}px ${t.paddingLG}px`,
      },
      [`.${prefixCls}-close`]: {
        position: 'absolute',
        top: t.padding,
        right: t.padding,
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-confirm .${prefixCls}-body`]: {
        padding: `${t.paddingLG}px ${t.paddingLG}px 0`,
      },
      [`.${prefixCls}-confirm-content`]: { color: t.colorText },
      [`.${prefixCls}-confirm-success .${prefixCls}-title`]: { color: t.colorSuccess },
      [`.${prefixCls}-confirm-info .${prefixCls}-title`]: { color: t.colorInfo },
      [`.${prefixCls}-confirm-warning .${prefixCls}-title`]: { color: t.colorWarning },
      [`.${prefixCls}-confirm-error .${prefixCls}-title`]: { color: t.colorError },
    }
  })
}
