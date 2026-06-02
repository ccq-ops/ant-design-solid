import { Button, Space } from '@ant-design-solid/core'
export default function Home() {
  return (
    <section class="hero">
      <h1>Ant Design Solid</h1>
      <p>
        An Ant Design-inspired component system built with SolidJS, Vite 8, pnpm 11, token-driven
        theming, and a Solid-native CSS-in-JS runtime.
      </p>
      <Space>
        <Button type="primary">Get Started</Button>
        <Button>View Components</Button>
      </Space>
    </section>
  )
}
