import { Show, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useEmptyStyle } from './empty.style'
import type {
  EmptyComponent,
  EmptyProps,
  EmptySemanticClassNames,
  EmptySemanticSlot,
  EmptySemanticStyles,
} from './interface'

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

function SimpleEmptyImage() {
  return (
    <svg viewBox="0 0 64 41" role="img" aria-label="Empty illustration">
      <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
        <ellipse cx="32" cy="33" rx="32" ry="7" fill="currentColor" opacity="0.08" />
        <g fill-rule="nonzero" stroke="currentColor">
          <path
            d="M55 12.76 44.85 1.26A4 4 0 0 0 41.85 0h-19.7a4 4 0 0 0-3 1.26L9 12.76V22h46v-9.24Z"
            opacity="0.18"
          />
          <path
            d="M41.61 15.93c0-1.61 1-2.93 2.24-2.93H55v18.14C55 33.27 53.68 35 52.05 35h-40.1C10.32 35 9 33.27 9 31.14V13h11.15c1.24 0 2.24 1.32 2.24 2.93v.02c0 1.61 1.01 2.91 2.24 2.91h14.74c1.23 0 2.24-1.31 2.24-2.93Z"
            fill="currentColor"
            opacity="0.08"
          />
        </g>
      </g>
    </svg>
  )
}

function descriptionToAlt(description: EmptyProps['description']) {
  return typeof description === 'string' ? description : 'empty'
}

function resolveSemanticClassNames(
  value: EmptyProps['classNames'],
  props: EmptyProps,
): EmptySemanticClassNames {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: EmptyProps['styles'],
  props: EmptyProps,
): EmptySemanticStyles {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeSemanticClassNames(...values: EmptySemanticClassNames[]): EmptySemanticClassNames {
  return {
    root: classNames(...values.map((value) => value.root)),
    image: classNames(...values.map((value) => value.image)),
    description: classNames(...values.map((value) => value.description)),
    footer: classNames(...values.map((value) => value.footer)),
  }
}

function mergeSemanticStyles(...values: EmptySemanticStyles[]): EmptySemanticStyles {
  return {
    root: mergeStyles(...values.map((value) => value.root)),
    image: mergeStyles(...values.map((value) => value.image)),
    description: mergeStyles(...values.map((value) => value.description)),
    footer: mergeStyles(...values.map((value) => value.footer)),
  }
}

function mergeStyles(...values: Array<JSX.CSSProperties | string | undefined>) {
  return Object.assign({}, ...values.filter((value) => value && typeof value !== 'string'))
}

function renderImage(image: EmptyProps['image'], description: EmptyProps['description']) {
  if (typeof image === 'string') {
    return <img draggable={false} src={image} alt={descriptionToAlt(description)} />
  }

  if (typeof image === 'function') return <Dynamic component={image} />

  return image
}

const EmptyRoot = (props: EmptyProps) => {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClassName',
    'image',
    'description',
    'children',
    'classNames',
    'styles',
    'class',
    'style',
  ])
  const config = useConfig()
  const emptyConfig = () => config.empty()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-empty`
  const [, hashId] = useEmptyStyle(prefixCls())
  const description = () => (local.description === undefined ? 'No Data' : local.description)
  const image = () => local.image ?? emptyConfig().image ?? <DefaultEmptyImage />
  const isSimpleImage = () => image() === SimpleEmptyImage
  const semanticClassNames = createMemo(() =>
    mergeSemanticClassNames(
      resolveSemanticClassNames(emptyConfig().classNames, props),
      resolveSemanticClassNames(local.classNames, props),
    ),
  )
  const semanticStyles = createMemo(() =>
    mergeSemanticStyles(
      resolveSemanticStyles(emptyConfig().styles, props),
      resolveSemanticStyles(local.styles, props),
    ),
  )
  const slotClass = (slot: EmptySemanticSlot) => semanticClassNames()[slot]
  const slotStyle = (slot: EmptySemanticSlot): JSX.CSSProperties => semanticStyles()[slot] ?? {}
  const hasDescription = () => Boolean(description())
  const hasFooter = () =>
    local.children !== undefined && local.children !== null && local.children !== false

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        isSimpleImage() && `${prefixCls()}-normal`,
        config.direction() === 'rtl' && `${prefixCls()}-rtl`,
        hashId(),
        emptyConfig().class,
        local.class,
        local.rootClassName,
        slotClass('root'),
      )}
      style={mergeStyles(slotStyle('root'), emptyConfig().style, local.style)}
    >
      <div
        class={classNames(`${prefixCls()}-image`, slotClass('image'))}
        style={slotStyle('image')}
      >
        {renderImage(image(), description())}
      </div>
      <Show when={hasDescription()}>
        <div
          class={classNames(`${prefixCls()}-description`, slotClass('description'))}
          style={slotStyle('description')}
        >
          {description()}
        </div>
      </Show>
      <Show when={hasFooter()}>
        <div
          class={classNames(`${prefixCls()}-footer`, slotClass('footer'))}
          style={slotStyle('footer')}
        >
          {local.children}
        </div>
      </Show>
    </div>
  )
}

export const Empty = EmptyRoot as EmptyComponent

Empty.PRESENTED_IMAGE_DEFAULT = DefaultEmptyImage
Empty.PRESENTED_IMAGE_SIMPLE = SimpleEmptyImage
