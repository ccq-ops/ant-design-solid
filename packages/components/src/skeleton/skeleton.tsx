import { For, Show, createMemo, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  SkeletonAvatarProps,
  SkeletonAvatarSize,
  SkeletonParagraphProps,
  SkeletonProps,
  SkeletonTitleProps,
  SkeletonWidth,
} from './interface'
import { useSkeletonStyle } from './skeleton.style'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toLength(value: SkeletonWidth | undefined): string | undefined {
  if (typeof value === 'number') return `${value}px`
  return value
}

function avatarSizeClass(prefixCls: string, size: SkeletonAvatarSize | undefined): string | false {
  if (size === 'small') return `${prefixCls}-avatar-sm`
  if (size === 'large') return `${prefixCls}-avatar-lg`
  return false
}

function avatarSizeStyle(size: SkeletonAvatarSize | undefined) {
  if (typeof size !== 'number') return undefined
  const value = `${size}px`
  return { width: value, height: value }
}

function normalizeAvatar(avatar: SkeletonProps['avatar']): SkeletonAvatarProps | undefined {
  if (!avatar) return undefined
  return isObject(avatar) ? avatar : {}
}

function normalizeTitle(title: SkeletonProps['title']): SkeletonTitleProps | undefined {
  if (title === false) return undefined
  if (isObject(title)) return title
  return {}
}

function normalizeParagraph(
  paragraph: SkeletonProps['paragraph'],
): SkeletonParagraphProps | undefined {
  if (paragraph === false) return undefined
  if (isObject(paragraph)) return paragraph
  return {}
}

export function Skeleton(props: SkeletonProps) {
  const [local, rest] = splitProps(props, [
    'active',
    'loading',
    'avatar',
    'title',
    'paragraph',
    'round',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-skeleton`
  const [, hashId] = useSkeletonStyle(prefixCls())

  const loading = () => local.loading !== false
  const hasExplicitSection = () =>
    local.avatar !== undefined || local.title !== undefined || local.paragraph !== undefined
  const avatar = createMemo(() => normalizeAvatar(local.avatar))
  const title = createMemo(() =>
    hasExplicitSection() ? normalizeTitle(local.title) : ({} as SkeletonTitleProps),
  )
  const paragraph = createMemo(() =>
    hasExplicitSection() ? normalizeParagraph(local.paragraph) : ({} as SkeletonParagraphProps),
  )
  const paragraphRows = createMemo(() => Math.max(0, Math.floor(paragraph()?.rows ?? 3)))
  const paragraphWidths = createMemo(() => paragraph()?.width)
  const getParagraphWidth = (index: number): string | undefined => {
    const width = paragraphWidths()
    if (Array.isArray(width)) return toLength(width[index])
    return toLength(width)
  }

  return (
    <Show when={loading()} fallback={local.children}>
      <div
        {...rest}
        class={classNames(
          prefixCls(),
          local.active && `${prefixCls()}-active`,
          local.round && `${prefixCls()}-round`,
          hashId(),
          local.class,
        )}
        classList={local.classList}
        style={local.style}
      >
        <Show when={avatar()}>
          {(avatarConfig) => {
            const size = () => avatarConfig().size
            const shape = () => avatarConfig().shape ?? 'circle'
            return (
              <div
                class={classNames(
                  `${prefixCls()}-avatar`,
                  `${prefixCls()}-avatar-${shape()}`,
                  avatarSizeClass(prefixCls(), size()),
                )}
                style={avatarSizeStyle(size())}
              />
            )
          }}
        </Show>
        <div class={`${prefixCls()}-content`}>
          <Show when={title()}>
            {(titleConfig) => (
              <div
                class={`${prefixCls()}-title`}
                style={{ width: toLength(titleConfig().width) }}
              />
            )}
          </Show>
          <Show when={paragraph()}>
            <ul class={`${prefixCls()}-paragraph`}>
              <For each={Array.from({ length: paragraphRows() })}>
                {(_, index) => <li style={{ width: getParagraphWidth(index()) }} />}
              </For>
            </ul>
          </Show>
        </div>
      </div>
    </Show>
  )
}
