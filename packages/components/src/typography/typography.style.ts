import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'
export function useTypographyStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Typography', prefixCls] },
    () => {
      const t = token()
      const tt = getComponentToken('Typography', t)
      return {
        [`.${prefixCls}`]: {
          color: t.colorText,
          'font-family': t.fontFamily,
          'font-size': t.fontSize,
          'line-height': t.lineHeight,
        },
        [`a.${prefixCls}`]: {
          color: t.colorPrimary,
          cursor: 'pointer',
          'text-decoration': 'none',
          '&:hover': { color: t.colorPrimaryHover, 'text-decoration': 'underline' },
        },
        [`.${prefixCls}-title`]: {
          margin: `0 0 ${tt.titleMarginBottom}px`,
          color: t.colorText,
          'font-weight': tt.titleFontWeight,
        },
        [`.${prefixCls}-secondary`]: { color: t.colorTextSecondary },
        [`.${prefixCls}-success`]: { color: t.colorSuccess },
        [`.${prefixCls}-warning`]: { color: t.colorWarning },
        [`.${prefixCls}-danger`]: { color: t.colorError },
        [`.${prefixCls}-paragraph`]: { margin: `0 0 ${tt.paragraphMarginBottom}px` },
        [`.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
          'user-select': 'none',
        },
        [`.${prefixCls} code`]: {
          margin: '0 0.2em',
          padding: '0.2em 0.4em',
          'font-size': '85%',
          'background-color': t.colorFillAlter,
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls} mark`]: {
          padding: 0,
          'background-color': t.colorWarning,
        },
        [`.${prefixCls} kbd`]: {
          margin: '0 0.2em',
          padding: '0.15em 0.4em',
          'font-size': '90%',
          'background-color': t.colorBgContainer,
          border: `1px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          'box-shadow': `0 1px 0 ${t.colorBorder}`,
        },
        [`.${prefixCls}-content`]: {
          display: 'inline',
        },
        [`.${prefixCls}-edit-content`]: {
          margin: 0,
          padding: 0,
          color: 'inherit',
          font: 'inherit',
          'text-align': 'inherit',
          cursor: 'pointer',
          background: 'transparent',
          border: 0,
        },
        [`.${prefixCls}-actions`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
          margin: `0 ${t.marginXS}px`,
          'vertical-align': 'baseline',
        },
        [`.${prefixCls}-action`]: {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          width: `${t.controlHeightSM}px`,
          height: `${t.controlHeightSM}px`,
          padding: 0,
          color: t.colorTextSecondary,
          cursor: 'pointer',
          background: 'transparent',
          border: 0,
          'border-radius': `${t.borderRadius}px`,
          '&:hover': {
            color: t.colorPrimary,
            'background-color': t.colorFillAlter,
          },
          '&:disabled': {
            color: t.colorTextDisabled,
            cursor: 'not-allowed',
            background: 'transparent',
          },
          svg: {
            width: '1em',
            height: '1em',
          },
        },
        [`.${prefixCls}-editing`]: {
          display: 'inline-flex',
          'align-items': 'flex-start',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-textarea`]: {
          'min-width': '12em',
          padding: `${t.paddingXS}px`,
          color: t.colorText,
          'font-family': t.fontFamily,
          'font-size': t.fontSize,
          'line-height': t.lineHeight,
          background: t.colorBgContainer,
          border: `1px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
        },
        [`.${prefixCls}-ellipsis`]: {
          overflow: 'hidden',
          'white-space': 'nowrap',
          'text-overflow': 'ellipsis',
        },
        [`.${prefixCls}-ellipsis-multiple-line`]: {
          'white-space': 'normal',
        },
        [`.${prefixCls}-expanded`]: {
          overflow: 'visible',
          'white-space': 'normal',
        },
        [`.${prefixCls}-ellipsis-suffix`]: {
          margin: `0 ${t.marginXS}px`,
        },
        [`.${prefixCls}-ellipsis-symbol`]: {
          margin: `0 0 0 ${t.marginXS}px`,
          padding: 0,
          color: t.colorPrimary,
          cursor: 'pointer',
          background: 'transparent',
          border: 0,
          font: 'inherit',
        },
      }
    },
  )
}
