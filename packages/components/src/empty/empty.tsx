import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useEmptyStyle } from './empty.style'
import type { EmptyProps } from './interface'

function DefaultEmptyImage() {
  return (
    <svg viewBox="0 0 120 100" role="img" aria-label="Empty illustration">
      <ellipse cx="60" cy="84" rx="42" ry="8" fill="currentColor" opacity="0.08" />
      <path
        d="M28 38h64l-8 38H36L28 38Z"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <path
        d="M38 24h44l10 14H28l10-14Z"
        fill="currentColor"
        opacity="0.18"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <path
        d="M45 52h30M49 62h22"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.28"
      />
    </svg>
  )
}

function descriptionToAlt(description: EmptyProps['description']) {
  return typeof description === 'string' ? description : 'empty'
}

export function Empty(props: EmptyProps) {
  const [local, rest] = splitProps(props, [
    'image',
    'imageStyle',
    'description',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-empty`
  const [, hashId] = useEmptyStyle(prefixCls())
  const description = () => local.description ?? 'No Data'
  const image = () => local.image ?? <DefaultEmptyImage />
  const hasFooter = () => local.children !== undefined && local.children !== null && local.children !== false

  return (
    <div {...rest} class={classNames(prefixCls(), hashId(), local.class)}>
      <div class={`${prefixCls()}-image`} style={local.imageStyle}>
        <Show when={typeof image() === 'string'} fallback={image()}>
          <img src={image() as string} alt={descriptionToAlt(description())} />
        </Show>
      </div>
      <div class={`${prefixCls()}-description`}>{description()}</div>
      <Show when={hasFooter()}>
        <div class={`${prefixCls()}-footer`}>{local.children}</div>
      </Show>
    </div>
  )
}
