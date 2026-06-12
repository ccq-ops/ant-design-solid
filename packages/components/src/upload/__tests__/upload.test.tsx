import { cleanup, fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Upload } from '../upload'
import type { UploadFile } from '../interface'

function file(name: string, type = 'text/plain') {
  return new File(['content'], name, { type })
}

function input(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

function dataTransfer(files: File[]) {
  return {
    files,
    items: files.map((item) => ({
      kind: 'file',
      getAsFile: () => item,
    })),
  }
}

afterEach(() => cleanup())

describe('Upload', () => {
  it('does not expose a nested button role around button children', () => {
    render(() => (
      <Upload>
        <button>Upload</button>
      </Upload>
    ))

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument()
  })

  it('opens input when clicking the child or trigger wrapper', () => {
    const result = render(() => (
      <Upload>
        <button>Upload</button>
      </Upload>
    ))
    const element = input(result.container)
    const click = vi.spyOn(element, 'click')

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))
    fireEvent.click(result.container.querySelector('.ads-upload-trigger') as HTMLElement)

    expect(click).toHaveBeenCalledTimes(2)
  })
  it('adds selected files and marks them done without customRequest', async () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Upload onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('a.txt')] } })

    await waitFor(() => expect(screen.getByText('a.txt')).toBeInTheDocument())
    expect(screen.getByText('done')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ name: 'a.txt', status: 'done', percent: 100 }),
        fileList: [expect.objectContaining({ name: 'a.txt', status: 'done' })],
      }),
    )
  })

  it('respects beforeUpload false', async () => {
    const onChange = vi.fn()
    const beforeUpload = vi.fn(() => false)
    const result = render(() => (
      <Upload beforeUpload={beforeUpload} onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('b.txt')] } })

    await waitFor(() => expect(screen.getByText('b.txt')).toBeInTheDocument())
    expect(screen.getByText('ready')).toBeInTheDocument()
    expect(beforeUpload).toHaveBeenCalledWith(expect.objectContaining({ name: 'b.txt' }), [
      expect.objectContaining({ name: 'b.txt' }),
    ])
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ name: 'b.txt', status: 'ready' }),
      }),
    )
  })

  it('supports async beforeUpload false and resets input value', async () => {
    const onChange = vi.fn()
    const beforeUpload = vi.fn(async () => false)
    const result = render(() => (
      <Upload beforeUpload={beforeUpload} onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))
    const element = input(result.container)

    Object.defineProperty(element, 'value', { value: 'fake-path', writable: true })
    fireEvent.change(element, { target: { files: [file('same.txt')] } })

    await waitFor(() => expect(screen.getByText('same.txt')).toBeInTheDocument())
    expect(element.value).toBe('')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ status: 'ready' }) }),
    )
  })

  it('marks files error when beforeUpload rejects', async () => {
    const error = new Error('blocked')
    const onChange = vi.fn()
    const result = render(() => (
      <Upload beforeUpload={async () => Promise.reject(error)} onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('reject.txt')] } })

    await waitFor(() => expect(screen.getByText('reject.txt')).toBeInTheDocument())
    expect(screen.getByText('error')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ name: 'reject.txt', status: 'error', error }),
      }),
    )
  })

  it('updates progress and success from customRequest', async () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Upload
        customRequest={({ onProgress, onSuccess }) => {
          onProgress(50)
          onSuccess({ ok: true })
        }}
        onChange={onChange}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('c.txt')] } })

    await waitFor(() => expect(screen.getByText('done')).toBeInTheDocument())
    expect(result.container.querySelector('.ads-upload-progress-bar')).toHaveStyle({
      width: '100%',
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ status: 'uploading', percent: 0 }),
      }),
    )
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ status: 'uploading', percent: 50 }),
      }),
    )
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ status: 'done', percent: 100, response: { ok: true } }),
      }),
    )
  })

  it('skips files when beforeUpload returns Upload.LIST_IGNORE', async () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Upload beforeUpload={() => Upload.LIST_IGNORE} onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('ignored.txt')] } })

    await Promise.resolve()
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByText('ignored.txt')).not.toBeInTheDocument()
  })

  it('uploads a transformed file from beforeUpload', async () => {
    const customRequest = vi.fn(({ file: uploadFile, onSuccess }) => {
      onSuccess({ ok: true }, uploadFile)
    })
    const result = render(() => (
      <Upload
        beforeUpload={() => new File(['changed'], 'changed.txt', { type: 'text/plain' })}
        customRequest={customRequest}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('original.txt')] } })

    await waitFor(() => expect(screen.getByText('original.txt')).toBeInTheDocument())
    expect(customRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ name: 'changed.txt' }),
      }),
      expect.objectContaining({ defaultRequest: expect.any(Function) }),
    )
  })

  it('passes full request options to customRequest and supports defaultRequest', async () => {
    const customRequest = vi.fn()
    const data = vi.fn(() => ({ token: 'abc' }))
    const result = render(() => (
      <Upload
        action={(uploadFile) => `/upload/${uploadFile.name}`}
        data={data}
        headers={{ 'x-test': '1' }}
        method="PUT"
        name="asset"
        withCredentials
        customRequest={customRequest}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('request.txt')] } })

    await waitFor(() => expect(customRequest).toHaveBeenCalled())
    expect(data).toHaveBeenCalledWith(expect.objectContaining({ name: 'request.txt' }))
    expect(customRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        action: '/upload/request.txt',
        data: { token: 'abc' },
        filename: 'asset',
        file: expect.objectContaining({ name: 'request.txt' }),
        headers: { 'x-test': '1' },
        method: 'PUT',
        withCredentials: true,
        onProgress: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
      expect.objectContaining({ defaultRequest: expect.any(Function) }),
    )
  })

  it('ignores late progress after success', async () => {
    let progress: ((percent: number) => void) | undefined
    const onChange = vi.fn()
    const result = render(() => (
      <Upload
        customRequest={({ onProgress, onSuccess }) => {
          progress = onProgress
          onSuccess({ ok: true })
        }}
        onChange={onChange}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('late.txt')] } })

    await waitFor(() => expect(screen.getByText('done')).toBeInTheDocument())
    progress?.(25)

    expect(screen.getByText('done')).toBeInTheDocument()
    expect(screen.queryByText('uploading')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ status: 'done', percent: 100 }) }),
    )
  })

  it('ignores callbacks after a file is removed', async () => {
    let progress: ((percent: number) => void) | undefined
    const onChange = vi.fn()
    const result = render(() => (
      <Upload
        customRequest={({ onProgress }) => {
          progress = onProgress
        }}
        onChange={onChange}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('removed-late.txt')] } })
    await waitFor(() => expect(screen.getByText('removed-late.txt')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Remove removed-late.txt' }))
    await waitFor(() => expect(screen.queryByText('removed-late.txt')).not.toBeInTheDocument())

    const callsBeforeLateProgress = onChange.mock.calls.length
    progress?.(80)

    expect(onChange).toHaveBeenCalledTimes(callsBeforeLateProgress)
    expect(screen.queryByText('removed-late.txt')).not.toBeInTheDocument()
  })

  it('ignores callbacks after maxCount trims a file', async () => {
    const progressByFile = new Map<string, (percent: number) => void>()
    const onChange = vi.fn()
    const result = render(() => (
      <Upload
        multiple
        maxCount={1}
        customRequest={({ file, onProgress }) => {
          progressByFile.set(file.name, onProgress)
        }}
        onChange={onChange}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), {
      target: { files: [file('trimmed.txt'), file('latest.txt')] },
    })

    await waitFor(() => expect(screen.queryByText('trimmed.txt')).not.toBeInTheDocument())
    expect(screen.getByText('latest.txt')).toBeInTheDocument()

    const callsBeforeLateProgress = onChange.mock.calls.length
    progressByFile.get('trimmed.txt')?.(80)

    expect(onChange).toHaveBeenCalledTimes(callsBeforeLateProgress)
    expect(screen.queryByText('trimmed.txt')).not.toBeInTheDocument()
    expect(screen.getByText('latest.txt')).toBeInTheDocument()
  })

  it('updates error from customRequest onError and catches thrown customRequest errors', async () => {
    const onErrorChange = vi.fn()
    const error = new Error('failed')
    const onThrowChange = vi.fn()
    const thrown = new Error('thrown')
    const first = render(() => (
      <Upload customRequest={({ onError }) => onError(error)} onChange={onErrorChange}>
        <button>Error upload</button>
      </Upload>
    ))

    fireEvent.change(input(first.container), { target: { files: [file('error.txt')] } })

    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
    expect(onErrorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ status: 'error', error }) }),
    )
    first.unmount()

    const second = render(() => (
      <Upload
        customRequest={() => {
          throw thrown
        }}
        onChange={onThrowChange}
      >
        <button>Throw upload</button>
      </Upload>
    ))

    fireEvent.change(input(second.container), { target: { files: [file('throw.txt')] } })

    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
    expect(onThrowChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ status: 'error', error: thrown }),
      }),
    )
  })

  it('supports maxCount and remove cancellation', async () => {
    const onRemove = vi.fn(() => false)
    const result = render(() => (
      <Upload maxCount={1} onRemove={onRemove}>
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('a.txt'), file('b.txt')] } })

    await waitFor(() => expect(screen.queryByText('a.txt')).not.toBeInTheDocument())
    expect(screen.getByText('b.txt')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove b.txt' }))
    expect(onRemove).toHaveBeenCalled()
    expect(screen.getByText('b.txt')).toBeInTheDocument()
  })

  it('removes files when onRemove allows removal', async () => {
    const onChange = vi.fn()
    const onRemove = vi.fn(async () => true)
    render(() => (
      <Upload
        defaultFileList={[{ uid: '1', name: 'remove.txt', status: 'done' }]}
        onChange={onChange}
        onRemove={onRemove}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Remove remove.txt' }))

    await waitFor(() => expect(screen.queryByText('remove.txt')).not.toBeInTheDocument())
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ name: 'remove.txt', status: 'removed' }),
        fileList: [],
      }),
    )
  })

  it('keeps file when onRemove rejects', async () => {
    const onRemove = vi.fn(async () => Promise.reject(new Error('keep')))
    render(() => (
      <Upload
        defaultFileList={[{ uid: '1', name: 'keep.txt', status: 'done' }]}
        onRemove={onRemove}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Remove keep.txt' }))

    await waitFor(() => expect(onRemove).toHaveBeenCalled())
    expect(screen.getByText('keep.txt')).toBeInTheDocument()
  })

  it('supports controlled fileList', async () => {
    function Demo() {
      const [files, setFiles] = createSignal<UploadFile[]>([
        { uid: '1', name: 'initial.txt', status: 'done' },
      ])
      return (
        <Upload fileList={files()} onChange={({ fileList }) => setFiles(fileList)}>
          <button>Upload</button>
        </Upload>
      )
    }

    const result = render(() => <Demo />)
    expect(screen.getByText('initial.txt')).toBeInTheDocument()

    fireEvent.change(input(result.container), { target: { files: [file('next.txt')] } })

    await waitFor(() => expect(screen.getByText('next.txt')).toBeInTheDocument())
  })

  it('hides list when showUploadList is false', async () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Upload showUploadList={false} onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.change(input(result.container), { target: { files: [file('hidden.txt')] } })

    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(screen.queryByText('hidden.txt')).not.toBeInTheDocument()
  })

  it('customizes upload list actions with showUploadList object', () => {
    const onPreview = vi.fn()
    const onDownload = vi.fn()
    render(() => (
      <Upload
        defaultFileList={[{ uid: '1', name: 'photo.png', status: 'done', url: '/photo.png' }]}
        showUploadList={{
          extra: (uploadFile) => <span>extra {uploadFile.name}</span>,
          showRemoveIcon: false,
          showPreviewIcon: true,
          showDownloadIcon: true,
          previewIcon: <span>Preview</span>,
          downloadIcon: <span>Download</span>,
        }}
        onPreview={onPreview}
        onDownload={onDownload}
      >
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Preview photo.png' }))
    fireEvent.click(screen.getByRole('button', { name: 'Download photo.png' }))

    expect(screen.getByText('extra photo.png')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove photo.png' })).not.toBeInTheDocument()
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'photo.png' }))
    expect(onDownload).toHaveBeenCalledWith(expect.objectContaining({ name: 'photo.png' }))
  })

  it('supports itemRender and semantic classNames/styles', () => {
    const result = render(() => (
      <Upload
        defaultFileList={[{ uid: '1', name: 'custom.txt', status: 'done' }]}
        classNames={{
          root: 'root-slot',
          list: 'list-slot',
          item: 'item-slot',
          trigger: 'trigger-slot',
        }}
        styles={{ item: { color: 'red' } }}
        itemRender={(_originNode, uploadFile, _fileList, actions) => (
          <button type="button" onClick={actions.remove}>
            Custom {uploadFile.name}
          </button>
        )}
      >
        <button>Upload</button>
      </Upload>
    ))

    expect(result.container.querySelector('.root-slot')).toBeInTheDocument()
    expect(result.container.querySelector('.list-slot')).toBeInTheDocument()
    expect(result.container.querySelector('.trigger-slot')).toBeInTheDocument()
    expect(result.container.querySelector<HTMLElement>('.item-slot')?.style.color).toBe('red')
  })

  it('supports dragger, drop uploads, and onDrop', async () => {
    const onDrop = vi.fn()
    const onChange = vi.fn()
    render(() => (
      <Upload.Dragger onDrop={onDrop} onChange={onChange}>
        <span>Drop files</span>
      </Upload.Dragger>
    ))

    fireEvent.drop(screen.getByText('Drop files'), {
      dataTransfer: dataTransfer([file('drop.txt')]),
    })

    await waitFor(() => expect(screen.getByText('drop.txt')).toBeInTheDocument())
    expect(onDrop).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ name: 'drop.txt' }) }),
    )
  })

  it('supports paste uploads when pastable is true', async () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Upload pastable onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))

    fireEvent.paste(result.container.querySelector('.ads-upload') as HTMLElement, {
      clipboardData: dataTransfer([file('paste.txt')]),
    })

    await waitFor(() => expect(screen.getByText('paste.txt')).toBeInTheDocument())
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ name: 'paste.txt' }) }),
    )
  })

  it('passes directory, capture, and openFileDialogOnClick input behavior', () => {
    const result = render(() => (
      <Upload directory capture="environment" openFileDialogOnClick={false}>
        <button>Upload</button>
      </Upload>
    ))
    const element = input(result.container)
    const click = vi.spyOn(element, 'click')

    fireEvent.click(result.container.querySelector('.ads-upload-trigger') as HTMLElement)

    expect(element).toHaveAttribute('webkitdirectory')
    expect(element).toHaveAttribute('directory')
    expect(element).toHaveAttribute('capture', 'environment')
    expect(click).not.toHaveBeenCalled()
  })

  it('guards trigger, remove, and selection when disabled', async () => {
    const onChange = vi.fn()
    const onRemove = vi.fn()
    const result = render(() => (
      <Upload
        disabled
        defaultFileList={[{ uid: '1', name: 'disabled.txt', status: 'done' }]}
        onChange={onChange}
        onRemove={onRemove}
      >
        <button>Upload</button>
      </Upload>
    ))
    const element = input(result.container)
    const click = vi.spyOn(element, 'click')

    fireEvent.click(result.container.querySelector('.ads-upload-trigger') as HTMLElement)
    fireEvent.change(element, { target: { files: [file('ignored.txt')] } })
    fireEvent.click(screen.getByRole('button', { name: 'Remove disabled.txt' }))

    await Promise.resolve()
    expect(click).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(onRemove).not.toHaveBeenCalled()
    expect(screen.getByText('disabled.txt')).toBeInTheDocument()
    expect(screen.queryByText('ignored.txt')).not.toBeInTheDocument()
  })

  it('passes file input attributes and supports custom prefix', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Upload accept="image/*" multiple>
          <button>Upload</button>
        </Upload>
      </ConfigProvider>
    ))
    const element = input(result.container)

    expect(element).toHaveAttribute('accept', 'image/*')
    expect(element).toHaveAttribute('multiple')
    expect(result.container.querySelector('.custom-upload')).toBeInTheDocument()
  })
})
