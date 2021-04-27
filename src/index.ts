import { DateTime } from 'luxon'

import { ISODate, PlainObject } from './types'

import { ParamResolver } from '@orioro/expression'

import { validateType } from '@orioro/typing'

export const DATE_ISO = 'ISO'
export const DATE_ISO_DATE = 'ISODate'
export const DATE_ISO_WEEK_DATE = 'ISOWeekDate'
export const DATE_ISO_TIME = 'ISOTime'
export const DATE_RFC2822 = 'RFC2822'
export const DATE_HTTP = 'HTTP'
export const DATE_SQL = 'SQL'
export const DATE_SQL_DATE = 'SQLTime'
export const DATE_SQL_TIME = 'SQLTime'
export const DATE_UNIX_EPOCH_MS = 'UnixEpochMs'
export const DATE_UNIX_EPOCH_S = 'UnixEpochS'
export const DATE_JS_DATE = 'JSDate'
export const DATE_PLAIN_OBJECT = 'PlainObject'
export const DATE_LUXON_DATE_TIME = 'DateTime'
export const DATE_DATE_TIME_PROP = 'LuxonDateTimeProp'

/**
 * Date input for all $date expressions
 *
 * @typedef {ISODate | [ISODate, PlainObject] | [any, string, PlainObject?]} DateValue
 */
export type DateValue =
  | ISODate
  | [ISODate, PlainObject] //
  | [any, string, PlainObject?]
const _VALIDATE_DATE_VALUE: ParamResolver = ['string', 'array']

/**
 * Arguments to be forwarded to Luxon corresponding DateTime parser.
 * If a `string`, will be considered as the name of the format.
 * If an `Array`, will be considered as a tuple consisting of
 * [format, formatOptions].
 * Recognized formats (exported as constants `DATE_{FORMAT_IN_CONSTANT_CASE}`):
 * - `ISO`
 * - `ISODate`
 * - `ISOWeekDate`
 * - `ISOTime`
 * - `RFC2822`
 * - `HTTP`
 * - `SQL`
 * - `SQLTime`
 * - `SQLTime`
 * - `UnixEpochMs`
 * - `UnixEpochS`
 * - `JSDate`
 * - `PlainObject`
 * - `LuxonDateTime`
 *
 * @typedef {String|[string, Object]} DateFormat
 */
export type DateFormat = string | [string, PlainObject]
const _VALIDATE_DATE_FORMAT: ParamResolver = ['string', 'array', 'undefined']

const _destructureDateValue = (input: DateValue) => {
  if (Array.isArray(input)) {
    if (typeof input[1] === 'string') {
      // [any, string, PlainObject?]
      return input
    } else {
      // [ISODate, PlainObject]
      return [input[0], DATE_ISO, input[1]]
    }
  } else {
    // ISODate
    return [input, DATE_ISO, undefined]
  }
}

const _parseLuxonDate = (dateValue: DateValue) => {
  const [value, format, options] = _destructureDateValue(dateValue)

  if (value instanceof DateTime || format === DATE_LUXON_DATE_TIME) {
    return value
  } else {
    switch (format) {
      case DATE_ISO:
      case DATE_ISO_DATE:
      case DATE_ISO_WEEK_DATE:
      case DATE_ISO_TIME:
        validateType('string', value)
        return DateTime.fromISO(value, options)
      case DATE_RFC2822:
        validateType('string', value)
        return DateTime.fromRFC2822(value, options)
      case DATE_HTTP:
        validateType('string', value)
        return DateTime.fromHTTP(value, options)
      case DATE_SQL:
      case DATE_SQL_DATE:
      case DATE_SQL_TIME:
        validateType('string', value)
        return DateTime.fromSQL(value, options)
      case DATE_UNIX_EPOCH_MS:
        validateType('number', value)
        return DateTime.fromMillis(value, options)
      case DATE_UNIX_EPOCH_S:
        validateType('number', value)
        return DateTime.fromSeconds(value, options)
      case DATE_JS_DATE:
        validateType('date', value)
        return DateTime.fromJSDate(value, options)
      case DATE_PLAIN_OBJECT:
        validateType('object', value)
        return DateTime.fromObject(value, options)
      default:
        validateType('string', value)
        return DateTime.fromFormat(value, format, options)
    }
  }
}

const _destructureDateFormat = (format: DateFormat) =>
  Array.isArray(format) ? format : [format, undefined]

const LUXON_DATE_TIME_PUBLIC_PROPERTIES = [
  'day',
  'daysInMonth',
  'daysInYear',
  'hour',
  'invalidExplanation',
  'invalidReason',
  'isInDST',
  'isInLeapYear',
  'isOffsetFixed',
  'isValid',
  'locale',
  'millisecond',
  'minute',
  'month',
  'monthLong',
  'monthShort',
  'numberingSystem',
  'offset',
  'offsetNameLong',
  'offsetNameShort',
  'ordinal',
  'outputCalendar',
  'quarter',
  'second',
  'weekNumber',
  'weekYear',
  'weekday',
  'weekdayLong',
  'weekdayShort',
  'weeksInWeekYear',
  'year',
  // 'zone',
  'zoneName',
]
const _luxonDateTimeGet = (value, property) => {
  if (!LUXON_DATE_TIME_PUBLIC_PROPERTIES.includes(property)) {
    throw new TypeError(`Invalid DATE_DATE_TIME_PROP property ${property}`)
  }

  return value[property]
}

/* istanbul ignore next */
const _serializeLuxonDate = (value, formatRaw: DateFormat) => {
  const [format, options] = _destructureDateFormat(formatRaw)

  if (typeof options === 'object' && options.zone) {
    value = value.setZone(options.zone)
  }

  switch (format) {
    case DATE_LUXON_DATE_TIME:
      return value
    case DATE_ISO:
      return value.toISO(options)
    case DATE_ISO_DATE:
      return value.toISODate(options)
    case DATE_ISO_WEEK_DATE:
      return value.toISOWeekDate(options)
    case DATE_ISO_TIME:
      return value.toISOTime(options)
    case DATE_RFC2822:
      return value.toRFC2822(options)
    case DATE_HTTP:
      return value.toHTTP(options)
    case DATE_SQL:
      return value.toSQL(options)
    case DATE_SQL_DATE:
      return value.toSQLDate(options)
    case DATE_SQL_TIME:
      return value.toSQLTime(options)
    case DATE_UNIX_EPOCH_MS:
      return value.toMillis(options)
    case DATE_UNIX_EPOCH_S:
      return value.toSeconds(options)
    case DATE_JS_DATE:
      return value.toJSDate(options)
    case DATE_PLAIN_OBJECT:
      return value.toObject(options)
    case DATE_DATE_TIME_PROP:
      return _luxonDateTimeGet(value, options)
    default:
      return value.toFormat(format, options)
  }
}

/**
 * String in the full ISO 8601 format:
 * `2017-04-20T11:32:00.000-04:00`
 *
 * @typedef {String} ISODate
 */

/**
 * Duration represented in an object format:
 *
 * @typedef {Object} Duration
 * @property {Object} duration
 * @property {Number} duration.years
 * @property {Number} duration.quarters
 * @property {Number} duration.months
 * @property {Number} duration.weeks
 * @property {Number} duration.days
 * @property {Number} duration.hours
 * @property {Number} duration.minutes
 * @property {Number} duration.seconds
 * @property {Number} duration.milliseconds
 */

/**
 * Parses a date from a given input format and serializes it into
 * another format. Use this expression to convert date formats into
 * your requirements. E.g. `UnixEpochMs` into `ISO`.
 *
 * @function $date
 * @param {DateFormat} [parseFmtArgs='ISO']
 * @param {DateFormat} [serializeFormat='ISO'] Same as `parseFmtArgs`
 *         but will be used to format the resulting output
 * @param {String | Number | Object | Date} [date=$$VALUE] Input type should be in accordance
 *         with the `parseFmtArgs`.
 * @returns {String | Number | Object | Date} date Output will vary according to `serializeFormat`
 */
export const $date = [
  (
    serializeFormat: DateFormat = 'ISO',
    value: DateValue
  ): string | number | PlainObject | Date =>
    _serializeLuxonDate(_parseLuxonDate(value), serializeFormat),
  [_VALIDATE_DATE_FORMAT, _VALIDATE_DATE_VALUE],
]

/**
 * Generates a ISO date string from `Date.now`
 *
 * @function $dateNow
 * @param {DateFormat} [serializeFormat='ISO']
 * @returns {String | Number | Object | Date} date
 */
export const $dateNow = [
  (serializeFormat: DateFormat = 'ISO'): string | number | PlainObject | Date =>
    _serializeLuxonDate(DateTime.fromMillis(Date.now()), serializeFormat),
  [_VALIDATE_DATE_FORMAT],
]

/**
 * Verifies whether the given date is valid.
 * From Luxon docs:
 * > The most common way to do that is to over- or underflow some unit:
 * > - February 40th
 * > - 28:00
 * > - 4 pm
 * > - etc
 * See https://github.com/moment/luxon/blob/master/docs/validity.md
 *
 * @function $dateIsValid
 * @param {*}
 * @returns {Boolean} isValid
 */
export const $dateIsValid = [
  (value: DateValue): boolean => {
    try {
      return _parseLuxonDate(value).isValid
    } catch (err) {
      return false
    }
  },
  ['any'],
]

/**
 * @type {string | [string, string?]} DateUnitValue
 */
export type DateUnitValue = string | [string, string?]
const _VALIDATE_DATE_UNIT_VALUE: ParamResolver = ['string', 'array']

type ZoneSensitiveOption = any | [any, string?]
const _parseZoneSensitiveOption = (unitValue: ZoneSensitiveOption) =>
  Array.isArray(unitValue) ? unitValue : [unitValue]

/**
 * Returns the date at the start of the given `unit` (e.g. `day`, `month`).
 *
 * @function $dateStartOf
 * @param {String} unitExp Unit to be used as basis for calculation:
 *                         `year`, `quarter`, `month`, `week`, `day`,
 *                         `hour`, `minute`, `second`, or `millisecond`.
 * @param {ISODate} [date=$$VALUE]
 * @returns {ISODate} date
 */
export const $dateStartOf = [
  (
    unitValue: DateUnitValue,
    serializeFormat: DateFormat = 'ISO',
    date: DateValue
  ): ISODate => {
    const [unit, zone = 'local'] = _parseZoneSensitiveOption(unitValue)
    return _serializeLuxonDate(
      DateTime.fromISO(date).setZone(zone).startOf(unit),
      serializeFormat
    )
  },
  [_VALIDATE_DATE_UNIT_VALUE, _VALIDATE_DATE_FORMAT, _VALIDATE_DATE_VALUE],
]

/**
 * Returns the date at the end of the given `unit` (e.g. `day`, `month`).
 *
 * @function $dateEndOf
 * @param {String} unitExp Unit to be used as basis for calculation:
 *                         `year`, `quarter`, `month`, `week`, `day`,
 *                         `hour`, `minute`, `second`, or `millisecond`.
 * @param {ISODate} [date=$$VALUE]
 * @returns {ISODate} date
 */
export const $dateEndOf = [
  (
    unitValue: DateUnitValue,
    serializeFormat: DateFormat = 'ISO',
    date: DateValue
  ): ISODate => {
    const [unit, zone = 'local'] = _parseZoneSensitiveOption(unitValue)
    return _serializeLuxonDate(
      DateTime.fromISO(date).setZone(zone).endOf(unit),
      serializeFormat
    )
  },
  [_VALIDATE_DATE_UNIT_VALUE, _VALIDATE_DATE_FORMAT, _VALIDATE_DATE_VALUE],
]

/**
 * Modifies date specific `units` and returns resulting date.
 * See [`DateTime#set`](https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#instance-method-set)
 * and [`DateTime.fromObject`](https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#static-method-fromObject)
 *
 * @function $dateSet
 * @param {Object} valuesExp
 * @param {Number} valuesExp.year
 * @param {Number} valuesExp.month
 * @param {Number} valuesExp.day
 * @param {Number} valuesExp.ordinal
 * @param {Number} valuesExp.weekYear
 * @param {Number} valuesExp.weekNumber
 * @param {Number} valuesExp.weekday
 * @param {Number} valuesExp.hour
 * @param {Number} valuesExp.minute
 * @param {Number} valuesExp.second
 * @param {Number} valuesExp.millisecond
 * @param {ISODate} [dateExp=$$VALUE]
 * @returns {ISODate} date
 */
export const $dateSet = [
  (
    values: ZoneSensitiveOption,
    serializeFormat: DateFormat = 'ISO',
    date: DateValue
  ): ISODate => {
    const [values_, zone = 'local'] = _parseZoneSensitiveOption(values)

    return _serializeLuxonDate(
      _parseLuxonDate(date).setZone(zone).set(values_),
      serializeFormat
    )
  },
  [['object', 'array'], _VALIDATE_DATE_FORMAT, _VALIDATE_DATE_VALUE],
]

const _luxonConfigDate = (dt, config, value) => {
  switch (config) {
    // case 'locale':
    //   return dt.setLocale(value)
    case 'zone':
      return dt.setZone(value)
    default:
      throw new Error(`Unknown DateTime config '${config}'`)
  }
}

/**
 * Modifies a configurations of the date.
 *
 * @function $dateSetConfig
 * @param {Object} configExp
 * @param {String} config.locale
 * @param {String} config.zone
 * @param {ISODate} [date=$$VALUE]
 * @returns {ISODate} date
 */
export const $dateSetConfig = [
  (
    config: PlainObject,
    serializeFormat: DateFormat = 'ISO',
    date: DateValue
  ): ISODate => {
    const dt = _parseLuxonDate(date)

    return _serializeLuxonDate(
      Object.keys(config).reduce(
        (dt, key) => _luxonConfigDate(dt, key, config[key]),
        dt
      ),
      serializeFormat
    )
  },
  ['object', _VALIDATE_DATE_FORMAT, _VALIDATE_DATE_VALUE],
]

const _dateComparison = (compare) => [
  (reference: ISODate, date: DateValue): boolean =>
    compare(_parseLuxonDate(reference), _parseLuxonDate(date)),
  [_VALIDATE_DATE_VALUE, _VALIDATE_DATE_VALUE],
]

/**
 * Greater than `date > reference`
 *
 * @function $dateGt
 * @param {ISODate} referenceDateExp
 * @param {ISODate} [date=$$VALUE]
 * @returns {Boolean}
 */
export const $dateGt = _dateComparison((reference, date) => date > reference)

/**
 * Greater than or equal `date >= reference`
 *
 * @function $dateGte
 * @param {ISODate} referenceDateExp
 * @param {ISODate} [date=$$VALUE]
 * @returns {Boolean}
 */
export const $dateGte = _dateComparison((reference, date) => date >= reference)

/**
 * Lesser than `date < reference`
 *
 * @function $dateLt
 * @param {ISODate} referenceDateExp
 * @param {ISODate} [date=$$VALUE]
 * @returns {Boolean}
 */
export const $dateLt = _dateComparison((reference, date) => date < reference)

/**
 * Lesser than or equal `date <= reference`
 *
 * @function $dateLte
 * @param {ISODate} referenceDateExp
 * @param {ISODate} [date=$$VALUE]
 * @returns {Boolean}
 */
export const $dateLte = _dateComparison((reference, date) => date <= reference)

/**
 * `date == reference`
 * Converts both `date` and `reference` and compares their
 * specified `compareUnit`. By default compares `millisecond` unit
 * so that checks whether are exactly the same millisecond in time,
 * but could be used to compare other units, such as whether two dates
 * are within the same `day`, `month` or `year`.
 *
 * @function $dateEq
 * @param {ISODate} referenceDateExp
 * @param {String} compareUnitExp
 * @param {ISODate} [date=$$VALUE]
 * @returns {Boolean}
 */
export const $dateEq = [
  (
    reference: ISODate,
    compareUnit: string = 'millisecond',
    date: DateValue
  ): boolean =>
    _parseLuxonDate(reference).hasSame(_parseLuxonDate(date), compareUnit),
  [_VALIDATE_DATE_VALUE, ['string', 'undefined'], _VALIDATE_DATE_VALUE],
]

/**
 * Modifies the date by moving it forward the duration specified.
 *
 * @function $dateMoveForward
 * @param {Duration} duration
 * @param {ISODate} [date=$$VALUE]
 * @returns {ISODate} date
 */
export const $dateMoveForward = [
  (
    duration: PlainObject,
    serializeFormat: DateFormat = 'ISO',
    date: DateValue
  ): ISODate =>
    _serializeLuxonDate(_parseLuxonDate(date).plus(duration), serializeFormat),
  ['object', _VALIDATE_DATE_FORMAT, _VALIDATE_DATE_VALUE],
]

/**
 * Modifies the date by moving it backward the duration specified.
 *
 * @function $dateMoveBackward
 * @param {Duration} duration
 * @param {ISODate} [date=$$VALUE]
 * @returns {ISODate} date
 */
export const $dateMoveBackward = [
  (
    duration: PlainObject,
    serializeFormat: DateFormat = 'ISO',
    date: DateValue
  ): ISODate =>
    _serializeLuxonDate(_parseLuxonDate(date).minus(duration), serializeFormat),
  ['object', _VALIDATE_DATE_FORMAT, _VALIDATE_DATE_VALUE],
]

export const DATE_EXPRESSIONS = {
  $date,
  $dateNow,
  $dateIsValid,
  $dateStartOf,
  $dateEndOf,
  $dateSet,
  $dateSetConfig,
  $dateGt,
  $dateGte,
  $dateLt,
  $dateLte,
  $dateEq,
  $dateMoveForward,
  $dateMoveBackward,
}
