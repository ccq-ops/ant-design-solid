import { createSignal, splitProps } from 'solid-js'
import { EyeInvisibleOutlined, EyeOutlined } from '@solid-ant-design/icons'
import { Input } from './input'
import type { PasswordProps, VisibilityToggle } from './interface'

function isVisibilityConfig(value: PasswordProps['visibilityToggle']): value is VisibilityToggle {
  return typeof value === 'object' && value !== null
}

export function Password(props: PasswordProps) {
  const [local, inputProps] = splitProps(props, [
    'inputPrefixCls',
    'action',
    'iconRender',
    'visibilityToggle',
    'suffix',
  ])
  const [innerVisible, setInnerVisible] = createSignal(false)
  const visibilityEnabled = () => local.visibilityToggle !== false
  const action = () => local.action ?? 'click'
  const visible = () =>
    isVisibilityConfig(local.visibilityToggle) && local.visibilityToggle.visible !== undefined
      ? local.visibilityToggle.visible
      : innerVisible()
  const iconRender = () =>
    local.iconRender ??
    ((nextVisible: boolean) => (nextVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />))
  const setVisible = (nextVisible: boolean) => {
    if (
      !(isVisibilityConfig(local.visibilityToggle) && local.visibilityToggle.visible !== undefined)
    ) {
      setInnerVisible(nextVisible)
    }
    if (isVisibilityConfig(local.visibilityToggle))
      local.visibilityToggle.onVisibleChange?.(nextVisible)
  }
  const toggle = () => setVisible(!visible())
  const toggleButton = () =>
    visibilityEnabled() ? (
      <button
        type="button"
        aria-label="toggle password visibility"
        class="ads-input-password-icon"
        onClick={() => {
          if (action() === 'click') toggle()
        }}
        onMouseEnter={() => {
          if (action() === 'hover') setVisible(true)
        }}
        onMouseLeave={() => {
          if (action() === 'hover') setVisible(false)
        }}
      >
        {iconRender()(visible())}
      </button>
    ) : undefined

  const suffix = () => (
    <span class="ads-input-password-suffix">
      {local.suffix}
      {toggleButton()}
    </span>
  )

  return (
    <Input
      {...inputProps}
      prefixCls={local.inputPrefixCls ?? inputProps.prefixCls}
      type={visible() ? 'text' : 'password'}
      suffix={suffix()}
    />
  )
}
