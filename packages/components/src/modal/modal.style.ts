import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useModalStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Modal', prefixCls] }, () => {
    const t = token()
    const mt = getComponentToken('Modal', t)
    const zoomMotion = `${t.motionDurationMid} ${t.motionEaseInOut}`
    const titleFontSize = typeof mt.titleFontSize === 'number' ? mt.titleFontSize : t.fontSize + 2
    const confirmIconSize = titleFontSize + 2
    return {
      '@keyframes adsModalFadeIn': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      '@keyframes adsModalFadeOut': {
        '0%': { opacity: 1 },
        '100%': { opacity: 0 },
      },
      '@keyframes adsModalZoomIn': {
        '0%': { opacity: 0, transform: 'scale(0.8)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
      },
      '@keyframes adsModalZoomOut': {
        '0%': { opacity: 1, transform: 'scale(1)' },
        '100%': { opacity: 0, transform: 'scale(0.8)' },
      },
      [`.${prefixCls}-root`]: { position: 'relative' },
      [`.${prefixCls}-mask`]: { position: 'fixed', inset: 0, background: mt.maskBg },
      [`.${prefixCls}-mask-blur`]: { 'backdrop-filter': 'blur(2px)' },
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
        width: `var(--${prefixCls}-xs-width, 520px)`,
        'transform-origin': '50% 50%',
      },
      [`.ads-zoom-enter, .ads-zoom-appear`]: {
        opacity: 0,
        transform: 'scale(0.8)',
        animation: `adsModalZoomIn ${zoomMotion} both`,
      },
      [`.ads-zoom-leave`]: {
        animation: `adsModalZoomOut ${zoomMotion} both`,
        'pointer-events': 'none',
      },
      [`.ads-fade-enter, .ads-fade-appear`]: {
        opacity: 0,
        animation: `adsModalFadeIn ${t.motionDurationMid} linear both`,
      },
      [`.ads-fade-leave`]: {
        animation: `adsModalFadeOut ${t.motionDurationMid} linear both`,
        'pointer-events': 'none',
      },
      '@media (min-width: 576px)': {
        [`.${prefixCls}`]: {
          width: `var(--${prefixCls}-sm-width, var(--${prefixCls}-xs-width, 520px))`,
        },
      },
      '@media (min-width: 768px)': {
        [`.${prefixCls}`]: {
          width: `var(--${prefixCls}-md-width, var(--${prefixCls}-sm-width, var(--${prefixCls}-xs-width, 520px)))`,
        },
      },
      '@media (min-width: 992px)': {
        [`.${prefixCls}`]: {
          width: `var(--${prefixCls}-lg-width, var(--${prefixCls}-md-width, var(--${prefixCls}-sm-width, var(--${prefixCls}-xs-width, 520px))))`,
        },
      },
      '@media (min-width: 1200px)': {
        [`.${prefixCls}`]: {
          width: `var(--${prefixCls}-xl-width, var(--${prefixCls}-lg-width, var(--${prefixCls}-md-width, var(--${prefixCls}-sm-width, var(--${prefixCls}-xs-width, 520px)))))`,
        },
      },
      '@media (min-width: 1600px)': {
        [`.${prefixCls}`]: {
          width: `var(--${prefixCls}-xxl-width, var(--${prefixCls}-xl-width, var(--${prefixCls}-lg-width, var(--${prefixCls}-md-width, var(--${prefixCls}-sm-width, var(--${prefixCls}-xs-width, 520px))))))`,
        },
      },
      [`.${prefixCls}-centered .${prefixCls}`]: { top: 0 },
      [`.${prefixCls}-content`]: {
        position: 'relative',
        background: mt.contentBg,
        'border-radius': mt.borderRadius,
        'box-shadow': mt.boxShadow,
        padding: mt.contentPadding,
      },
      [`.${prefixCls}-header`]: {
        padding: mt.headerPadding,
        background: mt.headerBg,
        'border-bottom': mt.headerBorderBottom,
        'margin-bottom': mt.headerMarginBottom,
        'border-radius': `${mt.borderRadius}px ${mt.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-title`]: {
        color: mt.titleColor,
        'font-size': mt.titleFontSize,
        'font-weight': 600,
        'line-height': mt.titleLineHeight,
      },
      [`.${prefixCls}-body`]: { padding: mt.bodyPadding, color: t.colorText },
      [`.${prefixCls}-loading`]: {
        color: t.colorTextSecondary,
        padding: t.paddingLG,
        'text-align': 'center',
      },
      [`.${prefixCls}-footer`]: {
        display: 'flex',
        'justify-content': 'flex-end',
        gap: mt.confirmIconMarginInlineEnd,
        padding: mt.footerPadding,
        background: mt.footerBg,
        'border-top': mt.footerBorderTop,
        'border-radius': mt.footerBorderRadius,
        'margin-top': mt.footerMarginTop,
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
        padding: mt.confirmBodyPadding,
      },
      [`.${prefixCls}-confirm-body`]: {
        display: 'flex',
        'align-items': 'flex-start',
        gap: t.marginSM,
      },
      [`.${prefixCls}-confirm-icon`]: {
        flex: 'none',
        'font-size': confirmIconSize,
        'line-height': 1,
        'margin-top': `${((titleFontSize * t.lineHeight - confirmIconSize) / 2).toFixed(2)}px`,
      },
      [`.${prefixCls}-confirm-icon > svg`]: { display: 'block' },
      [`.${prefixCls}-confirm-message`]: { flex: 1 },
      [`.${prefixCls}-confirm-title`]: {
        color: mt.titleColor,
        'font-size': mt.titleFontSize,
        'font-weight': 600,
        'line-height': t.lineHeight,
        'margin-bottom': t.marginXS,
      },
      [`.${prefixCls}-confirm-content`]: { color: t.colorText },
      [`.${prefixCls}-confirm .${prefixCls}-footer`]: {
        'margin-top': mt.confirmBtnsMarginTop,
      },
      [`.${prefixCls}-confirm-success .${prefixCls}-title`]: { color: t.colorSuccess },
      [`.${prefixCls}-confirm-info .${prefixCls}-title`]: { color: t.colorInfo },
      [`.${prefixCls}-confirm-warning .${prefixCls}-title`]: { color: t.colorWarning },
      [`.${prefixCls}-confirm-error .${prefixCls}-title`]: { color: t.colorError },
      [`.${prefixCls}-confirm-success .${prefixCls}-confirm-icon`]: { color: t.colorSuccess },
      [`.${prefixCls}-confirm-info .${prefixCls}-confirm-icon`]: { color: t.colorInfo },
      [`.${prefixCls}-confirm-warning .${prefixCls}-confirm-icon`]: { color: t.colorWarning },
      [`.${prefixCls}-confirm-confirm .${prefixCls}-confirm-icon`]: { color: t.colorWarning },
      [`.${prefixCls}-confirm-error .${prefixCls}-confirm-icon`]: { color: t.colorError },
    }
  })
}
