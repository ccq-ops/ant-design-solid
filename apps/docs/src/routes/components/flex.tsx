import { Button, Flex } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function FlexPage() {
  return (
    <>
      <h1>Flex</h1>
      <DemoBlock
        title="Basic"
        code={`<Flex gap="large"><Button>One</Button><Button>Two</Button></Flex>`}
      >
        <Flex gap="large" wrap>
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </Flex>
      </DemoBlock>
      <DemoBlock
        title="Vertical"
        code={`<Flex vertical gap={8}><Button>A</Button><Button>B</Button></Flex>`}
      >
        <Flex vertical gap={8} align="flex-start">
          <Button>A</Button>
          <Button>B</Button>
        </Flex>
      </DemoBlock>
      <DemoBlock title="Alignment" code={`<Flex justify="space-between" align="center">...</Flex>`}>
        <Flex justify="space-between" align="center" class="w-full bg-gray-100 p-3">
          <span>Left</span>
          <Button type="primary">Right</Button>
        </Flex>
      </DemoBlock>
      <DemoBlock title="Semantic element" code={`<Flex component="section">Section content</Flex>`}>
        <Flex component="section" gap={[8, 16]} wrap="wrap-reverse">
          <span>Section</span>
          <span>content</span>
        </Flex>
      </DemoBlock>
    </>
  )
}
