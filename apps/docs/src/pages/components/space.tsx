import { Button, Card, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const spaceRows: ApiTableRow[] = [
  {
    property: 'size',
    description: 'Gap size between items. Tuple values set horizontal and vertical gaps.',
    type: "'small' | 'middle' | 'large' | number | [number, number]",
    defaultValue: "'middle'",
  },
  {
    property: 'direction',
    description: 'Stack items horizontally or vertically.',
    type: "'horizontal' | 'vertical'",
    defaultValue: "'horizontal'",
  },
  {
    property: 'align',
    description: 'Cross-axis alignment of items.',
    type: "'start' | 'end' | 'center' | 'baseline'",
  },
  {
    property: 'wrap',
    description: 'Allows horizontal items to wrap onto multiple lines.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'split',
    description: 'Separator rendered between adjacent items.',
    type: 'JSX.Element',
  },
]

export default function SpacePage() {
  return (
    <>
      <h1>Space</h1>
      <p>Space adds consistent gaps between inline or stacked elements.</p>

      <DemoBlock title="Basic" code={`<Space><Button>One</Button><Button>Two</Button></Space>`}>
        <Space>
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Direction"
        code={`<Space direction="vertical">
  <Button>Top</Button>
  <Button>Bottom</Button>
</Space>`}
      >
        <Space direction="vertical">
          <Button>Top</Button>
          <Button>Middle</Button>
          <Button>Bottom</Button>
        </Space>
      </DemoBlock>

      <DemoBlock title="Size" code={`<Space size="large">...</Space>
<Space size={[8, 24]}>...</Space>`}>
        <Space direction="vertical">
          <Space size="large">
            <Button>Large</Button>
            <Button>Gap</Button>
          </Space>
          <Space size={[8, 24]} wrap>
            <Button>8 x 24</Button>
            <Button>Tuple</Button>
            <Button>Gap</Button>
          </Space>
        </Space>
      </DemoBlock>

      <DemoBlock title="Wrap" code={`<Space wrap>...</Space>`}>
        <Space wrap class="max-w-80">
          <Button>Alpha</Button>
          <Button>Beta</Button>
          <Button>Gamma</Button>
          <Button>Delta</Button>
          <Button>Epsilon</Button>
        </Space>
      </DemoBlock>

      <DemoBlock title="Alignment" code={`<Space align="start"><Card /> <Button /></Space>`}>
        <Space align="start">
          <Card size="small" title="Card">
            Taller content
            <br />
            spans two lines.
          </Card>
          <Button>Aligned start</Button>
        </Space>
      </DemoBlock>

      <DemoBlock title="Split" code={`<Space split={<span>/</span>}><a>Home</a><a>Docs</a></Space>`}>
        <Space split={<span class="text-gray-300">/</span>}>
          <a href="#home">Home</a>
          <a href="#docs">Docs</a>
          <a href="#components">Components</a>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={spaceRows} aria-label="Space API" />
    </>
  )
}
