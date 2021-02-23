# expressionDate

Set of expressions aimed at solving common date-related operations: 
parse, format, compare, validate, manipulate (e.g. move forward, move back).
Most (if not all) operations are based on and built with [`Luxon`](https://github.com/moment/luxon/) `DateTime`. If not stated otherwise, date operations return a `string` in ISO 8601 format (`2021-01-27T20:38:12.807Z`).

```
npm install @orioro/expression-date
yarn add @orioro/expression-date
```

# API Docs

- [`DateValue`](#datevalue)
- [`DateFormat`](#dateformat)
- [`ISODate`](#isodate)
- [`Duration`](#duration)
- [`$date(parseFmtArgs, serializeFormat, date)`](#dateparsefmtargs-serializeformat-date)
- [`$dateNow(serializeFormat)`](#datenowserializeformat)
- [`$dateIsValid()`](#dateisvalid)
- [`$dateStartOf(unitExp, date)`](#datestartofunitexp-date)
- [`$dateEndOf(unitExp, date)`](#dateendofunitexp-date)
- [`$dateSet(valuesExp, dateExp)`](#datesetvaluesexp-dateexp)
- [`$dateSetConfig(configExp, date)`](#datesetconfigconfigexp-date)
- [`$dateGt(referenceDateExp, date)`](#dategtreferencedateexp-date)
- [`$dateGte(referenceDateExp, date)`](#dategtereferencedateexp-date)
- [`$dateLt(referenceDateExp, date)`](#dateltreferencedateexp-date)
- [`$dateLte(referenceDateExp, date)`](#dateltereferencedateexp-date)
- [`$dateEq(referenceDateExp, compareUnitExp, date)`](#dateeqreferencedateexp-compareunitexp-date)
- [`$dateMoveForward(duration, date)`](#datemoveforwardduration-date)
- [`$dateMoveBackward(duration, date)`](#datemovebackwardduration-date)
- [`ISODate`](#isodate)
- [`PlainObject`](#plainobject)

##### `DateValue`

Date input for all $date expressions



##### `DateFormat`

Arguments to be forwarded to Luxon corresponding DateTime parser.
If a `string`, will be considered as the name of the format.
If an `Array`, will be considered as a tuple consisting of
[format, formatOptions].
Recognized formats (exported as constants `DATE_{FORMAT_IN_CONSTANT_CASE}`):
- `ISO`
- `ISODate`
- `ISOWeekDate`
- `ISOTime`
- `RFC2822`
- `HTTP`
- `SQL`
- `SQLTime`
- `SQLTime`
- `UnixEpochMs`
- `UnixEpochS`
- `JSDate`
- `PlainObject`
- `LuxonDateTime`



##### `ISODate`

String in the full ISO 8601 format:
`2017-04-20T11:32:00.000-04:00`



##### `Duration`

Duration represented in an object format:

- `duration` {Object}
  - `years` {Number}
  - `quarters` {Number}
  - `months` {Number}
  - `weeks` {Number}
  - `days` {Number}
  - `hours` {Number}
  - `minutes` {Number}
  - `seconds` {Number}
  - `milliseconds` {Number}

##### `$date(parseFmtArgs, serializeFormat, date)`

Parses a date from a given input format and serializes it into
another format. Use this expression to convert date formats into
your requirements. E.g. `UnixEpochMs` into `ISO`.

- `parseFmtArgs` {[DateFormat](#dateformat)}
- `serializeFormat` {[DateFormat](#dateformat)}
- `date` {String | Number | Object | Date}
- Returns: `date` {String | Number | Object | Date} Output will vary according to `serializeFormat`

##### `$dateNow(serializeFormat)`

Generates a ISO date string from `Date.now`

- `serializeFormat` {[DateFormat](#dateformat)}
- Returns: `date` {String | Number | Object | Date} 

##### `$dateIsValid()`

Verifies whether the given date is valid.
From Luxon docs:
> The most common way to do that is to over- or underflow some unit:
> - February 40th
> - 28:00
> - 4 pm
> - etc
See https://github.com/moment/luxon/blob/master/docs/validity.md

- `` {*}
- Returns: `isValid` {Boolean} 

##### `$dateStartOf(unitExp, date)`

Returns the date at the start of the given `unit` (e.g. `day`, `month`).

- `unitExp` {String}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: `date` {[[ISODate](#isodate)](#isodate)} 

##### `$dateEndOf(unitExp, date)`

Returns the date at the end of the given `unit` (e.g. `day`, `month`).

- `unitExp` {String}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: `date` {[[ISODate](#isodate)](#isodate)} 

##### `$dateSet(valuesExp, dateExp)`

Modifies date specific `units` and returns resulting date.
See [`DateTime#set`](https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#instance-method-set)
and [`DateTime.fromObject`](https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#static-method-fromObject)

- `valuesExp` {Object}
  - `year` {Number}
  - `month` {Number}
  - `day` {Number}
  - `ordinal` {Number}
  - `weekYear` {Number}
  - `weekNumber` {Number}
  - `weekday` {Number}
  - `hour` {Number}
  - `minute` {Number}
  - `second` {Number}
  - `millisecond` {Number}
- `dateExp` {[[ISODate](#isodate)](#isodate)}
- Returns: `date` {[[ISODate](#isodate)](#isodate)} 

##### `$dateSetConfig(configExp, date)`

Modifies a configurations of the date.

- `configExp` {Object}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: `date` {[[ISODate](#isodate)](#isodate)} 

##### `$dateGt(referenceDateExp, date)`

Greater than `date > reference`

- `referenceDateExp` {[[ISODate](#isodate)](#isodate)}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: {Boolean} 

##### `$dateGte(referenceDateExp, date)`

Greater than or equal `date >= reference`

- `referenceDateExp` {[[ISODate](#isodate)](#isodate)}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: {Boolean} 

##### `$dateLt(referenceDateExp, date)`

Lesser than `date < reference`

- `referenceDateExp` {[[ISODate](#isodate)](#isodate)}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: {Boolean} 

##### `$dateLte(referenceDateExp, date)`

Lesser than or equal `date <= reference`

- `referenceDateExp` {[[ISODate](#isodate)](#isodate)}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: {Boolean} 

##### `$dateEq(referenceDateExp, compareUnitExp, date)`

`date == reference`
Converts both `date` and `reference` and compares their
specified `compareUnit`. By default compares `millisecond` unit
so that checks whether are exactly the same millisecond in time,
but could be used to compare other units, such as whether two dates
are within the same `day`, `month` or `year`.

- `referenceDateExp` {[[ISODate](#isodate)](#isodate)}
- `compareUnitExp` {String}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: {Boolean} 

##### `$dateMoveForward(duration, date)`

Modifies the date by moving it forward the duration specified.

- `duration` {[Duration](#duration)}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: `date` {[[ISODate](#isodate)](#isodate)} 

##### `$dateMoveBackward(duration, date)`

Modifies the date by moving it backward the duration specified.

- `duration` {[Duration](#duration)}
- `date` {[[ISODate](#isodate)](#isodate)}
- Returns: `date` {[[ISODate](#isodate)](#isodate)} 

##### `ISODate`



##### `PlainObject`
