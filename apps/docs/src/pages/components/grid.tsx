import { Col, Row } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'
export default function GridPage() {
  return (
    <>
      <h1>Grid</h1>
      <DemoBlock
        title="24 columns"
        code={`<Row gutter={[16, 24]}><Col span={12}>A</Col><Col span={12}>B</Col></Row>`}
      >
        <Row gutter={[16, 24]}>
          <Col span={12}>
            <div class="bg-blue-50 p-4">A</div>
          </Col>
          <Col span={12}>
            <div class="bg-blue-200 p-4">B</div>
          </Col>
        </Row>
      </DemoBlock>
    </>
  )
}
