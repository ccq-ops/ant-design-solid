import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useCollapseStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Collapse', prefixCls] },
    () => {
      const t = token()
      const collapse = getComponentToken('Collapse', t)
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
          background: t.colorFillAlter,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-large`]: {
          'font-size': `${t.fontSizeLG}px`,
        },
        [`.${prefixCls}-small`]: {
          'font-size': `${t.fontSizeSM}px`,
        },
        [`.${prefixCls}-borderless`]: {
          border: 0,
          background: t.colorBgContainer,
        },
        [`.${prefixCls}-ghost`]: {
          border: 0,
          background: 'transparent',
        },
        [`.${prefixCls}-item`]: {
          'border-bottom': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-item:last-child`]: {
          'border-bottom': 0,
        },
        [`.${prefixCls}-ghost > .${prefixCls}-item`]: {
          'border-bottom': 0,
        },
        [`.${prefixCls}-header`]: {
          display: 'flex',
          'align-items': 'center',
          gap: `${t.marginSM}px`,
          padding: collapse.headerPadding,
          color: t.colorText,
          background: collapse.headerBg,
        },
        [`.${prefixCls}-small > .${prefixCls}-item > .${prefixCls}-header`]: {
          padding: collapse.headerPaddingSM,
        },
        [`.${prefixCls}-item-disabled > .${prefixCls}-header`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-expand-icon`]: {
          flex: 'none',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: `${t.fontSize}px`,
          height: `${t.fontSize}px`,
          padding: 0,
          color: 'inherit',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          transition: `transform ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}-no-arrow > .${prefixCls}-header .${prefixCls}-expand-icon`]: {
          display: 'none',
        },
        [`.${prefixCls}-expand-icon:disabled`]: {
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-item-active .${prefixCls}-expand-icon`]: {
          transform: 'rotate(90deg)',
        },
        [`.${prefixCls}-header-button`]: {
          flex: 1,
          display: 'flex',
          'align-items': 'center',
          'min-width': 0,
          padding: 0,
          color: 'inherit',
          'font-size': 'inherit',
          'font-family': 'inherit',
          'line-height': 'inherit',
          'text-align': 'start',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
        },
        [`.${prefixCls}-header-button:disabled`]: {
          cursor: 'not-allowed',
        },
        [`.${prefixCls}-header-text`]: {
          flex: 1,
          'min-width': 0,
        },
        [`.${prefixCls}-extra`]: {
          flex: 'none',
          'margin-inline-start': `${t.margin}px`,
        },
        [`.${prefixCls}-content`]: {
          color: t.colorText,
          background: collapse.contentBg,
          'border-top': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-borderless .${prefixCls}-content, .${prefixCls}-ghost .${prefixCls}-content`]:
          {
            'border-top': 0,
          },
        [`.${prefixCls}-content-box`]: {
          padding: collapse.contentPadding,
        },
        [`.${prefixCls}-content-hidden`]: {
          display: 'none',
        },
        [`.${prefixCls}-icon-position-end .${prefixCls}-header, .${prefixCls}-icon-placement-end .${prefixCls}-header`]:
          {
            'flex-direction': 'row-reverse',
          },
        [`.${prefixCls}-icon-position-end .${prefixCls}-extra, .${prefixCls}-icon-placement-end .${prefixCls}-extra`]:
          {
            'margin-inline-start': 0,
            'margin-inline-end': `${t.margin}px`,
          },
      }
    },
  )
}
