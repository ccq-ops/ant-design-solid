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

  it('accepts v6 Solid public props and rejects invalid prop combinations', () => {
    const single = (
      <DatePicker
        class="solid-picker"
        size="medium"
        previewValue="hover"
        format={['YYYY-MM-DD', (value) => value.format('YYYY/MM/DD')]}
        classNames={(info) => ({ root: info.props.class, popup: 'popup-slot' })}
        styles={() => ({ popup: { width: '320px' } })}
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
        class="solid-range-picker"
        id={{ start: 'range-start', end: 'range-end' }}
        size="medium"
        previewValue={false}
        disabledDate={(current, info) => {
          info.from?.format('YYYY-MM-DD')
          return current.isBefore(dayjs('2026-01-01'))
        }}
        disabledTime={(date, partial, info) => {
          date?.format('HH:mm:ss')
          partial.toUpperCase()
          info.from?.format('YYYY-MM-DD')
          return {}
        }}
        onChange={(dates, dateStrings) => {
          dates?.[0]?.format('YYYY-MM-DD')
          dateStrings?.[0]?.toUpperCase()
        }}
      />
    )
    const multipleWithShowTime = (
      // @ts-expect-error multiple DatePicker does not support showTime
      <DatePicker multiple showTime />
    )

    expect(single).toBeTruthy()
    expect(range).toBeTruthy()
    expect(multipleWithShowTime).toBeTruthy()
  })
})
