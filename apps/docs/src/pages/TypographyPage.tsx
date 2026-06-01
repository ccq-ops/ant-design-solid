import { Typography } from '@ant-design-solid/core'
import { DemoBlock } from '../site/DemoBlock'
export function TypographyPage() { return <><h1>Typography</h1><DemoBlock title="Basic" code={`<Typography.Title level={2}>Title</Typography.Title>`}><Typography.Title level={2}>Title</Typography.Title><Typography.Text type="secondary">Secondary text</Typography.Text><Typography.Paragraph ellipsis>Long paragraph long paragraph long paragraph long paragraph.</Typography.Paragraph></DemoBlock></> }
