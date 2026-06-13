import type { Accessor, JSX } from 'solid-js'
import type {
  AliasToken,
  ComponentSize,
  ThemeConfig as AntDesignSolidThemeConfig,
} from '@ant-design-solid/theme'
import type { AlertProps } from '../alert/interface'
import type { AnchorProps } from '../anchor/interface'
import type { BreadcrumbProps } from '../breadcrumb/interface'
import type { ButtonProps } from '../button/interface'
import type { CardMetaProps, CardProps } from '../card/interface'
import type { CascaderProps } from '../cascader/interface'
import type { CheckboxProps } from '../checkbox/interface'
import type { CollapseProps } from '../collapse/interface'
import type { ColorPickerProps } from '../color-picker/interface'
import type { DatePickerProps, RangePickerProps } from '../date-picker/interface'
import type { DescriptionsProps } from '../descriptions/interface'
import type { DividerProps } from '../divider/interface'
import type { DrawerProps } from '../drawer/interface'
import type { DropdownProps } from '../dropdown/interface'
import type { EmptyProps } from '../empty/interface'
import type { FlexProps } from '../flex/interface'
import type { FloatButtonGroupProps, FloatButtonProps } from '../float-button/interface'
import type { FormProps } from '../form/interface'
import type { ImageProps } from '../image/interface'
import type { InputNumberProps } from '../input-number/interface'
import type { InputProps, OTPProps, PasswordProps, SearchProps, TextAreaProps } from '../input'
import type { ListItemProps } from '../list/interface'
import type { MasonryProps } from '../masonry/interface'
import type { MentionsProps } from '../mentions/interface'
import type { MenuProps } from '../menu/interface'
import type { MessageConfigOptions } from '../message/interface'
import type { ModalProps } from '../modal/interface'
import type { NotificationConfig } from '../notification/interface'
import type { PaginationProps } from '../pagination/interface'
import type { PopconfirmProps } from '../popconfirm/interface'
import type { PopoverProps } from '../popover/interface'
import type { QRCodeProps } from '../qrcode/interface'
import type { RadioProps } from '../radio/interface'
import type { ResultProps } from '../result/interface'
import type { SegmentedProps } from '../segmented/interface'
import type { SelectProps } from '../select/interface'
import type { SkeletonProps } from '../skeleton/interface'
import type { SliderProps } from '../slider/interface'
import type { SpaceProps } from '../space/interface'
import type { SpinProps } from '../spin/interface'
import type { SplitterProps } from '../splitter/interface'
import type { StatisticProps } from '../statistic/interface'
import type { StepsProps } from '../steps/interface'
import type { SwitchProps } from '../switch/interface'
import type { TableProps } from '../table/interface'
import type { TabsProps } from '../tabs/interface'
import type { TagProps } from '../tag/interface'
import type { TimePickerProps } from '../time-picker/interface'
import type { TimelineProps } from '../timeline/interface'
import type { TooltipProps } from '../tooltip/interface'
import type { TourProps } from '../tour/interface'
import type { TransferProps } from '../transfer/interface'
import type { TreeProps } from '../tree/interface'
import type { TreeSelectProps } from '../tree-select/interface'
import type { TypographyProps } from '../typography/interface'
import type { UploadProps } from '../upload/interface'

export type DirectionType = 'ltr' | 'rtl'
export type PopupOverflow = 'viewport' | 'scroll'
export type Variant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type TriggerType = 'click' | 'pointerdown' | 'pointerup' | 'mousedown' | 'mouseup'
export type ThemeConfig = AntDesignSolidThemeConfig

export interface CSPConfig {
  nonce?: string
}

export interface Locale {
  locale?: string
  [key: string]: unknown
}

export interface WarningConfig {
  strict?: boolean
}

export interface ComponentStyleConfig {
  class?: string
  style?: JSX.CSSProperties
}

type PickProps<T, K extends PropertyKey> = Pick<T, Extract<keyof T, K>>

export interface WaveConfig {
  disabled?: boolean
  showEffect?: (
    element: HTMLElement,
    info: { className: string; token: AliasToken; component?: string },
  ) => void
  triggerType?: TriggerType
}

export type RenderEmptyHandler = (componentName?: string) => JSX.Element

export type AlertConfig = ComponentStyleConfig &
  PickProps<AlertProps, 'closable'> & {
    closeIcon?: JSX.Element
    successIcon?: JSX.Element
    infoIcon?: JSX.Element
    warningIcon?: JSX.Element
    errorIcon?: JSX.Element
  }
export type AnchorConfig = ComponentStyleConfig & PickProps<AnchorProps, 'classNames' | 'styles'>
export type BadgeConfig = ComponentStyleConfig
export type BorderBeamConfig = ComponentStyleConfig
export type BreadcrumbConfig = ComponentStyleConfig & PickProps<BreadcrumbProps, 'separator'>
export type ButtonConfig = ComponentStyleConfig &
  PickProps<
    ButtonProps,
    'autoInsertSpace' | 'variant' | 'color' | 'shape' | 'classNames' | 'styles'
  > & {
    loadingIcon?: JSX.Element
  }
export type CalendarConfig = ComponentStyleConfig
export type CardConfig = ComponentStyleConfig &
  PickProps<CardProps, 'classNames' | 'styles' | 'variant'>
export type CardMetaConfig = ComponentStyleConfig &
  PickProps<CardMetaProps, 'classNames' | 'styles'>
export type CascaderConfig = ComponentStyleConfig &
  PickProps<CascaderProps, 'variant' | 'loadingIcon' | 'removeIcon' | 'allowClear'> & {
    clearIcon?: JSX.Element
    searchIcon?: JSX.Element
    expandIcon?: JSX.Element
  }
export type CheckboxConfig = ComponentStyleConfig &
  PickProps<CheckboxProps, 'classNames' | 'styles'>
export type CollapseConfig = ComponentStyleConfig &
  Partial<PickProps<CollapseProps, 'expandIconPosition'>>
export type ColorPickerConfig = ComponentStyleConfig & PickProps<ColorPickerProps, 'allowClear'>
export type DatePickerConfig = ComponentStyleConfig &
  PickProps<DatePickerProps, 'variant' | 'classNames' | 'styles' | 'suffixIcon' | 'allowClear'> & {
    clearIcon?: JSX.Element
  }
export type RangePickerConfig = ComponentStyleConfig &
  PickProps<RangePickerProps, 'variant' | 'separator'>
export type DescriptionsConfig = ComponentStyleConfig &
  PickProps<DescriptionsProps, 'classNames' | 'styles'>
export type DividerConfig = ComponentStyleConfig & PickProps<DividerProps, 'classNames' | 'styles'>
export type DrawerConfig = ComponentStyleConfig &
  PickProps<
    DrawerProps,
    'classNames' | 'styles' | 'closeIcon' | 'closable' | 'mask' | 'focusable'
  > & {
    rootClass?: string
    rootStyle?: JSX.CSSProperties
  }
export type DropdownConfig = ComponentStyleConfig &
  PickProps<DropdownProps, 'classNames' | 'styles'>
export type EmptyConfig = ComponentStyleConfig &
  PickProps<EmptyProps, 'image' | 'classNames' | 'styles'>
export type FlexConfig = ComponentStyleConfig & PickProps<FlexProps, 'vertical'>
export type FloatButtonConfig = ComponentStyleConfig &
  PickProps<FloatButtonProps, 'classNames' | 'styles'> & {
    backTopIcon?: JSX.Element
  }
export type FloatButtonGroupConfig = ComponentStyleConfig &
  PickProps<FloatButtonGroupProps, 'closeIcon' | 'classNames' | 'styles'>
export type FormConfig = ComponentStyleConfig &
  PickProps<
    FormProps,
    | 'requiredMark'
    | 'colon'
    | 'scrollToFirstError'
    | 'validateMessages'
    | 'variant'
    | 'disabled'
    | 'size'
    | 'classNames'
    | 'styles'
    | 'tooltip'
    | 'labelAlign'
  >
export type ImageConfig = ComponentStyleConfig &
  PickProps<ImageProps, 'classNames' | 'styles' | 'fallback'> & {
    preview?: PickProps<NonNullable<Exclude<ImageProps['preview'], boolean>>, 'closeIcon'> &
      PickProps<ImageProps, 'classNames' | 'styles'> & { mask?: unknown }
  }
export type InputConfig = ComponentStyleConfig &
  PickProps<InputProps, 'autoComplete' | 'classNames' | 'styles' | 'allowClear' | 'variant'>
export type InputPasswordConfig = ComponentStyleConfig &
  PickProps<PasswordProps, 'classNames' | 'styles' | 'iconRender'>
export type InputSearchConfig = ComponentStyleConfig &
  PickProps<SearchProps, 'classNames' | 'styles' | 'searchIcon'>
export type OTPConfig = ComponentStyleConfig & PickProps<OTPProps, 'classNames' | 'styles'>
export type InputNumberConfig = ComponentStyleConfig &
  PickProps<InputNumberProps, 'variant' | 'classNames' | 'styles'>
export interface ListConfig extends ComponentStyleConfig {
  item?: PickProps<ListItemProps, 'classNames' | 'styles'>
}
export type MasonryConfig = ComponentStyleConfig & PickProps<MasonryProps, 'classNames' | 'styles'>
export type MentionsProviderConfig = ComponentStyleConfig &
  PickProps<MentionsProps, 'variant' | 'classNames' | 'styles' | 'allowClear'>
export type MenuConfig = ComponentStyleConfig &
  PickProps<MenuProps, 'expandIcon' | 'classNames' | 'styles'>
export type MessageConfig = ComponentStyleConfig &
  PickProps<MessageConfigOptions, 'className' | 'classNames' | 'styles'>
export type ModalConfig = ComponentStyleConfig &
  PickProps<
    ModalProps,
    | 'classNames'
    | 'styles'
    | 'closeIcon'
    | 'closable'
    | 'centered'
    | 'okButtonProps'
    | 'cancelButtonProps'
    | 'mask'
    | 'focusable'
  > & {
    infoIcon?: JSX.Element
    successIcon?: JSX.Element
    errorIcon?: JSX.Element
    warningIcon?: JSX.Element
  }
export type NotificationConfigProvider = ComponentStyleConfig &
  PickProps<NotificationConfig, 'closeIcon' | 'classNames' | 'styles'>
export type PaginationConfig = ComponentStyleConfig &
  PickProps<
    PaginationProps,
    'showSizeChanger' | 'totalBoundaryShowSizeChanger' | 'classNames' | 'styles'
  >
export type PopconfirmConfig = PickProps<
  PopconfirmProps,
  'class' | 'style' | 'styles' | 'classNames' | 'arrow' | 'trigger'
>
export type PopoverConfig = PickProps<
  PopoverProps,
  'class' | 'style' | 'styles' | 'classNames' | 'arrow' | 'trigger'
>
export type ProgressConfig = ComponentStyleConfig
export type QRcodeConfig = ComponentStyleConfig & PickProps<QRCodeProps, 'classNames' | 'styles'>
export type RadioConfig = ComponentStyleConfig & PickProps<RadioProps, 'classNames' | 'styles'>
export type ResultConfig = ComponentStyleConfig & PickProps<ResultProps, 'classNames' | 'styles'>
export type RibbonConfig = ComponentStyleConfig
export type SegmentedConfig = ComponentStyleConfig &
  PickProps<SegmentedProps, 'classNames' | 'styles'>
export type SelectConfig = ComponentStyleConfig &
  PickProps<
    SelectProps,
    | 'showSearch'
    | 'variant'
    | 'classNames'
    | 'styles'
    | 'allowClear'
    | 'clearIcon'
    | 'loadingIcon'
    | 'menuItemSelectedIcon'
    | 'removeIcon'
    | 'suffixIcon'
  >
export type SkeletonConfig = ComponentStyleConfig &
  PickProps<SkeletonProps, 'classNames' | 'styles'>
export type SliderConfig = ComponentStyleConfig & PickProps<SliderProps, 'classNames' | 'styles'>
export type SpaceConfig = ComponentStyleConfig &
  PickProps<SpaceProps, 'size' | 'classNames' | 'styles'>
export type SpinConfig = ComponentStyleConfig &
  PickProps<SpinProps, 'indicator' | 'classNames' | 'styles'>
export type SplitterConfig = ComponentStyleConfig &
  PickProps<SplitterProps, 'classNames' | 'styles'>
export type StatisticConfig = ComponentStyleConfig &
  PickProps<StatisticProps, 'classNames' | 'styles'>
export type StepsConfig = ComponentStyleConfig & PickProps<StepsProps, 'classNames' | 'styles'>
export type SwitchConfig = ComponentStyleConfig & PickProps<SwitchProps, 'classNames' | 'styles'>
export type TableConfig<RecordType extends object = object> = ComponentStyleConfig &
  PickProps<TableProps<RecordType>, 'rowKey' | 'scroll' | 'className'> & {
    expandable?: {
      expandIcon?: JSX.Element
    }
  }
export type TabsConfig = ComponentStyleConfig &
  PickProps<TabsProps, 'indicator' | 'more' | 'addIcon' | 'removeIcon' | 'classNames' | 'styles'>
export type TagConfig = ComponentStyleConfig &
  PickProps<TagProps, 'variant' | 'closeIcon' | 'closable' | 'classNames' | 'styles'>
export type TextAreaConfig = ComponentStyleConfig &
  PickProps<TextAreaProps, 'autoComplete' | 'classNames' | 'styles' | 'allowClear' | 'variant'>
export type TimePickerConfig = ComponentStyleConfig &
  PickProps<TimePickerProps, 'variant' | 'classNames' | 'styles' | 'suffixIcon' | 'allowClear'> & {
    clearIcon?: JSX.Element
  }
export type TimelineConfig = ComponentStyleConfig &
  PickProps<TimelineProps, 'classNames' | 'styles'>
export type TooltipConfig = PickProps<
  TooltipProps,
  'class' | 'style' | 'styles' | 'classNames' | 'arrow' | 'trigger'
> & {
  unique?: boolean
}
export type TourConfig = ComponentStyleConfig &
  PickProps<TourProps, 'closeIcon' | 'classNames' | 'styles'>
export type TransferConfig = ComponentStyleConfig &
  PickProps<TransferProps, 'selectionsIcon' | 'classNames' | 'styles'>
export type TreeConfig = ComponentStyleConfig & PickProps<TreeProps, 'classNames' | 'styles'>
export type TreeSelectConfig = ComponentStyleConfig &
  PickProps<TreeSelectProps, 'variant' | 'classNames' | 'styles' | 'switcherIcon'>
export type TypographyConfig = ComponentStyleConfig &
  PickProps<TypographyProps, 'classNames' | 'styles'>
export type UploadConfig = ComponentStyleConfig &
  PickProps<UploadProps, 'classNames' | 'styles' | 'customRequest' | 'progress' | 'accept'>
export type WatermarkConfig = ComponentStyleConfig

export interface ConfigComponentProps {
  affix?: ComponentStyleConfig
  alert?: AlertConfig
  anchor?: AnchorConfig
  app?: ComponentStyleConfig
  avatar?: ComponentStyleConfig
  badge?: BadgeConfig
  borderBeam?: BorderBeamConfig
  breadcrumb?: BreadcrumbConfig
  button?: ButtonConfig
  calendar?: CalendarConfig
  card?: CardConfig
  cardMeta?: CardMetaConfig
  carousel?: ComponentStyleConfig
  cascader?: CascaderConfig
  checkbox?: CheckboxConfig
  collapse?: CollapseConfig
  colorPicker?: ColorPickerConfig
  datePicker?: DatePickerConfig
  rangePicker?: RangePickerConfig
  descriptions?: DescriptionsConfig
  divider?: DividerConfig
  drawer?: DrawerConfig
  dropdown?: DropdownConfig
  empty?: EmptyConfig
  flex?: FlexConfig
  floatButton?: FloatButtonConfig
  floatButtonGroup?: FloatButtonGroupConfig
  form?: FormConfig
  image?: ImageConfig
  input?: InputConfig
  inputPassword?: InputPasswordConfig
  inputSearch?: InputSearchConfig
  otp?: OTPConfig
  inputNumber?: InputNumberConfig
  textArea?: TextAreaConfig
  layout?: ComponentStyleConfig
  list?: ListConfig
  masonry?: MasonryConfig
  mentions?: MentionsProviderConfig
  menu?: MenuConfig
  message?: MessageConfig
  modal?: ModalConfig
  notification?: NotificationConfigProvider
  pagination?: PaginationConfig
  popconfirm?: PopconfirmConfig
  popover?: PopoverConfig
  progress?: ProgressConfig
  qrcode?: QRcodeConfig
  radio?: RadioConfig
  rate?: ComponentStyleConfig
  result?: ResultConfig
  ribbon?: RibbonConfig
  segmented?: SegmentedConfig
  select?: SelectConfig
  skeleton?: SkeletonConfig
  slider?: SliderConfig
  space?: SpaceConfig
  spin?: SpinConfig
  splitter?: SplitterConfig
  statistic?: StatisticConfig
  steps?: StepsConfig
  switch?: SwitchConfig
  table?: TableConfig
  tabs?: TabsConfig
  tag?: TagConfig
  timeline?: TimelineConfig
  timePicker?: TimePickerConfig
  tooltip?: TooltipConfig
  tour?: TourConfig
  transfer?: TransferConfig
  tree?: TreeConfig
  treeSelect?: TreeSelectConfig
  typography?: TypographyConfig
  upload?: UploadConfig
  watermark?: WatermarkConfig
}

export interface ConfigProviderProps extends ConfigComponentProps {
  getTargetContainer?: () => HTMLElement | Window | ShadowRoot
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  prefixCls?: string
  iconPrefixCls?: string
  children?: JSX.Element
  renderEmpty?: RenderEmptyHandler
  csp?: CSPConfig
  variant?: Variant
  locale?: Locale
  componentSize?: ComponentSize
  componentDisabled?: boolean
  direction?: DirectionType
  virtual?: boolean
  popupMatchSelectWidth?: boolean | number
  popupOverflow?: PopupOverflow
  theme?: ThemeConfig
  warning?: WarningConfig
  wave?: WaveConfig
}

export interface GlobalConfigProps {
  prefixCls?: string
  iconPrefixCls?: string
  theme?: ThemeConfig
  holderRender?: (children: JSX.Element) => JSX.Element
}

export type ConfigContextValue = {
  prefixCls: Accessor<string>
  iconPrefixCls: Accessor<string>
  componentSize: Accessor<ComponentSize>
  componentDisabled: Accessor<boolean>
  direction: Accessor<DirectionType>
  theme: Accessor<ThemeConfig>
  token: Accessor<AliasToken>
  getTargetContainer?: () => HTMLElement | Window | ShadowRoot
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  renderEmpty?: RenderEmptyHandler
  csp: Accessor<CSPConfig>
  variant: Accessor<Variant>
  locale: Accessor<Locale | undefined>
  virtual: Accessor<boolean>
  popupMatchSelectWidth: Accessor<boolean | number | undefined>
  popupOverflow: Accessor<PopupOverflow>
  warning: Accessor<WarningConfig>
  wave: Accessor<WaveConfig>
} & {
  [K in keyof ConfigComponentProps]-?: Accessor<NonNullable<ConfigComponentProps[K]>>
}
