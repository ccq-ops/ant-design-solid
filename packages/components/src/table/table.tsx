import { For, Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTableStyle } from './table.style'
import type { JSX } from 'solid-js'
import type { TableColumn, TableProps } from './interface'

function getValue<T extends object>(record: T, dataIndex: keyof T | string | undefined) {
  if (!dataIndex) return undefined
  return (record as Record<string, unknown>)[String(dataIndex)]
}

function getColumnKey<T extends object>(column: TableColumn<T>, index: number) {
  return column.key ?? String(column.dataIndex ?? index)
}

function getRowKey<T extends object>(record: T, index: number, rowKey: TableProps<T>['rowKey']) {
  if (typeof rowKey === 'function') return rowKey(record, index)
  if (rowKey) return String((record as Record<string, unknown>)[String(rowKey)])
  if ('key' in record && record.key != null) return String(record.key)
  return String(index)
}

export function Table<T extends object = object>(props: TableProps<T>) {
  const [local, rest] = splitProps(props, [
    'columns',
    'dataSource',
    'rowKey',
    'loading',
    'emptyText',
    'size',
    'bordered',
    'showHeader',
    'onRow',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-table`
  const [, hashId] = useTableStyle(prefixCls())
  const columns = () => local.columns ?? []
  const data = () => local.dataSource ?? []
  const size = () => local.size ?? 'middle'

  return (
    <div
      {...rest}
      class={classNames(
        `${prefixCls()}-wrapper`,
        `${prefixCls()}-${size()}`,
        local.bordered && `${prefixCls()}-bordered`,
        local.loading && `${prefixCls()}-loading`,
        hashId(),
        local.class,
      )}
    >
      <table class={prefixCls()}>
        <Show when={local.showHeader !== false}>
          <thead>
            <tr>
              <For each={columns()}>
                {(column, index) => (
                  <th
                    class={classNames(
                      column.align === 'center' && `${prefixCls()}-cell-center`,
                      column.align === 'right' && `${prefixCls()}-cell-right`,
                      column.class,
                    )}
                    classList={column.classList}
                    style={{ width: typeof column.width === 'number' ? `${column.width}px` : column.width }}
                    data-column-key={getColumnKey(column, index())}
                  >
                    {column.title}
                  </th>
                )}
              </For>
            </tr>
          </thead>
        </Show>
        <tbody>
          <Show
            when={data().length > 0}
            fallback={
              <tr>
                <td class={`${prefixCls()}-empty`} colspan={Math.max(columns().length, 1)}>
                  {local.emptyText ?? 'No data'}
                </td>
              </tr>
            }
          >
            <For each={data()}>
              {(record, index) => {
                const rowProps = () => local.onRow?.(record, index()) ?? {}
                return (
                  <tr {...rowProps()} data-row-key={getRowKey(record, index(), local.rowKey)}>
                    <For each={columns()}>
                      {(column) => {
                        const value = () => getValue(record, column.dataIndex)
                        return (
                          <td
                            class={classNames(
                              column.align === 'center' && `${prefixCls()}-cell-center`,
                              column.align === 'right' && `${prefixCls()}-cell-right`,
                              column.class,
                            )}
                            classList={column.classList}
                          >
                            {column.render ? column.render(value(), record, index()) : (value() as JSX.Element)}
                          </td>
                        )
                      }}
                    </For>
                  </tr>
                )
              }}
            </For>
          </Show>
        </tbody>
      </table>
      <Show when={local.loading}>
        <div class={`${prefixCls()}-loading-indicator`}>Loading...</div>
      </Show>
    </div>
  )
}
