import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useInputStyle } from './input.style'
import type { GroupProps } from './interface'

export function Group(props: GroupProps) {
  const config = useConfig()
  const prefixCls = () => props.prefixCls ?? `${config.prefixCls()}-input-group`
  const inputPrefixCls = () =>
    props.prefixCls?.replace(/-group$/, '') ?? `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(inputPrefixCls())
  const size = () => props.size ?? config.componentSize()

  return (
    <span
      class={classNames(
        prefixCls(),
        props.compact && `${prefixCls()}-compact`,
        size() === 'small' && `${prefixCls()}-sm`,
        (size() === 'large' || size() === 'default') && size() !== 'middle' && `${prefixCls()}-lg`,
        hashId(),
        props.class,
      )}
      style={props.style}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    >
      {props.children}
    </span>
  )
}
