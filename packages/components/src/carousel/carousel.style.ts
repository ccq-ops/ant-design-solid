import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

const dotDurationVar = '--dot-duration'

function unit(value: number | string | undefined): string {
  if (typeof value === 'number') return `${value}px`
  return value ?? '0'
}

export function useCarouselStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Carousel', prefixCls] },
    () => {
      const t = token()
      const ct = getComponentToken('Carousel', t)
      const dotWidth = unit(ct.dotWidth)
      const dotHeight = unit(ct.dotHeight)
      const dotActiveWidth = unit(ct.dotActiveWidth ?? ct.dotWidthActive)
      const dotGap = `${ct.dotGap ?? t.marginXXS}px`
      const dotOffset = `${ct.dotOffset ?? 12}px`
      const arrowSize = `${ct.arrowSize ?? 16}px`
      const arrowOffset = `${ct.arrowOffset ?? t.marginXS}px`
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
        [`.${prefixCls}-slider`]: {
          position: 'relative',
          display: 'block',
          width: '100%',
          'box-sizing': 'border-box',
          'touch-action': 'pan-y',
        },
        [`.${prefixCls}-viewport`]: {
          position: 'relative',
          display: 'block',
          overflow: 'hidden',
          width: '100%',
          margin: '0',
          padding: '0',
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
        [`.${prefixCls}-vertical .${prefixCls}-track`]: {
          display: 'block',
        },
        [`.${prefixCls}-vertical .${prefixCls}-slide`]: {
          width: '100%',
          'min-width': '100%',
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
          'z-index': '1',
          width: arrowSize,
          height: arrowSize,
          padding: '0',
          border: '0',
          outline: 'none',
          color: '#fff',
          opacity: '0.4',
          background: 'transparent',
          cursor: 'pointer',
          transform: 'translateY(-50%)',
          transition: `opacity ${t.motionDurationSlow}`,
        },
        [`.${prefixCls}-arrow:hover, .${prefixCls}-arrow:focus`]: {
          opacity: '1',
        },
        [`.${prefixCls}-arrow:disabled`]: {
          opacity: '0',
          cursor: 'not-allowed',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-prev`]: {
          left: arrowOffset,
        },
        [`.${prefixCls}-next`]: {
          right: arrowOffset,
        },
        [`.${prefixCls}-vertical .${prefixCls}-prev, .${prefixCls}-vertical .${prefixCls}-next`]: {
          left: '50%',
          transform: 'translateX(-50%)',
        },
        [`.${prefixCls}-vertical .${prefixCls}-prev`]: {
          top: arrowOffset,
        },
        [`.${prefixCls}-vertical .${prefixCls}-next`]: {
          top: 'auto',
          bottom: arrowOffset,
        },
        [`.${prefixCls}-dots`]: {
          position: 'absolute',
          'z-index': '15',
          display: 'flex !important',
          'align-items': 'center',
          'justify-content': 'center',
          margin: '0',
          padding: '0',
          'list-style': 'none',
        },
        [`.${prefixCls}-dot-bottom .${prefixCls}-dots`]: {
          right: '0',
          bottom: dotOffset,
          left: '0',
        },
        [`.${prefixCls}-dot-top .${prefixCls}-dots`]: {
          top: dotOffset,
          right: '0',
          left: '0',
        },
        [`.${prefixCls}-dot-start .${prefixCls}-dots`]: {
          top: '50%',
          bottom: 'auto',
          left: dotOffset,
          width: dotHeight,
          transform: 'translateY(-50%)',
          'flex-direction': 'column',
        },
        [`.${prefixCls}-dot-end .${prefixCls}-dots`]: {
          top: '50%',
          right: dotOffset,
          bottom: 'auto',
          left: 'auto',
          width: dotHeight,
          transform: 'translateY(-50%)',
          'flex-direction': 'column',
        },
        [`.${prefixCls}-dots li`]: {
          position: 'relative',
          display: 'inline-block',
          flex: '0 1 auto',
          width: dotWidth,
          height: dotHeight,
          margin: `0 ${dotGap}`,
          padding: '0',
          overflow: 'hidden',
          'border-radius': dotHeight,
          transition: `all ${t.motionDurationSlow}`,
        },
        [`.${prefixCls}-dots li.slick-active`]: {
          width: dotActiveWidth,
        },
        [`.${prefixCls}-dots li.slick-active::after`]: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '0',
          height: dotHeight,
          content: '""',
          background: t.colorBgContainer,
          'border-radius': dotHeight,
          animation: `${prefixCls}-dot-animation var(${dotDurationVar}) ease-out forwards`,
        },
        [`.${prefixCls}-dot`]: {
          display: 'block',
          width: '100%',
          height: dotHeight,
          padding: '0',
          border: '0',
          'border-radius': dotHeight,
          opacity: '0.2',
          background: t.colorBgContainer,
          cursor: 'pointer',
          overflow: 'hidden',
          transition: `all ${t.motionDurationSlow}`,
        },
        [`.${prefixCls}-dot:hover`]: {
          opacity: '0.75',
        },
        [`.${prefixCls}-dot-active`]: {
          width: '100%',
          opacity: '1',
          background: t.colorBgContainer,
        },
        [`.${prefixCls}-dot-start .${prefixCls}-dots li`]: {
          width: dotHeight,
          height: dotWidth,
          margin: `${t.marginXXS}px 0`,
        },
        [`.${prefixCls}-dot-end .${prefixCls}-dots li`]: {
          width: dotHeight,
          height: dotWidth,
          margin: `${t.marginXXS}px 0`,
        },
        [`.${prefixCls}-dot-start .${prefixCls}-dots li.slick-active`]: {
          width: dotHeight,
          height: dotActiveWidth,
        },
        [`.${prefixCls}-dot-end .${prefixCls}-dots li.slick-active`]: {
          width: dotHeight,
          height: dotActiveWidth,
        },
        [`.${prefixCls}-dot-start .${prefixCls}-dot`]: {
          width: dotHeight,
          height: '100%',
        },
        [`.${prefixCls}-dot-end .${prefixCls}-dot`]: {
          width: dotHeight,
          height: '100%',
        },
        [`.${prefixCls}-vertical .${prefixCls}-dots li`]: {
          width: dotHeight,
          height: dotWidth,
          margin: `${t.marginXXS}px 0`,
        },
        [`.${prefixCls}-vertical .${prefixCls}-dots li.slick-active`]: {
          width: dotHeight,
          height: dotActiveWidth,
        },
        [`.${prefixCls}-vertical .${prefixCls}-dot`]: {
          width: dotHeight,
          height: '100%',
        },
        [`@keyframes ${prefixCls}-dot-animation`]: {
          from: { width: '0' },
          to: { width: dotActiveWidth },
        },
      }
    },
  )
}
