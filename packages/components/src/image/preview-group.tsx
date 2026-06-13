import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { useZIndex } from '../shared/z-index'
import type {
  ImageGroupPreviewConfig,
  ImageInfo,
  ImagePreviewGroupItem,
  ImagePreviewGroupProps,
  ImageSemanticClassNames,
  ImageSemanticStyles,
} from './interface'
import { ImagePreview } from './preview'

export interface PreviewGroupContextValue {
  register: (data: ImageInfo) => string
  update: (id: string, data: ImageInfo) => void
  unregister: (id: string) => void
  open: (id: string) => void
}

export const PreviewGroupContext = createContext<PreviewGroupContextValue>()

let imageId = 0

export function usePreviewGroup() {
  return useContext(PreviewGroupContext)
}

function normalizeGroupItem(item: ImagePreviewGroupItem): ImageInfo {
  if (typeof item === 'string') {
    return { url: item, alt: '', width: undefined, height: undefined }
  }
  return {
    url: item.src ?? '',
    alt: item.alt ?? '',
    width: item.width,
    height: item.height,
  }
}

function resolveClassNames(props: ImagePreviewGroupProps): ImageSemanticClassNames {
  return typeof props.classNames === 'function'
    ? props.classNames({ props: props as never })
    : (props.classNames ?? {})
}

function resolveStyles(props: ImagePreviewGroupProps): ImageSemanticStyles {
  return typeof props.styles === 'function'
    ? props.styles({ props: props as never })
    : (props.styles ?? {})
}

export function ImagePreviewGroup(props: ImagePreviewGroupProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-image`
  const [zIndex] = useZIndex('ImagePreview')
  const [registered, setRegistered] = createSignal<Array<{ id: string; data: ImageInfo }>>([])
  const [innerOpen, setInnerOpen] = createSignal(
    typeof props.preview === 'object' ? props.preview.defaultOpen === true : false,
  )
  const [innerCurrent, setInnerCurrent] = createSignal(
    typeof props.preview === 'object' ? (props.preview.defaultCurrent ?? 0) : 0,
  )
  const previewConfig = (): ImageGroupPreviewConfig =>
    typeof props.preview === 'object' && props.preview !== null ? props.preview : {}
  const itemList = createMemo(() => [
    ...(props.items ?? []).map((item, index) => ({
      id: `item-${index}`,
      data: normalizeGroupItem(item),
    })),
    ...registered(),
  ])
  const current = () => previewConfig().current ?? innerCurrent()
  const currentItem = () => itemList()[current()]?.data
  const open = () => previewConfig().open ?? previewConfig().visible ?? innerOpen()
  const setOpen = (nextOpen: boolean, nextCurrent = current()) => {
    if (previewConfig().open === undefined && previewConfig().visible === undefined)
      setInnerOpen(nextOpen)
    previewConfig().onOpenChange?.(nextOpen, { current: nextCurrent })
    previewConfig().onVisibleChange?.(nextOpen, open())
  }
  const setCurrent = (nextCurrent: number) => {
    const total = itemList().length
    if (total === 0) return
    const prevCurrent = current()
    const normalized = (nextCurrent + total) % total
    if (previewConfig().current === undefined) setInnerCurrent(normalized)
    previewConfig().onChange?.(normalized, prevCurrent)
  }
  const contextValue: PreviewGroupContextValue = {
    register: (data) => {
      const id = `image-${++imageId}`
      setRegistered((list) => [...list, { id, data }])
      return id
    },
    update: (id, data) => {
      setRegistered((list) => list.map((item) => (item.id === id ? { id, data } : item)))
    },
    unregister: (id) => {
      setRegistered((list) => list.filter((item) => item.id !== id))
    },
    open: (id) => {
      const index = itemList().findIndex((item) => item.id === id)
      if (index < 0) return
      if (previewConfig().current === undefined) setInnerCurrent(index)
      setOpen(true, index)
    },
  }
  const groupPreview = ImagePreview({
    prefixCls,
    src: () => currentItem()?.url,
    alt: () => currentItem()?.alt,
    width: () => currentItem()?.width,
    height: () => currentItem()?.height,
    zIndex: () => previewConfig().zIndex ?? zIndex,
    getPopupContainer: () => previewConfig().getContainer,
    classNames: () => resolveClassNames(props).popup,
    styles: () => resolveStyles(props).popup,
    preview: () => ({
      ...previewConfig(),
      open: open(),
      src: currentItem()?.url,
      alt: currentItem()?.alt,
      onOpenChange: (nextOpen) => setOpen(nextOpen),
      imageRender: previewConfig().imageRender
        ? (node, info) => previewConfig().imageRender?.(node, { ...info, current: current() })
        : undefined,
    }),
    count: () => itemList().length,
    current: () => current(),
    countRender: () => previewConfig().countRender,
    onSwitch: (offset) => setCurrent(current() + offset),
  })

  createEffect(() => {
    if (props.preview !== false && props.items?.length && previewConfig().defaultOpen && !open()) {
      setOpen(true)
    }
  })

  onCleanup(() => setRegistered([]))

  return (
    <PreviewGroupContext.Provider value={contextValue}>
      {props.children}
      {groupPreview.node}
    </PreviewGroupContext.Provider>
  )
}
