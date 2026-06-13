import type { JSX } from 'solid-js'
import { Show, createEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useZIndex } from '../shared/z-index'
import type {
  ImagePlaceholder,
  ImageProps,
  ImageSemanticClassNames,
  ImageSemanticStyles,
} from './interface'
import { useImageStyle } from './image.style'
import { ImagePreview, canPreview } from './preview'
import { ImageProgress } from './progress'
import { usePreviewGroup } from './preview-group'

function toCssSize(value: number | string | undefined) {
  return typeof value === 'number' ? `${value}px` : value
}

function resolveClassNames(props: ImageProps): ImageSemanticClassNames {
  return typeof props.classNames === 'function'
    ? props.classNames({ props })
    : (props.classNames ?? {})
}

function resolveStyles(props: ImageProps): ImageSemanticStyles {
  return typeof props.styles === 'function' ? props.styles({ props }) : (props.styles ?? {})
}

function isProgressPlaceholder(
  value: ImageProps['placeholder'],
): value is Extract<ImagePlaceholder, { progress?: unknown }> {
  return typeof value === 'object' && value !== null && 'progress' in value
}

export function Image(props: ImageProps) {
  const [local, rest] = splitProps(props, [
    'src',
    'alt',
    'width',
    'height',
    'fallback',
    'placeholder',
    'preview',
    'prefixCls',
    'previewPrefixCls',
    'zIndex',
    'getPopupContainer',
    'class',
    'classList',
    'style',
    'rootClass',
    'wrapperStyle',
    'classNames',
    'styles',
    'onLoad',
    'onError',
    'onClick',
    'onKeyDown',
  ])
  const config = useConfig()
  const previewGroup = usePreviewGroup()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-image`
  const [, hashId] = useImageStyle(prefixCls())
  const [previewZIndex] = useZIndex('ImagePreview', local.zIndex)
  const [loaded, setLoaded] = createSignal(false)
  const [currentSrc, setCurrentSrc] = createSignal(local.src)
  let groupId: string | undefined

  createEffect(() => {
    setCurrentSrc(local.src)
    setLoaded(false)
  })
  onCleanup(() => {
    if (previewGroup && groupId) previewGroup.unregister(groupId)
  })

  createEffect(() => {
    if (!previewGroup) return
    const data = {
      url: currentSrc() ?? '',
      alt: local.alt ?? '',
      width: local.width,
      height: local.height,
    }
    if (!groupId) {
      groupId = previewGroup.register(data)
    } else {
      previewGroup.update(groupId, data)
    }
  })

  const semanticClasses = () => resolveClassNames(props)
  const semanticStyles = () => resolveStyles(props)
  const sizeStyle = () => ({ width: toCssSize(local.width), height: toCssSize(local.height) })
  const rootStyle = () => ({
    ...sizeStyle(),
    ...local.wrapperStyle,
    ...semanticStyles().root,
    ...local.style,
  })
  const imageStyle = () => ({ ...sizeStyle(), ...semanticStyles().image })
  const preview = ImagePreview({
    prefixCls,
    src: currentSrc,
    alt: () => local.alt,
    width: () => local.width,
    height: () => local.height,
    preview: () => local.preview,
    zIndex: () => local.zIndex ?? previewZIndex,
    getPopupContainer: () => local.getPopupContainer,
    classNames: () => semanticClasses().popup,
    styles: () => semanticStyles().popup,
  })
  const previewConfig = () =>
    typeof local.preview === 'object' && local.preview !== null ? local.preview : undefined
  const cover = () => {
    const configCover = previewConfig()?.cover
    if (!configCover) return null
    const isCoverConfig =
      typeof configCover === 'object' &&
      configCover !== null &&
      ('coverNode' in configCover || 'placement' in configCover)
    const coverNode = (isCoverConfig ? configCover.coverNode : configCover) as JSX.Element
    const placement = isCoverConfig ? configCover.placement : undefined
    return (
      <div
        class={classNames(
          `${prefixCls()}-cover`,
          placement && `${prefixCls()}-cover-${placement}`,
          semanticClasses().cover,
        )}
        style={semanticStyles().cover}
        onClick={() => {
          if (canPreview(local.preview)) preview.open()
        }}
      >
        {coverNode}
      </div>
    )
  }

  return (
    <>
      <div
        class={classNames(
          prefixCls(),
          hashId(),
          local.rootClass,
          semanticClasses().root,
          local.class,
        )}
        classList={local.classList}
        style={rootStyle()}
        onClick={local.onClick}
        onKeyDown={local.onKeyDown}
      >
        <img
          {...rest}
          class={classNames(
            `${prefixCls()}-img`,
            !canPreview(local.preview) && `${prefixCls()}-img-no-preview`,
            semanticClasses().image,
          )}
          src={currentSrc()}
          alt={local.alt ?? ''}
          style={imageStyle()}
          onLoad={(event) => {
            setLoaded(true)
            local.onLoad?.(event)
          }}
          onError={(event) => {
            if (local.fallback && currentSrc() !== local.fallback) setCurrentSrc(local.fallback)
            local.onError?.(event)
          }}
          onClick={() => {
            if (previewGroup && groupId && canPreview(local.preview)) {
              previewGroup.open(groupId)
              return
            }
            if (canPreview(local.preview)) preview.open()
          }}
        />
        <Show when={local.placeholder && !loaded()}>
          <div class={`${prefixCls()}-placeholder`}>
            {isProgressPlaceholder(local.placeholder) ? (
              <ImageProgress
                prefixCls={prefixCls()}
                width={toCssSize(local.width)}
                height={toCssSize(local.height)}
                config={
                  local.placeholder.progress === true
                    ? {}
                    : local.placeholder.progress === false
                      ? undefined
                      : local.placeholder.progress
                }
                classNames={semanticClasses().placeholder?.progress}
                styles={semanticStyles().placeholder?.progress}
              />
            ) : local.placeholder === true ? (
              'Loading...'
            ) : (
              local.placeholder
            )}
          </div>
        </Show>
        {cover()}
      </div>
      {preview.node}
    </>
  )
}
