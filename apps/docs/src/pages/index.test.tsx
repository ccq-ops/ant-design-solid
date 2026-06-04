import { fireEvent, render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './index'

const navigate = vi.hoisted(() => vi.fn())

vi.mock('@solidjs/router', () => ({
  useNavigate: () => navigate,
}))

beforeEach(() => {
  navigate.mockClear()
})

function renderHome() {
  return render(() => (
    <StyleProvider>
      <ConfigProvider>
        <Home />
      </ConfigProvider>
    </StyleProvider>
  ))
}

describe('Home', () => {
  it('renders the hero with Tailwind utility classes', () => {
    const result = renderHome()
    const heading = result.getByRole('heading', { name: 'Ant Design Solid', level: 1 })
    const hero = heading.closest('section')

    expect(hero).toHaveClass('rounded-3xl')
    expect(hero).toHaveClass('bg-gradient-to-br')
    expect(hero).toHaveClass('p-14')
    expect(heading).toHaveClass('text-5xl')
    expect(result.getByText(/An Ant Design-inspired component system/)).toHaveClass('text-lg')
    expect(result.getByRole('button', { name: 'Get Started' })).toBeInTheDocument()
    expect(result.getByRole('button', { name: 'View Components' })).toBeInTheDocument()
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
