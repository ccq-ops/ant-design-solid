import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
import { presetColorMap } from './utils'

function presetColorStyles(prefixCls: string) {
  return Object.fromEntries(
    Object.entries(presetColorMap).flatMap(([name, color]) => [
      [
        `.${prefixCls} .${prefixCls}-color-${name}`,
        {
          background: color,
          '&:not(.${prefixCls}-count)': {
            color,
          },
        },
      ],
    ]),
  )
}

export function useBadgeStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Badge', prefixCls] }, () => {
    const t = token()
    const badge = getComponentToken('Badge', t)
    const indicatorHeight = badge.indicatorHeight ?? badge.overflowIndicatorHeight
    const indicatorHeightSm = badge.indicatorHeightSM ?? badge.overflowIndicatorHeightSm
    return {
      [`.${prefixCls}`]: {
        position: 'relative',
        display: 'inline-block',
        width: 'fit-content',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': t.fontSize,
        'font-family': t.fontFamily,
        'line-height': 1,
        'list-style': 'none',
      },
      [`.${prefixCls}-count`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': badge.indicatorZIndex,
        'min-width': indicatorHeight,
        height: indicatorHeight,
        padding: '0 6px',
        color: badge.colorText,
        'font-weight': badge.textFontWeight,
        'font-size': badge.textFontSize,
        'line-height': `${indicatorHeight}px`,
        'white-space': 'nowrap',
        background: badge.colorBg,
        'border-radius': indicatorHeight / 2,
        'box-shadow': `0 0 0 ${t.lineWidth}px ${t.colorBorderBg}`,
        transition: `background-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-count-sm`]: {
        'min-width': indicatorHeightSm,
        height: indicatorHeightSm,
        'font-size': badge.textFontSizeSm,
        'line-height': `${indicatorHeightSm}px`,
        'border-radius': indicatorHeightSm / 2,
      },
      [`.${prefixCls}-multiple-words`]: {
        padding: `0 ${typeof badge.paddingInline === 'number' ? `${badge.paddingInline}px` : badge.paddingInline}`,
      },
      [`.${prefixCls}-with-children .${prefixCls}-count, .${prefixCls}-with-children .${prefixCls}-dot, .${prefixCls}-custom-component`]:
        {
          position: 'absolute',
          top: 0,
          'inset-inline-end': 0,
          transform: 'translate(50%, -50%)',
          'transform-origin': '100% 0%',
        },
      [`.${prefixCls}-not-a-wrapper`]: { 'vertical-align': 'middle' },
      [`.${prefixCls}-not-a-wrapper .${prefixCls}-count, .${prefixCls}-not-a-wrapper .${prefixCls}-dot, .${prefixCls}-not-a-wrapper .${prefixCls}-custom-component`]:
        {
          position: 'relative',
          top: 'auto',
          display: 'inline-flex',
          transform: 'none',
          'transform-origin': '50% 50%',
        },
      [`.${prefixCls}-dot`]: {
        display: 'inline-block',
        'z-index': badge.indicatorZIndex,
        width: badge.dotSize,
        'min-width': badge.dotSize,
        height: badge.dotSize,
        background: badge.colorBg,
        'border-radius': '50%',
        'box-shadow': `0 0 0 ${t.lineWidth}px ${t.colorBorderBg}`,
      },
      [`.${prefixCls}-status`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'line-height': 'inherit',
        'vertical-align': 'baseline',
      },
      [`.${prefixCls}-status-dot`]: {
        position: 'relative',
        top: -1,
        display: 'inline-block',
        width: badge.statusSize,
        height: badge.statusSize,
        'border-radius': '50%',
        'vertical-align': 'middle',
      },
      [`.${prefixCls}-status-success`]: { background: t.colorSuccess },
      [`.${prefixCls}-status-processing`]: {
        background: t.colorInfo,
        color: t.colorInfo,
        '&::after': {
          position: 'absolute',
          top: 0,
          'inset-inline-start': 0,
          width: '100%',
          height: '100%',
          border: `${t.lineWidth}px solid currentcolor`,
          'border-radius': '50%',
          animation: 'ads-badge-pulse 1.2s infinite ease-in-out',
          content: '""',
        },
      },
      [`.${prefixCls}-status-default`]: { background: t.colorTextPlaceholder },
      [`.${prefixCls}-status-error`]: { background: t.colorError },
      [`.${prefixCls}-status-warning`]: { background: t.colorWarning },
      [`.${prefixCls}-status-text`]: {
        'margin-inline-start': t.marginXS,
        color: t.colorText,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
      },
      ...presetColorStyles(prefixCls),
      '@keyframes ads-badge-pulse': {
        '0%': { transform: 'scale(0.8)', opacity: 0.5 },
        '100%': { transform: 'scale(2.4)', opacity: 0 },
      },
    }
  })
}

export function useRibbonStyle(prefixCls: string, wrapperCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Ribbon', prefixCls] }, () => {
    const t = token()
    const badge = getComponentToken('Badge', t)
    const offset = badge.badgeRibbonOffset
    return {
      [`.${wrapperCls}`]: {
        position: 'relative',
      },
      [`.${prefixCls}`]: {
        position: 'absolute',
        top: t.marginXS,
        padding: `0 ${t.paddingXS}px`,
        color: t.colorPrimary,
        'font-size': t.fontSize,
        'font-family': t.fontFamily,
        'line-height': `${t.fontHeight}px`,
        'white-space': 'nowrap',
        'background-color': t.colorPrimary,
        'border-radius': t.borderRadiusSM,
      },
      [`.${prefixCls}-content`]: {
        color: badge.colorText,
      },
      [`.${prefixCls}-corner`]: {
        position: 'absolute',
        top: '100%',
        width: offset,
        height: offset,
        color: 'currentcolor',
        border: `${offset / 2}px solid`,
        transform: badge.badgeRibbonCornerTransform,
        'transform-origin': 'top',
        filter: badge.badgeRibbonCornerFilter,
      },
      [`.${prefixCls}-placement-end`]: {
        'inset-inline-end': -offset,
        'border-end-end-radius': 0,
      },
      [`.${prefixCls}-placement-end .${prefixCls}-corner`]: {
        'inset-inline-end': 0,
        'border-inline-end-color': 'transparent',
        'border-block-end-color': 'transparent',
      },
      [`.${prefixCls}-placement-start`]: {
        'inset-inline-start': -offset,
        'border-end-start-radius': 0,
      },
      [`.${prefixCls}-placement-start .${prefixCls}-corner`]: {
        'inset-inline-start': 0,
        'border-block-end-color': 'transparent',
        'border-inline-start-color': 'transparent',
      },
      ...Object.fromEntries(
        Object.entries(presetColorMap).map(([name, color]) => [
          `.${prefixCls}-color-${name}`,
          { background: color, color },
        ]),
      ),
    }
  })
}
