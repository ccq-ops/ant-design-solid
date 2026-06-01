import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTypographyStyle } from './typography.style'
import type { TitleProps, TypographyBaseProps } from './interface'
function useTypographyClasses() {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-typography`
  const [, hashId] = useTypographyStyle(prefixCls())
  return { prefixCls, hashId }
}
function Title(props: TitleProps) {
  const [local, rest] = splitProps(props, ['level', 'type', 'ellipsis', 'class', 'children'])
  const { prefixCls, hashId } = useTypographyClasses()
  const level = () => local.level ?? 1
  return (
    <Dynamic
      component={`h${level()}`}
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-title`,
        local.type && `${prefixCls()}-${local.type}`,
        local.ellipsis && `${prefixCls()}-ellipsis`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </Dynamic>
  )
}
function Text(props: TypographyBaseProps) {
  const [local, rest] = splitProps(props, ['type', 'ellipsis', 'class', 'children'])
  const { prefixCls, hashId } = useTypographyClasses()
  return (
    <span
      {...rest}
      class={classNames(
        prefixCls(),
        local.type && `${prefixCls()}-${local.type}`,
        local.ellipsis && `${prefixCls()}-ellipsis`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </span>
  )
}
function Paragraph(props: TypographyBaseProps) {
  const [local, rest] = splitProps(props, ['type', 'ellipsis', 'class', 'children'])
  const { prefixCls, hashId } = useTypographyClasses()
  return (
    <p
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-paragraph`,
        local.type && `${prefixCls()}-${local.type}`,
        local.ellipsis && `${prefixCls()}-ellipsis`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </p>
  )
}
export const Typography = Object.assign(Text, { Title, Text, Paragraph })
