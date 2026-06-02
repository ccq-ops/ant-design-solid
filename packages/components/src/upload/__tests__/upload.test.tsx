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

afterEach(() => cleanup())

describe('Upload', () => {
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
    expect(beforeUpload).toHaveBeenCalledWith(expect.objectContaining({ name: 'b.txt' }))
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
    const result = render(() => (
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
