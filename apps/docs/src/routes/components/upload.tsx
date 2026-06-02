import { createSignal } from 'solid-js'
import { Button, Space, Upload } from '@ant-design-solid/core'
import type { UploadFile, UploadRequestOptions } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

function delayedRequest({ onProgress, onSuccess }: UploadRequestOptions) {
  onProgress(35)
  window.setTimeout(() => {
    onProgress(100)
    onSuccess({ ok: true })
  }, 600)
}

export default function UploadPage() {
  const [manualFiles, setManualFiles] = createSignal<UploadFile[]>([])

  return (
    <>
      <h1>Upload</h1>
      <p>Select files, optionally intercept uploads, and render a basic upload list.</p>

      <DemoBlock
        title="Basic"
        code={`<Upload>
  <Button>Upload file</Button>
</Upload>`}
      >
        <Upload>
          <Button>Upload file</Button>
        </Upload>
      </DemoBlock>

      <DemoBlock
        title="Multiple"
        code={`<Upload multiple>
  <Button>Upload files</Button>
</Upload>`}
      >
        <Upload multiple>
          <Button>Upload files</Button>
        </Upload>
      </DemoBlock>

      <DemoBlock
        title="beforeUpload false"
        code={`const [manualFiles, setManualFiles] = createSignal<UploadFile[]>([])
<Upload
  fileList={manualFiles()}
  beforeUpload={() => false}
  onChange={({ fileList }) => setManualFiles(fileList)}
>
  <Button>Select without uploading</Button>
</Upload>`}
      >
        <Space direction="vertical">
          <Upload
            fileList={manualFiles()}
            beforeUpload={() => false}
            onChange={({ fileList }) => setManualFiles(fileList)}
          >
            <Button>Select without uploading</Button>
          </Upload>
          <span>
            Manual files:{' '}
            {manualFiles()
              .map((file) => file.name)
              .join(', ') || 'none'}
          </span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom request"
        code={`<Upload customRequest={({ onProgress, onSuccess }) => {
  onProgress(35)
  window.setTimeout(() => {
    onProgress(100)
    onSuccess({ ok: true })
  }, 600)
}}>
  <Button>Upload with progress</Button>
</Upload>`}
      >
        <Upload customRequest={delayedRequest}>
          <Button>Upload with progress</Button>
        </Upload>
      </DemoBlock>

      <DemoBlock
        title="Max count"
        code={`<Upload multiple maxCount={2}>
  <Button>Keep latest two</Button>
</Upload>`}
      >
        <Upload multiple maxCount={2}>
          <Button>Keep latest two</Button>
        </Upload>
      </DemoBlock>

      <DemoBlock
        title="Disabled"
        code={`<Upload disabled defaultFileList={[{ uid: '1', name: 'locked.txt', status: 'done' }]}>
  <Button disabled>Upload disabled</Button>
</Upload>`}
      >
        <Upload disabled defaultFileList={[{ uid: '1', name: 'locked.txt', status: 'done' }]}>
          <Button disabled>Upload disabled</Button>
        </Upload>
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          Use <code>fileList</code> and <code>onChange</code> for controlled file-list state.
        </li>
        <li>
          Return <code>false</code> from <code>beforeUpload</code> to keep a selected file in the
          list without starting upload work.
        </li>
        <li>
          Provide <code>customRequest</code> to report upload progress, success, and errors.
        </li>
      </ul>
    </>
  )
}
