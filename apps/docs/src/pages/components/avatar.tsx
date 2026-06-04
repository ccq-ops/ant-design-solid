import { Avatar, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
