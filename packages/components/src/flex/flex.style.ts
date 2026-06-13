import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

const flexWrapValues = ['wrap', 'nowrap', 'wrap-reverse'] as const
const justifyContentValues = [
  'flex-start',
  'flex-end',
  'start',
  'end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
  'stretch',
  'normal',
  'left',
  'right',
] as const
const alignItemsValues = [
  'center',
  'start',
  'end',
  'flex-start',
  'flex-end',
  'self-start',
  'self-end',
  'baseline',
  'normal',
  'stretch',
] as const

export function useFlexStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Flex', prefixCls] }, () => {
    const flexToken = getComponentToken('Flex', token())
    const wrapStyles: Record<string, { 'flex-wrap': string }> = {}
    const justifyStyles: Record<string, { 'justify-content': string }> = {}
    const alignStyles: Record<string, { 'align-items': string }> = {}

    flexWrapValues.forEach((value) => {
      wrapStyles[`.${prefixCls}-wrap-${value}`] = { 'flex-wrap': value }
    })
    justifyContentValues.forEach((value) => {
      justifyStyles[`.${prefixCls}-justify-${value}`] = { 'justify-content': value }
    })
    alignItemsValues.forEach((value) => {
      alignStyles[`.${prefixCls}-align-${value}`] = { 'align-items': value }
    })

    return {
      [`.${prefixCls}`]: {
        display: 'flex',
        margin: 0,
        padding: 0,
        '&:empty': {
          display: 'none',
        },
      },
      [`.${prefixCls}-inline`]: {
        display: 'inline-flex',
      },
      [`.${prefixCls}-vertical`]: {
        'flex-direction': 'column',
      },
      [`.${prefixCls}-rtl`]: {
        direction: 'rtl',
      },
      [`.${prefixCls}-wrap`]: {
        'flex-wrap': 'wrap',
      },
      [`.${prefixCls}-wrap-reverse`]: {
        'flex-wrap': 'wrap-reverse',
      },
      [`.${prefixCls}-nowrap`]: {
        'flex-wrap': 'nowrap',
      },
      [`.${prefixCls}-gap-small`]: {
        gap: flexToken.flexGapSM,
      },
      [`.${prefixCls}-gap-medium, .${prefixCls}-gap-middle`]: {
        gap: flexToken.flexGap,
      },
      [`.${prefixCls}-gap-large`]: {
        gap: flexToken.flexGapLG,
      },
      ...wrapStyles,
      ...justifyStyles,
      ...alignStyles,
    }
  })
}
