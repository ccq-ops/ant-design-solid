import type { JSX } from 'solid-js'

export type ImageSemanticName = 'root' | 'image' | 'cover'
export type ImagePopupSemanticName = 'root' | 'mask' | 'body' | 'close' | 'footer' | 'actions'

export type ImageSemanticClassNames = Partial<
  Record<ImageSemanticName, string> & {
    popup?: Partial<Record<ImagePopupSemanticName, string>>
    placeholder?: {
      progress?: Partial<Record<'root' | 'content' | 'rail' | 'indicator', string>>
    }
  }
>

export type ImageSemanticStyles = Partial<
  Record<ImageSemanticName, JSX.CSSProperties> & {
    popup?: Partial<Record<ImagePopupSemanticName, JSX.CSSProperties>>
    placeholder?: {
      progress?: Partial<Record<'root' | 'content' | 'rail' | 'indicator', JSX.CSSProperties>>
    }
  }
>

export type ImageSemanticClassNamesConfig =
  | ImageSemanticClassNames
  | ((info: { props: ImageProps }) => ImageSemanticClassNames)

export type ImageSemanticStylesConfig =
  | ImageSemanticStyles
  | ((info: { props: ImageProps }) => ImageSemanticStyles)

export interface ImagePreviewConfig {
  src?: string
  alt?: string
  open?: boolean
  defaultOpen?: boolean
  /** @deprecated Use `open` instead. */
  visible?: boolean
  onOpenChange?: (open: boolean, prevOpen: boolean) => void
  /** @deprecated Use `onOpenChange` instead. */
  onVisibleChange?: (visible: boolean, prevVisible: boolean) => void
  getContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  zIndex?: number
  rootClass?: string
  maskClass?: string
  scaleStep?: number
  minScale?: number
  maxScale?: number
  icons?: Partial<Record<ImageTransformAction, JSX.Element>>
  onTransform?: (info: ImageTransformInfo) => void
  mask?: boolean | JSX.Element
  closeIcon?: JSX.Element
  cover?: JSX.Element | { coverNode?: JSX.Element; placement?: 'top' | 'bottom' | 'center' }
  imageRender?: (
    originalNode: JSX.Element,
    info: { transform: ImageTransform; image: ImageInfo },
  ) => JSX.Element
  actionsRender?: (
    originalNode: JSX.Element,
    info: { transform: ImageTransform; actions: ImagePreviewActions; image: ImageInfo },
  ) => JSX.Element
  /** @deprecated Use `actionsRender` instead. */
  toolbarRender?: ImagePreviewConfig['actionsRender']
}

export interface ImageGroupPreviewConfig extends Omit<
  ImagePreviewConfig,
  'src' | 'alt' | 'onOpenChange' | 'imageRender'
> {
  current?: number
  defaultCurrent?: number
  onOpenChange?: (open: boolean, info: { current: number }) => void
  onChange?: (current: number, prevCurrent: number) => void
  countRender?: (current: number, total: number) => JSX.Element
  imageRender?: (
    originalNode: JSX.Element,
    info: { transform: ImageTransform; current: number; image: ImageInfo },
  ) => JSX.Element
}

export type ImagePreviewGroupItem =
  | string
  | {
      src?: string
      alt?: string
      width?: string | number
      height?: string | number
    }

export interface ImagePreviewGroupProps {
  preview?: boolean | ImageGroupPreviewConfig
  previewPrefixCls?: string
  items?: ImagePreviewGroupItem[]
  fallback?: string
  classNames?: ImageSemanticClassNamesConfig
  styles?: ImageSemanticStylesConfig
  children?: JSX.Element
}

export interface ImageTransform {
  x: number
  y: number
  rotate: number
  scale: number
  flipX: boolean
  flipY: boolean
}

export type ImageTransformAction =
  | 'flipY'
  | 'flipX'
  | 'rotateLeft'
  | 'rotateRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'close'
  | 'prev'
  | 'next'
  | 'wheel'
  | 'doubleClick'
  | 'move'
  | 'dragRebound'
  | 'touchZoom'
  | 'reset'

export interface ImageTransformInfo {
  transform: ImageTransform
  action: ImageTransformAction
}

export interface ImageInfo {
  url: string
  alt: string
  width: string | number | undefined
  height: string | number | undefined
}

export interface ImagePreviewActions {
  onFlipY: () => void
  onFlipX: () => void
  onRotateLeft: () => void
  onRotateRight: () => void
  onZoomOut: () => void
  onZoomIn: () => void
  onClose: () => void
  onReset: () => void
}

export interface ImageProgressConfig {
  percent?: number
  render?: (progress: JSX.Element, percent: number) => JSX.Element
}

export type ImagePlaceholder = JSX.Element | boolean | { progress?: boolean | ImageProgressConfig }

export interface ImageProps extends Omit<
  JSX.ImgHTMLAttributes<HTMLImageElement>,
  'class' | 'classList' | 'style' | 'placeholder' | 'onError' | 'onLoad' | 'onClick' | 'onKeyDown'
> {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  fallback?: string
  placeholder?: ImagePlaceholder
  preview?: boolean | ImagePreviewConfig
  prefixCls?: string
  previewPrefixCls?: string
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  rootClass?: string
  wrapperStyle?: JSX.CSSProperties
  classNames?: ImageSemanticClassNamesConfig
  styles?: ImageSemanticStylesConfig
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  onLoad?: JSX.EventHandler<HTMLImageElement, Event>
  onError?: JSX.EventHandler<HTMLImageElement, Event>
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>
  onKeyDown?: JSX.EventHandler<HTMLDivElement, KeyboardEvent>
}

export type ImageComponent = ((props: ImageProps) => JSX.Element) & {
  PreviewGroup: (props: ImagePreviewGroupProps) => JSX.Element
}
