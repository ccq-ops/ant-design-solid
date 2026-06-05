import { children, For, splitProps } from 'solid-js'
import { getComponentToken, type GlobalToken } from '@ant-design-solid/theme'
import { useConfig, useToken } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useSpaceStyle } from './space.style'
import type { SpaceProps, SpaceSize } from './interface'
function resolveGap(size: SpaceSize | undefined, token: GlobalToken): [number, number] {
  const ct = getComponentToken('Space', token)
  if (Array.isArray(size)) return size
  if (typeof size === 'number') return [size, size]
  if (size === 'small') return [ct.gapSmall, ct.gapSmall]
  if (size === 'large') return [ct.gapLarge, ct.gapLarge]
  return [ct.gapMiddle, ct.gapMiddle]
}

function isRenderableItem(item: unknown) {
  if (item === null || item === undefined || item === false) return false
  if (item instanceof Text && item.data === '') return false
  return true
}

export function Space(props: SpaceProps) {
  const [local, rest] = splitProps(props, [
    'size',
    'direction',
    'align',
    'wrap',
    'split',
    'class',
    'children',
  ])
  const config = useConfig()
  const token = useToken()
  const prefixCls = () => `${config.prefixCls()}-space`
  const [, hashId] = useSpaceStyle(prefixCls())
  const resolved = children(() => local.children)
  const items = () => resolved.toArray().filter(isRenderableItem)
  const gap = () => resolveGap(local.size, token())
  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        (local.direction ?? 'horizontal') === 'vertical' && `${prefixCls()}-vertical`,
        local.wrap && `${prefixCls()}-wrap`,
        hashId(),
        local.class,
      )}
      style={{
        'row-gap': `${gap()[1]}px`,
        'column-gap': `${gap()[0]}px`,
        'align-items': local.align,
      }}
    >
      <For each={items()}>
        {(item, index) => (
          <>
            <span class={`${prefixCls()}-item`}>{item}</span>
            {local.split && index() < items().length - 1 ? (
              <span class={`${prefixCls()}-split`}>{local.split}</span>
            ) : null}
          </>
        )}
      </For>
    </div>
  )
}
