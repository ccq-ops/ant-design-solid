import type { Dayjs } from 'dayjs'
import { describe, expect, it } from 'vitest'
import { DatePicker } from '../date-picker'

describe('DatePicker public types', () => {
  it('narrows callback value types by multiple mode', () => {
    const single = (
      <DatePicker
        onChange={(date: Dayjs | null, dateString: string) => {
          date?.format('YYYY-MM-DD')
          dateString.toUpperCase()
        }}
        onOk={(date?: Dayjs | null) => {
          date?.format('YYYY-MM-DD')
        }}
      />
    )

    const multiple = (
      <DatePicker
        multiple
        onChange={(dates: Dayjs[], dateStrings: string[]) => {
          dates.map((date) => date.format('YYYY-MM-DD'))
          dateStrings.map((dateString) => dateString.toUpperCase())
        }}
        onOk={(dates?: Dayjs[]) => {
          dates?.map((date) => date.format('YYYY-MM-DD'))
        }}
      />
    )

    expect(single).toBeTruthy()
    expect(multiple).toBeTruthy()
  })
})
