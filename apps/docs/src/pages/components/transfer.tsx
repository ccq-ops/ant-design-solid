import { createSignal } from 'solid-js'
import { Transfer } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const dataSource = [
  { key: '1', title: 'Alpha', description: 'First item' },
  { key: '2', title: 'Beta', description: 'Second item' },
  { key: '3', title: 'Gamma', description: 'Disabled item', disabled: true },
]

const transferRows: ApiTableRow[] = [
  {
    property: 'dataSource',
    description: 'Items that can be moved between lists.',
    type: 'TransferItem[]',
  },
  {
    property: 'targetKeys',
    description: 'Controlled keys currently in the target list.',
    type: 'string[]',
  },
  {
    property: 'defaultTargetKeys',
    description: 'Initial keys in the target list for uncontrolled usage.',
    type: 'string[]',
  },
  {
    property: 'selectedKeys',
    description: 'Controlled selected item keys across both lists.',
    type: 'string[]',
  },
  {
    property: 'defaultSelectedKeys',
    description: 'Initial selected item keys for uncontrolled usage.',
    type: 'string[]',
  },
  {
    property: 'disabled',
    description: 'Disables selection and transfer operations.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'showSearch',
    description: 'Shows search inputs for filtering both lists.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'titles',
    description: 'Source and target list titles.',
    type: '[JSX.Element, JSX.Element]',
  },
  {
    property: 'operations',
    description: 'Labels for move-to-target and move-to-source buttons.',
    type: '[JSX.Element, JSX.Element]',
  },
  {
    property: 'filterOption',
    description: 'Custom item filter used by search.',
    type: '(inputValue: string, item: TransferItem) => boolean',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  {
    property: 'onChange',
    description: 'Called after items move between lists.',
    type: '(targetKeys, direction, moveKeys) => void',
  },
  {
    property: 'onSelectChange',
    description: 'Called when source or target selected keys change.',
    type: '(sourceSelectedKeys, targetSelectedKeys) => void',
  },
]

const transferItemRows: ApiTableRow[] = [
  { property: 'key', description: 'Stable item key.', type: 'string' },
  { property: 'title', description: 'Item title content.', type: 'JSX.Element' },
  { property: 'description', description: 'Optional item description.', type: 'JSX.Element' },
  {
    property: 'disabled',
    description: 'Disables selecting and moving this item.',
    type: 'boolean',
  },
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

      <h2>API</h2>
      <h3>Transfer</h3>
      <ApiTable rows={transferRows} aria-label="Transfer API" />
      <h3>TransferItem</h3>
      <ApiTable rows={transferItemRows} aria-label="Transfer Item API" />
    </>
  )
}
