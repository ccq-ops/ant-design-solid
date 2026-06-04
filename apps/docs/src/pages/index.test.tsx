import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { describe, expect, it } from 'vitest'
import Home from './index'

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
})
