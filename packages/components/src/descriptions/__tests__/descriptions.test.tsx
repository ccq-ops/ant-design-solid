import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { For, createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Descriptions } from '../index'

afterEach(() => cleanup())

describe('Descriptions', () => {
  it('renders title, extra, and items', () => {
    const { container } = render(() => (
      <Descriptions
        title="User Info"
        extra={<button type="button">Edit</button>}
        items={[
          { label: 'Name', children: 'Ada' },
          { label: 'Age', children: 28 },
        ]}
      />
    ))

    expect(container.querySelector('.ads-descriptions')).toBeInTheDocument()
    expect(container.querySelector('.ads-descriptions-title')).toHaveTextContent('User Info')
    expect(container.querySelector('.ads-descriptions-extra')).toHaveTextContent('Edit')
    expect(container.querySelectorAll('.ads-descriptions-item-label')).toHaveLength(2)
    expect(screen.getByText('Name')).toHaveClass('ads-descriptions-item-label')
    expect(screen.getByText('Ada')).toHaveClass('ads-descriptions-item-content')
    expect(screen.getByText('Age')).toHaveClass('ads-descriptions-item-label')
    expect(screen.getByText('28')).toHaveClass('ads-descriptions-item-content')
  })

  it('renders children items', () => {
    render(() => (
      <Descriptions title="Children">
        <Descriptions.Item label="Email">ada@example.com</Descriptions.Item>
        <Descriptions.Item label="Phone">555-0100</Descriptions.Item>
      </Descriptions>
    ))

    expect(screen.getByText('Email')).toHaveClass('ads-descriptions-item-label')
    expect(screen.getByText('ada@example.com')).toHaveClass('ads-descriptions-item-content')
    expect(screen.getByText('Phone')).toHaveClass('ads-descriptions-item-label')
    expect(screen.getByText('555-0100')).toHaveClass('ads-descriptions-item-content')
  })

  it('applies bordered, vertical, size, span, class, and style variants', () => {
    const { container } = render(() => (
      <Descriptions
        data-testid="descriptions"
        class="custom-descriptions"
        style={{ margin: '4px' }}
        bordered
        layout="vertical"
        size="small"
        column={2}
        items={[
          {
            label: 'Address',
            children: 'No. 1 Road',
            span: 4,
            class: 'custom-item',
            style: { color: 'rgb(255, 0, 0)' },
          },
          { label: 'City', children: 'London' },
        ]}
      />
    ))

    const descriptions = screen.getByTestId('descriptions')
    const addressContent = screen.getByText('No. 1 Road')
    const firstItem = container.querySelector('.custom-item') as HTMLElement

    expect(descriptions).toHaveClass('ads-descriptions')
    expect(descriptions).toHaveClass('ads-descriptions-bordered')
    expect(descriptions).toHaveClass('ads-descriptions-vertical')
    expect(descriptions).toHaveClass('ads-descriptions-small')
    expect(descriptions).toHaveClass('custom-descriptions')
    expect(descriptions).toHaveStyle({ margin: '4px' })
    expect(firstItem).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(addressContent).toHaveAttribute('colspan', '2')
  })

  it('supports v6 size names and hides the generated colon when colon is false', () => {
    const { container } = render(() => (
      <Descriptions colon={false} size="medium" items={[{ label: 'Name', children: 'Ada' }]} />
    ))

    const descriptions = container.querySelector('.ads-descriptions') as HTMLElement
    const label = screen.getByText('Name')

    expect(descriptions).toHaveClass('ads-descriptions-medium')
    expect(label).toHaveClass('ads-descriptions-item-no-colon')
  })

  it('applies semantic classNames and styles from root and items', () => {
    render(() => (
      <Descriptions
        title="User Info"
        extra="Actions"
        classNames={{
          root: 'semantic-root',
          header: 'semantic-header',
          title: 'semantic-title',
          extra: 'semantic-extra',
          label: 'root-label',
          content: 'root-content',
        }}
        styles={{
          root: { margin: '6px' },
          header: { padding: '2px' },
          title: { color: 'rgb(255, 0, 0)' },
          extra: { color: 'rgb(0, 128, 0)' },
          label: { color: 'rgb(0, 0, 255)' },
          content: { background: 'rgb(0, 255, 255)' },
        }}
        items={[
          {
            label: 'Name',
            children: 'Ada',
            classNames: { label: 'item-label', content: 'item-content' },
            styles: {
              label: { background: 'rgb(255, 255, 0)' },
              content: { color: 'rgb(128, 0, 128)' },
            },
          },
        ]}
      />
    ))

    const descriptions = document.querySelector('.ads-descriptions') as HTMLElement
    const header = document.querySelector('.ads-descriptions-header') as HTMLElement
    const title = document.querySelector('.ads-descriptions-title') as HTMLElement
    const extra = document.querySelector('.ads-descriptions-extra') as HTMLElement
    const label = screen.getByText('Name')
    const content = screen.getByText('Ada')

    expect(descriptions).toHaveClass('semantic-root')
    expect(descriptions).toHaveStyle({ margin: '6px' })
    expect(header).toHaveClass('semantic-header')
    expect(header).toHaveStyle({ padding: '2px' })
    expect(title).toHaveClass('semantic-title')
    expect(title).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(extra).toHaveClass('semantic-extra')
    expect(extra).toHaveStyle({ color: 'rgb(0, 128, 0)' })
    expect(label).toHaveClass('root-label')
    expect(label).toHaveClass('item-label')
    expect(label).toHaveStyle({ color: 'rgb(0, 0, 255)', background: 'rgb(255, 255, 0)' })
    expect(content).toHaveClass('root-content')
    expect(content).toHaveClass('item-content')
    expect(content).toHaveStyle({ color: 'rgb(128, 0, 128)', background: 'rgb(0, 255, 255)' })
  })

  it('supports semantic classNames and styles functions with resolved props', () => {
    render(() => (
      <Descriptions
        title="User Info"
        size="small"
        column={2}
        classNames={(info) => ({
          root: `root-${info.props.size}`,
          label: `label-${info.props.column}`,
        })}
        styles={(info) => ({
          content: { color: info.props.size === 'small' ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 0)' },
        })}
        items={[{ label: 'Name', children: 'Ada' }]}
      />
    ))

    const descriptions = document.querySelector('.ads-descriptions') as HTMLElement

    expect(descriptions).toHaveClass('root-small')
    expect(screen.getByText('Name')).toHaveClass('label-2')
    expect(screen.getByText('Ada')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('resolves responsive column and span values from active breakpoints', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('768px') || query.includes('576px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    try {
      render(() => (
        <Descriptions
          column={{ xs: 1, sm: 2, md: 4 }}
          items={[
            { label: 'A', children: 'Alpha', span: { xs: 1, md: 2 } },
            { label: 'B', children: 'Beta' },
          ]}
        />
      ))

      expect(screen.getByText('A').closest('td')).toHaveAttribute('colspan', '2')
      expect(screen.getByText('B').closest('td')).toHaveAttribute('colspan', '2')
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })

  it('fills remaining row space for filled spans and the final row', () => {
    render(() => (
      <Descriptions
        column={3}
        items={[
          { label: 'A', children: 'Alpha' },
          { label: 'B', children: 'Beta', span: 'filled' },
          { label: 'C', children: 'Gamma' },
        ]}
      />
    ))

    expect(screen.getByText('A').closest('td')).toHaveAttribute('colspan', '1')
    expect(screen.getByText('B').closest('td')).toHaveAttribute('colspan', '2')
    expect(screen.getByText('C').closest('td')).toHaveAttribute('colspan', '3')
  })

  it('keeps children item order in sync with dynamic source order', () => {
    function DynamicDescriptions() {
      const first = { id: 'a', label: 'First', value: 'Alpha' }
      const second = { id: 'b', label: 'Second', value: 'Beta' }
      const [items, setItems] = createSignal([first, second])

      return (
        <>
          <button type="button" onClick={() => setItems([second, first])}>
            Reverse
          </button>
          <Descriptions>
            <For each={items()}>
              {(item) => <Descriptions.Item label={item.label}>{item.value}</Descriptions.Item>}
            </For>
          </Descriptions>
        </>
      )
    }

    const { container } = render(() => <DynamicDescriptions />)
    const labelOrder = () =>
      Array.from(container.querySelectorAll('.ads-descriptions-item-label')).map(
        (node) => node.textContent,
      )

    expect(labelOrder()).toEqual(['First', 'Second'])
    fireEvent.click(screen.getByRole('button', { name: 'Reverse' }))
    expect(labelOrder()).toEqual(['Second', 'First'])
  })

  it('renders nothing when Item is used standalone', () => {
    const { container } = render(() => (
      <Descriptions.Item label="Standalone">Hidden</Descriptions.Item>
    ))

    expect(container).toBeEmptyDOMElement()
    expect(container).not.toHaveTextContent('Standalone')
    expect(container).not.toHaveTextContent('Hidden')
    expect(container).not.toHaveTextContent('[object Object]')
  })

  it('prefers items over children when both are supplied', () => {
    render(() => (
      <Descriptions items={[{ label: 'Item Label', children: 'Item Content' }]}>
        <Descriptions.Item label="Child Label">Child Content</Descriptions.Item>
      </Descriptions>
    ))

    expect(screen.getByText('Item Label')).toBeInTheDocument()
    expect(screen.getByText('Item Content')).toBeInTheDocument()
    expect(screen.queryByText('Child Label')).not.toBeInTheDocument()
    expect(screen.queryByText('Child Content')).not.toBeInTheDocument()
  })
})
