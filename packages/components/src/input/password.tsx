import { createSignal } from 'solid-js'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design-solid/icons'
import { Input } from './input'
import type { PasswordProps, VisibilityToggle } from './interface'

function isVisibilityConfig(value: PasswordProps['visibilityToggle']): value is VisibilityToggle {
  return typeof value === 'object' && value !== null
}

export function Password(props: PasswordProps) {
  const [innerVisible, setInnerVisible] = createSignal(false)
  const visibilityEnabled = () => props.visibilityToggle !== false
  const visible = () =>
    isVisibilityConfig(props.visibilityToggle) && props.visibilityToggle.visible !== undefined
      ? props.visibilityToggle.visible
      : innerVisible()
  const iconRender = () =>
    props.iconRender ??
    ((nextVisible: boolean) => (nextVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />))
  const setVisible = (nextVisible: boolean) => {
    if (
      !(isVisibilityConfig(props.visibilityToggle) && props.visibilityToggle.visible !== undefined)
    ) {
      setInnerVisible(nextVisible)
    }
    if (isVisibilityConfig(props.visibilityToggle))
      props.visibilityToggle.onVisibleChange?.(nextVisible)
  }
  const toggle = () => setVisible(!visible())
  const toggleButton = () =>
    visibilityEnabled() ? (
      <button
        type="button"
        aria-label="toggle password visibility"
        class="ads-input-password-icon"
        onClick={toggle}
      >
        {iconRender()(visible())}
      </button>
    ) : undefined

  return <Input {...props} type={visible() ? 'text' : 'password'} suffix={toggleButton()} />
}
