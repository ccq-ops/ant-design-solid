import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useDrawerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Drawer', prefixCls] }, () => {
    const t = token()
    const modalToken = getComponentToken('Modal', t)
    return {
      [`.${prefixCls}-root`]: {
        position: 'relative',
      },
      [`.${prefixCls}-mask`]: {
        position: 'fixed',
        inset: '0',
        background: modalToken.maskBg,
      },
      [`.${prefixCls}-mask-blur`]: {
        'backdrop-filter': 'blur(4px)',
      },
      [`.${prefixCls}`]: {
        position: 'fixed',
        'box-sizing': 'border-box',
        display: 'flex',
        'flex-direction': 'column',
        background: modalToken.contentBg,
        'box-shadow': modalToken.boxShadow,
        color: t.colorText,
        'font-family': t.fontFamily,
        'font-size': `${t.fontSize}px`,
        'line-height': `${t.lineHeight}`,
        outline: '0',
        transition: 'transform 0.2s',
      },
      [`.${prefixCls}-right`]: {
        top: '0',
        right: '0',
        bottom: '0',
      },
      [`.${prefixCls}-left`]: {
        top: '0',
        left: '0',
        bottom: '0',
      },
      [`.${prefixCls}-top`]: {
        top: '0',
        left: '0',
        right: '0',
      },
      [`.${prefixCls}-bottom`]: {
        right: '0',
        bottom: '0',
        left: '0',
      },
      [`.${prefixCls}-content`]: {
        display: 'flex',
        'flex-direction': 'column',
        width: '100%',
        height: '100%',
        background: modalToken.contentBg,
      },
      [`.${prefixCls}-header`]: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        gap: `${t.margin}px`,
        padding: `${t.padding}px ${t.paddingLG}px`,
        'border-bottom': `1px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-header-close-start`]: {
        'justify-content': 'flex-start',
      },
      [`.${prefixCls}-title`]: {
        flex: '1',
        margin: '0',
        color: modalToken.titleColor,
        'font-size': `${modalToken.titleFontSize}px`,
        'font-weight': '600',
      },
      [`.${prefixCls}-extra`]: {
        display: 'flex',
        'align-items': 'center',
        gap: `${t.marginSM}px`,
      },
      [`.${prefixCls}-body`]: {
        flex: '1',
        padding: `${t.paddingLG}px`,
        overflow: 'auto',
      },
      [`.${prefixCls}-footer`]: {
        padding: `${t.paddingSM}px ${t.paddingLG}px`,
        'border-top': `1px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-loading`]: {
        width: '100%',
      },
      [`.${prefixCls}-close`]: {
        border: '0',
        background: 'transparent',
        cursor: 'pointer',
        color: t.colorTextSecondary,
        'font-size': `${t.fontSize + 2}px`,
        'line-height': '1',
        padding: '0',
      },
      [`.${prefixCls}-close:disabled`]: {
        cursor: 'not-allowed',
        opacity: 0.45,
      },
      [`.${prefixCls}-resize-handle`]: {
        position: 'absolute',
        'z-index': 1,
      },
      [`.${prefixCls}-resize-handle-right`]: {
        top: '0',
        bottom: '0',
        left: '-3px',
        width: '6px',
        cursor: 'ew-resize',
      },
      [`.${prefixCls}-resize-handle-left`]: {
        top: '0',
        right: '-3px',
        bottom: '0',
        width: '6px',
        cursor: 'ew-resize',
      },
      [`.${prefixCls}-resize-handle-top`]: {
        right: '0',
        bottom: '-3px',
        left: '0',
        height: '6px',
        cursor: 'ns-resize',
      },
      [`.${prefixCls}-resize-handle-bottom`]: {
        top: '-3px',
        right: '0',
        left: '0',
        height: '6px',
        cursor: 'ns-resize',
      },
    }
  })
}
