import { Dropdown as InternalDropdown } from './dropdown'
import { DropdownButton } from './dropdown-button'

export const Dropdown = Object.assign(InternalDropdown, { Button: DropdownButton })
export { DropdownButton }
export type {
  DropdownArrow,
  DropdownButtonProps,
  DropdownButtonType,
  DropdownMenuClickInfo,
  DropdownMenuItem,
  DropdownMenuProps,
  DropdownOpenChangeSource,
  DropdownPlacement,
  DropdownProps,
  DropdownSemanticClassNames,
  DropdownSemanticClassNamesConfig,
  DropdownSemanticSlot,
  DropdownSemanticStyles,
  DropdownSemanticStylesConfig,
  DropdownTrigger,
  DropdownTriggerInput,
} from './interface'
