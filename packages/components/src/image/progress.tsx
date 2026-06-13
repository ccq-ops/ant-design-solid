import type { JSX } from 'solid-js'
import { Show } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { ImageProgressConfig, ImageSemanticClassNames, ImageSemanticStyles } from './interface'

export interface ImageProgressProps {
  prefixCls: string
  width?: string | number
  height?: string | number
  config?: ImageProgressConfig
  classNames?: NonNullable<ImageSemanticClassNames['placeholder']>['progress']
  styles?: NonNullable<ImageSemanticStyles['placeholder']>['progress']
}

export function ImageProgress(props: ImageProgressProps) {
  const hasPercent = () =>
    typeof props.config?.percent === 'number' && Number.isFinite(props.config.percent)
  const percent = () => Math.max(0, Math.min(100, Math.round(props.config?.percent ?? 0)))
  const rail = () => (
    <div
      class={classNames(`${props.prefixCls}-progress-rail`, props.classNames?.rail)}
      style={{ '--progress-percent': `${percent()}%`, ...props.styles?.rail } as JSX.CSSProperties}
    />
  )
  const content = () =>
    props.config?.render?.(rail(), percent()) ?? (
      <>
        {rail()}
        <Show when={hasPercent()}>
          <div
            class={classNames(`${props.prefixCls}-progress-indicator`, props.classNames?.indicator)}
            style={props.styles?.indicator}
          >
            {percent()}%
          </div>
        </Show>
      </>
    )

  return (
    <div
      class={classNames(
        props.prefixCls,
        `${props.prefixCls}-progress-wrapper`,
        props.classNames?.root,
      )}
      style={
        { width: props.width, height: props.height, ...props.styles?.root } as JSX.CSSProperties
      }
      role={hasPercent() ? 'progressbar' : undefined}
      aria-valuemin={hasPercent() ? 0 : undefined}
      aria-valuemax={hasPercent() ? 100 : undefined}
      aria-valuenow={hasPercent() ? percent() : undefined}
      aria-label={hasPercent() ? `${percent()}%` : undefined}
      aria-busy={hasPercent() ? undefined : true}
    >
      <div class={`${props.prefixCls}-progress-ink-1`} />
      <div class={`${props.prefixCls}-progress-ink-2`} />
      <div
        class={classNames(`${props.prefixCls}-progress-content`, props.classNames?.content)}
        style={props.styles?.content}
      >
        {content()}
      </div>
    </div>
  )
}
