import { useNavigate } from '@solidjs/router'
import { Button, Space } from '@ant-design-solid/core'

export default function Home() {
  const navigate = useNavigate()

  return (
    <section class="rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-700/10 p-14">
      <h1 class="mb-4 mt-0 text-5xl font-bold">Ant Design Solid</h1>
      <p class="max-w-[680px] text-lg leading-[1.7] text-black/65">
        An Ant Design-inspired component system built with SolidJS, Vite 8, pnpm 11, token-driven
        theming, and a Solid-native CSS-in-JS runtime.
      </p>
      <Space>
        <Button type="primary" onClick={() => navigate('/docs/getting-started')}>
          Get Started
        </Button>
        <Button onClick={() => navigate('/components/affix')}>View Components</Button>
      </Space>
    </section>
  )
}
