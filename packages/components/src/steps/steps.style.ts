import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useStepsStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Steps', prefixCls] }, () => {
    const t = token()
    const iconSize = 32
    const smallIconSize = 24
    const tailColor = t.colorBorderSecondary ?? t.colorBorder

    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': String(t.lineHeight),
      },
      [`.${prefixCls}-list`]: {
        display: 'flex',
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-horizontal .${prefixCls}-list`]: {
        'flex-direction': 'row',
      },
      [`.${prefixCls}-vertical .${prefixCls}-list`]: {
        'flex-direction': 'column',
      },
      [`.${prefixCls}-item`]: {
        position: 'relative',
        display: 'flex',
        flex: '1 1 0',
        'min-width': 0,
        padding: 0,
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item:not(:last-child)`]: {
        'padding-inline-end': `${t.padding}px`,
      },
      [`.${prefixCls}-vertical .${prefixCls}-item`]: {
        flex: '0 0 auto',
        'padding-bottom': `${t.paddingLG}px`,
      },
      [`.${prefixCls}-item-container`]: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        padding: 0,
        border: 0,
        color: 'inherit',
        background: 'transparent',
        'font-family': 'inherit',
        'font-size': 'inherit',
        'line-height': 'inherit',
        'text-align': 'start',
      },
      [`.${prefixCls}-item-wrapper`]: {
        position: 'relative',
        display: 'flex',
        width: '100%',
      },
      [`.${prefixCls}-item-section`]: {
        display: 'flex',
        'min-width': 0,
      },
      [`.${prefixCls}-item-header`]: {
        display: 'inline-flex',
        'align-items': 'flex-start',
        'min-width': 0,
      },
      [`.${prefixCls}-navigation .${prefixCls}-item-container`]: {
        cursor: 'pointer',
      },
      [`.${prefixCls}-navigation .${prefixCls}-item-container:hover .${prefixCls}-item-title`]: {
        color: t.colorPrimaryHover,
      },
      [`.${prefixCls}-navigation .${prefixCls}-item-disabled .${prefixCls}-item-container`]: {
        cursor: 'not-allowed',
      },
      [`.${prefixCls}-navigation .${prefixCls}-item-container:focus-visible`]: {
        outline: `${t.lineWidth}px solid ${t.colorPrimary}`,
        'outline-offset': '2px',
        'border-radius': `${t.borderRadius}px`,
      },
      [`.${prefixCls}-item-icon`]: {
        position: 'relative',
        'z-index': '1',
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'flex-shrink': '0',
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        'margin-inline-end': `${t.marginSM}px`,
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        'border-radius': '50%',
        background: t.colorBgContainer,
        color: t.colorTextSecondary,
        'font-size': `${t.fontSize}px`,
        'font-weight': '400',
        'line-height': '1',
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}, border-color ${t.motionDurationMid} ${t.motionEaseInOut}, color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-small .${prefixCls}-item-icon`]: {
        width: `${smallIconSize}px`,
        height: `${smallIconSize}px`,
        'margin-inline-end': `${t.marginXS}px`,
        'font-size': `${t.fontSize - 2}px`,
      },
      [`.${prefixCls}-item-content`]: {
        display: 'block',
        'min-width': 0,
        'padding-top': '4px',
      },
      [`.${prefixCls}-item-section > .${prefixCls}-item-content`]: {
        'padding-top': '4px',
      },
      [`.${prefixCls}-small .${prefixCls}-item-content`]: {
        'padding-top': '1px',
      },
      [`.${prefixCls}-item-title`]: {
        display: 'inline-block',
        color: t.colorText,
        'font-weight': '400',
        transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-item-description`]: {
        margin: `${t.marginXS / 2}px 0 0`,
        color: t.colorTextSecondary,
        'font-size': `${t.fontSize}px`,
        'line-height': String(t.lineHeight),
      },
      [`.${prefixCls}-small .${prefixCls}-item-description`]: {
        'font-size': `${t.fontSize - 2}px`,
      },
      [`.${prefixCls}-item-tail`]: {
        position: 'absolute',
        background: tailColor,
      },
      [`.${prefixCls}-item-rail`]: {
        position: 'absolute',
        background: tailColor,
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item-tail`]: {
        top: `${iconSize / 2}px`,
        inset: `0 ${t.padding}px auto ${iconSize + t.marginSM}px`,
        height: `${t.lineWidth}px`,
        transform: 'translateY(-50%)',
      },
      [`.${prefixCls}-horizontal .${prefixCls}-item-rail`]: {
        top: `${iconSize / 2}px`,
        inset: `0 ${t.padding}px auto ${iconSize + t.marginSM}px`,
        height: `${t.lineWidth}px`,
        transform: 'translateY(-50%)',
      },
      [`.${prefixCls}-small.${prefixCls}-horizontal .${prefixCls}-item-tail`]: {
        top: `${smallIconSize / 2}px`,
        inset: `0 ${t.padding}px auto ${smallIconSize + t.marginXS}px`,
      },
      [`.${prefixCls}-small.${prefixCls}-horizontal .${prefixCls}-item-rail`]: {
        top: `${smallIconSize / 2}px`,
        inset: `0 ${t.padding}px auto ${smallIconSize + t.marginXS}px`,
      },
      [`.${prefixCls}-vertical .${prefixCls}-item-tail`]: {
        top: `${iconSize + t.marginXS / 2}px`,
        bottom: `${t.marginXS / 2}px`,
        inset: `${iconSize + t.marginXS / 2}px auto ${t.marginXS / 2}px ${iconSize / 2}px`,
        width: `${t.lineWidth}px`,
        transform: 'translateX(-50%)',
      },
      [`.${prefixCls}-vertical .${prefixCls}-item-rail`]: {
        top: `${iconSize + t.marginXS / 2}px`,
        bottom: `${t.marginXS / 2}px`,
        inset: `${iconSize + t.marginXS / 2}px auto ${t.marginXS / 2}px ${iconSize / 2}px`,
        width: `${t.lineWidth}px`,
        transform: 'translateX(-50%)',
      },
      [`.${prefixCls}-small.${prefixCls}-vertical .${prefixCls}-item-tail`]: {
        top: `${smallIconSize + t.marginXS / 2}px`,
        inset: `${smallIconSize + t.marginXS / 2}px auto ${t.marginXS / 2}px ${smallIconSize / 2}px`,
      },
      [`.${prefixCls}-small.${prefixCls}-vertical .${prefixCls}-item-rail`]: {
        top: `${smallIconSize + t.marginXS / 2}px`,
        inset: `${smallIconSize + t.marginXS / 2}px auto ${t.marginXS / 2}px ${smallIconSize / 2}px`,
      },
      [`.${prefixCls}-item:last-child .${prefixCls}-item-tail`]: {
        display: 'none',
      },
      [`.${prefixCls}-item:last-child .${prefixCls}-item-rail`]: {
        display: 'none',
      },
      [`.${prefixCls}-item-finish .${prefixCls}-item-icon`]: {
        border: `${t.lineWidth}px solid ${t.colorPrimary}`,
        color: t.colorPrimary,
      },
      [`.${prefixCls}-item-finish .${prefixCls}-item-tail`]: {
        background: t.colorPrimary,
      },
      [`.${prefixCls}-item-process .${prefixCls}-item-icon`]: {
        border: `${t.lineWidth}px solid ${t.colorPrimary}`,
        background: t.colorPrimary,
        color: t.colorBgContainer,
      },
      [`.${prefixCls}-item-process .${prefixCls}-item-title`]: {
        'font-weight': '600',
      },
      [`.${prefixCls}-item-error .${prefixCls}-item-icon`]: {
        border: `${t.lineWidth}px solid ${t.colorError}`,
        color: t.colorError,
      },
      [`.${prefixCls}-item-error .${prefixCls}-item-title`]: {
        color: t.colorError,
      },
      [`.${prefixCls}-item-wait .${prefixCls}-item-icon`]: {
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        color: t.colorTextDisabled,
      },
      [`.${prefixCls}-item-disabled`]: {
        color: t.colorTextDisabled,
      },
      [`.${prefixCls}-item-disabled .${prefixCls}-item-title, .${prefixCls}-item-disabled .${prefixCls}-item-description`]:
        {
          color: t.colorTextDisabled,
        },
      [`.${prefixCls}-item-disabled .${prefixCls}-item-icon`]: {
        border: `${t.lineWidth}px solid ${t.colorBorder}`,
        color: t.colorTextDisabled,
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-dot .${prefixCls}-item-icon`]: {
        width: '10px',
        height: '10px',
        'margin-inline-end': `${t.marginSM}px`,
        border: `${t.lineWidth * 2}px solid ${t.colorPrimary}`,
        background: t.colorBgContainer,
        color: t.colorPrimary,
        'font-size': 0,
      },
      [`.${prefixCls}-dot .${prefixCls}-item-dot`]: {
        display: 'block',
        width: '100%',
        height: '100%',
        'border-radius': '50%',
      },
      [`.${prefixCls}-dot.${prefixCls}-variant-filled .${prefixCls}-item-icon`]: {
        background: t.colorPrimary,
        color: t.colorBgContainer,
      },
      [`.${prefixCls}-dot.${prefixCls}-variant-outlined .${prefixCls}-item-icon`]: {
        background: t.colorBgContainer,
      },
      [`.${prefixCls}-dot .${prefixCls}-item-process .${prefixCls}-item-icon`]: {
        background: t.colorPrimary,
        color: t.colorBgContainer,
      },
      [`.${prefixCls}-dot .${prefixCls}-item-wait .${prefixCls}-item-icon`]: {
        border: `${t.lineWidth * 2}px solid ${t.colorBorder}`,
        color: t.colorTextDisabled,
      },
    }
  })
}
