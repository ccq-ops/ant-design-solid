import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useCarouselStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Carousel', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'relative',
          display: 'block',
          width: '100%',
          color: t.colorText,
          'font-family': t.fontFamily,
          'font-size': `${t.fontSize}px`,
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-viewport`]: {
          overflow: 'hidden',
          width: '100%',
        },
        [`.${prefixCls}-track`]: {
          display: 'flex',
          width: '100%',
          'will-change': 'transform',
        },
        [`.${prefixCls}-slide`]: {
          flex: '0 0 100%',
          width: '100%',
          'min-width': '100%',
          outline: 'none',
          'box-sizing': 'border-box',
        },
        [`.${prefixCls}-fade .${prefixCls}-viewport`]: {
          position: 'relative',
        },
        [`.${prefixCls}-fade .${prefixCls}-track`]: {
          display: 'block',
          transform: 'none !important',
        },
        [`.${prefixCls}-fade .${prefixCls}-slide`]: {
          position: 'absolute',
          inset: '0',
          opacity: '0',
          'pointer-events': 'none',
          transition: 'opacity 500ms ease',
        },
        [`.${prefixCls}-fade .${prefixCls}-slide-active`]: {
          position: 'relative',
          opacity: '1',
          'pointer-events': 'auto',
          'z-index': '1',
        },
        [`.${prefixCls}-arrow`]: {
          position: 'absolute',
          top: '50%',
          'z-index': '2',
          width: '32px',
          height: '32px',
          padding: '0',
          border: '0',
          'border-radius': '50%',
          color: t.colorBgContainer,
          background: 'rgba(0, 0, 0, 0.32)',
          cursor: 'pointer',
          transform: 'translateY(-50%)',
        },
        [`.${prefixCls}-arrow:hover`]: {
          background: 'rgba(0, 0, 0, 0.48)',
        },
        [`.${prefixCls}-arrow:disabled`]: {
          opacity: '0.35',
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-prev`]: {
          left: `${t.marginSM}px`,
        },
        [`.${prefixCls}-next`]: {
          right: `${t.marginSM}px`,
        },
        [`.${prefixCls}-dots`]: {
          position: 'absolute',
          'z-index': '2',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          gap: `${t.marginXS}px`,
          margin: '0',
          padding: '0',
          'list-style': 'none',
        },
        [`.${prefixCls}-dot-bottom .${prefixCls}-dots`]: {
          right: '0',
          bottom: `${t.marginSM}px`,
          left: '0',
        },
        [`.${prefixCls}-dot-top .${prefixCls}-dots`]: {
          top: `${t.marginSM}px`,
          right: '0',
          left: '0',
        },
        [`.${prefixCls}-dot-left .${prefixCls}-dots`]: {
          top: '0',
          bottom: '0',
          left: `${t.marginSM}px`,
          'flex-direction': 'column',
        },
        [`.${prefixCls}-dot-right .${prefixCls}-dots`]: {
          top: '0',
          right: `${t.marginSM}px`,
          bottom: '0',
          'flex-direction': 'column',
        },
        [`.${prefixCls}-dot`]: {
          display: 'block',
          width: '16px',
          height: '3px',
          padding: '0',
          border: '0',
          'border-radius': '2px',
          background: 'rgba(255, 255, 255, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        },
        [`.${prefixCls}-dot-active`]: {
          width: '24px',
          background: t.colorBgContainer,
        },
        [`.${prefixCls}-vertical .${prefixCls}-dot`]: {
          width: '3px',
          height: '16px',
        },
        [`.${prefixCls}-vertical .${prefixCls}-dot-active`]: {
          height: '24px',
        },
      }
    },
  )
}
