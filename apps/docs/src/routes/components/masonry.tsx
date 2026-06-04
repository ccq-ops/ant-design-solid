import { createSignal } from 'solid-js'
import { Button, Card, Masonry, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const baseItems = [
  { key: 1, title: 'Mountain', height: 120, color: '#e6f4ff' },
  { key: 2, title: 'Forest', height: 180, color: '#f6ffed' },
  { key: 3, title: 'River', height: 96, color: '#fff7e6' },
  { key: 4, title: 'City', height: 150, color: '#f9f0ff' },
  { key: 5, title: 'Desert', height: 110, color: '#fff1f0' },
  { key: 6, title: 'Ocean', height: 210, color: '#e6fffb' },
]

function DemoCard(props: { title: string; height: number; color: string }) {
  return (
    <Card title={props.title} style={{ background: props.color }}>
      <div style={{ height: `${props.height}px`, color: '#666' }}>
        Variable-height content creates a waterfall layout.
      </div>
    </Card>
  )
}

export default function MasonryPage() {
  const [items, setItems] = createSignal(baseItems)

  return (
    <>
      <h1>Masonry</h1>
      <p>Display variable-height content in balanced columns.</p>

      <DemoBlock
        title="Basic"
        code={`<Masonry
  items={items}
  itemRender={(item) => <Card title={item.title}>Content</Card>}
/>`}
      >
        <Masonry
          items={baseItems}
          itemRender={(item) => (
            <DemoCard title={item.title} height={item.height} color={item.color} />
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Responsive"
        code={`<Masonry columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }} gutter={{ xs: 8, md: 16 }} />`}
      >
        <Masonry
          columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
          gutter={{ xs: 8, md: 16, xl: 24 }}
          items={baseItems}
          itemRender={(item) => (
            <DemoCard title={item.title} height={item.height} color={item.color} />
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Gallery"
        code={`<Masonry columns={3} gutter={12} items={photos} itemRender={(photo) => <img src={photo.src} />} />`}
      >
        <Masonry
          columns={3}
          gutter={12}
          items={baseItems}
          itemRender={(item) => (
            <div
              style={{
                height: `${item.height + 80}px`,
                background: `linear-gradient(135deg, ${item.color}, #ffffff)`,
                border: '1px solid #f0f0f0',
                'border-radius': '8px',
                display: 'flex',
                'align-items': 'end',
                padding: '12px',
                'box-sizing': 'border-box',
              }}
            >
              {item.title}
            </div>
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Dynamic items"
        code={`<Masonry fresh items={items()} itemRender={(item) => <Card title={item.title}>...</Card>} />`}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            onClick={() =>
              setItems((previous) => [
                ...previous,
                {
                  key: Date.now(),
                  title: `New ${previous.length + 1}`,
                  height: 80 + ((previous.length * 37) % 140),
                  color: '#f0f5ff',
                },
              ])
            }
          >
            Add item
          </Button>
          <Masonry
            fresh
            columns={{ xs: 1, md: 3 }}
            items={items()}
            itemRender={(item) => (
              <DemoCard title={item.title} height={item.height} color={item.color} />
            )}
          />
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          <code>columns</code> sets the number of columns, or a responsive breakpoint map.
        </li>
        <li>
          <code>gutter</code> sets spacing between columns and items.
        </li>
        <li>
          <code>items</code> and <code>itemRender</code> render data-driven content.
        </li>
        <li>
          <code>fresh</code> refreshes layout when item heights update.
        </li>
        <li>
          <code>onLayoutChange</code> receives column count, column heights, and item placement.
        </li>
      </ul>
    </>
  )
}
