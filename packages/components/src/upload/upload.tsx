import { For, Show, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { UploadFile, UploadProps } from './interface'
import { useUploadStyle } from './upload.style'

let uidSeed = 0

function nextUid(): string {
  uidSeed += 1
  return `upload-${Date.now()}-${uidSeed}`
}

function toUploadFile(file: File): UploadFile {
  return {
    uid: nextUid(),
    name: file.name,
    status: 'ready',
    percent: 0,
    originFileObj: file,
  }
}

function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0
  return Math.max(0, Math.min(100, percent))
}

function applyMaxCount(fileList: UploadFile[], maxCount: number | undefined): UploadFile[] {
  if (maxCount === undefined || maxCount < 0) return fileList
  if (maxCount === 0) return []
  return fileList.slice(-maxCount)
}

export function Upload(props: UploadProps) {
  const [local, rest] = splitProps(props, [
    'fileList',
    'defaultFileList',
    'accept',
    'multiple',
    'disabled',
    'maxCount',
    'showUploadList',
    'beforeUpload',
    'customRequest',
    'onChange',
    'onRemove',
    'children',
    'prefixCls',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-upload`
  const [, hashId] = useUploadStyle(prefixCls())
  const [innerFileList, setInnerFileList] = createSignal<UploadFile[]>(local.defaultFileList ?? [])
  let inputRef: HTMLInputElement | undefined

  const disabled = () => Boolean(local.disabled)
  const showUploadList = () => local.showUploadList !== false
  const isControlled = () => 'fileList' in props
  const mergedFileList = () => (isControlled() ? (local.fileList ?? []) : innerFileList())

  function updateFileList(nextList: UploadFile[], changedFile: UploadFile): void {
    const limitedList = applyMaxCount(nextList, local.maxCount)
    if (!isControlled()) setInnerFileList(limitedList)
    local.onChange?.({ file: changedFile, fileList: limitedList })
  }

  function replaceFile(file: UploadFile): void {
    const nextList = mergedFileList().map((item) => (item.uid === file.uid ? file : item))
    updateFileList(nextList, file)
  }

  function addFile(file: UploadFile): void {
    updateFileList([...mergedFileList(), file], file)
  }

  function triggerUpload(file: UploadFile): void {
    const originFileObj = file.originFileObj
    if (!originFileObj) return

    if (!local.customRequest) {
      replaceFile({ ...file, status: 'done', percent: 100 })
      return
    }

    const uploadingFile: UploadFile = { ...file, status: 'uploading', percent: file.percent ?? 0 }
    replaceFile(uploadingFile)

    try {
      local.customRequest({
        file: originFileObj,
        onProgress: (percent) => {
          replaceFile({ ...uploadingFile, status: 'uploading', percent: clampPercent(percent) })
        },
        onSuccess: (response) => {
          replaceFile({ ...uploadingFile, status: 'done', percent: 100, response })
        },
        onError: (error) => {
          replaceFile({ ...uploadingFile, status: 'error', error })
        },
      })
    } catch (error) {
      replaceFile({ ...uploadingFile, status: 'error', error })
    }
  }

  async function handleFiles(files: File[]): Promise<void> {
    for (const nativeFile of files) {
      const uploadFile = toUploadFile(nativeFile)
      let shouldUpload = true

      try {
        shouldUpload = local.beforeUpload ? await local.beforeUpload(nativeFile) : true
      } catch (error) {
        addFile({ ...uploadFile, status: 'error', error })
        continue
      }

      addFile(uploadFile)
      if (shouldUpload !== false) triggerUpload(uploadFile)
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
    if (disabled()) return
    inputRef?.click()
  }

  async function removeFile(file: UploadFile): Promise<void> {
    if (disabled()) return

    let result = true
    try {
      result = local.onRemove ? await local.onRemove(file) : true
    } catch {
      result = false
    }

    if (result === false) return
    const removedFile: UploadFile = { ...file, status: 'removed' }
    updateFileList(
      mergedFileList().filter((item) => item.uid !== file.uid),
      removedFile,
    )
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <span
        class={`${prefixCls()}-trigger`}
        role="button"
        tabindex={disabled() ? undefined : 0}
        aria-disabled={disabled()}
        onClick={openFileDialog}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openFileDialog()
          }
        }}
      >
        {local.children}
      </span>
      <input
        ref={inputRef}
        class={`${prefixCls()}-input`}
        type="file"
        accept={local.accept}
        multiple={local.multiple}
        disabled={disabled()}
        onChange={handleChange}
      />
      <Show when={showUploadList()}>
        <ul class={`${prefixCls()}-list`}>
          <For each={mergedFileList()}>
            {(file) => (
              <li
                class={classNames(
                  `${prefixCls()}-list-item`,
                  file.status && `${prefixCls()}-list-item-${file.status}`,
                )}
              >
                <span class={`${prefixCls()}-file-name`}>
                  <Show when={file.url} fallback={file.name}>
                    <a
                      class={`${prefixCls()}-file-link`}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
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
                      style={{ width: `${clampPercent(file.percent ?? 0)}%` }}
                    />
                  </span>
                </Show>
                <button
                  type="button"
                  class={`${prefixCls()}-remove`}
                  aria-label={`Remove ${file.name}`}
                  disabled={disabled()}
                  onClick={() => void removeFile(file)}
                >
                  ×
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
