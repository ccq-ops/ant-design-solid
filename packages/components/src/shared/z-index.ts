const baseZIndex = 1000
const zIndexStep = 10
let currentZIndex = baseZIndex - zIndexStep

export function allocateZIndex() {
  currentZIndex += zIndexStep
  return currentZIndex
}

export function resetZIndexForTests() {
  currentZIndex = baseZIndex - zIndexStep
}
