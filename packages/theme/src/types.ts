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
}

export interface ThemeConfig {
  token?: Partial<SeedToken>
  components?: { [K in keyof ComponentTokenMap]?: Partial<ComponentTokenMap[K]> }
}
