import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useMasonryStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Masonry', prefixCls] },
    () => ({
      [`.${prefixCls}`]: {
        display: 'grid',
        'grid-template-columns': 'repeat(var(--ads-masonry-columns, auto-fit), minmax(0, 1fr))',
        'column-gap': 'var(--ads-masonry-horizontal-gutter, 0px)',
        width: '100%',
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-column`]: {
        display: 'flex',
        'flex-direction': 'column',
        gap: 'var(--ads-masonry-vertical-gutter, 0px)',
        'min-width': 0,
      },
      [`.${prefixCls}-item`]: {
        width: '100%',
        'box-sizing': 'border-box',
      },
    }),
  )
}
