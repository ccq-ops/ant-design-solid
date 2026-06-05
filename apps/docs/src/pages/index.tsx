import { useNavigate } from '@solidjs/router'
import { Badge, Button, Card, Space, Tabs, Tag } from '@ant-design-solid/core'
import heroBanner from '../assets/hero-banner.png'

const features = [
  {
    title: 'Component-rich',
    description:
      'Explore Ant Design-inspired semantics across navigation, data entry, feedback, and display components.',
  },
  {
    title: 'Token-driven theming',
    description:
      'Tune the system from ConfigProvider with seed tokens, component tokens, and predictable visual results.',
  },
  {
    title: 'Solid-native runtime',
    description:
      'Use fine-grained reactivity with a Solid-first component model and CSS-in-JS runtime built for this stack.',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div class="space-y-10 pb-8">
      <section class="relative overflow-hidden rounded-[36px] border border-blue-100 bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.95),_rgba(255,255,255,0.98)_46%,_rgba(245,243,255,0.92))] px-6 py-14 text-center shadow-[0_32px_120px_rgba(37,99,235,0.14)] sm:px-10 lg:px-14">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(124,58,237,0.14),transparent_26%)]" />
        <div class="pointer-events-none absolute left-1/2 top-28 h-64 w-[min(760px,86%)] -translate-x-1/2 rounded-full bg-blue-300/20 blur-3xl" />

        <div class="relative z-[1] mx-auto max-w-[860px]">
          <div class="mb-6 inline-flex rounded-full border border-blue-200/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 shadow-sm backdrop-blur">
            SolidJS · Design System · Token Driven
          </div>
          <h1 class="mb-5 mt-0 text-5xl font-black tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Ant Design Solid
          </h1>
          <p class="mx-auto mb-2 max-w-[720px] text-2xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-3xl">
            Ant Design for the Solid era
          </p>
          <p class="mx-auto max-w-[760px] text-base leading-[1.8] text-black/65 sm:text-lg">
            Build polished product interfaces with Ant Design-inspired semantics, Solid-native
            performance, token-driven theming, and a docs experience designed for fast discovery.
          </p>
          <Space class="mt-8 justify-center" size="middle">
            <Button type="primary" size="large" onClick={() => navigate('/docs/getting-started')}>
              Get Started
            </Button>
            <Button size="large" onClick={() => navigate('/components/affix')}>
              View Components
            </Button>
          </Space>
        </div>

        <div class="relative z-[1] mx-auto mt-12 max-w-[960px]">
          <div class="rounded-[32px] border border-white/80 bg-white/45 p-2 shadow-[0_36px_100px_rgba(37,99,235,0.22)] backdrop-blur-xl">
            <img
              alt="Blue glassmorphism interface hero artwork"
              class="w-full rounded-[26px] object-cover shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              src={heroBanner}
            />
          </div>
        </div>
      </section>

      <section class="grid gap-5 lg:grid-cols-3">
        {features.map((feature) => (
          <Card class="h-full border-blue-100 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
            <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg text-blue-600">
              ✦
            </div>
            <h2 class="mb-3 mt-0 text-xl font-bold text-slate-950">{feature.title}</h2>
            <p class="m-0 leading-[1.75] text-black/65">{feature.description}</p>
          </Card>
        ))}
      </section>

      <section class="grid gap-6 rounded-[32px] border border-blue-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] lg:grid-cols-[1fr_1.25fr] lg:p-8">
        <div>
          <Tag color="blue">Components</Tag>
          <h2 class="mb-3 mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950">
            Preview the building blocks
          </h2>
          <p class="mb-6 leading-[1.75] text-black/65">
            Ready for production docs, examples, and theme exploration without leaving the SolidJS
            workflow.
          </p>
          <Space wrap>
            <Badge count={32}>
              <Button>Components</Button>
            </Badge>
            <Button type="primary">Primary action</Button>
            <Button>Secondary</Button>
          </Space>
        </div>

        <Card class="border-slate-100 bg-slate-50/80">
          <Tabs
            defaultActiveKey="theme"
            items={[
              {
                key: 'theme',
                label: 'Theme',
                children: (
                  <div class="rounded-2xl bg-white p-5 shadow-sm">
                    <div class="mb-3 text-sm font-semibold text-slate-950">Token preview</div>
                    <div class="flex gap-3">
                      <span class="h-10 flex-1 rounded-xl bg-blue-500" />
                      <span class="h-10 flex-1 rounded-xl bg-indigo-500" />
                      <span class="h-10 flex-1 rounded-xl bg-violet-500" />
                    </div>
                  </div>
                ),
              },
              {
                key: 'runtime',
                label: 'Runtime',
                children: (
                  <div class="rounded-2xl bg-white p-5 text-sm leading-7 text-black/65 shadow-sm">
                    Fine-grained updates, component-level styles, and predictable composition for
                    Solid applications.
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </section>
    </div>
  )
}
