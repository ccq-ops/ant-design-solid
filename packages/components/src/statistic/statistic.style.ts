import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useStatisticStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Statistic', prefixCls] },
    () => {
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
        [`.${prefixCls}-title`]: {
          'margin-bottom': `${t.marginXS}px`,
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-content`]: {
          display: 'flex',
          'align-items': 'baseline',
          color: t.colorText,
          'font-size': '24px',
          'line-height': 1.35,
        },
        [`.${prefixCls}-content-prefix`]: {
          'margin-inline-end': `${t.marginXS}px`,
        },
        [`.${prefixCls}-content-suffix`]: {
          'margin-inline-start': `${t.marginXS}px`,
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-content-value`]: {
          display: 'inline-block',
        },
        [`.${prefixCls}-loading`]: {
          display: 'inline-block',
          width: '4em',
          height: '1em',
          background: t.colorFillAlter,
          'border-radius': `${t.borderRadius}px`,
        },
      }
    },
  )
}
