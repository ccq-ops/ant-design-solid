import { createSignal } from 'solid-js'
import { Transfer } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const dataSource = [
  { key: '1', title: 'Alpha', description: 'First item' },
  { key: '2', title: 'Beta', description: 'Second item' },
  { key: '3', title: 'Gamma', description: 'Disabled item', disabled: true },
]

export default function TransferPage() {
  const [targetKeys, setTargetKeys] = createSignal<string[]>(['2'])

  return (
    <>
      <h1>Transfer</h1>
      <p>Move items between source and target lists.</p>

      <DemoBlock title="Basic" code={`<Transfer dataSource={dataSource} />`}>
        <Transfer dataSource={dataSource} />
      </DemoBlock>

      <DemoBlock title="Search" code={`<Transfer showSearch dataSource={dataSource} />`}>
        <Transfer showSearch dataSource={dataSource} />
      </DemoBlock>

      <DemoBlock
        title="Custom labels"
        code={`<Transfer titles={['Available', 'Chosen']} operations={['Add', 'Remove']} />`}
      >
        <Transfer
          dataSource={dataSource}
          operations={['Add', 'Remove']}
          titles={['Available', 'Chosen']}
        />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`<Transfer targetKeys={targetKeys()} onChange={setTargetKeys} />`}
      >
        <Transfer
          dataSource={dataSource}
          targetKeys={targetKeys()}
          onChange={(next) => setTargetKeys(next)}
        />
      </DemoBlock>
    </>
  )
}
