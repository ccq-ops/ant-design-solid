import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { For, createSignal } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
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
