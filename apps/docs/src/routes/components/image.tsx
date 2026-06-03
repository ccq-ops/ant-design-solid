import { Image, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const src = 'https://dummyimage.com/240x160/e6f4ff/1677ff.png&text=Image'

export default function ImagePage() {
  return (
    <>
      <h1>Image</h1>
      <p>Render images with fallback, placeholder, and preview.</p>

      <DemoBlock title="Basic" code={`<Image width={240} src={src} alt="Example" />`}>
        <Image width={240} src={src} alt="Example" />
      </DemoBlock>

      <DemoBlock
        title="Placeholder"
        code={`<Image width={240} src={src} placeholder="Loading image" />`}
      >
        <Image width={240} src={src} alt="Placeholder" placeholder="Loading image" />
      </DemoBlock>

      <DemoBlock
        title="Fallback"
        code={`<Image src="/missing.png" fallback="https://dummyimage.com/240x160/f5f5f5/999.png&text=Fallback" />`}
      >
        <Image
          width={240}
          src="/missing.png"
          fallback="https://dummyimage.com/240x160/f5f5f5/999.png&text=Fallback"
          alt="Fallback"
        />
      </DemoBlock>

      <DemoBlock title="Preview" code={`<Image width={160} src={src} />`}>
        <Space>
          <Image width={160} src={src} alt="Preview" />
          <Image preview={false} width={160} src={src} alt="No preview" />
        </Space>
      </DemoBlock>
    </>
  )
}
