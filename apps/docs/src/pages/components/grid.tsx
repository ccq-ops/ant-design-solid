import { Col, Row } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const blockStyle = 'rounded bg-blue-50 p-4 text-center text-blue-700'
const strongBlockStyle = 'rounded bg-blue-200 p-4 text-center text-blue-900'

const rowRows: ApiTableRow[] = [
  {
    property: 'gutter',
    description: 'Horizontal gutter or horizontal and vertical gutter pair in pixels.',
    type: 'number | [number, number]',
    defaultValue: '0',
  },
  {
    property: 'align',
    description: 'Vertical alignment of columns inside the row.',
    type: "'top' | 'middle' | 'bottom' | 'stretch'",
  },
  {
    property: 'justify',
    description: 'Horizontal distribution of columns inside the row.',
    type: "'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'",
  },
  {
    property: 'wrap',
    description: 'Allows columns to wrap when there is not enough horizontal space.',
    type: 'boolean',
    defaultValue: 'true',
  },
]

const colRows: ApiTableRow[] = [
  {
    property: 'span',
    description: 'Column width as a number of units in the 24-column grid.',
    type: 'number',
  },
  {
    property: 'offset',
    description: 'Number of grid units to move the column to the right with margin.',
    type: 'number',
  },
  {
    property: 'order',
    description: 'CSS flex order for the column.',
    type: 'number',
  },
  {
    property: 'push',
    description: 'Moves the column right by the specified grid units.',
    type: 'number',
  },
  {
    property: 'pull',
    description: 'Moves the column left by the specified grid units.',
    type: 'number',
  },
]

export default function GridPage() {
  return (
    <>
      <h1>Grid</h1>
      <p>Grid uses rows and columns to build layouts on a 24-column system.</p>

      <DemoBlock
        title="24 columns"
        code={`<Row>
  <Col span={12}>A</Col>
  <Col span={12}>B</Col>
</Row>`}
      >
        <Row>
          <Col span={12}>
            <div class="bg-blue-50 p-4">span 12</div>
          </Col>
          <Col span={12}>
            <div class="bg-blue-200 p-4">span 12</div>
          </Col>
        </Row>
      </DemoBlock>

      <DemoBlock
        title="Gutter"
        code={`<Row gutter={[16, 24]}>
  <Col span={8}>A</Col>
  <Col span={8}>B</Col>
  <Col span={8}>C</Col>
</Row>`}
      >
        <Row gutter={[16, 24]}>
          <Col span={8}>
            <div class={blockStyle}>A</div>
          </Col>
          <Col span={8}>
            <div class={strongBlockStyle}>B</div>
          </Col>
          <Col span={8}>
            <div class={blockStyle}>C</div>
          </Col>
          <Col span={8}>
            <div class={strongBlockStyle}>D</div>
          </Col>
        </Row>
      </DemoBlock>

      <DemoBlock
        title="Offset and order"
        code={`<Row>
  <Col span={6} order={2}>First in DOM</Col>
  <Col span={6} offset={6} order={1}>Ordered first</Col>
</Row>`}
      >
        <Row>
          <Col span={6} order={2}>
            <div class={blockStyle}>order 2</div>
          </Col>
          <Col span={6} offset={6} order={1}>
            <div class={strongBlockStyle}>offset 6 / order 1</div>
          </Col>
        </Row>
      </DemoBlock>

      <DemoBlock
        title="Flex alignment"
        code={`<Row justify="space-between" align="middle">
  <Col span={6}>Short</Col>
  <Col span={6}>Tall</Col>
</Row>`}
      >
        <Row justify="space-between" align="middle">
          <Col span={6}>
            <div class={blockStyle}>Short</div>
          </Col>
          <Col span={6}>
            <div class="rounded bg-blue-200 p-8 text-center text-blue-900">Tall</div>
          </Col>
          <Col span={6}>
            <div class={blockStyle}>Middle aligned</div>
          </Col>
        </Row>
      </DemoBlock>

      <h2>API</h2>
      <h3>Row</h3>
      <ApiTable rows={rowRows} aria-label="Row API" />
      <h3>Col</h3>
      <ApiTable rows={colRows} aria-label="Col API" />
    </>
  )
}
