export type GetProps<T> = T extends (props: infer P) => unknown ? P : T extends object ? T : never

export type GetProp<
  T,
  PropName extends keyof GetProps<T>,
  Type extends 'Default' | 'Return' = 'Default',
> = Type extends 'Default'
  ? NonNullable<GetProps<T>[PropName]>
  : Type extends 'Return'
    ? ReturnType<Extract<NonNullable<GetProps<T>[PropName]>, (...args: never[]) => unknown>>
    : never

export type GetRef<T> =
  GetProps<T> extends { ref?: infer R }
    ? Exclude<R, string | ((value: unknown) => void) | { current?: unknown }> extends never
      ? R extends (value: infer V) => void
        ? V
        : R extends { current?: infer V }
          ? V
          : never
      : Exclude<R, string | ((value: unknown) => void) | { current?: unknown }>
    : never
