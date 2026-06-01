import type { JSX } from 'solid-js'

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> { spin?: boolean }

export function LoadingIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M512 64a32 32 0 0 1 32 32v160a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32Z" opacity="0.85" />
      <path d="M512 736a32 32 0 0 1 32 32v160a32 32 0 1 1-64 0V768a32 32 0 0 1 32-32Z" opacity="0.25" />
      <path d="M195.2 195.2a32 32 0 0 1 45.3 0l113.1 113.1a32 32 0 0 1-45.3 45.3L195.2 240.5a32 32 0 0 1 0-45.3Z" opacity="0.65" />
      <path d="M670.4 670.4a32 32 0 0 1 45.3 0l113.1 113.1a32 32 0 1 1-45.3 45.3L670.4 715.7a32 32 0 0 1 0-45.3Z" opacity="0.2" />
      <path d="M64 512a32 32 0 0 1 32-32h160a32 32 0 0 1 0 64H96a32 32 0 0 1-32-32Z" opacity="0.45" />
      <path d="M736 512a32 32 0 0 1 32-32h160a32 32 0 1 1 0 64H768a32 32 0 0 1-32-32Z" />
    </svg>
  )
}

export function CloseCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M512 64a448 448 0 1 0 0 896 448 448 0 0 0 0-896Zm169.7 572.5a32 32 0 1 1-45.2 45.2L512 557.3 387.5 681.7a32 32 0 0 1-45.2-45.2L466.7 512 342.3 387.5a32 32 0 0 1 45.2-45.2L512 466.7l124.5-124.4a32 32 0 0 1 45.2 45.2L557.3 512l124.4 124.5Z" />
    </svg>
  )
}
