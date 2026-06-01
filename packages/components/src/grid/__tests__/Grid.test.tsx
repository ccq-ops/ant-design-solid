import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Col, Row } from '../index'

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
})
