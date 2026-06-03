import { Show, createEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { InternalPortal } from '../shared/portal'
import type { ImageProps } from './interface'
import { useImageStyle } from './image.style'

function toCssSize(value: number | string | undefined) {
  return typeof value === 'number' ? `${value}px` : value
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
    'class',
    'classList',
    'onLoad',
    'onError',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-image`
  const [, hashId] = useImageStyle(prefixCls())
  const [loaded, setLoaded] = createSignal(false)
  const [currentSrc, setCurrentSrc] = createSignal(local.src)
  const [previewOpen, setPreviewOpen] = createSignal(false)
  const canPreview = () => local.preview !== false

  createEffect(() => {
    setCurrentSrc(local.src)
    setLoaded(false)
  })

  const closePreview = () => setPreviewOpen(false)
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') closePreview()
  }

  createEffect(() => {
    if (!previewOpen()) return
    document.addEventListener('keydown', onKeyDown)
    onCleanup(() => document.removeEventListener('keydown', onKeyDown))
  })

  const imageStyle = () => ({ width: toCssSize(local.width), height: toCssSize(local.height) })

  return (
    <>
      <div
        {...rest}
        class={classNames(prefixCls(), hashId(), local.class)}
        classList={local.classList}
        style={imageStyle()}
      >
        <img
          class={classNames(`${prefixCls()}-img`, !canPreview() && `${prefixCls()}-img-no-preview`)}
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
            if (canPreview()) setPreviewOpen(true)
          }}
        />
        <Show when={local.placeholder && !loaded()}>
          <div class={`${prefixCls()}-placeholder`}>
            {local.placeholder === true ? 'Loading...' : local.placeholder}
          </div>
        </Show>
      </div>
      <Show when={previewOpen()}>
        <InternalPortal>
          <div
            class={`${prefixCls()}-preview`}
            onClick={(event) => {
              if (event.target === event.currentTarget) closePreview()
            }}
          >
            <button type="button" class={`${prefixCls()}-preview-close`} onClick={closePreview}>
              ×
            </button>
            <img class={`${prefixCls()}-preview-img`} src={currentSrc()} alt={local.alt ?? ''} />
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
