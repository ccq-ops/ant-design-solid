import { render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { BorderBeam } from '../index'

const beamSelector = '.ads-border-beam'

function getBeam(container: HTMLElement) {
  return container.querySelector<HTMLElement>(beamSelector)!
}

describe('BorderBeam', () => {
  it('injects an aria-hidden beam element into a single HTMLElement child without wrapping it', async () => {
    const result = render(() => (
      <BorderBeam class="custom-beam">
        <div class="beam-host" data-testid="host">
          content
        </div>
      </BorderBeam>
    ))

    await waitFor(() => {
      const host = result.getByTestId('host')
      const beam = getBeam(result.container)

      expect(result.container.firstElementChild).toBe(host)
      expect(host).not.toHaveClass('ads-border-beam')
      expect(beam.parentElement).toBe(host)
      expect(beam).toHaveClass('custom-beam')
      expect(beam).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('skips decoration for text and non HTMLElement hosts', async () => {
    const textResult = render(() => <BorderBeam>content</BorderBeam>)
    expect(textResult.container).toHaveTextContent('content')
    expect(textResult.container.querySelector(beamSelector)).toBeNull()
    textResult.unmount()

    const svgResult = render(() => (
      <BorderBeam>
        <svg data-testid="svg-host" />
      </BorderBeam>
    ))

    await waitFor(() => {
      expect(svgResult.getByTestId('svg-host')).toBeTruthy()
      expect(svgResult.container.querySelector(beamSelector)).toBeNull()
    })
  })

  it('uses custom prefix, class, style, inferred inset, inferred radius, and color gradient variables', async () => {
    const result = render(() => (
      <BorderBeam
        prefixCls="custom-border-beam"
        class="custom-class"
        style={{ opacity: 0.8 }}
        color="#36cfc9"
      >
        <div style={{ border: '2px solid red', 'border-radius': '12px' }}>content</div>
      </BorderBeam>
    ))

    await waitFor(() => {
      const beam = result.container.querySelector<HTMLElement>('.custom-border-beam')!

      expect(beam).toHaveClass('custom-class')
      expect(beam).toHaveStyle({ opacity: '0.8' })
      expect(beam.style.getPropertyValue('--ads-border-beam-inset-offset')).toBe(
        '-2px -2px -2px -2px',
      )
      expect(beam.style.getPropertyValue('--ads-border-beam-border-radius')).toBe('12px')
      expect(beam.style.getPropertyValue('--ads-border-beam-beam-gradient')).toBe(
        'linear-gradient(to left, #36cfc9 0%, #36cfc9 70%, transparent)',
      )
    })
  })

  it('supports custom numeric and string outset values plus gradient stop color values', async () => {
    const result = render(() => (
      <BorderBeam
        outset={4}
        color={[
          { color: '#1677ff', percent: 0 },
          { color: '#36cfc9', percent: 55 },
          { color: '#95de64', percent: 100 },
        ]}
      >
        <div>content</div>
      </BorderBeam>
    ))

    await waitFor(() => {
      const beam = getBeam(result.container)

      expect(beam.style.getPropertyValue('--ads-border-beam-inset-offset')).toBe('-4px')
      expect(beam.style.getPropertyValue('--ads-border-beam-beam-gradient')).toBe(
        'linear-gradient(to left, #1677ff 0%, #36cfc9 38.5%, #95de64 70%, transparent)',
      )
    })

    result.unmount()

    const stringOutsetResult = render(() => (
      <BorderBeam outset="2em">
        <div>content</div>
      </BorderBeam>
    ))

    await waitFor(() => {
      expect(
        getBeam(stringOutsetResult.container).style.getPropertyValue(
          '--ads-border-beam-inset-offset',
        ),
      ).toBe('calc(-1 * 2em)')
    })
  })
})
