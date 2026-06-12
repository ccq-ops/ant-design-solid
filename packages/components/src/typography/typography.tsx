import { For, Show, children, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { CheckOutlined, CopyOutlined, EditOutlined, EnterOutlined } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { Tooltip } from '../tooltip'
import { useTypographyStyle } from './typography.style'
import type {
  CopyConfig,
  EditAutoSizeConfig,
  EditConfig,
  EllipsisConfig,
  LinkProps,
  ParagraphProps,
  TextProps,
  TitleProps,
  TypographyBaseProps,
  TypographyComponent,
  TypographyProps,
} from './interface'

type BlockKind = 'text' | 'link' | 'title' | 'paragraph'
type TypographyElementProps = JSX.HTMLAttributes<HTMLElement> & {
  href?: string
  target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>['target']
  rel?: string
}
type TypographyBlockProps = TypographyBaseProps &
  BlockRenderOptions & {
    href?: string
    target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>['target']
    rel?: string
  }

interface BlockRenderOptions {
  kind: BlockKind
  component: TypographyComponent
  allowFullEllipsis?: boolean
  linkEllipsisOnly?: boolean
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCopyConfig(copyable: TypographyBaseProps['copyable']): copyable is CopyConfig {
  return isObject(copyable)
}

function isEditConfig(editable: TypographyBaseProps['editable']): editable is EditConfig {
  return isObject(editable)
}

function isEllipsisConfig(ellipsis: TypographyBaseProps['ellipsis']): ellipsis is EllipsisConfig {
  return isObject(ellipsis)
}

function getTextContent(value: JSX.Element): string {
  if (value === undefined || value === null || typeof value === 'boolean') return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(getTextContent).join('')
  return ''
}

function getAutoSizeConfig(
  autoSize: boolean | EditAutoSizeConfig | undefined,
): EditAutoSizeConfig | undefined {
  if (!autoSize) return undefined
  return typeof autoSize === 'object' ? autoSize : {}
}

function useTypographyClasses() {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-typography`
  const [, hashId] = useTypographyStyle(prefixCls())
  return { prefixCls, hashId }
}

async function copyText(text: string, format: CopyConfig['format']) {
  const clipboard = navigator.clipboard as
    | (Clipboard & {
        write?: (items: ClipboardItem[]) => Promise<void>
      })
    | undefined
  if (format === 'text/html' && clipboard?.write && typeof ClipboardItem !== 'undefined') {
    await clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([text], { type: 'text/html' }),
      }),
    ])
    return
  }
  await clipboard?.writeText?.(text)
}

function renderDecoratedContent(props: {
  local: TypographyBaseProps
  content: JSX.Element
  onTextEdit?: () => void
}) {
  const triggerText = () =>
    isEditConfig(props.local.editable) && props.local.editable.triggerType?.includes('text')
  const hasDecoration = () =>
    Boolean(
      props.local.italic ||
      props.local.keyboard ||
      props.local.strong ||
      props.local.delete ||
      props.local.underline ||
      props.local.mark ||
      props.local.code,
    )

  const apply = (
    node: JSX.Element,
    enabled: boolean | undefined,
    wrap: (child: JSX.Element) => JSX.Element,
  ) => (enabled ? wrap(node) : node)

  const content = () => {
    let node = props.content
    node = apply(node, props.local.italic, (child) => <i>{child}</i>)
    node = apply(node, props.local.keyboard, (child) => <kbd>{child}</kbd>)
    node = apply(node, props.local.strong, (child) => <strong>{child}</strong>)
    node = apply(node, props.local.delete, (child) => <del>{child}</del>)
    node = apply(node, props.local.underline, (child) => <u>{child}</u>)
    node = apply(node, props.local.mark, (child) => <mark>{child}</mark>)
    node = apply(node, props.local.code, (child) => <code>{child}</code>)
    return node
  }

  return (
    <Show when={triggerText() || hasDecoration()} fallback={content()}>
      <Show when={triggerText()} fallback={<span class="ads-typography-content">{content()}</span>}>
        <button
          type="button"
          class="ads-typography-content ads-typography-edit-content"
          onClick={props.onTextEdit}
        >
          {content()}
        </button>
      </Show>
    </Show>
  )
}

function TypographyRoot(props: TypographyProps) {
  const [local, rest] = splitProps(props, [
    'component',
    'class',
    'rootClass',
    'rootClassName',
    'classNames',
    'styles',
    'children',
  ])
  const { prefixCls, hashId } = useTypographyClasses()
  const component = () => local.component ?? 'article'
  const rootStyle = () => ({
    ...local.styles?.root,
    ...(rest.style as JSX.CSSProperties | undefined),
  })
  return (
    <Dynamic
      component={component()}
      {...rest}
      class={classNames(
        prefixCls(),
        hashId(),
        local.class,
        local.rootClass,
        local.rootClassName,
        local.classNames?.root,
      )}
      style={rootStyle()}
    >
      {local.children}
    </Dynamic>
  )
}

function TypographyBlock(props: TypographyBlockProps) {
  const [local, rest] = splitProps(props, [
    'kind',
    'component',
    'allowFullEllipsis',
    'linkEllipsisOnly',
    'type',
    'ellipsis',
    'class',
    'rootClass',
    'rootClassName',
    'children',
    'classNames',
    'styles',
    'actions',
    'title',
    'editable',
    'copyable',
    'disabled',
    'code',
    'mark',
    'underline',
    'delete',
    'strong',
    'keyboard',
    'italic',
  ])
  const { prefixCls, hashId } = useTypographyClasses()
  const elementProps = rest as TypographyElementProps
  const resolvedChildren = children(() => local.children)
  const [innerEditing, setInnerEditing] = createSignal(false)
  const [innerValue, setInnerValue] = createSignal(
    (isEditConfig(local.editable) ? local.editable.text : undefined) ??
      getTextContent(local.children),
  )
  const [copied, setCopied] = createSignal(false)
  const ellipsisConfig = () => (isEllipsisConfig(local.ellipsis) ? local.ellipsis : undefined)
  const canUseConfigEllipsis = () => isEllipsisConfig(local.ellipsis) && !local.linkEllipsisOnly
  const canExpand = () =>
    Boolean(local.allowFullEllipsis && canUseConfigEllipsis() && ellipsisConfig()?.expandable)
  const controlledExpanded = () => ellipsisConfig()?.expanded
  const [innerExpanded, setInnerExpanded] = createSignal(Boolean(ellipsisConfig()?.defaultExpanded))
  const expanded = () => controlledExpanded() ?? innerExpanded()
  const editConfig = () => (isEditConfig(local.editable) ? local.editable : undefined)
  const copyConfig = () => (isCopyConfig(local.copyable) ? local.copyable : undefined)
  const editing = () => editConfig()?.editing ?? innerEditing()
  const editText = () => editConfig()?.text ?? getTextContent(resolvedChildren())
  const hasActions = () => Boolean(local.copyable || local.editable)
  const actionPlacement = () => local.actions?.placement ?? 'end'
  const rows = () =>
    local.allowFullEllipsis && canUseConfigEllipsis() ? ellipsisConfig()?.rows : undefined
  const ellipsisActive = () => Boolean(local.ellipsis && !expanded())
  let textareaRef: HTMLTextAreaElement | undefined

  createEffect(() => {
    if (local.editable && !editing()) setInnerValue(editText())
  })

  createEffect(() => {
    if (local.ellipsis) ellipsisConfig()?.onEllipsis?.(true)
  })

  createEffect(() => {
    if (textareaRef) textareaRef.value = innerValue()
  })

  function startEdit() {
    if (local.disabled || !local.editable) return
    setInnerValue(editText())
    if (editConfig()?.editing === undefined) setInnerEditing(true)
    editConfig()?.onStart?.()
    queueMicrotask(() => textareaRef?.focus())
  }

  function endEdit() {
    editConfig()?.onEnd?.()
    if (editConfig()?.editing === undefined) setInnerEditing(false)
  }

  function cancelEdit() {
    editConfig()?.onCancel?.()
    if (editConfig()?.editing === undefined) setInnerEditing(false)
  }

  async function handleCopy(event: MouseEvent) {
    if (local.disabled || !local.copyable) return
    const config = copyConfig()
    const textSource = config?.text
    const text =
      typeof textSource === 'function'
        ? await textSource()
        : (textSource ?? getTextContent(resolvedChildren()))
    await copyText(text, config?.format)
    setCopied(true)
    config?.onCopy?.(event)
    window.setTimeout(() => setCopied(false), 1200)
  }

  function toggleExpanded(event: MouseEvent) {
    const next = !expanded()
    if (controlledExpanded() === undefined) setInnerExpanded(next)
    ellipsisConfig()?.onExpand?.(event, { expanded: next })
  }

  const ellipsisStyle = () => {
    if (!ellipsisActive() || !rows()) return {}
    return {
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': String(rows()),
    } as JSX.CSSProperties
  }

  const autoSizeConfig = () => getAutoSizeConfig(editConfig()?.autoSize)
  const textareaRows = () => autoSizeConfig()?.minRows ?? 1
  const rootStyle = () => ({
    ...local.styles?.root,
    ...(elementProps.style as JSX.CSSProperties | undefined),
    ...ellipsisStyle(),
  })
  const editingRootStyle = () => ({
    ...local.styles?.root,
    ...(elementProps.style as JSX.CSSProperties | undefined),
  })
  const textareaStyle = (): JSX.CSSProperties => ({
    ...local.styles?.textarea,
    ...(autoSizeConfig()?.maxRows
      ? { 'max-height': `${autoSizeConfig()!.maxRows! * 24}px`, 'overflow-y': 'auto' }
      : {}),
    ...(editConfig()?.autoSize ? { resize: 'none' } : {}),
  })

  const renderActionButton = (action: 'copy' | 'edit') => {
    if (action === 'copy') {
      const button = (
        <button
          type="button"
          aria-label="copy"
          tabIndex={copyConfig()?.tabIndex}
          class={classNames(`${prefixCls()}-action`, local.classNames?.action)}
          style={local.styles?.action}
          disabled={local.disabled}
          onClick={handleCopy}
        >
          {copyConfig()?.icon ?? (copied() ? <CheckOutlined /> : <CopyOutlined />)}
        </button>
      )
      return copyConfig()?.tooltips === false ? (
        button
      ) : (
        <Tooltip title={copyConfig()?.tooltips ?? (copied() ? 'Copied' : 'Copy')}>{button}</Tooltip>
      )
    }
    const button = (
      <button
        type="button"
        aria-label="edit"
        tabIndex={editConfig()?.tabIndex}
        class={classNames(`${prefixCls()}-action`, local.classNames?.action)}
        style={local.styles?.action}
        disabled={local.disabled}
        onClick={startEdit}
      >
        {editConfig()?.icon ?? <EditOutlined />}
      </button>
    )
    return editConfig()?.tooltip === false ? (
      button
    ) : (
      <Tooltip title={editConfig()?.tooltip ?? 'Edit'}>{button}</Tooltip>
    )
  }

  const actions = createMemo(() => {
    const nodes: JSX.Element[] = []
    if (local.editable && !editing() && !editConfig()?.triggerType?.length)
      nodes.push(renderActionButton('edit'))
    if (local.editable && !editing() && editConfig()?.triggerType?.includes('icon'))
      nodes.push(renderActionButton('edit'))
    if (local.copyable) nodes.push(renderActionButton('copy'))
    return nodes
  })

  const renderActions = () => (
    <Show when={hasActions() && actions().length > 0}>
      <span
        class={classNames(`${prefixCls()}-actions`, local.classNames?.actions)}
        style={local.styles?.actions}
      >
        <For each={actions()}>{(action) => action}</For>
      </span>
    </Show>
  )

  const symbol = () => {
    const value = ellipsisConfig()?.symbol
    if (typeof value === 'function') return value(expanded())
    return value ?? (expanded() ? 'collapse' : 'more')
  }

  const renderContent = () => (
    <>
      {renderDecoratedContent({ local, content: resolvedChildren(), onTextEdit: startEdit })}
      <Show when={canUseConfigEllipsis() && ellipsisConfig()?.suffix}>
        <span class={`${prefixCls()}-ellipsis-suffix`}>{ellipsisConfig()!.suffix}</span>
      </Show>
      <Show when={canExpand()}>
        <button
          type="button"
          class={`${prefixCls()}-ellipsis-symbol`}
          aria-label={getTextContent(symbol()) || (expanded() ? 'collapse' : 'more')}
          onClick={toggleExpanded}
        >
          {symbol()}
        </button>
      </Show>
    </>
  )

  return (
    <Show
      when={editing()}
      fallback={
        <Dynamic
          component={local.component}
          {...elementProps}
          title={local.title}
          aria-disabled={local.disabled || undefined}
          class={classNames(
            prefixCls(),
            local.kind === 'title' && `${prefixCls()}-title`,
            local.kind === 'paragraph' && `${prefixCls()}-paragraph`,
            local.kind === 'link' && `${prefixCls()}-link`,
            local.type && `${prefixCls()}-${local.type}`,
            local.disabled && `${prefixCls()}-disabled`,
            local.ellipsis && `${prefixCls()}-ellipsis`,
            Boolean(rows()) && `${prefixCls()}-ellipsis-multiple-line`,
            expanded() && `${prefixCls()}-expanded`,
            hashId(),
            local.class,
            local.rootClass,
            local.rootClassName,
            local.classNames?.root,
          )}
          style={rootStyle()}
        >
          <Show when={actionPlacement() === 'start'}>{renderActions()}</Show>
          {renderContent()}
          <Show when={actionPlacement() === 'end'}>{renderActions()}</Show>
        </Dynamic>
      }
    >
      <span
        class={classNames(
          prefixCls(),
          `${prefixCls()}-editing`,
          hashId(),
          local.class,
          local.rootClass,
          local.rootClassName,
          local.classNames?.root,
        )}
        style={editingRootStyle()}
      >
        <textarea
          ref={(el) => {
            textareaRef = el
          }}
          class={classNames(`${prefixCls()}-textarea`, local.classNames?.textarea)}
          style={textareaStyle()}
          value={innerValue()}
          rows={textareaRows()}
          maxLength={editConfig()?.maxLength}
          disabled={local.disabled}
          onInput={(event) => {
            setInnerValue(event.currentTarget.value)
            editConfig()?.onChange?.(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              endEdit()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              cancelEdit()
            }
          }}
        />
        <button
          type="button"
          aria-label="finish edit"
          class={classNames(`${prefixCls()}-action`, local.classNames?.action)}
          style={local.styles?.action}
          onClick={endEdit}
        >
          {editConfig()?.enterIcon ?? <EnterOutlined />}
        </button>
      </span>
    </Show>
  )
}

function Text(props: TextProps) {
  return <TypographyBlock {...props} kind="text" component="span" />
}

function Link(props: LinkProps) {
  const [local, rest] = splitProps(props, ['target', 'rel', 'ellipsis', 'children'])
  const rel = () =>
    local.rel === undefined && local.target === '_blank' ? 'noopener noreferrer' : local.rel
  return (
    <TypographyBlock
      {...(rest as TypographyBaseProps)}
      target={local.target}
      rel={rel()}
      ellipsis={Boolean(local.ellipsis)}
      kind="link"
      component="a"
      linkEllipsisOnly
    >
      {local.children}
    </TypographyBlock>
  )
}

function Paragraph(props: ParagraphProps) {
  return <TypographyBlock {...props} kind="paragraph" component="div" allowFullEllipsis />
}

function Title(props: TitleProps) {
  const [local, rest] = splitProps(props, ['level'])
  const level = () => local.level ?? 1
  return (
    <TypographyBlock
      {...rest}
      kind="title"
      component={`h${level()}` as TypographyComponent}
      allowFullEllipsis
    />
  )
}

export const Typography = Object.assign(TypographyRoot, { Title, Text, Link, Paragraph })
