import type { ImageTransform, ImageTransformAction } from './interface'

export const defaultTransform: ImageTransform = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  flipX: false,
  flipY: false,
}

export function clampScale(scale: number, minScale: number, maxScale: number) {
  return Math.min(maxScale, Math.max(minScale, scale))
}

export function nextTransform(
  transform: ImageTransform,
  action: ImageTransformAction,
  options: {
    scaleStep: number
    minScale: number
    maxScale: number
    deltaX?: number
    deltaY?: number
    wheelDirection?: 1 | -1
  },
): ImageTransform {
  switch (action) {
    case 'zoomIn':
      return {
        ...transform,
        scale: clampScale(transform.scale + options.scaleStep, options.minScale, options.maxScale),
      }
    case 'zoomOut':
      return {
        ...transform,
        scale: clampScale(transform.scale - options.scaleStep, options.minScale, options.maxScale),
      }
    case 'rotateLeft':
      return { ...transform, rotate: transform.rotate - 90 }
    case 'rotateRight':
      return { ...transform, rotate: transform.rotate + 90 }
    case 'flipX':
      return { ...transform, flipX: !transform.flipX }
    case 'flipY':
      return { ...transform, flipY: !transform.flipY }
    case 'move':
      return {
        ...transform,
        x: transform.x + (options.deltaX ?? 0),
        y: transform.y + (options.deltaY ?? 0),
      }
    case 'wheel':
      return {
        ...transform,
        scale: clampScale(
          transform.scale + options.scaleStep * (options.wheelDirection ?? 1),
          options.minScale,
          options.maxScale,
        ),
      }
    case 'reset':
    case 'doubleClick':
      return { ...defaultTransform }
    default:
      return transform
  }
}

export function transformToCss(transform: ImageTransform) {
  const scaleX = transform.scale * (transform.flipX ? -1 : 1)
  const scaleY = transform.scale * (transform.flipY ? -1 : 1)
  return `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotate}deg) scale3d(${scaleX}, ${scaleY}, 1)`
}
