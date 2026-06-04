import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useMasonryStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Masonry', prefixCls] },
    () => ({
      [`.${prefixCls}`]: {
        display: 'grid',
        'grid-template-columns': 'repeat(var(--ads-masonry-columns, auto-fit), minmax(0, 1fr))',
        gap: 'var(--ads-masonry-gutter, 16px)',
        width: '100%',
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-column`]: {
        display: 'flex',
        'flex-direction': 'column',
        gap: 'var(--ads-masonry-gutter, 16px)',
        'min-width': 0,
      },
      [`.${prefixCls}-item`]: {
        width: '100%',
        'box-sizing': 'border-box',
      },
    }),
  )
}
