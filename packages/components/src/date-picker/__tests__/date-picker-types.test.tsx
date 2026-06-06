import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { DatePicker, RangePicker } from '../date-picker'

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

  it('narrows preset value shapes by picker kind', () => {
    const singlePreset = <DatePicker presets={[{ label: 'Single', value: dayjs('2026-06-01') }]} />
    const rangePreset = (
      <RangePicker
        presets={[{ label: 'Range', value: [dayjs('2026-06-01'), dayjs('2026-06-30')] }]}
      />
    )
    const rangeCallbackPreset = (
      <RangePicker
        presets={[
          {
            label: 'Range callback',
            value: () => [dayjs('2026-06-01'), () => dayjs('2026-06-30')],
          },
        ]}
      />
    )
    const nextWeekPreset = (
      <RangePicker
        presets={[{ label: 'Next week', value: () => [dayjs(), () => dayjs().add(7, 'day')] }]}
      />
    )
    const badSinglePreset = (
      // @ts-expect-error DatePicker presets do not accept ranges
      <DatePicker presets={[{ label: 'Bad', value: [dayjs('2026-06-01'), dayjs('2026-06-30')] }]} />
    )
    const badRangePreset = (
      // @ts-expect-error RangePicker presets do not accept single values
      <RangePicker presets={[{ label: 'Bad', value: dayjs('2026-06-01') }]} />
    )

    expect(singlePreset).toBeTruthy()
    expect(rangePreset).toBeTruthy()
    expect(rangeCallbackPreset).toBeTruthy()
    expect(nextWeekPreset).toBeTruthy()
    expect(badSinglePreset).toBeTruthy()
    expect(badRangePreset).toBeTruthy()
  })

  it('accepts public parity props for single and range pickers', () => {
    const single = (
      <DatePicker
        showWeek
        previewValue={dayjs('2026-06-01')}
        superPrevIcon={<span />}
        superNextIcon={<span />}
        components={{
          input: (props) => <input ref={props.inputRef} value={props.value} />,
          panel: (props) => <div>{props.children}</div>,
          date: (props) => <div>{props.children}</div>,
        }}
        onSelect={(date) => date.format('YYYY-MM-DD')}
      />
    )
    const range = (
      <RangePicker
        picker="month"
        previewValue={[dayjs('2026-06-01'), dayjs('2026-06-30')]}
        superPrevIcon={<span />}
        superNextIcon={<span />}
        components={{ input: (props) => <input ref={props.inputRef} value={props.value} /> }}
        onSelect={(date) => date.format('YYYY-MM-DD')}
      />
    )

    expect(single).toBeTruthy()
    expect(range).toBeTruthy()
  })
})
