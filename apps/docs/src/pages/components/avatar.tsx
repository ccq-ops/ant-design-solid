import { Avatar, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const avatarRows: ApiTableRow[] = [
  {
    property: 'size',
    description: 'Avatar size or custom pixel size.',
    type: "'small' | 'default' | 'large' | number",
    defaultValue: "'default'",
  },
  {
    property: 'shape',
    description: 'Avatar shape.',
    type: "'circle' | 'square'",
    defaultValue: "'circle'",
  },
  {
    property: 'src',
    description: 'Image URL. Falls back to icon or children after load failure.',
    type: 'string',
  },
  { property: 'alt', description: 'Alternate text for the image avatar.', type: 'string' },
  {
    property: 'icon',
    description: 'Icon content shown when no valid image is available.',
    type: 'JSX.Element',
  },
  { property: 'gap', description: 'Reserved text gap configuration.', type: 'number' },
  {
    property: 'children',
    description: 'Text or custom content shown inside the avatar.',
    type: 'JSX.Element',
  },
]

const avatarGroupRows: ApiTableRow[] = [
  {
    property: 'maxCount',
    description: 'Maximum number of avatars to show before rendering an overflow avatar.',
    type: 'number',
  },
  {
    property: 'maxStyle',
    description: 'Inline style applied to the overflow avatar.',
    type: 'JSX.CSSProperties',
  },
  {
    property: 'size',
    description: 'Shared size applied to avatars in the group.',
    type: "'small' | 'default' | 'large' | number",
  },
  {
    property: 'shape',
    description: 'Shared shape applied to avatars in the group.',
    type: "'circle' | 'square'",
  },
  { property: 'children', description: 'Avatar items rendered in the group.', type: 'JSX.Element' },
]

function UserIcon() {
  return <span aria-hidden="true">👤</span>
}

export default function AvatarPage() {
  return (
    <>
      <h1>Avatar</h1>
      <DemoBlock
        title="Sizes"
        code={`<Avatar size="small">S</Avatar>\n<Avatar>M</Avatar>\n<Avatar size="large">L</Avatar>\n<Avatar size={56}>56</Avatar>`}
      >
        <Space align="center" wrap>
          <Avatar size="small">S</Avatar>
          <Avatar>M</Avatar>
          <Avatar size="large">L</Avatar>
          <Avatar size={56}>56</Avatar>
        </Space>
      </DemoBlock>
      <DemoBlock title="Shapes" code={`<Avatar>U</Avatar>\n<Avatar shape="square">U</Avatar>`}>
        <Space align="center" wrap>
          <Avatar>U</Avatar>
          <Avatar shape="square">U</Avatar>
          <Avatar shape="square" size="large">
            AB
          </Avatar>
        </Space>
      </DemoBlock>
      <DemoBlock title="Image fallback" code={`<Avatar src="/missing-avatar.png">JD</Avatar>`}>
        <Space align="center" wrap>
          <Avatar src="https://example.invalid/missing-avatar.png" alt="Jane Doe">
            JD
          </Avatar>
          <span>When the image fails to load, Avatar falls back to text.</span>
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Icon and text"
        code={`<Avatar icon={<UserIcon />} />\n<Avatar>Tom</Avatar>`}
      >
        <Space align="center" wrap>
          <Avatar icon={<UserIcon />} />
          <Avatar>Tom</Avatar>
          <Avatar style={{ background: '#1677ff' }}>A</Avatar>
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Group overflow"
        code={`<Avatar.Group maxCount={3}>\n  <Avatar>A</Avatar>\n  <Avatar>B</Avatar>\n  <Avatar>C</Avatar>\n  <Avatar>D</Avatar>\n</Avatar.Group>`}
      >
        <Avatar.Group maxCount={3} size="large">
          <Avatar>A</Avatar>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
          <Avatar>E</Avatar>
        </Avatar.Group>
      </DemoBlock>

      <h2>API</h2>
      <h3>Avatar</h3>
      <ApiTable rows={avatarRows} aria-label="Avatar API" />
      <h3>Avatar.Group</h3>
      <ApiTable rows={avatarGroupRows} aria-label="Avatar Group API" />
    </>
  )
}
