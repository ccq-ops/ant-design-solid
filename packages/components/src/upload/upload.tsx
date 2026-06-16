import {
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileOutlined,
  InboxOutlined,
} from '@solid-ant-design/icons'
import { For, Show, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  ShowUploadListConfig,
  UploadChangeInfo,
  UploadComponent,
  UploadFile,
  UploadProps,
  UploadRequestOptions,
} from './interface'
import { useUploadStyle } from './upload.style'

export const LIST_IGNORE = `__UPLOAD_LIST_IGNORE_${Date.now()}__`

let uidSeed = 0

function nextUid(): string {
  uidSeed += 1
  return `upload-${Date.now()}-${uidSeed}`
}

function fileName(file: File | Blob | string, fallback: string): string {
  if (typeof file === 'string') return fallback
  if ('name' in file && typeof file.name === 'string') return file.name
  return fallback
}

function toNativeFile(file: File | Blob | string, fallback: File): File {
  if (file instanceof File) return file
  if (file instanceof Blob) {
    return new File([file], fileName(file, fallback.name), { type: file.type || fallback.type })
  }
  return new File([file], fallback.name, { type: fallback.type })
}

function toUploadFile<T>(file: File): UploadFile<T> {
  return {
    uid: nextUid(),
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified),
    type: file.type,
    status: 'ready',
    percent: 0,
    originFileObj: file,
  }
}

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0
  return Math.max(0, Math.min(100, percent))
}

function applyMaxCount<T>(
  fileList: Array<UploadFile<T>>,
  maxCount: number | undefined,
): Array<UploadFile<T>> {
  if (maxCount === undefined || maxCount < 0) return fileList
  if (maxCount === 0) return []
  return fileList.slice(-maxCount)
}

function mergeStyle(...values: Array<JSX.CSSProperties | string | undefined>) {
  return Object.assign({}, ...values.filter((value) => value && typeof value !== 'string'))
}

function resolveNode<T>(
  node: JSX.Element | ((file: UploadFile<T>) => JSX.Element) | undefined,
  file: UploadFile<T>,
) {
  return typeof node === 'function' ? node(file) : node
}

function resolveBoolean<T>(
  value: boolean | ((file: UploadFile<T>) => boolean) | undefined,
  file: UploadFile<T>,
  fallback: boolean,
) {
  if (typeof value === 'function') return value(file)
  if (typeof value === 'boolean') return value
  return fallback
}

function defaultIsImageUrl<T>(file: UploadFile<T>): boolean {
  const type = file.type ?? file.originFileObj?.type
  if (type?.startsWith('image/')) return true
  return Boolean(file.thumbUrl || file.url?.match(/\.(webp|png|gif|jpe?g|bmp|svg)$/i))
}

function filesFromDataTransfer(dataTransfer: DataTransfer | null | undefined): File[] {
  if (!dataTransfer) return []
  const itemFiles = Array.from(dataTransfer.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter((item): item is File => Boolean(item))
  if (itemFiles.length > 0) return itemFiles
  return Array.from(dataTransfer.files ?? [])
}

function normalizeAccept(accept: UploadProps['accept']): string | undefined {
  if (!accept) return undefined
  return typeof accept === 'string' ? accept : accept.format
}

function filePassesAccept(file: File, accept: UploadProps['accept']): boolean {
  if (!accept || typeof accept === 'string') return true
  if (accept.filter === 'native' || !accept.filter) return true
  return accept.filter(file)
}

function defaultRequest<T>(options: UploadRequestOptions<T>): void {
  if (!options.action) {
    options.onSuccess(undefined, undefined)
    return
  }

  const xhr = new XMLHttpRequest()
  const formData = new FormData()

  for (const [key, value] of Object.entries(options.data ?? {})) {
    if (value instanceof Blob) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  }

  formData.append(options.filename ?? 'file', options.file)
  xhr.upload.onprogress = (event) => {
    if (!event.lengthComputable) return
    options.onProgress({ percent: clampPercent((event.loaded / event.total) * 100) })
  }
  xhr.onerror = () => options.onError(new Error('Upload request failed'))
  xhr.onload = () => {
    const body = xhr.response
    if (xhr.status >= 200 && xhr.status < 300) {
      options.onSuccess(body as T, xhr)
    } else {
      options.onError(new Error(`Upload request failed with status ${xhr.status}`), body)
    }
  }
  xhr.open(options.method ?? 'post', options.action, true)
  xhr.withCredentials = Boolean(options.withCredentials)
  for (const [key, value] of Object.entries(options.headers ?? {})) {
    xhr.setRequestHeader(key, value)
  }
  xhr.send(formData)
}

async function resolveRequestOptions<T>(
  props: UploadProps<T>,
  uploadFile: UploadFile<T>,
  nativeFile: File,
  callbacks: Pick<UploadRequestOptions<T>, 'onProgress' | 'onSuccess' | 'onError'>,
): Promise<UploadRequestOptions<T>> {
  const action = typeof props.action === 'function' ? await props.action(nativeFile) : props.action
  const data = typeof props.data === 'function' ? await props.data(uploadFile) : props.data
  return {
    action,
    data,
    filename: props.name ?? 'file',
    file: nativeFile,
    headers: props.headers,
    method: props.method ?? 'post',
    withCredentials: props.withCredentials,
    ...callbacks,
  }
}

function InternalUpload<T = unknown>(props: UploadProps<T>) {
  const [local, rest] = splitProps(props, [
    'type',
    'fileList',
    'defaultFileList',
    'accept',
    'action',
    'directory',
    'data',
    'method',
    'headers',
    'name',
    'multiple',
    'disabled',
    'maxCount',
    'showUploadList',
    'beforeUpload',
    'customRequest',
    'onChange',
    'onRemove',
    'onPreview',
    'onDownload',
    'onDrop',
    'listType',
    'withCredentials',
    'openFileDialogOnClick',
    'pastable',
    'capture',
    'previewFile',
    'iconRender',
    'isImageUrl',
    'progress',
    'itemRender',
    'classNames',
    'styles',
    'children',
    'prefixCls',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-upload`
  const [, hashId] = useUploadStyle(prefixCls())
  const [innerFileList, setInnerFileList] = createSignal<Array<UploadFile<T>>>(
    local.defaultFileList ?? [],
  )
  const [dragState, setDragState] = createSignal<'drop' | 'dragover'>('drop')
  const activeUids = new Set<string>()
  const terminalUids = new Set<string>()
  let inputRef: HTMLInputElement | undefined

  const disabled = () => Boolean(local.disabled)
  const listType = () => local.listType ?? 'text'
  const uploadType = () => local.type ?? 'select'
  const showUploadList = () => local.showUploadList !== false
  const showUploadListConfig = () =>
    typeof local.showUploadList === 'object'
      ? (local.showUploadList as ShowUploadListConfig<T>)
      : {}
  const isControlled = () => 'fileList' in props
  const mergedFileList = () => (isControlled() ? (local.fileList ?? []) : innerFileList())

  function markInactive(uid: string): void {
    activeUids.delete(uid)
    terminalUids.add(uid)
  }

  function updateFileList(
    nextList: Array<UploadFile<T>>,
    changedFile: UploadFile<T>,
    event?: UploadChangeInfo<T>['event'],
  ): void {
    const limitedList = applyMaxCount(nextList, local.maxCount)
    const nextUids = new Set(nextList.map((file) => file.uid))
    const limitedUids = new Set(limitedList.map((file) => file.uid))

    for (const uid of nextUids) {
      if (!limitedUids.has(uid)) markInactive(uid)
    }

    if (!isControlled()) setInnerFileList(limitedList)
    local.onChange?.({ file: changedFile, fileList: limitedList, event })
  }

  function currentFile(uid: string): UploadFile<T> | undefined {
    return mergedFileList().find((file) => file.uid === uid)
  }

  function replaceExistingFile(file: UploadFile<T>, event?: UploadChangeInfo<T>['event']): void {
    if (!currentFile(file.uid)) return
    const nextList = mergedFileList().map((item) => (item.uid === file.uid ? file : item))
    updateFileList(nextList, file, event)
  }

  function updateActiveFile(
    uid: string,
    updater: (file: UploadFile<T>) => UploadFile<T>,
    options: { terminal?: boolean; event?: UploadChangeInfo<T>['event'] } = {},
  ): void {
    if (!activeUids.has(uid) || terminalUids.has(uid)) return
    const current = currentFile(uid)
    if (!current) {
      markInactive(uid)
      return
    }

    const nextFile = updater(current)
    if (options.terminal) markInactive(uid)
    replaceExistingFile(nextFile, options.event)
  }

  function addFile(file: UploadFile<T>): void {
    updateFileList([...mergedFileList(), file], file)
  }

  async function triggerUpload(file: UploadFile<T>, requestFile: File): Promise<void> {
    activeUids.add(file.uid)
    terminalUids.delete(file.uid)

    if (!local.customRequest && !local.action) {
      updateActiveFile(file.uid, (current) => ({ ...current, status: 'done', percent: 100 }), {
        terminal: true,
      })
      return
    }

    updateActiveFile(file.uid, (current) => ({
      ...current,
      status: 'uploading',
      percent: current.percent ?? 0,
    }))

    const callbacks: Pick<UploadRequestOptions<T>, 'onProgress' | 'onSuccess' | 'onError'> = {
      onProgress: (event) => {
        const percent = clampPercent(typeof event === 'number' ? event : event.percent)
        updateActiveFile(
          file.uid,
          (current) => ({
            ...current,
            status: 'uploading',
            percent,
          }),
          { event: { percent } },
        )
      },
      onSuccess: (response, fileOrXhr) => {
        updateActiveFile(
          file.uid,
          (current) => ({
            ...current,
            status: 'done',
            percent: 100,
            response,
            xhr: fileOrXhr instanceof XMLHttpRequest ? fileOrXhr : current.xhr,
          }),
          { terminal: true },
        )
      },
      onError: (error) => {
        updateActiveFile(file.uid, (current) => ({ ...current, status: 'error', error }), {
          terminal: true,
        })
      },
    }

    try {
      const requestOptions = await resolveRequestOptions(local, file, requestFile, callbacks)
      if (!activeUids.has(file.uid) || terminalUids.has(file.uid)) return
      if (local.customRequest) {
        local.customRequest(requestOptions, { defaultRequest })
      } else {
        defaultRequest(requestOptions)
      }
    } catch (error) {
      updateActiveFile(file.uid, (current) => ({ ...current, status: 'error', error }), {
        terminal: true,
      })
    }
  }

  async function handleFiles(files: File[]): Promise<void> {
    const acceptedFiles = files.filter((nativeFile) => filePassesAccept(nativeFile, local.accept))
    for (const nativeFile of acceptedFiles) {
      const uploadFile = toUploadFile<T>(nativeFile)
      let beforeResult: Awaited<ReturnType<NonNullable<UploadProps<T>['beforeUpload']>>> = true

      try {
        beforeResult = local.beforeUpload
          ? await local.beforeUpload(nativeFile, acceptedFiles)
          : true
      } catch (error) {
        markInactive(uploadFile.uid)
        addFile({ ...uploadFile, status: 'error', error })
        continue
      }

      if (beforeResult === LIST_IGNORE) continue

      let requestFile = nativeFile
      if (
        beforeResult instanceof File ||
        beforeResult instanceof Blob ||
        typeof beforeResult === 'string'
      ) {
        requestFile = toNativeFile(beforeResult, nativeFile)
      }

      addFile(uploadFile)
      if (beforeResult !== false) void triggerUpload(uploadFile, requestFile)
    }
  }

  function handleChange(event: Event): void {
    const target = event.currentTarget as HTMLInputElement
    const files = Array.from(target.files ?? [])
    target.value = ''
    if (disabled()) return
    void handleFiles(files)
  }

  function openFileDialog(): void {
    if (disabled() || local.openFileDialogOnClick === false) return
    inputRef?.click()
  }

  async function removeFile(file: UploadFile<T>): Promise<void> {
    if (disabled()) return

    let result: void | boolean = true
    try {
      result = local.onRemove ? await local.onRemove(file) : true
    } catch {
      result = false
    }

    if (result === false) return
    markInactive(file.uid)
    const removedFile: UploadFile<T> = { ...file, status: 'removed' }
    updateFileList(
      mergedFileList().filter((item) => item.uid !== file.uid),
      removedFile,
    )
  }

  function previewFile(file: UploadFile<T>): void {
    local.onPreview?.(file)
  }

  function downloadFile(file: UploadFile<T>): void {
    if (local.onDownload) {
      local.onDownload(file)
      return
    }
    if (file.url) window.open(file.url)
  }

  function handleDrop(event: DragEvent): void {
    event.preventDefault()
    setDragState('drop')
    local.onDrop?.(event)
    if (disabled()) return
    void handleFiles(filesFromDataTransfer(event.dataTransfer))
  }

  function handleDrag(event: DragEvent): void {
    event.preventDefault()
    if (disabled()) return
    setDragState(event.type === 'dragover' ? 'dragover' : 'drop')
  }

  function handlePaste(event: ClipboardEvent): void {
    if (!local.pastable || disabled()) return
    const files = filesFromDataTransfer(event.clipboardData)
    if (files.length === 0) return
    event.preventDefault()
    void handleFiles(files)
  }

  function renderIcon(file: UploadFile<T>) {
    const custom = local.iconRender?.(file, listType())
    if (custom) return custom
    const isImage = (local.isImageUrl ?? defaultIsImageUrl)(file)
    if (isImage && (file.thumbUrl || file.url || file.preview)) {
      return (
        <img
          class={`${prefixCls()}-thumbnail`}
          src={file.thumbUrl ?? file.preview ?? file.url}
          alt={file.name}
          crossOrigin={file.crossOrigin}
        />
      )
    }
    return <FileOutlined />
  }

  function renderUploadItem(file: UploadFile<T>) {
    const config = showUploadListConfig()
    const canPreview = resolveBoolean(config.showPreviewIcon, file, Boolean(local.onPreview))
    const canDownload = resolveBoolean(
      config.showDownloadIcon,
      file,
      Boolean(local.onDownload || file.url),
    )
    const canRemove = resolveBoolean(config.showRemoveIcon, file, true)
    const itemStyle = mergeStyle(local.styles?.item)
    const originNode = (
      <li
        class={classNames(
          `${prefixCls()}-list-item`,
          `${prefixCls()}-list-item-${listType()}`,
          file.status && `${prefixCls()}-list-item-${file.status}`,
          local.classNames?.item,
        )}
        style={itemStyle}
      >
        <Show when={listType() !== 'text'}>
          <span class={`${prefixCls()}-icon`}>{renderIcon(file)}</span>
        </Show>
        <span class={`${prefixCls()}-file-name`}>
          <Show when={file.url} fallback={file.name}>
            <a
              class={`${prefixCls()}-file-link`}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (local.onPreview) {
                  event.preventDefault()
                  previewFile(file)
                }
              }}
            >
              {file.name}
            </a>
          </Show>
        </span>
        <Show when={file.status}>
          <span class={`${prefixCls()}-status`}>{file.status}</span>
        </Show>
        <Show when={file.status === 'uploading' || (file.percent ?? 0) > 0}>
          <span class={`${prefixCls()}-progress`} aria-hidden="true">
            <span
              class={`${prefixCls()}-progress-bar`}
              style={{
                width: `${clampPercent(file.percent ?? 0)}%`,
                'background-color': local.progress?.strokeColor,
                height: local.progress?.strokeWidth ? `${local.progress.strokeWidth}px` : undefined,
              }}
            />
          </span>
        </Show>
        <Show when={resolveNode(config.extra, file)}>
          {(extra) => <span class={`${prefixCls()}-extra`}>{extra()}</span>}
        </Show>
        <span class={`${prefixCls()}-actions`}>
          <Show when={canPreview}>
            <button
              type="button"
              class={`${prefixCls()}-preview`}
              aria-label={`Preview ${file.name}`}
              onClick={() => previewFile(file)}
            >
              {resolveNode(config.previewIcon, file) ?? <EyeOutlined />}
            </button>
          </Show>
          <Show when={canDownload}>
            <button
              type="button"
              class={`${prefixCls()}-download`}
              aria-label={`Download ${file.name}`}
              onClick={() => downloadFile(file)}
            >
              {resolveNode(config.downloadIcon, file) ?? <DownloadOutlined />}
            </button>
          </Show>
          <Show when={canRemove}>
            <button
              type="button"
              class={`${prefixCls()}-remove`}
              aria-label={`Remove ${file.name}`}
              disabled={disabled()}
              onClick={() => void removeFile(file)}
            >
              {resolveNode(config.removeIcon, file) ?? <CloseOutlined />}
            </button>
          </Show>
        </span>
      </li>
    )

    const renderedNode =
      local.itemRender?.(originNode, file, mergedFileList(), {
        download: () => downloadFile(file),
        preview: () => previewFile(file),
        remove: () => void removeFile(file),
      }) ?? originNode

    if (local.itemRender) {
      return (
        <li
          class={classNames(
            `${prefixCls()}-list-item`,
            `${prefixCls()}-list-item-${listType()}`,
            file.status && `${prefixCls()}-list-item-${file.status}`,
            local.classNames?.item,
          )}
          style={itemStyle}
        >
          {renderedNode}
        </li>
      )
    }

    return renderedNode
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${uploadType()}`,
        `${prefixCls()}-list-${listType()}`,
        dragState() === 'dragover' && `${prefixCls()}-drag-hover`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.classNames?.root,
        local.class,
      )}
      style={mergeStyle(local.styles?.root, local.style)}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onPaste={handlePaste}
    >
      <span
        class={classNames(`${prefixCls()}-trigger`, local.classNames?.trigger)}
        style={local.styles?.trigger}
        aria-disabled={disabled()}
        onClick={openFileDialog}
      >
        <Show when={uploadType() === 'drag' && !local.children}>
          <span class={`${prefixCls()}-drag-icon`}>
            <InboxOutlined />
          </span>
        </Show>
        {local.children}
      </span>
      <input
        ref={(element) => {
          inputRef = element
          if (local.directory) {
            element.setAttribute('webkitdirectory', '')
            element.setAttribute('directory', '')
          } else {
            element.removeAttribute('webkitdirectory')
            element.removeAttribute('directory')
          }
        }}
        class={`${prefixCls()}-input`}
        type="file"
        accept={normalizeAccept(local.accept)}
        multiple={local.multiple}
        disabled={disabled()}
        capture={local.capture === true ? undefined : local.capture || undefined}
        onChange={handleChange}
      />
      <Show when={showUploadList()}>
        <ul
          class={classNames(
            `${prefixCls()}-list`,
            `${prefixCls()}-list-${listType()}`,
            local.classNames?.list,
          )}
          style={local.styles?.list}
        >
          <For each={mergedFileList()}>{(file) => renderUploadItem(file)}</For>
        </ul>
      </Show>
    </div>
  )
}

export const Upload = InternalUpload as UploadComponent

Upload.LIST_IGNORE = LIST_IGNORE
Upload.Dragger = function Dragger<T = unknown>(props: UploadProps<T>) {
  return <InternalUpload {...props} type="drag" />
}
