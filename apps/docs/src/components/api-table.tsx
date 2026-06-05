import type { JSX } from 'solid-js'

export type ApiTableRow = {
  property: string
  description: JSX.Element
  type: string
  defaultValue?: string
}

export type ApiTableProps = {
  rows: ApiTableRow[]
  'aria-label'?: string
}

export function ApiTable(props: ApiTableProps) {
  return (
    <div class="my-4 overflow-x-auto rounded-lg border border-gray-200">
      <table class="w-full border-collapse text-left text-sm" aria-label={props['aria-label']}>
        <thead class="bg-slate-50 text-gray-600">
          <tr>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Property</th>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Description</th>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Type</th>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Default</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr>
              <td class="border-b border-gray-100 px-4 py-3 align-top">
                <code>{row.property}</code>
              </td>
              <td class="border-b border-gray-100 px-4 py-3 align-top text-gray-700">
                {row.description}
              </td>
              <td class="border-b border-gray-100 px-4 py-3 align-top">
                <code>{row.type}</code>
              </td>
              <td class="border-b border-gray-100 px-4 py-3 align-top">
                <code>{row.defaultValue ?? '-'}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
