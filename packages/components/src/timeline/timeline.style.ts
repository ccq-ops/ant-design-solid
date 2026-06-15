import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useTimelineStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Timeline', prefixCls] },
    () => {
      const t = token()
      const dotSize = 10
      const titleSpan = `var(--${prefixCls}-title-span, 120px)`
      const iconColor = `var(--${prefixCls}-item-icon-color, ${t.colorPrimary})`
      const iconColumn = dotSize + t.marginXS
      const contentGap = t.margin

      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
          'list-style': 'none',
        },
        [`.${prefixCls} .${prefixCls}-list`]: {
          margin: 0,
          padding: 0,
          'list-style': 'none',
        },
        [`.${prefixCls} .${prefixCls}-item`]: {
          position: 'relative',
          display: 'block',
          flex: '0 0 auto',
          'min-height': '48px',
          padding: `0 0 ${t.padding}px`,
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item`]: {
          flex: '0 0 auto',
        },
        [`.${prefixCls}.${prefixCls}-horizontal`]: {
          display: 'flex',
          'flex-direction': 'row',
          gap: 0,
        },
        [`.${prefixCls}.${prefixCls}-horizontal .${prefixCls}-item`]: {
          flex: '1 1 0',
          'min-width': 0,
          'padding-inline-end': `${t.padding}px`,
        },
        [`.${prefixCls} .${prefixCls}-item-container`]: {
          display: 'block',
          width: '100%',
        },
        [`.${prefixCls} .${prefixCls}-item-wrapper`]: {
          display: 'block',
          width: '100%',
        },
        [`.${prefixCls} .${prefixCls}-item-section`]: {
          position: 'relative',
          display: 'grid',
          'align-items': 'start',
          'min-width': 0,
        },
        [`.${prefixCls} .${prefixCls}-item-header`]: {
          display: 'contents',
        },
        [`.${prefixCls} .${prefixCls}-item-title`]: {
          color: t.colorTextSecondary,
          'text-align': 'end',
          'min-width': 0,
        },
        [`.${prefixCls} .${prefixCls}-item-content`]: {
          display: 'block',
          'min-width': 0,
          'padding-top': 0,
        },
        [`.${prefixCls} .${prefixCls}-item-section > .${prefixCls}-item-content`]: {
          'padding-top': 0,
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-section`]: {
          'grid-template-columns': `${titleSpan} ${iconColumn}px minmax(0, 1fr)`,
          'column-gap': 0,
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-section`]:
          {
            'grid-template-columns': `minmax(0, 1fr) ${iconColumn}px ${titleSpan}`,
          },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-title`]: {
          'grid-column': 1,
          'grid-row': 1,
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-icon`]: {
          'grid-column': 2,
          'grid-row': 1,
          'justify-self': 'center',
          'align-self': 'start',
          'margin-top': `${Math.round((t.fontSize * t.lineHeight - dotSize) / 2)}px`,
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-content`]: {
          'grid-column': 3,
          'grid-row': 1,
          'padding-inline-start': `${contentGap}px`,
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-title`]:
          {
            'grid-column': 3,
            'text-align': 'start',
            'padding-inline-start': `${contentGap}px`,
          },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-content`]:
          {
            'grid-column': 1,
            'padding-inline-start': 0,
            'padding-inline-end': `${contentGap}px`,
            'text-align': 'end',
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-section`]:
          {
            'grid-template-columns': `minmax(0, 1fr) ${iconColumn}px minmax(0, 1fr)`,
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-section`]:
          {
            'grid-template-columns': `minmax(0, 1fr) ${iconColumn}px minmax(0, 1fr)`,
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-title`]:
          {
            'grid-column': 1,
            'text-align': 'end',
            'padding-inline-end': `${contentGap}px`,
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-content`]:
          {
            'grid-column': 3,
            'padding-inline-start': `${contentGap}px`,
            'padding-inline-end': 0,
            'text-align': 'start',
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-title`]:
          {
            'grid-column': 3,
            'text-align': 'start',
            'padding-inline-start': `${contentGap}px`,
            'padding-inline-end': 0,
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-content`]:
          {
            'grid-column': 1,
            'padding-inline-start': 0,
            'padding-inline-end': `${contentGap}px`,
            'text-align': 'end',
          },
        [`.${prefixCls}.${prefixCls}-horizontal .${prefixCls}-item-section`]: {
          'grid-template-columns': `${dotSize}px minmax(0, 1fr)`,
          'grid-template-rows': `${dotSize}px auto auto`,
          'column-gap': `${t.margin}px`,
          'row-gap': `${t.marginXS}px`,
        },
        [`.${prefixCls}.${prefixCls}-horizontal .${prefixCls}-item-title`]: {
          'grid-column': 2,
          'grid-row': 1,
          'text-align': 'start',
          'line-height': `${dotSize}px`,
        },
        [`.${prefixCls}.${prefixCls}-horizontal .${prefixCls}-item-icon`]: {
          'grid-column': 1,
          'grid-row': 1,
          'justify-self': 'start',
        },
        [`.${prefixCls}.${prefixCls}-horizontal .${prefixCls}-item-content`]: {
          'grid-column': '2 / span 1',
          'grid-row': 2,
        },
        [`.${prefixCls}.${prefixCls}-dot .${prefixCls}-item-icon`]: {
          position: 'relative',
          'z-index': 1,
          display: 'inline-flex',
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          'margin-inline-end': 0,
          'box-sizing': 'border-box',
          'border-radius': '50%',
          border: `${t.lineWidth * 2}px solid ${iconColor}`,
          background: t.colorBgContainer,
          color: iconColor,
          'align-items': 'center',
          'justify-content': 'center',
          'font-size': `${Math.max(10, t.fontSize - 2)}px`,
          'line-height': 1,
        },
        [`.${prefixCls}.${prefixCls}-variant-filled .${prefixCls}-item-icon`]: {
          background: iconColor,
          color: t.colorBgContainer,
        },
        [`.${prefixCls} .${prefixCls}-item-color-blue`]: {
          [`--${prefixCls}-item-icon-color`]: t.colorPrimary,
        },
        [`.${prefixCls} .${prefixCls}-item-color-green`]: {
          [`--${prefixCls}-item-icon-color`]: t.colorSuccess,
        },
        [`.${prefixCls} .${prefixCls}-item-color-red`]: {
          [`--${prefixCls}-item-icon-color`]: t.colorError,
        },
        [`.${prefixCls} .${prefixCls}-item-color-gray`]: {
          [`--${prefixCls}-item-icon-color`]: t.colorTextDisabled,
        },
        [`.${prefixCls} .${prefixCls}-item-rail`]: {
          position: 'absolute',
          background: t.colorBorderSecondary,
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-rail`]: {
          top: `${Math.round((dotSize + t.fontSize * t.lineHeight) / 2 + t.lineWidth)}px`,
          bottom: `${-Math.round((t.fontSize * t.lineHeight - dotSize) / 2 - t.lineWidth)}px`,
          left: `calc(${titleSpan} + ${iconColumn / 2}px)`,
          width: `${t.lineWidth}px`,
          transform: 'translateX(-50%)',
        },
        [`.${prefixCls}.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-rail`]:
          {
            left: 'auto',
            right: `calc(${titleSpan} + ${iconColumn / 2}px)`,
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-rail`]:
          {
            left: '50%',
            right: 'auto',
          },
        [`.${prefixCls}.${prefixCls}-layout-alternate.${prefixCls}-vertical .${prefixCls}-item-placement-end .${prefixCls}-item-rail`]:
          {
            left: '50%',
            right: 'auto',
          },
        [`.${prefixCls}.${prefixCls}-horizontal .${prefixCls}-item-rail`]: {
          position: 'absolute',
          display: 'block',
          top: `${dotSize / 2}px`,
          left: `${dotSize}px`,
          right: 0,
          width: 'auto',
          height: `${t.lineWidth}px`,
          margin: 0,
          transform: 'translateY(-50%)',
        },
        [`.${prefixCls} .${prefixCls}-item:last-child .${prefixCls}-item-rail`]: {
          display: 'none',
        },
        [`.${prefixCls} .${prefixCls}-item-loading .${prefixCls}-item-icon svg`]: {
          animation: `${prefixCls}-loading-rotate 1s linear infinite`,
        },
        [`@keyframes ${prefixCls}-loading-rotate`]: {
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      }
    },
  )
}
