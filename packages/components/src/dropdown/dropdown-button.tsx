import { EllipsisOutlined } from '@ant-design-solid/icons'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { Space } from '../space'
import { classNames } from '../shared/class-names'
import { Dropdown } from './dropdown'
import type { DropdownButtonProps, DropdownProps } from './interface'

export function DropdownButton(props: DropdownButtonProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-dropdown`
  const {
    type = 'default',
    danger,
    disabled,
    loading,
    onClick,
    htmlType,
    children,
    class: className,
    menu,
    arrow,
    autoFocus,
    trigger,
    align,
    open,
    onOpenChange,
    placement,
    getPopupContainer,
    href,
    icon = <EllipsisOutlined />,
    title,
    buttonsRender = (buttons) => buttons,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayClass,
    overlayClassName,
    overlayStyle,
    destroyOnHidden,
    destroyPopupOnHide,
    dropdownRender,
    popupRender,
    buttonProps,
    ...rest
  } = props

  const dropdownProps: DropdownProps = {
    menu,
    arrow,
    autoFocus,
    align,
    disabled,
    trigger: disabled ? [] : trigger,
    onOpenChange,
    getPopupContainer,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayClass,
    overlayClassName,
    overlayStyle,
    destroyOnHidden,
    destroyPopupOnHide,
    dropdownRender,
    popupRender,
    placement: placement ?? 'bottomRight',
    open,
  }

  const leftButton = (
    <Button
      {...buttonProps}
      type={type}
      danger={danger}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      htmlType={htmlType}
      href={href}
      title={title}
    >
      {children}
    </Button>
  )
  const rightButton = (
    <Button
      type={type}
      danger={danger}
      disabled={disabled}
      icon={icon}
      class={`${prefixCls()}-button-trigger-btn`}
      style={{
        'border-inline-start-color':
          type === 'primary' && !danger ? 'rgba(255, 255, 255, 0.45)' : undefined,
      }}
    />
  )
  const [leftButtonToRender, rightButtonToRender] = buttonsRender([leftButton, rightButton])

  return (
    <Space.Compact {...rest} block class={classNames(`${prefixCls()}-button`, className)}>
      {leftButtonToRender}
      <Dropdown {...dropdownProps} class={`${prefixCls()}-button-trigger`}>
        {rightButtonToRender}
      </Dropdown>
    </Space.Compact>
  )
}
