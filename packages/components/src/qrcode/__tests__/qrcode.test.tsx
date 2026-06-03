import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { QRCode } from '../index'

describe('QRCode', () => {
  it('renders a deterministic SVG matrix for a value', () => {
    const first = render(() => <QRCode value="https://example.com" />)
    const second = render(() => <QRCode value="https://example.com" />)
    const firstSvg = first.container.querySelector('svg') as SVGElement
    const secondSvg = second.container.querySelector('svg') as SVGElement
    expect(firstSvg).toBeInTheDocument()
    expect(firstSvg.innerHTML).toBe(secondSvg.innerHTML)
    expect(firstSvg.querySelectorAll('rect').length).toBeGreaterThan(20)
  })

  it('applies size, color, background and bordered classes', () => {
    const result = render(() => (
      <QRCode value="solid" size={120} color="#111111" bgColor="#eeeeee" data-testid="qr" />
    ))
    const root = result.getByTestId('qr')
    const svg = root.querySelector('svg') as SVGElement
    expect(root.className).toContain('ads-qrcode')
    expect(root.className).toContain('ads-qrcode-bordered')
    expect(root.style.width).toBe('120px')
    expect(root.style.height).toBe('120px')
    expect(root.style.backgroundColor).toBe('rgb(238, 238, 238)')
    expect(svg.getAttribute('width')).toBe('120')
    expect(svg.querySelector('rect[data-module="true"]')?.getAttribute('fill')).toBe('#111111')
  })

  it('supports bordered=false', () => {
    const result = render(() => <QRCode value="solid" bordered={false} data-testid="qr" />)
    expect(result.getByTestId('qr').className).not.toContain('ads-qrcode-bordered')
  })

  it('renders centered icon', () => {
    const result = render(() => <QRCode value="solid" icon="/logo.png" iconSize={32} />)
    const image = result.container.querySelector('image') as SVGImageElement
    expect(image).toBeInTheDocument()
    expect(image.getAttribute('href')).toBe('/logo.png')
    expect(image.getAttribute('width')).toBe('32')
    expect(image.getAttribute('height')).toBe('32')
  })

  it('shows loading and expired overlays', () => {
    const loading = render(() => <QRCode value="solid" status="loading" />)
    expect(loading.getByText('Loading...')).toBeInTheDocument()
    const expired = render(() => <QRCode value="solid" status="expired" />)
    expect(expired.getByText('Expired')).toBeInTheDocument()
  })

  it('supports custom statusRender', () => {
    const result = render(() => (
      <QRCode
        value="solid"
        status="expired"
        statusRender={({ status }) => <button>{status}</button>}
      />
    ))
    expect(result.getByRole('button', { name: 'expired' })).toBeInTheDocument()
  })

  it('supports custom prefixCls', () => {
    const result = render(() => <QRCode prefixCls="custom-qr" value="solid" data-testid="qr" />)
    expect(result.getByTestId('qr').className).toContain('custom-qr')
  })

  it('uses ConfigProvider prefix', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <QRCode value="solid" data-testid="qr" />
      </ConfigProvider>
    ))
    expect(result.getByTestId('qr').className).toContain('custom-qrcode')
  })
})
