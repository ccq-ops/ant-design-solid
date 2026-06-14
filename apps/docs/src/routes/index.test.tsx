import { fireEvent } from '@solidjs/testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderDocsPage } from '../test-utils/render-docs-page'
import Home from './index.mdx'

const navigate = vi.hoisted(() => vi.fn())

vi.mock('@solidjs/router', () => ({
  useNavigate: () => navigate,
}))

vi.mock('../assets/hero-banner.png', () => ({
  default: '/hero-banner.png',
}))

beforeEach(() => {
  navigate.mockClear()
})

function renderHome() {
  return renderDocsPage(() => <Home />)
}

describe('Home', () => {
  it('renders the centered landing hero with the provided banner image', () => {
    const result = renderHome()
    const heading = result.getByRole('heading', { name: 'Ant Design Solid', level: 1 })
    const hero = heading.closest('section')

    expect(hero).toHaveClass('overflow-hidden')
    expect(hero).toHaveClass('text-center')
    expect(hero).toHaveClass('docs-hero')
    expect(hero).toHaveClass('docs-border')
    expect(result.getByText('SolidJS · Design System · Token Driven')).toBeInTheDocument()
    expect(result.getByText(/Ant Design for the Solid era/)).toBeInTheDocument()
    expect(result.getAllByText(/Ant Design-inspired semantics/).length).toBeGreaterThan(0)

    const image = result.getByRole('img', { name: 'Blue glassmorphism interface hero artwork' })
    expect(image).toHaveAttribute('src', '/hero-banner.png')
    expect(image).toHaveClass('w-full')
  })

  it('renders homepage feature cards and component preview copy', () => {
    const result = renderHome()

    expect(result.getByText('Component-rich')).toBeInTheDocument()
    expect(result.getByText('Token-driven theming')).toBeInTheDocument()
    expect(result.getByText('Solid-native runtime')).toBeInTheDocument()
    expect(result.getByText('Preview the building blocks')).toBeInTheDocument()
    expect(result.getByText(/Ready for production docs/)).toBeInTheDocument()
  })

  it('navigates to getting started when clicking Get Started', () => {
    const result = renderHome()

    fireEvent.click(result.getByRole('button', { name: 'Get Started' }))

    expect(navigate).toHaveBeenCalledWith('/docs/getting-started')
  })

  it('navigates to the first component page when clicking View Components', () => {
    const result = renderHome()

    fireEvent.click(result.getByRole('button', { name: 'View Components' }))

    expect(navigate).toHaveBeenCalledWith('/components/affix')
  })
})
