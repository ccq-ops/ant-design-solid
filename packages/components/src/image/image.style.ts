import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

function alphaWhite(alpha: number) {
  return `rgba(255, 255, 255, ${alpha})`
}

export function useImageStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Image', prefixCls] }, () => {
    const t = token()
    const previewOperationSize = t.fontSizeIcon * 1.5
    const operationBg = 'rgba(0, 0, 0, 0.1)'
    const operationBgHover = 'rgba(0, 0, 0, 0.2)'
    const progressAnimationDuration = '3s'

    return {
      [`.${prefixCls}`]: {
        position: 'relative',
        display: 'inline-block',
        'box-sizing': 'border-box',
        color: t.colorText,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        outline: 0,
      },
      [`.${prefixCls}:focus-visible`]: {
        outline: `${t.lineWidthFocus}px solid ${t.colorPrimaryBorder}`,
        'outline-offset': 1,
      },
      [`.${prefixCls}-img`]: {
        width: '100%',
        height: 'auto',
        'vertical-align': 'middle',
        cursor: 'zoom-in',
      },
      [`.${prefixCls}-img-placeholder`]: {
        'background-color': t.colorBgContainerDisabled,
        'background-repeat': 'no-repeat',
        'background-position': 'center center',
        'background-size': '30%',
      },
      [`.${prefixCls}-img-no-preview`]: {
        cursor: 'default',
      },
      [`.${prefixCls}-placeholder`]: {
        position: 'absolute',
        inset: 0,
      },
      [`.${prefixCls}-cover`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        color: t.colorTextLightSolid,
        background: 'rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        opacity: 0,
        transition: `opacity ${t.motionDurationSlow}`,
      },
      [`.${prefixCls}:hover .${prefixCls}-cover, .${prefixCls}:focus-visible .${prefixCls}-cover`]:
        {
          opacity: 1,
        },
      [`.${prefixCls}-cover-top`]: {
        inset: '0 0 auto 0',
      },
      [`.${prefixCls}-cover-bottom`]: {
        inset: 'auto 0 0 0',
      },
      [`.${prefixCls}-progress-wrapper`]: {
        position: 'relative',
        display: 'inline-block',
        overflow: 'hidden',
        'border-radius': 'inherit',
        'background-color': t.colorBgBase,
        'backdrop-filter': 'blur(8px)',
      },
      [`.${prefixCls}-progress-ink-1, .${prefixCls}-progress-ink-2`]: {
        position: 'absolute',
        width: '150%',
        height: '150%',
        left: '-25%',
        top: '-25%',
        'pointer-events': 'none',
        'will-change': 'transform, opacity',
        'animation-duration': progressAnimationDuration,
        'animation-iteration-count': 'infinite',
        'animation-timing-function': t.motionEaseInOut,
      },
      [`.${prefixCls}-progress-ink-1`]: {
        background:
          'radial-gradient(ellipse 65% 55% at 25% 30%, rgba(100, 180, 255, 0.98) 0%, transparent 55%)',
        filter: 'blur(40px)',
      },
      [`.${prefixCls}-progress-ink-2`]: {
        background:
          'radial-gradient(ellipse 45% 40% at 60% 20%, rgba(255, 150, 200, 0.88) 0%, transparent 45%)',
        filter: 'blur(42px)',
      },
      [`.${prefixCls}-progress-content`]: {
        position: 'absolute',
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        width: '100%',
        'padding-inline': `${t.paddingLG}px`,
        'text-align': 'center',
        'font-size': `${t.fontSize}px`,
        color: t.colorTextSecondary,
        'z-index': 1,
      },
      [`.${prefixCls}-progress-rail`]: {
        width: '100%',
        height: '6px',
        'margin-top': `${t.marginSM}px`,
        'background-color': alphaWhite(0.5),
        'border-radius': `${t.borderRadiusXS}px`,
        overflow: 'hidden',
      },
      [`.${prefixCls}-progress-rail::before`]: {
        content: '""',
        display: 'block',
        height: '100%',
        width: 'var(--progress-percent, 0%)',
        background:
          'linear-gradient(90deg, rgba(120, 170, 255, 0.85) 0%, rgba(160, 150, 245, 0.85) 40%, rgba(130, 200, 220, 0.85) 60%, rgba(120, 170, 255, 0.85) 100%)',
        'background-size': '200% 100%',
        'border-radius': `${t.borderRadiusXS / 2}px`,
        transition: `width ${t.motionDurationMid} ease`,
      },
      [`.${prefixCls}-progress-indicator`]: {
        'margin-top': `${t.marginXS}px`,
      },
      [`.${prefixCls}-preview`]: {
        'text-align': 'center',
        inset: 0,
        position: 'fixed',
        'user-select': 'none',
        'z-index': t.zIndexPopupBase + 80,
      },
      [`.${prefixCls}-preview-mask`]: {
        inset: 0,
        position: 'absolute',
        background: t.colorBgMask,
        'backdrop-filter': 'blur(0px)',
        transition: `backdrop-filter ${t.motionDurationSlow}`,
      },
      [`.${prefixCls}-preview-mask-hidden`]: {
        display: 'none',
      },
      [`.${prefixCls}-preview-body`]: {
        position: 'absolute',
        inset: 0,
        'pointer-events': 'none',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      },
      [`.${prefixCls}-preview-body > *`]: {
        'pointer-events': 'auto',
      },
      [`.${prefixCls}-preview-img`]: {
        'max-width': '100%',
        'max-height': '70%',
        'vertical-align': 'middle',
        transition: `transform ${t.motionDurationSlow} ${t.motionEaseOut} 0s`,
      },
      [`.${prefixCls}-preview-movable .${prefixCls}-preview-img`]: {
        cursor: 'grab',
      },
      [`.${prefixCls}-preview-moving .${prefixCls}-preview-img`]: {
        cursor: 'grabbing',
      },
      [`.${prefixCls}-preview-close, .${prefixCls}-preview-switch`]: {
        position: 'absolute',
        color: t.colorTextLightSolid,
        'background-color': operationBg,
        'border-radius': '50%',
        padding: `${t.paddingSM}px`,
        outline: 0,
        border: 0,
        cursor: 'pointer',
        transition: `all ${t.motionDurationSlow}`,
        display: 'flex',
        'font-size': `${previewOperationSize}px`,
      },
      [`.${prefixCls}-preview-close:hover, .${prefixCls}-preview-switch:hover`]: {
        'background-color': operationBgHover,
      },
      [`.${prefixCls}-preview-close`]: {
        top: `${t.marginSM}px`,
        right: `${t.marginSM}px`,
      },
      [`.${prefixCls}-preview-switch`]: {
        top: '50%',
        transform: 'translateY(-50%)',
      },
      [`.${prefixCls}-preview-switch-prev`]: {
        left: `${t.marginSM}px`,
      },
      [`.${prefixCls}-preview-switch-next`]: {
        right: `${t.marginSM}px`,
      },
      [`.${prefixCls}-preview-footer`]: {
        position: 'absolute',
        bottom: `${t.marginXL}px`,
        left: '50%',
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        color: alphaWhite(0.65),
        transform: 'translateX(-50%)',
        gap: `${t.margin}px`,
      },
      [`.${prefixCls}-preview-progress`]: {
        color: t.colorTextLightSolid,
      },
      [`.${prefixCls}-preview-actions`]: {
        display: 'flex',
        gap: `${t.paddingSM}px`,
        padding: `0 ${t.paddingLG}px`,
        'background-color': operationBg,
        'border-radius': '100px',
        'font-size': `${previewOperationSize}px`,
      },
      [`.${prefixCls}-preview-actions-action`]: {
        color: 'inherit',
        background: 'transparent',
        border: 0,
        font: 'inherit',
        padding: `${t.paddingSM}px`,
        cursor: 'pointer',
        transition: `all ${t.motionDurationSlow}`,
        display: 'flex',
      },
      [`.${prefixCls}-preview-actions-action:hover`]: {
        color: alphaWhite(0.85),
      },
      [`.${prefixCls}-preview-actions-action-disabled`]: {
        color: alphaWhite(0.25),
        cursor: 'not-allowed',
      },
    }
  })
}
