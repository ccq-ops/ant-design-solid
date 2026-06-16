import { CloseOutlined } from '@ant-design-solid/solid-icons'
import type { Accessor, JSX } from 'solid-js'
import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js'
import { classNames } from '../shared/class-names'
import { InternalPortal } from '../shared/portal'
import type {
  ImageInfo,
  ImagePreviewConfig,
  ImageSemanticClassNames,
  ImageSemanticStyles,
  ImageTransformAction,
} from './interface'
import { defaultTransform, nextTransform, transformToCss } from './transform'

export type PreviewInput = boolean | ImagePreviewConfig | undefined

export interface ImagePreviewProps {
  prefixCls: Accessor<string>
  src: Accessor<string | undefined>
  alt: Accessor<string | undefined>
  width?: Accessor<string | number | undefined>
  height?: Accessor<string | number | undefined>
  preview: Accessor<boolean | ImagePreviewConfig | undefined>
  zIndex: Accessor<number>
  getPopupContainer: Accessor<((triggerNode?: HTMLElement) => HTMLElement | ShadowRoot) | undefined>
  classNames: Accessor<ImageSemanticClassNames['popup'] | undefined>
  styles: Accessor<ImageSemanticStyles['popup'] | undefined>
  count?: Accessor<number>
  current?: Accessor<number>
  countRender?: Accessor<((current: number, total: number) => JSX.Element) | undefined>
  onSwitch?: (offset: number) => void
}

export function normalizePreviewConfig(preview: PreviewInput): ImagePreviewConfig {
  if (preview === false) return {}
  if (preview === true || preview === undefined) return {}
  return preview
}

export function canPreview(preview: PreviewInput) {
  return preview !== false
}

export function ImagePreview(props: ImagePreviewProps) {
  const [innerOpen, setInnerOpen] = createSignal(
    normalizePreviewConfig(props.preview()).defaultOpen ??
      normalizePreviewConfig(props.preview()).visible ??
      false,
  )
  const config = () => normalizePreviewConfig(props.preview())
  const [transform, setTransform] = createSignal({ ...defaultTransform })
  const isControlled = () => config().open !== undefined || config().visible !== undefined
  const open = () => config().open ?? config().visible ?? innerOpen()
  const previewSrc = () => config().src ?? props.src()
  const previewAlt = () => config().alt ?? props.alt() ?? ''
  const zIndex = () => config().zIndex ?? props.zIndex()
  const container = () => config().getContainer ?? props.getPopupContainer()

  const setOpen = (nextOpen: boolean) => {
    const previous = open()
    if (!isControlled()) setInnerOpen(nextOpen)
    config().onOpenChange?.(nextOpen, previous)
    config().onVisibleChange?.(nextOpen, previous)
  }

  const scaleStep = () => config().scaleStep ?? 0.5
  const minScale = () => config().minScale ?? 1
  const maxScale = () => config().maxScale ?? 50
  const dispatchTransform = (
    action: ImageTransformAction,
    options: { deltaX?: number; deltaY?: number; wheelDirection?: 1 | -1 } = {},
  ) => {
    const next = nextTransform(transform(), action, {
      scaleStep: scaleStep(),
      minScale: minScale(),
      maxScale: maxScale(),
      ...options,
    })
    setTransform(next)
    config().onTransform?.({ transform: next, action })
  }
  const close = () => setOpen(false)
  const imageInfo = (): ImageInfo => ({
    url: previewSrc() ?? '',
    alt: previewAlt(),
    width: props.width?.(),
    height: props.height?.(),
  })
  const actions = () => ({
    onFlipY: () => dispatchTransform('flipY'),
    onFlipX: () => dispatchTransform('flipX'),
    onRotateLeft: () => dispatchTransform('rotateLeft'),
    onRotateRight: () => dispatchTransform('rotateRight'),
    onZoomOut: () => dispatchTransform('zoomOut'),
    onZoomIn: () => dispatchTransform('zoomIn'),
    onClose: close,
    onReset: () => dispatchTransform('reset'),
  })

  createEffect(() => {
    if (open()) setTransform({ ...defaultTransform })
  })

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setOpen(false)
  }

  createEffect(() => {
    if (!open()) return
    document.addEventListener('keydown', onKeyDown)
    onCleanup(() => document.removeEventListener('keydown', onKeyDown))
  })

  const actionButtons: Array<{ action: ImageTransformAction; label: string; text: string }> = [
    { action: 'flipY', label: 'Flip Y', text: 'Flip Y' },
    { action: 'flipX', label: 'Flip X', text: 'Flip X' },
    { action: 'rotateLeft', label: 'Rotate left', text: 'Rotate L' },
    { action: 'rotateRight', label: 'Rotate right', text: 'Rotate R' },
    { action: 'zoomOut', label: 'Zoom out', text: '-' },
    { action: 'zoomIn', label: 'Zoom in', text: '+' },
    { action: 'reset', label: 'Reset', text: 'Reset' },
  ]
  const imageNode = () => (
    <img
      class={`${props.prefixCls()}-preview-img`}
      src={previewSrc()}
      alt={previewAlt()}
      style={{ transform: transformToCss(transform()) }}
      onDblClick={() => dispatchTransform('reset')}
      onWheel={(event) => {
        event.preventDefault()
        dispatchTransform('wheel', { wheelDirection: event.deltaY < 0 ? 1 : -1 })
      }}
    />
  )
  const actionNode = () => (
    <For each={actionButtons}>
      {(item) => (
        <button
          type="button"
          class={`${props.prefixCls()}-preview-actions-action`}
          aria-label={item.label}
          onClick={() => dispatchTransform(item.action)}
        >
          {config().icons?.[item.action] ?? item.text}
        </button>
      )}
    </For>
  )
  const renderedActions = () => {
    const node =
      config().actionsRender?.(actionNode(), {
        transform: transform(),
        actions: actions(),
        image: imageInfo(),
      }) ?? actionNode()
    return (
      config().toolbarRender?.(node, {
        transform: transform(),
        actions: actions(),
        image: imageInfo(),
      }) ?? node
    )
  }

  return {
    open: () => setOpen(true),
    close,
    node: (
      <Show when={open()}>
        <InternalPortal mount={() => container()?.()}>
          <div
            class={classNames(
              `${props.prefixCls()}-preview`,
              config().rootClass,
              props.classNames()?.root,
            )}
            style={{ 'z-index': zIndex(), ...props.styles()?.root }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false)
            }}
          >
            <div
              class={classNames(
                `${props.prefixCls()}-preview-mask`,
                config().mask === false && `${props.prefixCls()}-preview-mask-hidden`,
                config().maskClass,
                props.classNames()?.mask,
              )}
              style={props.styles()?.mask}
              onClick={() => setOpen(false)}
            >
              {config().mask !== true && config().mask !== false ? config().mask : null}
            </div>
            <div class={classNames(`${props.prefixCls()}-preview-body`, props.classNames()?.body)}>
              <button
                type="button"
                class={classNames(`${props.prefixCls()}-preview-close`, props.classNames()?.close)}
                style={props.styles()?.close}
                onClick={() => setOpen(false)}
              >
                {config().closeIcon ?? <CloseOutlined />}
              </button>
              <Show when={(props.count?.() ?? 0) > 1}>
                <button
                  type="button"
                  class={`${props.prefixCls()}-preview-switch ${props.prefixCls()}-preview-switch-prev`}
                  aria-label="Previous image"
                  onClick={() => props.onSwitch?.(-1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  class={`${props.prefixCls()}-preview-switch ${props.prefixCls()}-preview-switch-next`}
                  aria-label="Next image"
                  onClick={() => props.onSwitch?.(1)}
                >
                  Next
                </button>
              </Show>
              {config().imageRender?.(imageNode(), {
                transform: transform(),
                image: imageInfo(),
              }) ?? imageNode()}
              <div
                class={classNames(
                  `${props.prefixCls()}-preview-footer`,
                  props.classNames()?.footer,
                )}
                style={props.styles()?.footer}
              >
                <Show when={(props.count?.() ?? 0) > 1}>
                  <div class={`${props.prefixCls()}-preview-progress`}>
                    {props.countRender?.()?.((props.current?.() ?? 0) + 1, props.count?.() ?? 0) ??
                      `${(props.current?.() ?? 0) + 1} / ${props.count?.() ?? 0}`}
                  </div>
                </Show>
                <div
                  class={classNames(
                    `${props.prefixCls()}-preview-actions`,
                    props.classNames()?.actions,
                  )}
                  style={props.styles()?.actions}
                >
                  {renderedActions()}
                </div>
              </div>
            </div>
          </div>
        </InternalPortal>
      </Show>
    ),
  }
}
