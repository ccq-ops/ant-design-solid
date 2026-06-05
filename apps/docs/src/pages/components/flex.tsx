import { Button, Flex } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const flexRows: ApiTableRow[] = [
  {
    property: 'vertical',
    description: 'Stacks children vertically.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'wrap',
    description: 'Controls flex wrapping. Boolean true maps to wrap.',
    type: "boolean | 'nowrap' | 'wrap' | 'wrap-reverse'",
  },
  {
    property: 'justify',
    description: 'Maps to CSS justify-content.',
    type: "'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'",
  },
  {
    property: 'align',
    description: 'Maps to CSS align-items.',
    type: "'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'",
  },
  {
    property: 'gap',
    description: 'Horizontal and vertical gap. Presets use Space tokens.',
    type: "'small' | 'middle' | 'large' | number | [number, number]",
    defaultValue: "'middle'",
  },
  {
    property: 'component',
    description: 'HTML element used as the wrapper.',
    type: 'keyof JSX.IntrinsicElements',
    defaultValue: "'div'",
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
]

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

      <h2>API</h2>
      <ApiTable rows={flexRows} aria-label="Flex API" />
    </>
  )
}
