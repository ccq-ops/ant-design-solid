import type { JSX } from 'solid-js'
import type {
  TreeSelectLabeledValue,
  TreeSelectRawValue,
  TreeSelectShowCheckedStrategy,
  TreeSelectTreeEntity,
  TreeSelectValue,
} from './interface'
import { findEntityByValue, getEntityLabel } from './tree-data-utils'

interface OutputOptions {
  halfCheckedValues?: TreeSelectRawValue[]
  labelInValue?: boolean
  multiple?: boolean
  treeNodeLabelProp?: string
}

function isLabeledValue(value: unknown): value is TreeSelectLabeledValue {
  return Boolean(value && typeof value === 'object' && 'value' in value)
}

export function rawValues(value: TreeSelectValue): TreeSelectRawValue[] {
  if (value === undefined) return []
  if (Array.isArray(value)) {
    return value.map((item) => (isLabeledValue(item) ? item.value : item))
  }
  return [isLabeledValue(value) ? value.value : value]
}

export function valueEntities(
  entities: TreeSelectTreeEntity[],
  value: TreeSelectValue,
): TreeSelectTreeEntity[] {
  return rawValues(value)
    .map((item) => findEntityByValue(entities, item))
    .filter((entity): entity is TreeSelectTreeEntity => entity !== undefined)
}

function labeledValue(
  entity: TreeSelectTreeEntity,
  options: OutputOptions,
): TreeSelectLabeledValue {
  const label = getEntityLabel(entity, options.treeNodeLabelProp) ?? entity.node.title
  return {
    ...(options.halfCheckedValues?.length ? { halfChecked: options.halfCheckedValues } : {}),
    label,
    value: entity.value,
  }
}

export function outputTreeSelectValue(
  entities: TreeSelectTreeEntity[],
  options: OutputOptions = {},
): TreeSelectValue {
  const multiple = Boolean(options.multiple)
  if (options.labelInValue) {
    const labeled = entities.map((entity) => labeledValue(entity, options))
    return multiple ? labeled : labeled[0]
  }
  const values = entities.map((entity) => entity.value)
  return multiple ? values : values[0]
}

function hasCheckedAncestor(
  entity: TreeSelectTreeEntity,
  checked: Set<TreeSelectTreeEntity>,
): boolean {
  let parent = entity.parent
  while (parent) {
    if (checked.has(parent)) return true
    parent = parent.parent
  }
  return false
}

function hasCheckedChildren(
  entity: TreeSelectTreeEntity,
  checked: Set<TreeSelectTreeEntity>,
): boolean {
  return entity.children.some((child) => checked.has(child) || hasCheckedChildren(child, checked))
}

export function displayEntitiesByStrategy(
  entities: TreeSelectTreeEntity[],
  strategy: TreeSelectShowCheckedStrategy,
): TreeSelectTreeEntity[] {
  const checked = new Set(entities)
  if (strategy === 'SHOW_ALL') return entities
  if (strategy === 'SHOW_PARENT') {
    return entities.filter((entity) => !hasCheckedAncestor(entity, checked))
  }
  return entities.filter((entity) => !hasCheckedChildren(entity, checked))
}

export function truncateTreeSelectLabel(label: JSX.Element, maxLength?: number): JSX.Element {
  if (!maxLength) return label
  const text = typeof label === 'string' || typeof label === 'number' ? String(label) : undefined
  if (!text || text.length <= maxLength) return label
  return `${text.slice(0, maxLength)}...`
}

export function treeSelectLabels(
  entities: TreeSelectTreeEntity[],
  treeNodeLabelProp?: string,
): JSX.Element | JSX.Element[] | undefined {
  const labels = entities.map(
    (entity) => getEntityLabel(entity, treeNodeLabelProp) ?? entity.node.title,
  )
  return labels.length > 1 ? labels : labels[0]
}
