import { Show, createEffect, createSignal, onCleanup, splitProps, type JSX } from 'solid-js'
import { ExclamationCircleFilled } from '@ant-design-solid/solid-icons'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { Popover, type PopoverSemanticClassNames, type PopoverSemanticStyles } from '../popover'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import type {
  PopconfirmProps,
  PopconfirmRef,
  PopconfirmSemanticClassNames,
  PopconfirmSemanticStyles,
} from './interface'
import { usePopconfirmStyle } from './popconfirm.style'

function isRenderFunction(value: PopconfirmProps['title']): value is () => JSX.Element {
  return typeof value === 'function'
}

function resolveContent(value: PopconfirmProps['title'] | PopconfirmProps['description']) {
  return isRenderFunction(value) ? value() : value
}

function assignRef(ref: PopconfirmProps['ref'], value: PopconfirmRef) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  if ('current' in ref) ref.current = value
  else Object.assign(ref, value)
}

export function Popconfirm(props: PopconfirmProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'title',
    'description',
    'disabled',
    'trigger',
    'okText',
    'okType',
    'okButtonProps',
    'cancelText',
    'cancelButtonProps',
    'showCancel',
    'icon',
    'onConfirm',
    'onCancel',
    'onOpenChange',
    'onPopupClick',
    'classNames',
    'styles',
    'onClick',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-popconfirm`
  const [, hashId] = usePopconfirmStyle(prefixCls())
  const [innerOpen, setInnerOpen] = createSignal(rest.defaultOpen ?? false)
  const [popoverRef, setPopoverRef] = createSignal<PopconfirmRef>()
  const mergedOpen = () => (local.disabled ? false : (rest.open ?? innerOpen()))
  const destroyOnHidden = () =>
    rest.destroyOnHidden ??
    (rest.destroyTooltipOnHide !== undefined ? Boolean(rest.destroyTooltipOnHide) : true)

  const semanticProps = (): PopconfirmProps => ({ ...props })
  const resolvedClassNames = (): PopconfirmSemanticClassNames =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {})
  const resolvedStyles = (): PopconfirmSemanticStyles =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {})

  const popoverClassNames = (): PopoverSemanticClassNames => {
    const classNames = resolvedClassNames()
    return {
      root: classNames.root,
      container: classNames.container,
      arrow: classNames.arrow,
    }
  }
  const popoverStyles = (): PopoverSemanticStyles => {
    const styles = resolvedStyles()
    return {
      root: styles.root,
      container: styles.container,
      arrow: styles.arrow,
    }
  }

  const confirm = async (event: MouseEvent) => {
    event?.stopPropagation()
    try {
      await local.onConfirm?.(event)
      setOpen(false)
    } catch {
      setOpen(true)
    }
  }

  const cancel = (event: MouseEvent) => {
    event?.stopPropagation()
    setOpen(false)
    local.onCancel?.(event)
  }

  const setOpen = (nextOpen: boolean) => {
    if (local.disabled && nextOpen) return
    if (rest.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (local.disabled && nextOpen) return
    setOpen(nextOpen)
  }

  const handleClick = (event: MouseEvent & { currentTarget: HTMLSpanElement; target: Element }) => {
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
    if ((local.trigger ?? 'click') !== 'click') return
    if (local.disabled) return
    setOpen(true)
  }

  createEffect(() => {
    const ref = popoverRef()
    if (ref) assignRef(local.ref, ref)
  })

  const containsTarget = (target: EventTarget | null) => {
    const ref = popoverRef()
    return Boolean(
      target instanceof Node &&
      (ref?.nativeElement?.contains(target) || ref?.popupElement?.contains(target)),
    )
  }

  const cleanupPointerDown = addDocumentPointerDown((event) => {
    if (!mergedOpen()) return
    if (containsTarget(event.target)) return
    setOpen(false)
  })
  const cleanupKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && mergedOpen()) setOpen(false)
  })

  onCleanup(() => {
    cleanupPointerDown()
    cleanupKeydown()
  })

  const overlay = () => {
    const semanticClassNames = resolvedClassNames()
    const semanticStyles = resolvedStyles()
    const icon = local.icon ?? <ExclamationCircleFilled />

    return (
      <div
        class={`${prefixCls()}-body`}
        role="dialog"
        on:click={(event) => {
          event.stopPropagation()
          local.onPopupClick?.(event)
        }}
      >
        <div class={`${prefixCls()}-message`}>
          <Show when={icon}>
            <span
              class={classNames(`${prefixCls()}-icon`, semanticClassNames.icon)}
              style={semanticStyles.icon}
            >
              {icon}
            </span>
          </Show>
          <div class={`${prefixCls()}-text`}>
            <div
              class={classNames(`${prefixCls()}-title`, semanticClassNames.title)}
              style={semanticStyles.title}
            >
              {resolveContent(local.title)}
            </div>
            <Show when={local.description}>
              <div
                class={classNames(`${prefixCls()}-description`, semanticClassNames.description)}
                style={semanticStyles.description}
              >
                {resolveContent(local.description)}
              </div>
            </Show>
          </div>
        </div>
        <div
          class={classNames(`${prefixCls()}-buttons`, semanticClassNames.buttons)}
          style={semanticStyles.buttons}
        >
          <Show when={local.showCancel ?? true}>
            <Button size="small" {...local.cancelButtonProps} on:click={cancel}>
              {local.cancelText ?? 'Cancel'}
            </Button>
          </Show>
          <Button
            size="small"
            type={local.okType ?? 'primary'}
            {...local.okButtonProps}
            on:click={confirm}
          >
            {local.okText ?? 'OK'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Popover
      {...rest}
      ref={setPopoverRef}
      open={mergedOpen()}
      destroyOnHidden={destroyOnHidden()}
      content={overlay}
      trigger={(local.trigger ?? 'click') === 'click' ? [] : local.trigger}
      onOpenChange={handleOpenChange}
      onClick={handleClick}
      classNames={popoverClassNames()}
      styles={popoverStyles()}
      rootClass={classNames(hashId(), rest.rootClass)}
      overlayClass={classNames(rest.overlayClass, prefixCls())}
      prefixCls={prefixCls()}
    />
  )
}
