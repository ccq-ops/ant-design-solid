import type { Component } from 'solid-js'
import { useToken } from '../config-provider'

type ExceptionImageStatus = '403' | '404' | '500'

function ExceptionImage(props: { title: string; code: ExceptionImageStatus }) {
  const token = useToken()
  const accentColor = () => {
    const t = token()
    if (props.code === '403') return t.colorWarning
    if (props.code === '500') return t.colorError
    return t.colorPrimary
  }
  const imageStyle = () => ({
    '--ads-result-image-bg-color': token().colorFillTertiary,
    '--ads-result-image-surface-color': token().colorBgContainer,
    '--ads-result-image-muted-color': token().colorBorderSecondary,
    '--ads-result-image-accent-color': accentColor(),
  })

  return (
    <svg
      viewBox="0 0 252 252"
      width="252"
      height="252"
      role="img"
      aria-label={props.title}
      style={imageStyle()}
    >
      <rect
        class="ads-result-image-bg"
        x="22"
        y="38"
        width="208"
        height="132"
        rx="16"
        fill="var(--ads-result-image-bg-color)"
      />
      <rect
        class="ads-result-image-surface"
        x="42"
        y="58"
        width="168"
        height="92"
        rx="10"
        fill="var(--ads-result-image-surface-color)"
      />
      <circle
        class="ads-result-image-accent"
        cx="62"
        cy="76"
        r="6"
        fill="var(--ads-result-image-accent-color)"
      />
      <circle
        class="ads-result-image-muted"
        cx="82"
        cy="76"
        r="6"
        fill="var(--ads-result-image-muted-color)"
      />
      <circle
        class="ads-result-image-muted"
        cx="102"
        cy="76"
        r="6"
        fill="var(--ads-result-image-muted-color)"
      />
      <path
        class="ads-result-image-muted"
        d="M64 106h124M64 126h88"
        stroke="var(--ads-result-image-muted-color)"
        stroke-width="8"
        stroke-linecap="round"
      />
      <text
        class="ads-result-image-accent"
        x="126"
        y="230"
        fill="var(--ads-result-image-accent-color)"
        font-size="36"
        font-family="Arial, sans-serif"
        font-weight="700"
        text-anchor="middle"
      >
        {props.code}
      </text>
    </svg>
  )
}

export const PresentedImage403: Component = () => (
  <ExceptionImage title="403 forbidden" code="403" />
)

export const PresentedImage404: Component = () => (
  <ExceptionImage title="404 not found" code="404" />
)

export const PresentedImage500: Component = () => (
  <ExceptionImage title="500 server error" code="500" />
)
