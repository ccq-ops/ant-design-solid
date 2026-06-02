import type { JSX } from 'solid-js'

export type UploadFileStatus = 'ready' | 'uploading' | 'done' | 'error' | 'removed'

export interface UploadFile {
  uid: string
  name: string
  status?: UploadFileStatus
  percent?: number
  originFileObj?: File
  url?: string
  response?: unknown
  error?: unknown
}

export interface UploadRequestOptions {
  file: File
  onProgress: (percent: number) => void
  onSuccess: (response?: unknown) => void
  onError: (error: unknown) => void
}

export interface UploadChangeInfo {
  file: UploadFile
  fileList: UploadFile[]
}

export interface UploadProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'children'
> {
  fileList?: UploadFile[]
  defaultFileList?: UploadFile[]
  accept?: string
  multiple?: boolean
  disabled?: boolean
  maxCount?: number
  showUploadList?: boolean
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  customRequest?: (options: UploadRequestOptions) => void
  onChange?: (info: UploadChangeInfo) => void
  onRemove?: (file: UploadFile) => boolean | Promise<boolean>
  children?: JSX.Element
  prefixCls?: string
}
