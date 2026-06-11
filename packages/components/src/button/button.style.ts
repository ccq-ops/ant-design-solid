import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'
import { loadingIconRotateKeyframes, loadingIconRotateStyle } from '../shared/loading-icon-style'

const presetColorMap: Record<string, string> = {
  blue: '#1677ff',
  purple: '#722ed1',
  cyan: '#13c2c2',
  green: '#52c41a',
  magenta: '#eb2f96',
  pink: '#eb2f96',
  red: '#f5222d',
  orange: '#fa8c16',
  yellow: '#fadb14',
  volcano: '#fa541c',
  geekblue: '#2f54eb',
  lime: '#a0d911',
  gold: '#faad14',
}

function colorVariantStyles(prefixCls: string, colorName: string, color: string) {
  return {
    [`.${prefixCls}-color-${colorName}.${prefixCls}-variant-solid`]: {
      color: '#fff',
      background: color,
      borderColor: color,
    },
    [`.${prefixCls}-color-${colorName}.${prefixCls}-variant-outlined`]: {
      color,
      borderColor: color,
    },
    [`.${prefixCls}-color-${colorName}.${prefixCls}-variant-dashed`]: {
      color,
      borderColor: color,
      borderStyle: 'dashed',
    },
    [`.${prefixCls}-color-${colorName}.${prefixCls}-variant-filled`]: {
      color,
      background: `${color}1a`,
      borderColor: 'transparent',
    },
    [`.${prefixCls}-color-${colorName}.${prefixCls}-variant-text`]: {
      color,
      background: 'transparent',
      borderColor: 'transparent',
    },
    [`.${prefixCls}-color-${colorName}.${prefixCls}-variant-link`]: {
      color,
      background: 'transparent',
      borderColor: 'transparent',
      padding: 0,
      height: 'auto',
    },
  }
}

export function useButtonStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Button', prefixCls] }, () => {
    const t = token()
    const bt = getComponentToken('Button', t)
    const presetStyles = Object.fromEntries(
      Object.entries(presetColorMap).flatMap(([name, color]) =>
        Object.entries(colorVariantStyles(prefixCls, name, color)),
      ),
    )
    return {
      ...loadingIconRotateKeyframes,
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: `4px ${bt.paddingInline}px`,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        height: t.controlHeight,
        border: `${t.lineWidth}px solid ${bt.defaultBorderColor}`,
        'border-radius': bt.borderRadius,
        background: t.colorBgContainer,
        cursor: 'pointer',
        transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'text-decoration': 'none',
        '&:hover': { color: t.colorPrimaryHover, borderColor: t.colorPrimaryHover },
        '&[disabled], &-disabled': {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
          background: t.colorFillAlter,
          borderColor: t.colorBorder,
        },
      },
      [`.${prefixCls}-disabled`]: {
        color: t.colorTextDisabled,
        cursor: 'not-allowed',
        background: t.colorFillAlter,
        borderColor: t.colorBorder,
      },
      [`.${prefixCls}-primary`]: {
        color: bt.primaryColor,
        background: t.colorPrimary,
        borderColor: t.colorPrimary,
        '&:hover': {
          color: bt.primaryColor,
          background: t.colorPrimaryHover,
          borderColor: t.colorPrimaryHover,
        },
      },
      [`.${prefixCls}-dashed`]: { borderStyle: 'dashed' },
      [`.${prefixCls}-text`]: { borderColor: 'transparent', background: 'transparent' },
      [`.${prefixCls}-link`]: {
        borderColor: 'transparent',
        background: 'transparent',
        color: t.colorPrimary,
      },
      [`.${prefixCls}-variant-solid`]: {
        color: bt.primaryColor,
        background: t.colorPrimary,
        borderColor: t.colorPrimary,
      },
      [`.${prefixCls}-variant-outlined`]: {
        background: t.colorBgContainer,
      },
      [`.${prefixCls}-variant-dashed`]: { borderStyle: 'dashed' },
      [`.${prefixCls}-variant-filled`]: {
        background: t.colorFillAlter,
        borderColor: 'transparent',
      },
      [`.${prefixCls}-variant-text`]: {
        borderColor: 'transparent',
        background: 'transparent',
      },
      [`.${prefixCls}-variant-link`]: {
        borderColor: 'transparent',
        background: 'transparent',
        color: t.colorPrimary,
      },
      [`.${prefixCls}-color-default`]: {},
      ...colorVariantStyles(prefixCls, 'primary', t.colorPrimary),
      ...colorVariantStyles(prefixCls, 'danger', t.colorError),
      ...presetStyles,
      [`.${prefixCls}-sm`]: { height: t.controlHeightSM, padding: `0 ${t.paddingSM}px` },
      [`.${prefixCls}-lg`]: { height: t.controlHeightLG, padding: `6px ${t.paddingLG}px` },
      [`.${prefixCls}-circle`]: { width: t.controlHeight, 'border-radius': '50%', padding: 0 },
      [`.${prefixCls}-circle.${prefixCls}-sm`]: { width: t.controlHeightSM },
      [`.${prefixCls}-circle.${prefixCls}-lg`]: { width: t.controlHeightLG },
      [`.${prefixCls}-round`]: { 'border-radius': t.controlHeight },
      [`.${prefixCls}-dangerous`]: { color: t.colorError, borderColor: t.colorError },
      [`.${prefixCls}-block`]: { width: '100%' },
      [`.${prefixCls}-loading`]: { cursor: 'default' },
      [`.${prefixCls}-loading-icon`]: {
        transition: `width ${t.motionDurationMid} ${t.motionEaseInOut}, opacity ${t.motionDurationMid} ${t.motionEaseInOut}, margin ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      ...loadingIconRotateStyle(`.${prefixCls}-loading-icon svg`),
      [`.${prefixCls}-background-ghost`]: { background: 'transparent' },
      [`.${prefixCls}-icon`]: { display: 'inline-flex' },
      [`.${prefixCls}-icon-start`]: { 'margin-inline-end': 8 },
      [`.${prefixCls}-icon-end`]: { 'margin-inline-start': 8 },
    }
  })
}
