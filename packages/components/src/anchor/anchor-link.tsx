import { Show, createEffect, onCleanup, splitProps } from 'solid-js'
import { classNames } from '../shared/class-names'
import { useAnchorContext } from './context'
import type { AnchorItem, AnchorLinkProps } from './interface'

export function AnchorLink(props: AnchorLinkProps) {
  const [local, rest] = splitProps(props, [
    'href',
    'target',
    'title',
    'replace',
    'targetOffset',
    'children',
    'class',
    'className',
    'style',
  ])
  const context = useAnchorContext()
  const prefixCls = () => context?.prefixCls() ?? 'ads-anchor'
  const item = (): AnchorItem => ({
    href: local.href,
    target: local.target,
    title: local.title,
    replace: local.replace,
    targetOffset: local.targetOffset,
  })
  const active = () => context?.activeLink() === local.href

  createEffect(() => {
    const nextItem = item()
    context?.registerLink(nextItem)
    onCleanup(() => context?.unregisterLink(nextItem.href))
  })

  const handleClick = (event: MouseEvent) => {
    context?.onClick(event, item())
  }

  return (
    <div
      class={classNames(
        `${prefixCls()}-link`,
        context?.semanticClass('item'),
        local.class,
        local.className,
      )}
      style={local.style}
    >
      <a
        {...rest}
        class={classNames(
          `${prefixCls()}-link-title`,
          active() && `${prefixCls()}-link-title-active`,
          context?.semanticClass('itemTitle'),
        )}
        style={context?.semanticStyle('itemTitle')}
        href={local.href}
        target={local.target}
        title={typeof local.title === 'string' ? local.title : undefined}
        aria-current={active() ? 'true' : undefined}
        onClick={handleClick}
      >
        {local.title}
      </a>
      <Show when={context?.direction() !== 'horizontal'}>{local.children}</Show>
    </div>
  )
}
