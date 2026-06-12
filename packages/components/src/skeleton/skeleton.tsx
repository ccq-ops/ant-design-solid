import { For, Show, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  SkeletonAvatarProps,
  SkeletonAvatarSize,
  SkeletonButtonProps,
  SkeletonComponent,
  SkeletonElementProps,
  SkeletonElementShape,
  SkeletonImageProps,
  SkeletonIndependentAvatarProps,
  SkeletonInputProps,
  SkeletonNodeProps,
  SkeletonParagraphProps,
  SkeletonProps,
  SkeletonSemanticClassNames,
  SkeletonSemanticClassNamesMap,
  SkeletonSemanticStyles,
  SkeletonSemanticStylesMap,
  SkeletonSize,
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

function elementSizeClass(prefixCls: string, size: SkeletonSize | undefined): string | false {
  if (size === 'small') return `${prefixCls}-sm`
  if (size === 'large') return `${prefixCls}-lg`
  return false
}

function elementSizeStyle(size: SkeletonSize | undefined) {
  if (typeof size !== 'number') return undefined
  const value = `${size}px`
  return { width: value, height: value, 'line-height': value }
}

function shapeClass(prefixCls: string, shape: SkeletonElementShape | undefined): string | false {
  if (!shape || shape === 'default') return false
  return `${prefixCls}-${shape}`
}

function mergeStyle(
  ...styles: Array<string | JSX.CSSProperties | undefined>
): string | JSX.CSSProperties {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  return Object.assign({}, ...styles.filter(Boolean))
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

function resolveSemanticClassNames(
  value: SkeletonSemanticClassNames | undefined,
  props: SkeletonProps,
): SkeletonSemanticClassNamesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: SkeletonSemanticStyles | undefined,
  props: SkeletonProps,
): SkeletonSemanticStylesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function getAvatarBasicProps(hasTitle: boolean, hasParagraph: boolean): SkeletonAvatarProps {
  if (hasTitle && !hasParagraph) return { size: 'large', shape: 'square' }
  return { size: 'large', shape: 'circle' }
}

function getTitleBasicProps(hasAvatar: boolean, hasParagraph: boolean): SkeletonTitleProps {
  if (!hasAvatar && hasParagraph) return { width: '38%' }
  if (hasAvatar && hasParagraph) return { width: '50%' }
  return {}
}

function getParagraphBasicProps(hasAvatar: boolean, hasTitle: boolean): SkeletonParagraphProps {
  return {
    width: !hasAvatar || !hasTitle ? '61%' : undefined,
    rows: !hasAvatar && hasTitle ? 3 : 2,
  }
}

function resolvePrefixCls(customizePrefixCls: string | undefined, fallbackPrefixCls: string) {
  return customizePrefixCls ?? `${fallbackPrefixCls}-skeleton`
}

function SkeletonRoot(props: SkeletonProps) {
  const [local, rest] = splitProps(props, [
    'active',
    'loading',
    'prefixCls',
    'rootClassName',
    'avatar',
    'title',
    'paragraph',
    'round',
    'classNames',
    'styles',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())
  const [, hashId] = useSkeletonStyle(prefixCls())

  const loading = () => local.loading !== false
  const hasExplicitSection = () =>
    local.avatar !== undefined || local.title !== undefined || local.paragraph !== undefined
  const avatar = createMemo(() => normalizeAvatar(local.avatar))
  const title = createMemo(() => normalizeTitle(hasExplicitSection() ? local.title : true))
  const paragraph = createMemo(() =>
    normalizeParagraph(hasExplicitSection() ? local.paragraph : true),
  )
  const hasAvatar = () => Boolean(avatar())
  const hasTitle = () => Boolean(title())
  const hasParagraph = () => Boolean(paragraph())
  const mergedAvatar = createMemo(() => {
    const avatarConfig = avatar()
    if (!avatarConfig) return undefined
    return { ...getAvatarBasicProps(hasTitle(), hasParagraph()), ...avatarConfig }
  })
  const mergedTitle = createMemo(() => {
    const titleConfig = title()
    if (!titleConfig) return undefined
    return { ...getTitleBasicProps(hasAvatar(), hasParagraph()), ...titleConfig }
  })
  const mergedParagraph = createMemo(() => {
    const paragraphConfig = paragraph()
    if (!paragraphConfig) return undefined
    return { ...getParagraphBasicProps(hasAvatar(), hasTitle()), ...paragraphConfig }
  })
  const paragraphRows = createMemo(() => Math.max(0, Math.floor(mergedParagraph()?.rows ?? 0)))
  const paragraphWidths = createMemo(() => mergedParagraph()?.width)
  const getParagraphWidth = (index: number): string | undefined => {
    const width = paragraphWidths()
    if (Array.isArray(width)) return toLength(width[index])
    return index === paragraphRows() - 1 ? toLength(width) : undefined
  }
  const semanticClassNames = () => resolveSemanticClassNames(local.classNames, props)
  const semanticStyles = () => resolveSemanticStyles(local.styles, props)

  return (
    <Show when={loading()} fallback={local.children}>
      <div
        {...rest}
        class={classNames(
          prefixCls(),
          hasAvatar() && `${prefixCls()}-with-avatar`,
          local.active && `${prefixCls()}-active`,
          local.round && `${prefixCls()}-round`,
          semanticClassNames().root,
          hashId(),
          local.class,
          local.rootClassName,
        )}
        classList={local.classList}
        style={mergeStyle(semanticStyles().root, local.style)}
      >
        <Show when={mergedAvatar()}>
          {(avatarConfig) => {
            const size = () => avatarConfig().size
            const shape = () => avatarConfig().shape ?? 'circle'
            return (
              <div
                class={classNames(`${prefixCls()}-header`, semanticClassNames().header)}
                style={semanticStyles().header}
              >
                <div
                  class={classNames(
                    `${prefixCls()}-avatar`,
                    `${prefixCls()}-avatar-${shape()}`,
                    avatarSizeClass(prefixCls(), size()),
                    semanticClassNames().avatar,
                  )}
                  style={mergeStyle(avatarSizeStyle(size()), semanticStyles().avatar)}
                />
              </div>
            )
          }}
        </Show>
        <div
          class={classNames(`${prefixCls()}-section`, semanticClassNames().section)}
          style={semanticStyles().section}
        >
          <Show when={mergedTitle()}>
            {(titleConfig) => (
              <div
                class={classNames(`${prefixCls()}-title`, semanticClassNames().title)}
                style={mergeStyle({ width: toLength(titleConfig().width) }, semanticStyles().title)}
              />
            )}
          </Show>
          <Show when={mergedParagraph()}>
            <ul
              class={classNames(`${prefixCls()}-paragraph`, semanticClassNames().paragraph)}
              style={semanticStyles().paragraph}
            >
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

function SkeletonElement(props: SkeletonElementProps & { element: string }) {
  const [local, rest] = splitProps(props, [
    'active',
    'prefixCls',
    'rootClassName',
    'size',
    'shape',
    'element',
    'classNames',
    'styles',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())
  const [, hashId] = useSkeletonStyle(prefixCls())
  const elementPrefixCls = () => `${prefixCls()}-${local.element}`
  const shape = () => local.shape ?? 'default'

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-element`,
        local.active && `${prefixCls()}-active`,
        local.classNames?.root,
        local.class,
        local.rootClassName,
        hashId(),
      )}
      classList={local.classList}
      style={local.styles?.root}
    >
      <span
        class={classNames(
          elementPrefixCls(),
          elementSizeClass(elementPrefixCls(), local.size),
          shapeClass(elementPrefixCls(), shape()),
          local.classNames?.content,
        )}
        style={mergeStyle(elementSizeStyle(local.size), local.styles?.content, local.style)}
      />
    </div>
  )
}

function SkeletonButton(props: SkeletonButtonProps) {
  const [local, rest] = splitProps(props, ['block', 'classNames', 'prefixCls'])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())

  return (
    <SkeletonElement
      {...rest}
      prefixCls={local.prefixCls}
      element="button"
      classNames={{
        ...local.classNames,
        root: classNames(local.block && `${prefixCls()}-block`, local.classNames?.root),
      }}
    />
  )
}

function SkeletonAvatar(props: SkeletonIndependentAvatarProps) {
  return <SkeletonElement {...props} element="avatar" shape={props.shape ?? 'circle'} />
}

function SkeletonInput(props: SkeletonInputProps) {
  const [local, rest] = splitProps(props, ['block', 'classNames', 'prefixCls'])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())

  return (
    <SkeletonElement
      {...rest}
      prefixCls={local.prefixCls}
      element="input"
      classNames={{
        ...local.classNames,
        root: classNames(local.block && `${prefixCls()}-block`, local.classNames?.root),
      }}
    />
  )
}

function SkeletonNode(props: SkeletonNodeProps) {
  const [local, rest] = splitProps(props, [
    'active',
    'prefixCls',
    'rootClassName',
    'internalClassName',
    'classNames',
    'styles',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())
  const [, hashId] = useSkeletonStyle(prefixCls())

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-element`,
        local.active && `${prefixCls()}-active`,
        local.classNames?.root,
        local.class,
        local.rootClassName,
        hashId(),
      )}
      classList={local.classList}
      style={mergeStyle(local.styles?.root)}
    >
      <div
        class={classNames(
          local.internalClassName ?? `${prefixCls()}-node`,
          local.classNames?.content,
        )}
        style={mergeStyle(local.styles?.content, local.style)}
      >
        {local.children}
      </div>
    </div>
  )
}

function SkeletonImage(props: SkeletonImageProps) {
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(props.prefixCls, config.prefixCls())

  return (
    <SkeletonNode {...props} internalClassName={`${prefixCls()}-image`}>
      <svg viewBox="0 0 1098 1024" class={`${prefixCls()}-image-svg`}>
        <title>Image placeholder</title>
        <path
          class={`${prefixCls()}-image-path`}
          d="M365.7 329.1q0 45.8-32 77.7t-77.7 32-77.7-32-32-77.7 32-77.6 77.7-32 77.7 32 32 77.6M951 548.6v256H146.3V694.9L329 512l91.5 91.4L713 311zm54.8-402.3H91.4q-7.4 0-12.8 5.4T73 164.6v694.8q0 7.5 5.5 12.9t12.8 5.4h914.3q7.5 0 12.9-5.4t5.4-12.9V164.6q0-7.5-5.4-12.9t-12.9-5.4m91.4 18.3v694.8q0 37.8-26.8 64.6t-64.6 26.9H91.4q-37.7 0-64.6-26.9T0 859.4V164.6q0-37.8 26.8-64.6T91.4 73h914.3q37.8 0 64.6 26.9t26.8 64.6"
        />
      </svg>
    </SkeletonNode>
  )
}

export const Skeleton = SkeletonRoot as SkeletonComponent
Skeleton.Button = SkeletonButton
Skeleton.Avatar = SkeletonAvatar
Skeleton.Input = SkeletonInput
Skeleton.Image = SkeletonImage
Skeleton.Node = SkeletonNode
