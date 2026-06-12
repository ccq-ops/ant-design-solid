import { Card as InternalCard } from './card'
import { CardGrid } from './card-grid'
import { CardMeta } from './card-meta'
import type { CardComponent } from './interface'

export type {
  CardComponent,
  CardGridProps,
  CardMetaProps,
  CardProps,
  CardSemanticClassNames,
  CardSemanticClassNamesMap,
  CardSemanticStyles,
  CardSemanticStylesMap,
  CardSize,
  CardTabListType,
  CardType,
  CardVariant,
} from './interface'
export { CardGrid } from './card-grid'
export { CardMeta } from './card-meta'

const Card = InternalCard as CardComponent
Card.Grid = CardGrid
Card.Meta = CardMeta

export { Card }
