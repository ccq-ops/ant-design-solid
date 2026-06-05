import { Anchor, Card, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const anchorRows: ApiTableRow[] = [
  { property: 'items', description: 'Anchor links rendered as navigation items.', type: 'AnchorItem[]' },
  { property: 'affix', description: 'Wraps the anchor in Affix behavior.', type: 'boolean', defaultValue: 'true' },
  { property: 'offsetTop', description: 'Top offset used by the affixed anchor.', type: 'number' },
  { property: 'targetOffset', description: 'Scroll target offset used when navigating to anchors.', type: 'number' },
  { property: 'getContainer', description: 'Returns the scroll container observed by the anchor.', type: '() => Window | HTMLElement | undefined | null' },
  { property: 'bounds', description: 'Pixel tolerance when determining the current active anchor.', type: 'number' },
  { property: 'getCurrentAnchor', description: 'Overrides active anchor selection.', type: '(activeLink: string) => string' },
  { property: 'direction', description: 'Anchor layout direction.', type: "'vertical' | 'horizontal'", defaultValue: "'vertical'" },
  { property: 'replace', description: 'Uses history replace instead of push for navigation.', type: 'boolean' },
  { property: 'onClick', description: 'Called when a link is clicked.', type: '(event: MouseEvent, link: AnchorItem) => void' },
  { property: 'onChange', description: 'Called when the active link changes.', type: '(currentActiveLink: string) => void' },
]

const anchorItemRows: ApiTableRow[] = [
  { property: 'key', description: 'Optional stable item key.', type: 'string | number' },
  { property: 'href', description: 'Anchor href target.', type: 'string' },
  { property: 'target', description: 'Link target attribute.', type: 'string' },
  { property: 'title', description: 'Link label content.', type: 'JSX.Element' },
  { property: 'replace', description: 'Overrides replace behavior for this item.', type: 'boolean' },
  { property: 'targetOffset', description: 'Overrides target offset for this item.', type: 'number' },
  { property: 'children', description: 'Nested anchor items.', type: 'AnchorItem[]' },
]

const items = [
  { href: '#anchor-basic', title: 'Basic' },
  {
    href: '#anchor-examples',
    title: 'Examples',
    children: [{ href: '#anchor-api', title: 'API' }],
  },
]

export default function AnchorPage() {
  return (
    <>
      <h1>Anchor</h1>
      <p>
        Anchor renders page-section navigation and highlights the current section while scrolling.
      </p>

      <DemoBlock title="Basic" code={`<Anchor items={[{ href: '#basic', title: 'Basic' }]} />`}>
        <Space align="start" style={{ width: '100%' }}>
          <Anchor affix={false} items={items} />
          <div style={{ flex: 1 }}>
            <Card id="anchor-basic" title="Basic">
              Basic section content.
            </Card>
            <div style={{ height: '24px' }} />
            <Card id="anchor-examples" title="Examples">
              Example section content.
            </Card>
            <div style={{ height: '24px' }} />
            <Card id="anchor-api" title="API">
              API section content.
            </Card>
          </div>
        </Space>
      </DemoBlock>

      <DemoBlock title="Affixed" code={`<Anchor offsetTop={80} items={items} />`}>
        <Anchor offsetTop={80} items={items} />
      </DemoBlock>

      <h2>API</h2>
      <h3>Anchor</h3>
      <ApiTable rows={anchorRows} aria-label="Anchor API" />
      <h3>AnchorItem</h3>
      <ApiTable rows={anchorItemRows} aria-label="Anchor Item API" />
    </>
  )
}
