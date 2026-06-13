import { render } from '@solidjs/testing-library'
import { createEffect } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import Grid, { Col, Row } from '../index'

type MatchMediaListener = (event: MediaQueryListEvent) => void

function installMatchMedia(width: number) {
  let viewportWidth = width
  const entries: Array<{
    query: string
    listeners: Set<MatchMediaListener>
    mediaQuery: MediaQueryList
  }> = []

  const matches = (query: string) => {
    const minWidth = Number(query.match(/min-width:\s*(\d+)px/)?.[1] ?? 0)
    return viewportWidth >= minWidth
  }

  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const listeners = new Set<MatchMediaListener>()
    const mediaQuery = {
      media: query,
      get matches() {
        return matches(query)
      },
      onchange: null,
      addEventListener: (_type: string, listener: MatchMediaListener) => listeners.add(listener),
      removeEventListener: (_type: string, listener: MatchMediaListener) =>
        listeners.delete(listener),
      addListener: (listener: MatchMediaListener) => listeners.add(listener),
      removeListener: (listener: MatchMediaListener) => listeners.delete(listener),
      dispatchEvent: () => true,
    } as MediaQueryList
    entries.push({ query, listeners, mediaQuery })
    return mediaQuery
  })

  return {
    resize(nextWidth: number) {
      viewportWidth = nextWidth
      entries.forEach((entry) => {
        const event = {
          media: entry.query,
          matches: matches(entry.query),
        } as MediaQueryListEvent
        entry.listeners.forEach((listener) => listener(event))
      })
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Grid', () => {
  it('renders Row and Col with 24-grid styles', () => {
    const result = render(() => (
      <Row gutter={[16, 24]} justify="center" align="middle">
        <Col span={12} offset={2}>
          A
        </Col>
        <Col span={10}>B</Col>
      </Row>
    ))
    const row = result.container.firstElementChild as HTMLElement
    const cols = result.container.querySelectorAll('.ads-col')
    expect(row.className).toContain('ads-row')
    expect(row.style.marginLeft).toBe('-8px')
    expect(row.style.rowGap).toBe('24px')
    expect(cols[0].className).toContain('ads-col-12')
    expect((cols[0] as HTMLElement).style.paddingLeft).toBe('8px')
  })

  it('passes Row gutter to Col instead of using fixed column padding', () => {
    const result = render(() => (
      <Row gutter={24}>
        <Col span={12}>A</Col>
      </Row>
    ))
    const row = result.container.firstElementChild as HTMLElement
    const col = result.container.querySelector('.ads-col') as HTMLElement

    expect(row.style.marginLeft).toBe('-12px')
    expect(row.style.marginRight).toBe('-12px')
    expect(col.style.paddingLeft).toBe('12px')
    expect(col.style.paddingRight).toBe('12px')
  })

  it('supports string and responsive Row gutter, align, and justify', () => {
    const viewport = installMatchMedia(800)
    const result = render(() => (
      <Row
        gutter={[
          { xs: 8, md: '2rem' },
          { xs: 4, md: 20 },
        ]}
        justify={{ xs: 'center', md: 'space-between' }}
        align={{ xs: 'top', md: 'middle' }}
      >
        <Col span={8}>A</Col>
      </Row>
    ))

    const row = result.container.firstElementChild as HTMLElement
    const col = result.container.querySelector('.ads-col') as HTMLElement

    expect(row).toHaveClass('ads-row-space-between')
    expect(row).toHaveClass('ads-row-middle')
    expect(row.style.marginLeft).toBe('calc(-1rem)')
    expect(row.style.rowGap).toBe('20px')
    expect(col.style.paddingLeft).toBe('calc(1rem)')

    viewport.resize(400)

    expect(row).toHaveClass('ads-row-center')
    expect(row).toHaveClass('ads-row-top')
    expect(row.style.marginLeft).toBe('-4px')
    expect(row.style.rowGap).toBe('4px')
    expect(col.style.paddingLeft).toBe('4px')
  })

  it('supports Col flex and responsive breakpoint props', () => {
    const result = render(() => (
      <Row wrap={false}>
        <Col flex="100px" xs={24} md={{ span: 12, offset: 6, order: 2, push: 1, pull: 0 }}>
          A
        </Col>
        <Col flex={1}>B</Col>
      </Row>
    ))

    const row = result.container.firstElementChild as HTMLElement
    const cols = result.container.querySelectorAll('.ads-col')
    const first = cols[0] as HTMLElement
    const second = cols[1] as HTMLElement

    expect(row).toHaveClass('ads-row-no-wrap')
    expect(first).toHaveClass('ads-col-xs-24')
    expect(first).toHaveClass('ads-col-md-12')
    expect(first).toHaveClass('ads-col-md-offset-6')
    expect(first).toHaveClass('ads-col-md-order-2')
    expect(first).toHaveClass('ads-col-md-push-1')
    expect(first).toHaveClass('ads-col-md-pull-0')
    expect(first.style.flex).toBe('0 0 100px')
    expect(first.style.minWidth).toBe('0px')
    expect(second.style.flex).toBe('1 1 auto')
  })

  it('supports prefixCls and rtl classes', () => {
    const result = render(() => (
      <ConfigProvider direction="rtl">
        <Row prefixCls="custom-row">
          <Col prefixCls="custom-col" span={6}>
            A
          </Col>
        </Row>
      </ConfigProvider>
    ))

    const row = result.container.querySelector('.custom-row') as HTMLElement
    const col = result.container.querySelector('.custom-col') as HTMLElement

    expect(row).toHaveClass('custom-row-rtl')
    expect(col).toHaveClass('custom-col-6')
    expect(col).toHaveClass('custom-col-rtl')
  })

  it('exposes Grid.useBreakpoint as a Solid accessor', () => {
    const viewport = installMatchMedia(1000)
    const snapshots: string[] = []

    function Probe() {
      const screens = Grid.useBreakpoint()
      createEffect(() => {
        snapshots.push(JSON.stringify(screens()))
      })
      return <span>{screens().md ? 'desktop' : 'mobile'}</span>
    }

    const result = render(() => <Probe />)

    expect(result.getByText('desktop')).toBeInTheDocument()
    expect(JSON.parse(snapshots.at(-1) ?? '{}')).toMatchObject({ xs: true, sm: true, md: true })

    viewport.resize(500)

    expect(result.getByText('mobile')).toBeInTheDocument()
    expect(JSON.parse(snapshots.at(-1) ?? '{}')).toMatchObject({ xs: true, sm: false, md: false })
  })
})
