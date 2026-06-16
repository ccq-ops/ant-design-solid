import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useCardStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Card', prefixCls] }, () => {
    const t = token()
    const card = getComponentToken('Card', t)
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        position: 'relative',
        background: t.colorBgContainer,
        'border-radius': `${t.borderRadiusLG}px`,
        transition: `box-shadow ${t.motionDurationMid} ${t.motionEaseInOut}, border-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-bordered`]: {
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-borderless`]: {
        border: 0,
      },
      [`.${prefixCls}-hoverable`]: {
        cursor: 'pointer',
        '&:hover': {
          'border-color': 'transparent',
          'box-shadow': t.boxShadowCard,
        },
      },
      [`.${prefixCls}-head`]: {
        'min-height': `${card.headerHeight}px`,
        'padding-inline': `${card.headerPadding}px`,
        color: t.colorText,
        'font-weight': 600,
        'font-size': `${card.headerFontSize}px`,
        background: card.headerBg,
        'border-block-end': `${t.lineWidth}px solid ${card.headerBorderBottom}`,
        'border-radius': `${t.borderRadiusLG}px ${t.borderRadiusLG}px 0 0`,
      },
      [`.${prefixCls}-head-wrapper`]: {
        display: 'flex',
        'align-items': 'center',
        width: '100%',
        'min-height': `${card.headerHeight}px`,
      },
      [`.${prefixCls}-head-title`]: {
        display: 'inline-block',
        flex: 1,
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
      },
      [`.${prefixCls}-extra`]: {
        'margin-inline-start': `${t.margin}px`,
        color: card.extraColor,
        'font-weight': 400,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-body`]: {
        padding: `${card.bodyPadding}px`,
      },
      [`.${prefixCls}-body::before, .${prefixCls}-body::after`]: {
        display: 'table',
        content: '""',
      },
      [`.${prefixCls}-body::after`]: {
        clear: 'both',
      },
      [`.${prefixCls}-cover`]: {
        display: 'block',
        overflow: 'hidden',
        'border-start-start-radius': `${t.borderRadiusLG}px`,
        'border-start-end-radius': `${t.borderRadiusLG}px`,
        [`& > img, & > picture > img`]: {
          display: 'block',
          width: '100%',
        },
      },
      [`.${prefixCls}-actions`]: {
        display: 'flex',
        margin: 0,
        padding: 0,
        'list-style': 'none',
        background: card.actionsBg,
        'border-block-start': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-actions > li`]: {
        flex: 1,
        margin: `${card.actionsLiMargin}px 0`,
        color: t.colorTextSecondary,
        'text-align': 'center',
      },
      [`.${prefixCls}-actions > li > span`]: {
        position: 'relative',
        display: 'block',
        'min-width': `${t.controlHeightSM}px`,
        'font-size': `${t.fontSize}px`,
        'line-height': `${t.controlHeightSM}px`,
        cursor: 'pointer',
      },
      [`.${prefixCls}-actions > li:not(:last-child)`]: {
        'border-inline-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-actions a`]: {
        color: t.colorTextSecondary,
        transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
        '&:hover': {
          color: t.colorPrimaryHover,
        },
      },
      [`.${prefixCls}-head-tabs`]: {
        clear: 'both',
        'margin-bottom': `${card.tabsMarginBottom}px`,
        color: t.colorText,
        'font-weight': 'normal',
      },
      [`.${prefixCls}-head-tabs .${prefixCls.replace('-card', '-tabs')}-nav`]: {
        'margin-bottom': 0,
      },
      [`.${prefixCls}-type-inner .${prefixCls}-head`]: {
        'padding-inline': `${t.padding}px`,
        background: t.colorFillAlter,
      },
      [`.${prefixCls}-type-inner .${prefixCls}-head-wrapper`]: {
        'min-height': `${t.controlHeightLG}px`,
      },
      [`.${prefixCls}-type-inner .${prefixCls}-body`]: {
        padding: `${t.padding}px`,
      },
      [`.${prefixCls}-contain-grid .${prefixCls}-body`]: {
        display: 'flex',
        'flex-wrap': 'wrap',
        padding: 0,
      },
      [`.${prefixCls}-grid`]: {
        width: '33.33%',
        padding: `${card.bodyPadding}px`,
        'border-radius': 0,
        'box-shadow': `${t.lineWidth}px 0 0 0 ${t.colorBorderSecondary}, 0 ${t.lineWidth}px 0 0 ${t.colorBorderSecondary}, ${t.lineWidth}px ${t.lineWidth}px 0 0 ${t.colorBorderSecondary}, ${t.lineWidth}px 0 0 0 ${t.colorBorderSecondary} inset, 0 ${t.lineWidth}px 0 0 ${t.colorBorderSecondary} inset`,
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-grid-hoverable:hover`]: {
        position: 'relative',
        'z-index': 1,
        'box-shadow': t.boxShadowCard,
      },
      [`.${prefixCls}-meta`]: {
        display: 'flex',
        margin: `${-t.marginXXS}px 0`,
      },
      [`.${prefixCls}-meta-avatar`]: {
        'padding-inline-end': `${t.padding}px`,
      },
      [`.${prefixCls}-meta-section`]: {
        flex: 1,
        overflow: 'hidden',
      },
      [`.${prefixCls}-meta-title`]: {
        overflow: 'hidden',
        color: t.colorText,
        'font-weight': 600,
        'font-size': `${t.fontSizeLG}px`,
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
      },
      [`.${prefixCls}-meta-description`]: {
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-small > .${prefixCls}-head`]: {
        'min-height': `${card.headerHeightSM}px`,
        'padding-inline': `${card.headerPaddingSM}px`,
        'font-size': `${card.headerFontSizeSM}px`,
      },
      [`.${prefixCls}-small > .${prefixCls}-head > .${prefixCls}-head-wrapper`]: {
        'min-height': `${card.headerHeightSM}px`,
      },
      [`.${prefixCls}-small > .${prefixCls}-body`]: {
        padding: `${card.bodyPaddingSM}px`,
      },
      [`.${prefixCls}-small.${prefixCls}-contain-grid > .${prefixCls}-body`]: {
        padding: 0,
      },
      [`.${prefixCls}-small .${prefixCls}-grid`]: {
        padding: `${card.bodyPaddingSM}px`,
      },
    }
  })
}
