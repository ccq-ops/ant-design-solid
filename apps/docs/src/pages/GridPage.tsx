import { Col, Row } from '@ant-design-solid/core'
import { DemoBlock } from '../site/DemoBlock'
export function GridPage() { return <><h1>Grid</h1><DemoBlock title="24 columns" code={`<Row gutter={[16, 24]}><Col span={12}>A</Col><Col span={12}>B</Col></Row>`}><Row gutter={[16, 24]}><Col span={12}><div style={{ background: '#e6f4ff', padding: '16px' }}>A</div></Col><Col span={12}><div style={{ background: '#bae0ff', padding: '16px' }}>B</div></Col></Row></DemoBlock></> }
