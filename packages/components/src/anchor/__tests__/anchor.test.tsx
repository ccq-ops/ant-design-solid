import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Anchor } from '../index'
import type { AnchorItem } from '../interface'

const items: AnchorItem[] = [
  { href: '#intro', title: 'Intro' },
  {
    href: '#usage',
    title: 'Usage',
    children: [{ href: '#api', title: 'API' }],
  },
]

const itemsWithApi: AnchorItem[] = [
  { href: '#intro', title: 'Intro', target: '_blank' },
  { href: '#usage', title: 'Usage', targetOffset: 12 },
  { href: '#api', title: 'API', replace: true },
]

function appendTarget(id: string, top: number) {
  const target = document.createElement('section')
  target.id = id
  Object.defineProperty(target, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: 0,
      y: top,
      top,
      left: 0,
      right: 100,
      bottom: top + 50,
      width: 100,
      height: 50,
      toJSON: () => undefined,
    }),
  })
  document.body.appendChild(target)
  return target
}

describe('Anchor', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('renders nested items with anchor semantics', () => {
    const result = render(() => <Anchor affix={false} items={items} />)

    expect(result.container.querySelector('.ads-anchor')).toBeInTheDocument()
    expect(result.getByRole('link', { name: 'Intro' })).toHaveAttribute('href', '#intro')
    expect(result.getByRole('link', { name: 'Usage' })).toHaveClass('ads-anchor-link-title')
    expect(result.getByRole('link', { name: 'API' })).toBeInTheDocument()
    expect(result.container.querySelectorAll('.ads-anchor-list')).toHaveLength(2)
  })

  it('clicks a link, calls onClick, and scrolls to the target', () => {
    const onClick = vi.fn()
    appendTarget('usage', 240)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const result = render(() => <Anchor affix={false} items={items} onClick={onClick} />)

    fireEvent.click(result.getByRole('link', { name: 'Usage' }))

    expect(onClick).toHaveBeenCalledWith(
      expect.any(MouseEvent),
      expect.objectContaining({ href: '#usage' }),
    )
    expect(scrollTo).toHaveBeenCalledWith({ top: 240, behavior: 'smooth' })
  })

  it('uses offsetTop as the default targetOffset when scrolling', () => {
    appendTarget('usage', 240)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const result = render(() => <Anchor affix={false} offsetTop={80} items={items} />)

    fireEvent.click(result.getByRole('link', { name: 'Usage' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 160, behavior: 'smooth' })
  })

  it('updates browser history with pushState by default and replaceState when requested', () => {
    appendTarget('intro', 100)
    appendTarget('api', 200)
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const pushState = vi.spyOn(window.history, 'pushState')
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const result = render(() => <Anchor affix={false} items={itemsWithApi} />)

    fireEvent.click(result.getByRole('link', { name: 'Intro' }))
    fireEvent.click(result.getByRole('link', { name: 'API' }))

    expect(pushState).toHaveBeenCalledWith(null, '', '#intro')
    expect(replaceState).toHaveBeenCalledWith(null, '', '#api')
  })

  it('uses component replace when item replace is not specified', () => {
    appendTarget('intro', 100)
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const pushState = vi.spyOn(window.history, 'pushState')
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const result = render(() => <Anchor affix={false} replace items={itemsWithApi} />)

    fireEvent.click(result.getByRole('link', { name: 'Intro' }))

    expect(pushState).not.toHaveBeenCalled()
    expect(replaceState).toHaveBeenCalledWith(null, '', '#intro')
  })

  it('uses per-item targetOffset before the component targetOffset', () => {
    appendTarget('usage', 240)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const result = render(() => <Anchor affix={false} targetOffset={80} items={itemsWithApi} />)

    fireEvent.click(result.getByRole('link', { name: 'Usage' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 228, behavior: 'smooth' })
  })

  it('updates active link on scroll and calls onChange', () => {
    const onChange = vi.fn()
    appendTarget('intro', -20)
    appendTarget('usage', 12)
    appendTarget('api', 160)
    const result = render(() => (
      <Anchor affix={false} targetOffset={20} bounds={0} items={items} onChange={onChange} />
    ))

    window.dispatchEvent(new Event('scroll'))

    expect(result.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'true')
    expect(result.getByRole('link', { name: 'Usage' })).toHaveClass('ads-anchor-link-title-active')
    expect(onChange).toHaveBeenCalledWith('#usage')
  })

  it('allows getCurrentAnchor to customize the active link', () => {
    const onChange = vi.fn()
    appendTarget('intro', -20)
    appendTarget('usage', 12)
    const result = render(() => (
      <Anchor
        affix={false}
        bounds={0}
        items={items}
        getCurrentAnchor={() => '#intro'}
        onChange={onChange}
      />
    ))

    window.dispatchEvent(new Event('scroll'))

    expect(result.getByRole('link', { name: 'Intro' })).toHaveAttribute('aria-current', 'true')
    expect(onChange).toHaveBeenCalledWith('#intro')
  })

  it('renders link target and horizontal direction class', () => {
    const result = render(() => (
      <Anchor affix={false} direction="horizontal" items={itemsWithApi} />
    ))

    expect(result.container.querySelector('.ads-anchor-horizontal')).toBeInTheDocument()
    expect(result.getByRole('link', { name: 'Intro' })).toHaveAttribute('target', '_blank')
  })

  it('wraps with Affix by default and skips it when affix is false', () => {
    const affixed = render(() => <Anchor items={items} />)
    expect(affixed.container.querySelector('.ads-affix-wrapper')).toBeInTheDocument()
    cleanup()

    const plain = render(() => <Anchor affix={false} items={items} />)
    expect(plain.container.querySelector('.ads-affix-wrapper')).toBeNull()
  })

  it('applies custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Anchor affix={false} items={items} />
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-anchor')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-anchor')).toBeNull()
  })

  it('applies semantic classNames, styles, rootClass, and component config', () => {
    const result = render(() => (
      <ConfigProvider anchor={{ class: 'configured-root', style: { 'font-size': '18px' } }}>
        <Anchor
          affix={false}
          showInkInFixed
          rootClass="root-layer"
          class="local-root"
          style={{ color: 'rgb(1, 2, 3)' }}
          classNames={{
            root: 'semantic-root',
            item: 'semantic-item',
            itemTitle: 'semantic-title',
            indicator: 'semantic-indicator',
          }}
          styles={{
            root: { background: 'rgb(4, 5, 6)' },
            item: { padding: '3px' },
            itemTitle: { color: 'rgb(7, 8, 9)' },
            indicator: { width: '4px' },
          }}
          items={items}
        />
      </ConfigProvider>
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-anchor')
    expect(root).toHaveClass('configured-root')
    expect(root).toHaveClass('root-layer')
    expect(root).toHaveClass('local-root')
    expect(root).toHaveClass('semantic-root')
    expect(root).toHaveStyle({ color: 'rgb(1, 2, 3)', background: 'rgb(4, 5, 6)' })
    expect(root).toHaveStyle({ 'font-size': '18px' })
    expect(result.getByRole('link', { name: 'Intro' }).parentElement).toHaveClass('semantic-item')
    expect(result.getByRole('link', { name: 'Intro' })).toHaveClass('semantic-title')
    expect(result.getByRole('link', { name: 'Intro' })).toHaveStyle({ color: 'rgb(7, 8, 9)' })
    expect(result.container.querySelector('.ads-anchor-ink')).toHaveClass('semantic-indicator')
  })

  it('supports semantic classNames and styles as functions', () => {
    const result = render(() => (
      <Anchor
        affix={false}
        direction="horizontal"
        classNames={({ props }) => ({ root: props.direction === 'horizontal' ? 'fn-root' : '' })}
        styles={({ props }) => ({
          root: { display: props.direction === 'horizontal' ? 'block' : 'inline-block' },
        })}
        items={items}
      />
    ))

    expect(result.container.querySelector('.ads-anchor')).toHaveClass('fn-root')
    expect(result.container.querySelector('.ads-anchor')).toHaveStyle({ display: 'block' })
  })

  it('supports showInkInFixed when affix is false', () => {
    const hidden = render(() => <Anchor affix={false} items={items} />)
    expect(hidden.container.querySelector('.ads-anchor-ink')).toBeNull()
    cleanup()

    const shown = render(() => <Anchor affix={false} showInkInFixed items={items} />)
    expect(shown.container.querySelector('.ads-anchor-ink')).toBeInTheDocument()
  })

  it('passes object affix configuration to Affix', () => {
    const result = render(() => (
      <Anchor affix={{ offsetBottom: 12, class: 'affix-extra' }} items={items} />
    ))

    expect(result.container.querySelector('.ads-affix-wrapper')).toHaveClass('affix-extra')
  })

  it('renders Anchor.Link children and scrolls with link-level targetOffset', () => {
    appendTarget('intro', 120)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const result = render(() => (
      <Anchor affix={false}>
        <Anchor.Link href="#intro" title="Intro child" targetOffset={20} />
      </Anchor>
    ))

    fireEvent.click(result.getByRole('link', { name: 'Intro child' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 100, behavior: 'smooth' })
  })

  it('uses Anchor.Link children when calculating the active link', () => {
    const onChange = vi.fn()
    appendTarget('intro', -20)
    const result = render(() => (
      <Anchor affix={false} showInkInFixed bounds={0} onChange={onChange}>
        <Anchor.Link href="#intro" title="Intro child" />
      </Anchor>
    ))

    window.dispatchEvent(new Event('scroll'))

    expect(result.getByRole('link', { name: 'Intro child' })).toHaveClass(
      'ads-anchor-link-title-active',
    )
    expect(onChange).toHaveBeenCalledWith('#intro')
  })

  it('hides nested links in horizontal direction for children and items', () => {
    const result = render(() => (
      <Anchor affix={false} direction="horizontal" items={items}>
        <Anchor.Link href="#parent" title="Parent">
          <Anchor.Link href="#child" title="Child" />
        </Anchor.Link>
      </Anchor>
    ))

    expect(result.queryByRole('link', { name: 'API' })).toBeNull()
    expect(result.queryByRole('link', { name: 'Child' })).toBeNull()
  })

  it('lets external links keep caller-controlled browser navigation', () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
    const result = render(() => (
      <Anchor
        affix={false}
        onClick={onClick}
        items={[{ href: 'https://example.com/default', title: 'External default' }]}
      />
    ))

    const defaultEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    result.getByRole('link', { name: 'External default' }).dispatchEvent(defaultEvent)
    expect(defaultEvent.defaultPrevented).toBe(true)
    expect(onClick).toHaveBeenCalledWith(
      expect.any(MouseEvent),
      expect.objectContaining({ href: 'https://example.com/default' }),
    )
  })
})
