export type ComponentSize = 'small' | 'medium' | 'middle' | 'large'

export type TokenValue = string | number | boolean | undefined

export interface TokenRecord {
  [key: string]: TokenValue
}

export interface PresetColorToken {
  blue: string
  purple: string
  cyan: string
  green: string
  magenta: string
  pink: string
  red: string
  orange: string
  yellow: string
  volcano: string
  geekblue: string
  lime: string
  gold: string
}

export interface SeedToken extends PresetColorToken, TokenRecord {
  colorPrimary: string
  colorSuccess: string
  colorWarning: string
  colorError: string
  colorInfo: string
  colorLink: string
  colorTextBase: string
  colorBgBase: string
  fontFamily: string
  fontFamilyCode: string
  fontSize: number
  lineWidth: number
  lineType: string
  motionUnit: number
  motionBase: number
  motionEaseOutCirc: string
  motionEaseInOutCirc: string
  motionEaseOut: string
  motionEaseInOut: string
  motionEaseOutBack: string
  motionEaseInBack: string
  motionEaseInQuint: string
  motionEaseOutQuint: string
  borderRadius: number
  sizeUnit: number
  sizeStep: number
  sizePopupArrow: number
  controlHeight: number
  zIndexBase: number
  zIndexPopupBase: number
  opacityImage: number
  wireframe: boolean
  motion: boolean
}

export interface AliasToken extends SeedToken {
  colorPrimaryBg: string
  colorPrimaryBgHover: string
  colorPrimaryBorder: string
  colorPrimaryBorderHover: string
  colorPrimaryHover: string
  colorPrimaryActive: string
  colorPrimaryTextHover: string
  colorPrimaryText: string
  colorPrimaryTextActive: string
  colorSuccessBg: string
  colorSuccessBgHover: string
  colorSuccessBorder: string
  colorSuccessBorderHover: string
  colorSuccessHover: string
  colorSuccessActive: string
  colorSuccessTextHover: string
  colorSuccessText: string
  colorSuccessTextActive: string
  colorErrorBg: string
  colorErrorBgHover: string
  colorErrorBgFilledHover: string
  colorErrorBgActive: string
  colorErrorBorder: string
  colorErrorBorderHover: string
  colorErrorHover: string
  colorErrorActive: string
  colorErrorTextHover: string
  colorErrorText: string
  colorErrorTextActive: string
  colorWarningBg: string
  colorWarningBgHover: string
  colorWarningBorder: string
  colorWarningBorderHover: string
  colorWarningHover: string
  colorWarningActive: string
  colorWarningTextHover: string
  colorWarningText: string
  colorWarningTextActive: string
  colorInfoBg: string
  colorInfoBgHover: string
  colorInfoBorder: string
  colorInfoBorderHover: string
  colorInfoHover: string
  colorInfoActive: string
  colorInfoTextHover: string
  colorInfoText: string
  colorInfoTextActive: string
  colorLinkHover: string
  colorLinkActive: string
  colorText: string
  colorTextSecondary: string
  colorTextTertiary: string
  colorTextQuaternary: string
  colorTextDisabled: string
  colorTextPlaceholder: string
  colorTextHeading: string
  colorTextLabel: string
  colorTextDescription: string
  colorTextLightSolid: string
  colorIcon: string
  colorIconHover: string
  colorBgLayout: string
  colorBgContainer: string
  colorBgElevated: string
  colorBgSpotlight: string
  colorBgMask: string
  colorBgBlur: string
  colorBgSolid: string
  colorBgSolidHover: string
  colorBgSolidActive: string
  colorBgTextHover: string
  colorBgTextActive: string
  colorBgContainerDisabled: string
  colorBorder: string
  colorBorderDisabled: string
  colorBorderSecondary: string
  colorBorderBg: string
  colorSplit: string
  colorFill: string
  colorFillSecondary: string
  colorFillTertiary: string
  colorFillQuaternary: string
  colorFillAlter: string
  colorFillContent: string
  colorFillContentHover: string
  colorHighlight: string
  colorErrorOutline: string
  colorWarningOutline: string
  colorErrorAffix: string
  colorWarningAffix: string
  colorWhite: string
  colorShadow: string
  fontSizeSM: number
  fontSizeLG: number
  fontSizeXL: number
  fontSizeHeading1: number
  fontSizeHeading2: number
  fontSizeHeading3: number
  fontSizeHeading4: number
  fontSizeHeading5: number
  fontSizeIcon: number
  lineHeight: number
  lineHeightSM: number
  lineHeightLG: number
  lineHeightHeading1: number
  lineHeightHeading2: number
  lineHeightHeading3: number
  lineHeightHeading4: number
  lineHeightHeading5: number
  fontHeight: number
  fontHeightSM: number
  fontHeightLG: number
  fontWeightStrong: number
  lineWidthBold: number
  lineWidthFocus: number
  controlOutlineWidth: number
  controlInteractiveSize: number
  controlItemBgHover: string
  controlItemBgActive: string
  controlItemBgActiveHover: string
  controlItemBgActiveDisabled: string
  controlTmpOutline: string
  controlOutline: string
  controlPaddingHorizontal: number
  controlPaddingHorizontalSM: number
  controlHeightXS: number
  controlHeightSM: number
  controlHeightLG: number
  sizeXXS: number
  sizeXS: number
  sizeSM: number
  size: number
  sizeMS: number
  sizeMD: number
  sizeLG: number
  sizeXL: number
  sizeXXL: number
  paddingXXS: number
  paddingXS: number
  paddingSM: number
  padding: number
  paddingMD: number
  paddingLG: number
  paddingXL: number
  paddingContentHorizontalLG: number
  paddingContentVerticalLG: number
  paddingContentHorizontal: number
  paddingContentVertical: number
  paddingContentHorizontalSM: number
  paddingContentVerticalSM: number
  marginXXS: number
  marginXS: number
  marginSM: number
  margin: number
  marginMD: number
  marginLG: number
  marginXL: number
  marginXXL: number
  borderRadiusXS: number
  borderRadiusSM: number
  borderRadiusLG: number
  borderRadiusOuter: number
  motionDurationFast: string
  motionDurationMid: string
  motionDurationSlow: string
  opacityLoading: number
  linkDecoration: string
  linkHoverDecoration: string
  linkFocusDecoration: string
  boxShadow: string
  boxShadowSecondary: string
  boxShadowTertiary: string
  boxShadowPopoverArrow: string
  dropShadowPopover: string
  boxShadowCard: string
  boxShadowDrawerRight: string
  boxShadowDrawerLeft: string
  boxShadowDrawerUp: string
  boxShadowDrawerDown: string
  boxShadowTabsOverflowLeft: string
  boxShadowTabsOverflowRight: string
  boxShadowTabsOverflowTop: string
  boxShadowTabsOverflowBottom: string
  screenXS: number
  screenXSMin: number
  screenXSMax: number
  screenSM: number
  screenSMMin: number
  screenSMMax: number
  screenMD: number
  screenMDMin: number
  screenMDMax: number
  screenLG: number
  screenLGMin: number
  screenLGMax: number
  screenXL: number
  screenXLMin: number
  screenXLMax: number
  screenXXL: number
  screenXXLMin: number
  screenXXLMax: number
  screenXXXL: number
  screenXXXLMin: number
}

export type GlobalToken = AliasToken

export type ThemeAlgorithm = (seed: SeedToken, mapToken?: AliasToken) => AliasToken

export interface ComponentTokenBase extends TokenRecord {}

export interface ButtonComponentToken extends ComponentTokenBase {
  borderRadius: number
  fontWeight: number
  primaryColor: string
  defaultBorderColor: string
  paddingInline: number
}

export interface InputComponentToken extends ComponentTokenBase {
  activeBorderColor: string
  activeBg: string
  activeShadow: string
  addonBg: string
  clearBg: string
  errorActiveShadow: string
  hoverBorderColor: string
  hoverBg: string
  clearIconColor: string
  inputFontSize: number
  inputFontSizeLG: number
  inputFontSizeSM: number
  paddingBlock: number
  paddingBlockLG: number
  paddingBlockSM: number
  paddingInline: number
  paddingInlineLG: number
  paddingInlineSM: number
  warningActiveShadow: string
}

export interface InputNumberComponentToken extends ComponentTokenBase {
  activeBorderColor: string
  activeShadow: string
  addonBg: string
  filledHandleBg: string
  handleActiveBg: string
  handleBg: string
  handleBorderColor: string
  handleFontSize: number
  handleHoverColor: string
  handleVisible: boolean
  handleWidth: number
  hoverBorderColor: string
  inputFontSize: number
  inputFontSizeLG: number
  inputFontSizeSM: number
  paddingBlock: number
  paddingBlockLG: number
  paddingBlockSM: number
  paddingInline: number
  paddingInlineLG: number
  paddingInlineSM: number
}

export interface DatePickerComponentToken extends ComponentTokenBase {
  activeBg: string
  activeBorderColor: string
  activeShadow: string
  addonBg: string
  cellActiveWithRangeBg: string
  cellBgDisabled: string
  cellHoverBg: string
  cellHoverWithRangeBg: string
  cellRangeBorderColor: string
  cellHeight: number
  cellWidth: number
  hoverBg: string
  hoverBorderColor: string
  inputFontSize: number
  inputFontSizeLG: number
  inputFontSizeSM: number
  multipleItemBg: string
  multipleItemBorderColor: string
  multipleItemHeight: number
  multipleItemHeightLG: number
  multipleItemHeightSM: number
  paddingBlock: number
  paddingBlockLG: number
  paddingBlockSM: number
  paddingInline: number
  paddingInlineLG: number
  paddingInlineSM: number
  presetsWidth: number
  textHeight: number
  timeColumnHeight: number
  timeColumnWidth: number
  withoutTimeCellHeight: number
}

export interface SpaceComponentToken extends ComponentTokenBase {
  gapSmall: number
  gapMiddle: number
  gapLarge: number
}
export interface FlexComponentToken extends ComponentTokenBase {
  flexGapSM: number
  flexGap: number
  flexGapLG: number
}
export interface TypographyComponentToken extends ComponentTokenBase {
  titleMarginBottom: number
  titleFontWeight: number
  paragraphMarginBottom: number
}
export interface GridComponentToken extends ComponentTokenBase {
  columns: number
}

export interface DescriptionsComponentToken extends ComponentTokenBase {
  labelBg: string
  titleMarginBottom: number
  itemPaddingBottom: number
  colonMarginInlineStart: number
  colonMarginInlineEnd: number
  contentColor: string
  labelColor: string
  extraColor: string
  cellPaddingBlock: number
  cellPaddingInline: number
  cellPaddingBlockMD: number
  cellPaddingInlineMD: number
  cellPaddingBlockSM: number
  cellPaddingInlineSM: number
}

export interface FormComponentToken extends ComponentTokenBase {
  /** Required mark color. */
  labelRequiredMarkColor: string
  /** Label color. */
  labelColor: string
  /** Label font size. */
  labelFontSize: number
  /** Label height. */
  labelHeight: number
  /** Label colon margin-inline-start. */
  labelColonMarginInlineStart: number
  /** Label colon margin-inline-end. */
  labelColonMarginInlineEnd: number
  /** Form item margin bottom. */
  itemMarginBottom: number
  /** Inline layout form item margin bottom. */
  inlineItemMarginBottom: number
  /** Vertical layout label padding. */
  verticalLabelPadding: number
  /** Vertical layout label margin. */
  verticalLabelMargin: number
  explainColor: string
  extraColor: string
  feedbackIconSize: number
  feedbackIconMarginInlineStart: number
}

export interface SelectComponentToken extends ComponentTokenBase {
  optionHeight: number
  optionPadding: number
  optionSelectedBg: string
  optionActiveBg: string
  clearIconColor: string
}

export interface CheckboxComponentToken extends ComponentTokenBase {
  size: number
  borderRadius: number
  checkColor: string
}

export interface RadioComponentToken extends ComponentTokenBase {
  size: number
  dotSize: number
}

export interface SwitchComponentToken extends ComponentTokenBase {
  trackHeight: number
  trackMinWidth: number
  handleSize: number
}

export interface AlertComponentToken extends ComponentTokenBase {
  padding: number
  borderRadius: number
  withDescriptionPadding: number
  iconSize: number
  successBg: string
  successBorderColor: string
  infoBg: string
  infoBorderColor: string
  warningBg: string
  warningBorderColor: string
  errorBg: string
  errorBorderColor: string
}

export interface MessageComponentToken extends ComponentTokenBase {
  noticePadding: number
  noticeBorderRadius: number
  contentBg: string
  contentShadow: string
}

export interface NotificationComponentToken extends ComponentTokenBase {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
}

export interface ModalComponentToken extends ComponentTokenBase {
  contentBg: string
  headerBg: string
  titleColor: string
  titleFontSize: number
  borderRadius: number
  boxShadow: string
  maskBg: string
}

export interface DrawerComponentToken extends ComponentTokenBase {
  zIndexPopup: number
  footerPaddingBlock: number
  footerPaddingInline: number
  draggerSize: number
}

export interface PopconfirmComponentToken extends ComponentTokenBase {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
}

export interface TableComponentToken extends ComponentTokenBase {
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

export interface TagComponentToken extends ComponentTokenBase {
  defaultBg: string
  defaultColor: string
  borderColor: string
  borderRadius: number
  paddingInline: number
  fontSize: number
  lineHeight: number
  closeIconColor: string
  successBg: string
  successBorderColor: string
  warningBg: string
  warningBorderColor: string
  errorBg: string
  errorBorderColor: string
  processingBg: string
  processingBorderColor: string
}

export interface BadgeComponentToken extends ComponentTokenBase {
  overflowIndicatorHeight: number
  overflowIndicatorHeightSm: number
  dotSize: number
  textFontSize: number
  textFontSizeSm: number
  colorBg: string
  colorText: string
  statusSize: number
}

export interface FloatButtonComponentToken extends ComponentTokenBase {
  size: number
  iconSize: number
  insetBlockEnd: number
  insetInlineEnd: number
}

export interface TabsComponentToken extends ComponentTokenBase {
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

export interface CardComponentToken extends ComponentTokenBase {
  headerBg: string
  headerFontSize: number
  headerFontSizeSM: number
  headerHeight: number
  headerHeightSM: number
  actionsBg: string
  actionsLiMargin: number
  tabsMarginBottom: number
  extraColor: string
  bodyPadding: number
  bodyPaddingSM: number
  headerPadding: number
  headerPaddingSM: number
  headerBorderBottom: string
}

export interface DividerComponentToken extends ComponentTokenBase {
  textPaddingInline: string | number
  orientationMargin: number
  verticalMarginInline: string | number
}

export interface PopoverComponentToken extends ComponentTokenBase {
  bg: string
  borderRadius: number
  boxShadow: string
  minWidth: number
  maxWidth: number
  paddingBlock: number
  paddingInline: number
}

export interface TooltipComponentToken extends ComponentTokenBase {
  bg: string
  color: string
  borderRadius: number
  paddingBlock: number
  paddingInline: number
  boxShadow: string
  maxWidth: number
}

export interface DropdownComponentToken extends ComponentTokenBase {
  bg: string
  boxShadow: string
  borderRadius: number
  itemColor: string
  itemHoverBg: string
  itemDisabledColor: string
  paddingBlock: number
  dropdownArrowDistance: number
  dropdownEdgeChildPadding: number
  minWidth: number
  zIndexPopup: number
  /** @deprecated Use `paddingBlock` and global control padding tokens instead. */
  itemPaddingBlock: number
  /** @deprecated Use global control padding tokens instead. */
  itemPaddingInline: number
}

export interface TreeComponentToken extends ComponentTokenBase {
  nodeSelectedBg: string
}

export interface TourComponentToken extends ComponentTokenBase {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
  maskBg: string
  targetBorderRadius: number
  zIndex: number
}

export interface LayoutComponentToken extends ComponentTokenBase {
  bodyBg: string
  headerBg: string
  headerColor: string
  headerHeight: number
  headerPadding: string
  footerBg: string
  footerPadding: string
  lightSiderBg: string
  lightTriggerBg: string
  lightTriggerColor: string
  siderBg: string
  triggerBg: string
  triggerColor: string
  triggerHeight: number
  zeroTriggerWidth: number
  zeroTriggerHeight: number
}

export interface MenuComponentToken extends ComponentTokenBase {
  itemBg: string
  itemColor: string
  itemHoverBg: string
  itemHoverColor: string
  itemSelectedBg: string
  itemSelectedColor: string
  itemDisabledColor: string
  groupTitleColor: string
  popupBg: string
  subMenuItemBg: string
  darkItemBg: string
  darkPopupBg: string
  darkSubMenuItemBg: string
  darkItemColor: string
  darkItemHoverColor: string
  darkItemSelectedBg: string
  darkItemSelectedColor: string
  darkItemDisabledColor: string
  darkGroupTitleColor: string
  darkItemDividerBg: string
}

export interface ComponentTokenMap {
  Affix?: ComponentTokenBase
  Addon?: ComponentTokenBase
  Alert: AlertComponentToken
  Anchor?: ComponentTokenBase
  Avatar?: ComponentTokenBase
  BackTop?: ComponentTokenBase
  Badge: BadgeComponentToken
  BorderBeam?: ComponentTokenBase
  Button: ButtonComponentToken
  Breadcrumb?: ComponentTokenBase
  Calendar?: ComponentTokenBase
  Card: CardComponentToken
  Carousel?: ComponentTokenBase
  Cascader?: ComponentTokenBase
  Checkbox: CheckboxComponentToken
  ColorPicker?: ComponentTokenBase
  Collapse?: ComponentTokenBase
  DatePicker: DatePickerComponentToken
  Descriptions: DescriptionsComponentToken
  Divider: DividerComponentToken
  Drawer: DrawerComponentToken
  Dropdown: DropdownComponentToken
  Empty?: ComponentTokenBase
  Flex: FlexComponentToken
  FloatButton: FloatButtonComponentToken
  Form: FormComponentToken
  Grid: GridComponentToken
  Image?: ComponentTokenBase
  Input: InputComponentToken
  InputNumber: InputNumberComponentToken
  Layout: LayoutComponentToken
  List?: ComponentTokenBase
  Masonry?: ComponentTokenBase
  Mentions?: ComponentTokenBase
  Menu: MenuComponentToken
  Message: MessageComponentToken
  Modal: ModalComponentToken
  Notification: NotificationComponentToken
  Pagination?: ComponentTokenBase
  Popconfirm: PopconfirmComponentToken
  Popover: PopoverComponentToken
  Progress?: ComponentTokenBase
  QRCode?: ComponentTokenBase
  Radio: RadioComponentToken
  Rate?: ComponentTokenBase
  Result?: ComponentTokenBase
  Segmented?: ComponentTokenBase
  Select: SelectComponentToken
  Skeleton?: ComponentTokenBase
  Slider?: ComponentTokenBase
  Space: SpaceComponentToken
  Spin?: ComponentTokenBase
  Splitter?: ComponentTokenBase
  Statistic?: ComponentTokenBase
  Steps?: ComponentTokenBase
  Switch: SwitchComponentToken
  Table: TableComponentToken
  Tabs: TabsComponentToken
  Tag: TagComponentToken
  Timeline?: ComponentTokenBase
  Tooltip: TooltipComponentToken
  Tour: TourComponentToken
  Transfer?: ComponentTokenBase
  Tree: TreeComponentToken
  TreeSelect?: ComponentTokenBase
  Typography: TypographyComponentToken
  Upload?: ComponentTokenBase
  Wave?: ComponentTokenBase
}

export type ComponentTokenConfig<T extends ComponentTokenBase | undefined> = Partial<
  NonNullable<T>
> & {
  algorithm?: boolean | ThemeAlgorithm | ThemeAlgorithm[]
}

export interface ThemeConfig {
  algorithm?: ThemeAlgorithm | ThemeAlgorithm[]
  token?: Partial<SeedToken & AliasToken>
  components?: { [K in keyof ComponentTokenMap]?: ComponentTokenConfig<ComponentTokenMap[K]> }
  inherit?: boolean
  hashed?: boolean
  cssVar?:
    | boolean
    | {
        prefix?: string
        key?: string
      }
  zeroRuntime?: boolean
}
