import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useCardStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Card', prefixCls] }, () => {
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
        background: t.colorBgContainer,
        'border-radius': `${t.borderRadius}px`,
        transition: `box-shadow ${t.motionDurationMid} ${t.motionEaseInOut}, border-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-bordered`]: {
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-hoverable`]: {
        cursor: 'pointer',
        '&:hover': {
          'border-color': 'transparent',
          'box-shadow': t.boxShadow,
        },
      },
      [`.${prefixCls}-head`]: {
        display: 'flex',
        'align-items': 'center',
        'min-height': `${t.controlHeightLG + t.padding}px`,
        'padding-inline': `${t.paddingLG}px`,
        color: t.colorText,
        'font-weight': 600,
        'font-size': `${t.fontSize + 2}px`,
        'border-block-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
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
        color: t.colorText,
        'font-weight': 400,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-body`]: {
        padding: `${t.paddingLG}px`,
      },
      [`.${prefixCls}-cover`]: {
        display: 'block',
        overflow: 'hidden',
        'border-start-start-radius': `${t.borderRadius}px`,
        'border-start-end-radius': `${t.borderRadius}px`,
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
        background: t.colorFillAlter,
        'border-block-start': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-actions > li`]: {
        flex: 1,
        margin: `${t.paddingSM}px 0`,
        color: t.colorTextSecondary,
        'text-align': 'center',
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
      [`.${prefixCls}-small > .${prefixCls}-head`]: {
        'min-height': `${t.controlHeight}px`,
        'padding-inline': `${t.paddingSM}px`,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-small > .${prefixCls}-body`]: {
        padding: `${t.paddingSM}px`,
      },
    }
  })
}
