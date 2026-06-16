import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'
import { MAX_BEAM_COLOR_STOP_PERCENT } from './util'

export function useBorderBeamStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['BorderBeam', prefixCls] },
    () => {
      const t = token()
      const borderBeam = getComponentToken('BorderBeam', t) ?? {}
      const defaultBeamGradient = `linear-gradient(to left, ${t.colorPrimary} 0%, ${t.colorPrimaryHover} ${MAX_BEAM_COLOR_STOP_PERCENT}%, transparent)`

      return {
        '@keyframes adsBorderBeamMove': {
          from: {
            'offset-distance': '0%',
          },
          to: {
            'offset-distance': '100%',
          },
        },
        [`.${prefixCls}`]: {
          display: 'none',
          position: 'absolute',
          inset: 'var(--ads-border-beam-inset-offset, 0px)',
          'border-radius': 'var(--ads-border-beam-border-radius, 0px)',
          'z-index': 1,
          overflow: 'hidden',
          'pointer-events': 'none',
          padding: `${borderBeam.lineWidth ?? t.lineWidth}px`,
        },
        [`@supports ((mask-composite: exclude) or (-webkit-mask-composite: xor))`]: {
          [`.${prefixCls}`]: {
            '-webkit-mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            '-webkit-mask-composite': 'xor',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            'mask-composite': 'exclude',
          },
        },
        [`@supports (offset-path: rect(0 auto auto 0 round 1px))`]: {
          [`.${prefixCls}`]: {
            display: 'block',
          },
          [`.${prefixCls}::before`]: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100px',
            'aspect-ratio': '1 / 1',
            opacity: 0.95,
            'background-image': `var(--ads-border-beam-beam-gradient, ${defaultBeamGradient})`,
            'offset-anchor': '90% 50%',
            'offset-distance': '0%',
            'offset-path': 'rect(0 auto auto 0 round 100px)',
            'offset-rotate': 'auto',
            animation: 'adsBorderBeamMove 6s linear infinite',
            'will-change': 'offset-distance',
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          [`.${prefixCls}::before`]: {
            display: 'none',
          },
        },
      }
    },
  )
}
