const primaryMap: Record<string, { hover: string; active: string }> = {
  '#1677ff': { hover: '#4096ff', active: '#0958d9' },
  '#722ed1': { hover: '#9254de', active: '#531dab' },
}

export function getPrimaryHover(colorPrimary: string): string { return primaryMap[colorPrimary]?.hover ?? colorPrimary }
export function getPrimaryActive(colorPrimary: string): string { return primaryMap[colorPrimary]?.active ?? colorPrimary }
