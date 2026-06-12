import type { JSX } from 'solid-js'

export type UploadFileStatus = 'ready' | 'uploading' | 'done' | 'error' | 'removed'
export type UploadType = 'select' | 'drag'
export type UploadListType = 'text' | 'picture' | 'picture-card' | 'picture-circle'
export type UploadMethod = 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch'
export type UploadSemanticSlot = 'root' | 'trigger' | 'list' | 'item'
export type UploadSemanticClassNames = Partial<Record<UploadSemanticSlot, string>>
export type UploadSemanticStyles = Partial<Record<UploadSemanticSlot, JSX.CSSProperties>>
export type UploadBeforeValue = void | boolean | string | Blob | File
export type UploadAcceptObject = {
  format: string
  filter?: 'native' | ((file: File) => boolean)
}

export interface UploadFile<T = unknown> {
  uid: string
  name: string
  size?: number
  fileName?: string
  lastModified?: number
  lastModifiedDate?: Date
  status?: UploadFileStatus
  percent?: number
  originFileObj?: File
  url?: string
  thumbUrl?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  response?: T
  error?: unknown
  linkProps?: JSX.AnchorHTMLAttributes<HTMLAnchorElement> | string
  type?: string
  xhr?: XMLHttpRequest
  preview?: string
}

export interface UploadRequestOptions<T = unknown> {
  action?: string
  data?: Record<string, unknown>
  filename?: string
  file: File
  withCredentials?: boolean
  headers?: Record<string, string>
  method?: UploadMethod
  onProgress: (event: { percent: number } | number, file?: UploadFile<T>) => void
  onSuccess: (body?: T, fileOrXhr?: UploadFile<T> | XMLHttpRequest) => void
  onError: (event: unknown, body?: unknown) => void
}

export interface UploadChangeInfo<T = unknown> {
  file: UploadFile<T>
  fileList: Array<UploadFile<T>>
  event?: { percent: number }
}

export interface ShowUploadListConfig<T = unknown> {
  extra?: JSX.Element | ((file: UploadFile<T>) => JSX.Element)
  showRemoveIcon?: boolean | ((file: UploadFile<T>) => boolean)
  showPreviewIcon?: boolean | ((file: UploadFile<T>) => boolean)
  showDownloadIcon?: boolean | ((file: UploadFile<T>) => boolean)
  removeIcon?: JSX.Element | ((file: UploadFile<T>) => JSX.Element)
  downloadIcon?: JSX.Element | ((file: UploadFile<T>) => JSX.Element)
  previewIcon?: JSX.Element | ((file: UploadFile<T>) => JSX.Element)
}

export interface UploadItemRenderActions {
  download: () => void
  preview: () => void
  remove: () => void
}

export interface UploadProgressProps {
  strokeWidth?: number
  showInfo?: boolean
  strokeColor?: string
}

export interface UploadProps<T = unknown> extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'children' | 'onDrop' | 'onPaste'
> {
  type?: UploadType
  name?: string
  fileList?: Array<UploadFile<T>>
  defaultFileList?: Array<UploadFile<T>>
  accept?: string | UploadAcceptObject
  action?: string | ((file: File) => string | PromiseLike<string>)
  directory?: boolean
  data?:
    | Record<string, unknown>
    | ((file: UploadFile<T>) => Record<string, unknown> | Promise<Record<string, unknown>>)
  method?: UploadMethod
  headers?: Record<string, string>
  multiple?: boolean
  disabled?: boolean
  maxCount?: number
  showUploadList?: boolean | ShowUploadListConfig<T>
  beforeUpload?: (file: File, fileList: File[]) => UploadBeforeValue | Promise<UploadBeforeValue>
  customRequest?: (
    options: UploadRequestOptions<T>,
    info: { defaultRequest: (options: UploadRequestOptions<T>) => void },
  ) => void
  onChange?: (info: UploadChangeInfo<T>) => void
  onRemove?: (file: UploadFile<T>) => void | boolean | Promise<void | boolean>
  onPreview?: (file: UploadFile<T>) => void
  onDownload?: (file: UploadFile<T>) => void
  onDrop?: (event: DragEvent) => void
  listType?: UploadListType
  withCredentials?: boolean
  openFileDialogOnClick?: boolean
  pastable?: boolean
  capture?: boolean | 'user' | 'environment'
  previewFile?: (file: File | Blob) => PromiseLike<string>
  iconRender?: (file: UploadFile<T>, listType?: UploadListType) => JSX.Element
  isImageUrl?: (file: UploadFile<T>) => boolean
  progress?: UploadProgressProps
  itemRender?: (
    originNode: JSX.Element,
    file: UploadFile<T>,
    fileList: Array<UploadFile<T>>,
    actions: UploadItemRenderActions,
  ) => JSX.Element
  classNames?: UploadSemanticClassNames
  styles?: UploadSemanticStyles
  children?: JSX.Element
  prefixCls?: string
}

export interface UploadComponent {
  <T = unknown>(props: UploadProps<T>): JSX.Element
  Dragger: <T = unknown>(props: UploadProps<T>) => JSX.Element
  LIST_IGNORE: string
}
