import { Button, Card, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function CardPage() {
  return (
    <>
      <h1>Card</h1>
      <DemoBlock title="Basic" code={`<Card>Card content</Card>`}>
        <Card class="w-80">
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
      </DemoBlock>
      <DemoBlock
        title="Title and extra"
        code={`<Card title="Card title" extra={<a href="#">More</a>}>Content</Card>`}
      >
        <Card title="Card title" extra={<a href="#more">More</a>} class="w-90">
          <p>Content with a header and an extra action.</p>
        </Card>
      </DemoBlock>
      <DemoBlock
        title="Cover and actions"
        code={`<Card cover={<div>Cover</div>} actions={[<a>Edit</a>, <a>Share</a>]}>Content</Card>`}
      >
        <Card
          title="Project"
          cover={
            <div class="flex h-[120px] items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 font-semibold text-blue-600">
              Cover
            </div>
          }
          actions={[
            <a href="#edit">Edit</a>,
            <a href="#share">Share</a>,
            <a href="#more-actions">More</a>,
          ]}
          class="w-90"
        >
          <p>Cards can include a visual cover and a footer action bar.</p>
        </Card>
      </DemoBlock>
      <DemoBlock
        title="Variants"
        code={`<Card hoverable size="small">Small hoverable</Card>\n<Card bordered={false}>Borderless</Card>`}
      >
        <Space wrap align="start">
          <Card hoverable size="small" title="Small" class="w-60">
            Small cards reduce header and body padding.
          </Card>
          <Card bordered={false} title="Borderless" class="w-60">
            Borderless cards sit directly on the surrounding surface.
          </Card>
          <Card hoverable title="Hoverable" class="w-60">
            Hoverable cards receive an elevated treatment on hover.
          </Card>
        </Space>
      </DemoBlock>
      <DemoBlock
        title="With actions"
        code={`<Card actions={[<Button>Edit</Button>]}>Content</Card>`}
      >
        <Card actions={[<Button type="text">Edit</Button>, <Button type="text">Archive</Button>]}>
          Action slots accept any JSX element, including buttons.
        </Card>
      </DemoBlock>
    </>
  )
}
