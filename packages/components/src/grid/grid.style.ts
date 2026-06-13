import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'
import type { Breakpoint } from '../shared/responsive-observer'
import { responsiveArrayReversed } from '../shared/responsive-observer'

type StyleValue = string | number
interface StyleObject {
  [key: string]: StyleValue | StyleObject
}

export function useGridStyle(rowPrefixCls: string, colPrefixCls: string) {
  const token = useToken()
  const rootPrefixCls = colPrefixCls.endsWith('-col') ? colPrefixCls.slice(0, -4) : colPrefixCls
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Grid', rowPrefixCls, colPrefixCls] },
    () => {
      const styles: Record<string, StyleObject> = {
        [`.${rowPrefixCls}`]: { display: 'flex', 'flex-flow': 'row wrap', 'min-width': 0 },
        [`.${rowPrefixCls}-no-wrap`]: { 'flex-wrap': 'nowrap' },
        [`.${rowPrefixCls}-start`]: { 'justify-content': 'flex-start' },
        [`.${rowPrefixCls}-center`]: { 'justify-content': 'center' },
        [`.${rowPrefixCls}-end`]: { 'justify-content': 'flex-end' },
        [`.${rowPrefixCls}-space-between`]: { 'justify-content': 'space-between' },
        [`.${rowPrefixCls}-space-around`]: { 'justify-content': 'space-around' },
        [`.${rowPrefixCls}-space-evenly`]: { 'justify-content': 'space-evenly' },
        [`.${rowPrefixCls}-top`]: { 'align-items': 'flex-start' },
        [`.${rowPrefixCls}-middle`]: { 'align-items': 'center' },
        [`.${rowPrefixCls}-bottom`]: { 'align-items': 'flex-end' },
        [`.${rowPrefixCls}-stretch`]: { 'align-items': 'stretch' },
        [`.${colPrefixCls}`]: { position: 'relative', 'max-width': '100%', 'min-height': 1 },
      }

      const createGridStyles = (suffix: string): Record<string, StyleObject> => {
        const gridStyles: Record<string, StyleObject> = {}
        gridStyles[`.${colPrefixCls}${suffix}-0`] = { display: 'none' }
        gridStyles[`.${colPrefixCls}${suffix}-push-0`] = { left: 'auto' }
        gridStyles[`.${colPrefixCls}${suffix}-pull-0`] = { right: 'auto' }
        gridStyles[`.${colPrefixCls}${suffix}-offset-0`] = { 'margin-left': 0 }
        gridStyles[`.${colPrefixCls}${suffix}-order-0`] = { order: 0 }
        gridStyles[`.${colPrefixCls}${suffix}-flex`] = {
          flex: `var(--${rootPrefixCls}-col-${suffix.replace('-', '')}-flex)`,
        }

        for (let index = 1; index <= 24; index += 1) {
          const percent = `${(index / 24) * 100}%`
          gridStyles[`.${colPrefixCls}${suffix}-${index}`] = {
            display: 'block',
            flex: `0 0 ${percent}`,
            'max-width': percent,
          }
          gridStyles[`.${colPrefixCls}${suffix}-offset-${index}`] = { 'margin-left': percent }
          gridStyles[`.${colPrefixCls}${suffix}-push-${index}`] = { left: percent }
          gridStyles[`.${colPrefixCls}${suffix}-pull-${index}`] = { right: percent }
          gridStyles[`.${colPrefixCls}${suffix}-order-${index}`] = { order: index }
        }

        return gridStyles
      }

      const mediaSize: Record<Breakpoint, number> = {
        xs: token().screenXSMin,
        sm: token().screenSMMin,
        md: token().screenMDMin,
        lg: token().screenLGMin,
        xl: token().screenXLMin,
        xxl: token().screenXXLMin,
        xxxl: token().screenXXXLMin,
      }

      Object.assign(styles, createGridStyles(''), createGridStyles('-xs'))
      responsiveArrayReversed
        .filter((breakpoint) => breakpoint !== 'xs')
        .forEach((breakpoint) => {
          styles[`@media (min-width: ${mediaSize[breakpoint]}px)`] = createGridStyles(
            `-${breakpoint}`,
          )
        })

      return styles
    },
  )
}
