import { Mentions, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const peopleOptions = [
  { label: 'Alice', value: 'alice' },
  { label: 'Bob', value: 'bob' },
  { label: 'Charlie', value: 'charlie', disabled: true },
]

const topicOptions = [
  { label: 'Design', value: 'design' },
  { label: 'Solid', value: 'solid' },
  { label: 'Components', value: 'components' },
]

export default function MentionsPage() {
  return (
    <>
      <h1>Mentions</h1>
      <p>Mentions lets users select people or topics while typing in a textarea.</p>

      <DemoBlock
        title="Basic"
        code={`<Mentions placeholder="Mention someone" options={peopleOptions} />`}
      >
        <Mentions placeholder="Mention someone with @" options={peopleOptions} />
      </DemoBlock>

      <DemoBlock
        title="Default value and clear"
        code={`<Mentions allowClear defaultValue="Hello @alice " options={peopleOptions} />`}
      >
        <Mentions allowClear defaultValue="Hello @alice " options={peopleOptions} />
      </DemoBlock>

      <DemoBlock
        title="Multiple prefixes"
        code={`<Mentions prefix={["@", "#"]} options={topicOptions} />`}
      >
        <Space direction="vertical" class="w-80">
          <Mentions
            prefix={['@', '#']}
            placeholder="Type @ or # to open suggestions"
            options={topicOptions}
          />
        </Space>
      </DemoBlock>
    </>
  )
}
