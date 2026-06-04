import { createSignal } from 'solid-js'
import { Button, Carousel, Space } from '@ant-design-solid/core'
import type { CarouselRef } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const slideStyle = {
  height: '160px',
  color: '#fff',
  'line-height': '160px',
  'text-align': 'center',
  background: '#1677ff',
  'font-size': '24px',
} as const

function Slide(props: { children: string }) {
  return <div style={slideStyle}>{props.children}</div>
}

export default function CarouselPage() {
  let carousel: CarouselRef | undefined
  const [current, setCurrent] = createSignal(0)

  return (
    <>
      <h1>Carousel</h1>
      <p>Display a group of content in a carousel with dots, arrows, and autoplay.</p>

      <DemoBlock
        title="Basic"
        code={`<Carousel>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</Carousel>`}
      >
        <Carousel>
          <Slide>1</Slide>
          <Slide>2</Slide>
          <Slide>3</Slide>
        </Carousel>
      </DemoBlock>

      <DemoBlock title="Autoplay" code={`<Carousel autoplay autoplaySpeed={2000}>...</Carousel>`}>
        <Carousel autoplay autoplaySpeed={2000}>
          <Slide>1</Slide>
          <Slide>2</Slide>
          <Slide>3</Slide>
        </Carousel>
      </DemoBlock>

      <DemoBlock title="Arrows" code={`<Carousel arrows>...</Carousel>`}>
        <Carousel arrows>
          <Slide>1</Slide>
          <Slide>2</Slide>
          <Slide>3</Slide>
        </Carousel>
      </DemoBlock>

      <DemoBlock title="Fade" code={`<Carousel effect="fade">...</Carousel>`}>
        <Carousel effect="fade">
          <Slide>1</Slide>
          <Slide>2</Slide>
          <Slide>3</Slide>
        </Carousel>
      </DemoBlock>

      <DemoBlock
        title="Imperative methods"
        code={`let carousel: CarouselRef | undefined
<Carousel ref={carousel} afterChange={setCurrent}>...</Carousel>
<button onClick={() => carousel?.prev()}>Previous</button>
<button onClick={() => carousel?.next()}>Next</button>`}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Carousel
            ref={(ref) => {
              carousel = ref
            }}
            arrows
            afterChange={setCurrent}
          >
            <Slide>1</Slide>
            <Slide>2</Slide>
            <Slide>3</Slide>
          </Carousel>
          <Space>
            <Button onClick={() => carousel?.prev()}>Previous</Button>
            <Button onClick={() => carousel?.goTo(1)}>Go to 2</Button>
            <Button onClick={() => carousel?.next()}>Next</Button>
            <span>Current: {current() + 1}</span>
          </Space>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          Use <code>autoplay</code> and <code>autoplaySpeed</code> to switch slides automatically.
        </li>
        <li>
          Use <code>dots</code>, <code>dotPosition</code>, and <code>arrows</code> for navigation.
        </li>
        <li>
          Use <code>effect="fade"</code> for fade transitions.
        </li>
        <li>
          Use <code>ref</code> to call <code>goTo</code>, <code>next</code>, and <code>prev</code>.
        </li>
      </ul>
    </>
  )
}
