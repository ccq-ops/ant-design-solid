import { render } from '@solidjs/testing-library'
import { ClockCircleOutlined } from '@ant-design-solid/solid-icons'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Badge } from '../index'

describe('Badge', () => {
  it('renders count', () => {
    const result = render(() => <Badge count={5} />)
    expect(result.getByText('5').className).toContain('ads-badge-count')
  })

  it('handles overflow count', () => {
    const result = render(() => <Badge count={120} overflowCount={99} />)
    expect(result.getByText('99+')).toBeInTheDocument()
  })

  it('hides zero by default and shows zero with showZero', () => {
    const hidden = render(() => <Badge count={0} />)
    expect(hidden.queryByText('0')).toBeNull()
    hidden.unmount()

    const visible = render(() => <Badge count={0} showZero />)
    expect(visible.getByText('0')).toBeInTheDocument()
  })

  it('renders dot mode', () => {
    const result = render(() => <Badge dot count={9} />)
    expect(result.container.querySelector('.ads-badge-dot')).not.toBeNull()
    expect(result.queryByText('9')).toBeNull()
  })

  it('hides dot when count is zero without showZero', () => {
    const result = render(() => <Badge dot count={0} />)
    expect(result.container.querySelector('.ads-badge-dot')).toBeNull()
  })

  it('supports custom count node', () => {
    const result = render(() => (
      <Badge
        count={<ClockCircleOutlined data-testid="custom-count" style={{ color: '#f5222d' }} />}
        color="#52c41a"
      >
        <button>Inbox</button>
      </Badge>
    ))
    expect(result.getByTestId('custom-count')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-badge-count')).toBeNull()
    const custom = result.container.querySelector('.ads-badge-custom-component') as HTMLElement
    expect(custom).not.toBeNull()
    expect(custom.style.background).toBe('')
  })

  it('supports color, offset, size and title on indicator', () => {
    const result = render(() => (
      <Badge count={8} color="#52c41a" offset={[10, 6]} size="small" title="Unread">
        <button>Inbox</button>
      </Badge>
    ))
    const indicator = result.getByText('8')
    expect(indicator.className).toContain('ads-badge-count-sm')
    expect(indicator).toHaveAttribute('title', 'Unread')
    expect(indicator).toHaveStyle({ background: '#52c41a', 'inset-inline-end': '-10px' })
    expect(indicator.style.marginTop).toBe('6px')
  })

  it('uses count as default indicator title', () => {
    const result = render(() => <Badge count={5} />)
    expect(result.getByText('5')).toHaveAttribute('title', '5')
  })

  it('supports semantic classNames and styles', () => {
    const result = render(() => (
      <Badge
        count={2}
        classNames={{ root: 'root-slot', indicator: 'indicator-slot' }}
        styles={{ root: { margin: '4px' }, indicator: { color: 'rgb(1, 2, 3)' } }}
      />
    ))
    expect(result.container.firstElementChild?.className).toContain('root-slot')
    expect(result.container.firstElementChild).toHaveStyle({ margin: '4px' })
    expect(result.getByText('2').className).toContain('indicator-slot')
    expect(result.getByText('2')).toHaveStyle({ color: 'rgb(1, 2, 3)' })
  })

  it('renders status with text', () => {
    const result = render(() => <Badge status="success" text="Active" />)
    expect(result.getByText('Active')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-badge-status-success')).not.toBeNull()
  })

  it('supports status color without status prop', () => {
    const result = render(() => <Badge color="#1677ff" text="Custom" />)
    const dot = result.container.querySelector('.ads-badge-status-dot')
    expect(dot).not.toBeNull()
    expect(dot).toHaveStyle({ background: '#1677ff' })
    expect(result.getByText('Custom')).toBeInTheDocument()
  })

  it('keeps zero count mode when color and showZero are set', () => {
    const result = render(() => <Badge count={0} showZero color="#52c41a" />)
    expect(result.getByText('0').className).toContain('ads-badge-count')
    expect(result.container.querySelector('.ads-badge-status-dot')).toBeNull()
  })

  it('renders ribbon with placement, color and semantic slots', () => {
    const result = render(() => (
      <Badge.Ribbon
        text="New"
        color="#52c41a"
        placement="start"
        classNames={{
          root: 'ribbon-root',
          indicator: 'ribbon-indicator',
          content: 'ribbon-content',
        }}
        styles={{
          root: { margin: '2px' },
          indicator: { 'font-weight': 700 },
          content: { 'letter-spacing': '1px' },
        }}
      >
        <div>Card</div>
      </Badge.Ribbon>
    ))
    expect(result.getByText('Card')).toBeInTheDocument()
    expect(result.container.firstElementChild?.className).toContain('ads-ribbon-wrapper')
    expect(result.container.firstElementChild?.className).toContain('ribbon-root')
    const ribbon = result.container.querySelector('.ads-ribbon')
    expect(ribbon?.className).toContain('ads-ribbon-placement-start')
    expect(ribbon?.className).toContain('ribbon-indicator')
    expect(ribbon).toHaveStyle({ background: '#52c41a' })
    expect(result.container.querySelector('.ribbon-indicator')).toHaveStyle({
      'font-weight': '700',
    })
    expect(result.getByText('New').className).toContain('ribbon-content')
    expect(result.getByText('New')).toHaveStyle({ 'letter-spacing': '1px' })
  })

  it('renders wrapped children mode', () => {
    const result = render(() => (
      <Badge count={3}>
        <button>Inbox</button>
      </Badge>
    ))
    expect(result.getByRole('button', { name: 'Inbox' })).toBeInTheDocument()
    expect(result.getByText('3')).toBeInTheDocument()
    expect(result.container.firstElementChild?.className).toContain('ads-badge')
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Badge count={1} />
      </ConfigProvider>
    ))
    expect(result.getByText('1').className).toContain('custom-badge-count')
  })
})
