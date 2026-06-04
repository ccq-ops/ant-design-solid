export type ComponentSize = 'small' | 'middle' | 'large'

export interface SeedToken {
  colorPrimary: string
  colorSuccess: string
  colorWarning: string
  colorError: string
  colorInfo: string
  colorTextBase: string
  colorBgBase: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  borderRadius: number
  sizeUnit: number
  sizeStep: number
  controlHeight: number
  motionDurationFast: string
  motionDurationMid: string
  motionEaseInOut: string
  boxShadow: string
}

export interface AliasToken extends SeedToken {
  colorPrimaryHover: string
  colorPrimaryActive: string
  colorText: string
  colorTextSecondary: string
  colorTextDisabled: string
  colorBorder: string
  colorBorderSecondary: string
  colorBgContainer: string
  colorBgElevated: string
  colorFillAlter: string
  lineWidth: number
  controlHeightSM: number
  controlHeightLG: number
  paddingXS: number
  paddingSM: number
  padding: number
  paddingLG: number
  marginXS: number
  marginSM: number
  margin: number
  marginLG: number
}

export type GlobalToken = AliasToken

export type ThemeAlgorithm = (seed: SeedToken) => AliasToken

export interface ButtonComponentToken {
  borderRadius: number
  fontWeight: number
  primaryColor: string
  defaultBorderColor: string
  paddingInline: number
}

export interface InputComponentToken {
  activeBorderColor: string
  hoverBorderColor: string
  clearIconColor: string
  paddingInline: number
}

export interface SpaceComponentToken {
  gapSmall: number
  gapMiddle: number
  gapLarge: number
}
export interface TypographyComponentToken {
  titleMarginBottom: number
  titleFontWeight: number
  paragraphMarginBottom: number
}
export interface GridComponentToken {
  columns: number
}

export interface FormComponentToken {
  labelColor: string
  labelRequiredMarkColor: string
  itemMarginBottom: number
  verticalLabelPadding: number
  explainColor: string
}

export interface SelectComponentToken {
  optionHeight: number
  optionPadding: number
  optionSelectedBg: string
  optionActiveBg: string
  clearIconColor: string
}

export interface CheckboxComponentToken {
  size: number
  borderRadius: number
  checkColor: string
}

export interface RadioComponentToken {
  size: number
  dotSize: number
}

export interface SwitchComponentToken {
  trackHeight: number
  trackMinWidth: number
  handleSize: number
}

export interface AlertComponentToken {
  padding: number
  borderRadius: number
  withDescriptionPadding: number
  iconSize: number
}

export interface MessageComponentToken {
  noticePadding: number
  noticeBorderRadius: number
  contentBg: string
  contentShadow: string
}

export interface NotificationComponentToken {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
}

export interface ModalComponentToken {
  contentBg: string
  headerBg: string
  titleColor: string
  titleFontSize: number
  borderRadius: number
  boxShadow: string
  maskBg: string
}

export interface PopconfirmComponentToken {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
}

export interface TableComponentToken {
  headerBg: string
  headerColor: string
  rowHoverBg: string
  borderColor: string
  cellPadding: number
  cellPaddingSm: number
  cellPaddingLg: number
  borderRadius: number
  emptyColor: string
}

export interface TagComponentToken {
  defaultBg: string
  defaultColor: string
  borderColor: string
  borderRadius: number
  paddingInline: number
  fontSize: number
  lineHeight: number
  closeIconColor: string
}

export interface BadgeComponentToken {
  overflowIndicatorHeight: number
  overflowIndicatorHeightSm: number
  dotSize: number
  textFontSize: number
  textFontSizeSm: number
  colorBg: string
  colorText: string
  statusSize: number
}

export interface TabsComponentToken {
  itemColor: string
  itemSelectedColor: string
  itemHoverColor: string
  itemDisabledColor: string
  inkBarColor: string
  cardBg: string
  cardBorderColor: string
  horizontalItemPadding: number
  horizontalItemPaddingSm: number
  horizontalItemPaddingLg: number
}

export interface PopoverComponentToken {
  bg: string
  borderRadius: number
  boxShadow: string
  minWidth: number
  maxWidth: number
  paddingBlock: number
  paddingInline: number
}

export interface TooltipComponentToken {
  bg: string
  color: string
  borderRadius: number
  paddingBlock: number
  paddingInline: number
  boxShadow: string
  maxWidth: number
}

export interface DropdownComponentToken {
  bg: string
  boxShadow: string
  borderRadius: number
  itemColor: string
  itemHoverBg: string
  itemDisabledColor: string
  itemPaddingBlock: number
  itemPaddingInline: number
  minWidth: number
}

export interface TourComponentToken {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
  maskBg: string
  targetBorderRadius: number
  zIndex: number
}

export interface ComponentTokenMap {
  Button: ButtonComponentToken
  Input: InputComponentToken
  Space: SpaceComponentToken
  Typography: TypographyComponentToken
  Grid: GridComponentToken
  Form: FormComponentToken
  Select: SelectComponentToken
  Checkbox: CheckboxComponentToken
  Radio: RadioComponentToken
  Switch: SwitchComponentToken
  Alert: AlertComponentToken
  Message: MessageComponentToken
  Notification: NotificationComponentToken
  Modal: ModalComponentToken
  Popconfirm: PopconfirmComponentToken
  Table: TableComponentToken
  Tag: TagComponentToken
  Badge: BadgeComponentToken
  Tabs: TabsComponentToken
  Tooltip: TooltipComponentToken
  Popover: PopoverComponentToken
  Dropdown: DropdownComponentToken
  Tour: TourComponentToken
}

export interface ThemeConfig {
  algorithm?: ThemeAlgorithm | ThemeAlgorithm[]
  token?: Partial<SeedToken>
  components?: { [K in keyof ComponentTokenMap]?: Partial<ComponentTokenMap[K]> }
}
