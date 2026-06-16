import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useDividerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Divider', prefixCls] },
    () => {
      const t = token()
      const dt = getComponentToken('Divider', t)
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
          'border-block-start': `${t.lineWidth}px solid ${t.colorSplit}`,
        },
        [`.${prefixCls}-rail`]: {
          'border-block-start': `${t.lineWidth}px solid ${t.colorSplit}`,
        },
        [`.${prefixCls}-horizontal`]: {
          display: 'flex',
          clear: 'both',
          width: '100%',
          'min-width': '100%',
          margin: `${t.marginLG}px 0`,
        },
        [`.${prefixCls}-horizontal.${prefixCls}-sm`]: {
          'margin-block': `${t.marginXS}px`,
        },
        [`.${prefixCls}-horizontal.${prefixCls}-md`]: {
          'margin-block': `${t.margin}px`,
        },
        [`.${prefixCls}-horizontal.${prefixCls}-with-text`]: {
          display: 'flex',
          'align-items': 'center',
          margin: `${t.margin}px 0`,
          color: t.colorTextHeading,
          'font-weight': 500,
          'font-size': `${t.fontSizeLG}px`,
          'white-space': 'nowrap',
          'text-align': 'center',
          'border-block-start': `0 ${t.colorSplit}`,
        },
        [`.${prefixCls}-horizontal.${prefixCls}-with-text .${prefixCls}-rail-start, .${prefixCls}-horizontal.${prefixCls}-with-text .${prefixCls}-rail-end`]:
          {
            width: '50%',
            'border-block-start-color': 'inherit',
            'border-block-end': 0,
          },
        [`.${prefixCls}-with-text-start .${prefixCls}-rail-start`]: {
          width: `calc(${dt.orientationMargin} * 100%)`,
        },
        [`.${prefixCls}-with-text-start .${prefixCls}-rail-end`]: {
          width: `calc(100% - ${dt.orientationMargin} * 100%)`,
        },
        [`.${prefixCls}-with-text-end .${prefixCls}-rail-start`]: {
          width: `calc(100% - ${dt.orientationMargin} * 100%)`,
        },
        [`.${prefixCls}-with-text-end .${prefixCls}-rail-end`]: {
          width: `calc(${dt.orientationMargin} * 100%)`,
        },
        [`.${prefixCls}-inner-text`]: {
          display: 'inline-block',
          'padding-block': 0,
          'padding-inline': `${dt.textPaddingInline}`,
        },
        [`.${prefixCls}-plain.${prefixCls}-with-text`]: {
          color: t.colorText,
          'font-weight': 'normal',
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-vertical`]: {
          position: 'relative',
          top: '-0.06em',
          display: 'inline-block',
          height: '0.9em',
          'margin-inline': `${dt.verticalMarginInline}`,
          'margin-block': 0,
          'vertical-align': 'middle',
          'border-top': 0,
          'border-inline-start': `${t.lineWidth}px solid ${t.colorSplit}`,
        },
        [`.${prefixCls}-dashed`]: {
          background: 'none',
          'border-color': t.colorSplit,
          'border-style': 'dashed',
          'border-width': `${t.lineWidth}px 0 0`,
          [`.${prefixCls}-rail`]: {
            'border-block-start': `${t.lineWidth}px dashed ${t.colorSplit}`,
          },
        },
        [`.${prefixCls}-horizontal.${prefixCls}-with-text.${prefixCls}-dashed .${prefixCls}-rail-start, .${prefixCls}-horizontal.${prefixCls}-with-text.${prefixCls}-dashed .${prefixCls}-rail-end`]:
          {
            'border-style': 'dashed none none',
          },
        [`.${prefixCls}-vertical.${prefixCls}-dashed`]: {
          'border-inline-start-width': t.lineWidth,
          'border-inline-end': 0,
          'border-block-start': 0,
          'border-block-end': 0,
        },
        [`.${prefixCls}-dotted`]: {
          background: 'none',
          'border-color': t.colorSplit,
          'border-style': 'dotted',
          'border-width': `${t.lineWidth}px 0 0`,
          [`.${prefixCls}-rail`]: {
            'border-block-start': `${t.lineWidth}px dotted ${t.colorSplit}`,
          },
        },
        [`.${prefixCls}-horizontal.${prefixCls}-with-text.${prefixCls}-dotted .${prefixCls}-rail-start, .${prefixCls}-horizontal.${prefixCls}-with-text.${prefixCls}-dotted .${prefixCls}-rail-end`]:
          {
            'border-style': 'dotted none none',
          },
        [`.${prefixCls}-vertical.${prefixCls}-dotted`]: {
          'border-inline-start-width': t.lineWidth,
          'border-inline-end': 0,
          'border-block-start': 0,
          'border-block-end': 0,
        },
        [`.${prefixCls}-horizontal.${prefixCls}-with-text-start.${prefixCls}-no-default-orientation-margin-start`]:
          {
            [`.${prefixCls}-rail-start`]: { width: 0 },
            [`.${prefixCls}-rail-end`]: { width: '100%' },
            [`.${prefixCls}-inner-text`]: { 'padding-inline-start': 0 },
          },
        [`.${prefixCls}-horizontal.${prefixCls}-with-text-end.${prefixCls}-no-default-orientation-margin-end`]:
          {
            [`.${prefixCls}-rail-start`]: { width: '100%' },
            [`.${prefixCls}-rail-end`]: { width: 0 },
            [`.${prefixCls}-inner-text`]: { 'padding-inline-end': 0 },
          },
        [`.${prefixCls}-rtl`]: {
          direction: 'rtl',
        },
      }
    },
  )
}
