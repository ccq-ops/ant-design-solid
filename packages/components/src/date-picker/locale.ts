import type { DatePickerLocale } from './interface'

export const enUSDatePickerLocale: DatePickerLocale = {
  lang: {
    locale: 'en_US',
    placeholder: 'Select date',
    rangePlaceholder: ['Start date', 'End date'],
    today: 'Today',
    now: 'Now',
    backToToday: 'Back to today',
    ok: 'OK',
    clear: 'Clear',
    clearStart: 'Clear start date',
    clearEnd: 'Clear end date',
    month: 'Month',
    year: 'Year',
    week: 'Week',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    timeSelect: 'Select time',
    dateSelect: 'Select date',
    weekSelect: 'Choose a week',
    monthSelect: 'Choose a month',
    yearSelect: 'Choose a year',
    decadeSelect: 'Choose a decade',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    previousDecade: 'Previous decade',
    nextDecade: 'Next decade',
    previousYears: 'Previous years',
    nextYears: 'Next years',
    previousDecades: 'Previous decades',
    nextDecades: 'Next decades',
    previousCenturies: 'Previous centuries',
    nextCenturies: 'Next centuries',
  },
  timePickerLocale: {},
}

export function mergeDatePickerLocale(locale?: DatePickerLocale): DatePickerLocale {
  return {
    ...enUSDatePickerLocale,
    ...locale,
    lang: { ...enUSDatePickerLocale.lang, ...locale?.lang },
    timePickerLocale: { ...enUSDatePickerLocale.timePickerLocale, ...locale?.timePickerLocale },
  }
}
