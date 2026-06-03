export interface RgbColor {
  r: number
  g: number
  b: number
  a?: number
}

export interface HsbColor {
  h: number
  s: number
  b: number
  a?: number
}

export type ColorPickerValue = string | RgbColor | HsbColor | Color

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max)
}

const round = (value: number): number => Math.round(value)

const formatAlpha = (alpha: number): string => Number(alpha.toFixed(3)).toString()

export function normalizeRgb(color: RgbColor): Required<RgbColor> {
  return {
    r: round(clamp(color.r, 0, 255)),
    g: round(clamp(color.g, 0, 255)),
    b: round(clamp(color.b, 0, 255)),
    a: clamp(color.a ?? 1, 0, 1),
  }
}

export function normalizeHsb(color: HsbColor): Required<HsbColor> {
  return {
    h: round(((color.h % 360) + 360) % 360),
    s: round(clamp(color.s, 0, 100)),
    b: round(clamp(color.b, 0, 100)),
    a: clamp(color.a ?? 1, 0, 1),
  }
}

export function rgbToHsb(color: RgbColor): Required<HsbColor> {
  const { r, g, b, a } = normalizeRgb(color)
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let hue = 0

  if (delta !== 0) {
    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6)
    } else if (max === green) {
      hue = 60 * ((blue - red) / delta + 2)
    } else {
      hue = 60 * ((red - green) / delta + 4)
    }
  }

  if (hue < 0) {
    hue += 360
  }

  return normalizeHsb({
    h: hue,
    s: max === 0 ? 0 : (delta / max) * 100,
    b: max * 100,
    a,
  })
}

export function hsbToRgb(color: HsbColor): Required<RgbColor> {
  const { h, s, b, a } = normalizeHsb(color)
  const saturation = s / 100
  const brightness = b / 100
  const chroma = brightness * saturation
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1))
  const match = brightness - chroma

  let red = 0
  let green = 0
  let blue = 0

  if (h < 60) {
    red = chroma
    green = x
  } else if (h < 120) {
    red = x
    green = chroma
  } else if (h < 180) {
    green = chroma
    blue = x
  } else if (h < 240) {
    green = x
    blue = chroma
  } else if (h < 300) {
    red = x
    blue = chroma
  } else {
    red = chroma
    blue = x
  }

  return normalizeRgb({
    r: (red + match) * 255,
    g: (green + match) * 255,
    b: (blue + match) * 255,
    a,
  })
}

const isRgbColor = (value: RgbColor | HsbColor): value is RgbColor =>
  'r' in value && 'g' in value

export class Color {
  private readonly rgb: Required<RgbColor>

  private constructor(color: RgbColor) {
    this.rgb = normalizeRgb(color)
  }

  static fromRgb(color: RgbColor): Color {
    return new Color(color)
  }

  static fromHsb(color: HsbColor): Color {
    return new Color(hsbToRgb(color))
  }

  toHex(): string {
    const { r, g, b } = this.rgb
    return [r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')
  }

  toHexString(): string {
    return `#${this.toHex()}`
  }

  toRgb(): Required<RgbColor> {
    return { ...this.rgb }
  }

  toRgbString(): string {
    const { r, g, b, a } = this.rgb

    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${formatAlpha(a)})`
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  toHsb(): Required<HsbColor> {
    return rgbToHsb(this.rgb)
  }

  toHsbString(): string {
    const { h, s, b, a } = this.toHsb()

    if (a < 1) {
      return `hsba(${h}, ${s}%, ${b}%, ${formatAlpha(a)})`
    }

    return `hsb(${h}, ${s}%, ${b}%)`
  }
}

export function colorFromHsb(color: HsbColor): Color {
  return Color.fromHsb(color)
}

export function colorToCss(color: ColorPickerValue): string {
  const parsed = color instanceof Color ? color : parseColor(color)

  return parsed?.toRgbString() ?? ''
}

function parseHexColor(value: string): Color | undefined {
  const match = value.match(/^#?([\da-f]{3}|[\da-f]{6})$/i)

  if (!match) {
    return undefined
  }

  const hex = match[1]
  const normalized = hex.length === 3
    ? hex.split('').map(char => `${char}${char}`).join('')
    : hex

  return Color.fromRgb({
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
    a: 1,
  })
}

function parseRgbColor(value: string): Color | undefined {
  const match = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i)

  if (!match) {
    return undefined
  }

  return Color.fromRgb({
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  })
}

function parseHsbColor(value: string): Color | undefined {
  const match = value.match(/^hsba?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i)

  if (!match) {
    return undefined
  }

  return Color.fromHsb({
    h: Number(match[1]),
    s: Number(match[2]),
    b: Number(match[3]),
    a: match[4] === undefined ? 1 : Number(match[4]),
  })
}

export function parseColor(value: ColorPickerValue): Color | undefined {
  if (value instanceof Color) {
    return value
  }

  if (typeof value !== 'string') {
    return isRgbColor(value) ? Color.fromRgb(value) : Color.fromHsb(value)
  }

  const trimmedValue = value.trim()

  return parseHexColor(trimmedValue) ?? parseRgbColor(trimmedValue) ?? parseHsbColor(trimmedValue)
}
