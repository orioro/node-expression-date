import {
  evaluate,
  interpreterList,
  VALUE_EXPRESSIONS,
  COMPARISON_EXPRESSIONS,
} from '@orioro/expression'
import { DATE_EXPRESSIONS } from './'

import { prepareEvaluateTestCases } from '@orioro/jest-util-expression'

const interpreters = interpreterList({
  ...VALUE_EXPRESSIONS,
  ...DATE_EXPRESSIONS,
  ...COMPARISON_EXPRESSIONS,
})

const testAllCases = prepareEvaluateTestCases({
  ...VALUE_EXPRESSIONS,
  ...DATE_EXPRESSIONS,
  ...COMPARISON_EXPRESSIONS,
})

describe('$date', () => {
  describe('ISO > Custom format', () => {
    const value = '2020-10-14T23:09:30.787Z'

    testAllCases([
      [value, ['$date', 'y'], '2020'],
      [value, ['$date', 'MMMM'], 'October'],
    ])
  })

  describe('UnixEpochMs > ISO (default)', () => {
    const ISODate = '2020-10-14T23:09:30.787Z'
    const value = [new Date(ISODate).getTime(), 'UnixEpochMs', { zone: 'utc' }]

    testAllCases([[value, ['$date'], ISODate]])
  })
})

describe('$dateNow', () => {
  test('basic', () => {
    const context = {
      interpreters,
      scope: { $$VALUE: undefined },
    }

    const now = evaluate(context, ['$dateNow', 'UnixEpochMs'])

    return new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
      expect(now).toBeLessThanOrEqual(Date.now())
      expect(now).toBeGreaterThan(Date.now() - 100)
    })
  })
})

describe('$dateIsValid', () => {
  testAllCases([
    [undefined, ['$dateIsValid'], false],
    [null, ['$dateIsValid'], false],
    ['', ['$dateIsValid'], false],
    ['2021 02 12T12:34:15.020-03:00', ['$dateIsValid'], false],
    ['2021-02-12T12:34:15.020-03:00', ['$dateIsValid'], true],
    ['2021-02-12T12:34:15.020', ['$dateIsValid'], true],
    ['2021-02-12T12:34:15', ['$dateIsValid'], true],
    ['2021-02-12', ['$dateIsValid'], true],
    ['2021-02', ['$dateIsValid'], true],
    ['2021', ['$dateIsValid'], true],
    ['202', ['$dateIsValid'], false],
    ['some random string', ['$dateIsValid'], false],
    [10, ['$dateIsValid'], false],
    [['2021 02 12', 'ISO'], ['$dateIsValid'], false],
    [[10, 'ISO'], ['$dateIsValid'], false],
  ])
})

describe('$dateStartOf', () => {
  const value = '2021-02-12T12:34:15.020-03:00'

  testAllCases([
    [value, ['$dateStartOf', ['year', 'utc']], '2021-01-01T00:00:00.000Z'],
    [value, ['$dateStartOf', ['year', 'utc']], '2021-01-01T00:00:00.000Z'],
    [value, ['$dateStartOf', ['month', 'utc']], '2021-02-01T00:00:00.000Z'],
    [value, ['$dateStartOf', ['day', 'utc']], '2021-02-12T00:00:00.000Z'],
    [value, ['$dateStartOf', ['hour', 'utc']], '2021-02-12T15:00:00.000Z'],
    [value, ['$dateStartOf', ['minute', 'utc']], '2021-02-12T15:34:00.000Z'],
    [value, ['$dateStartOf', ['second', 'utc']], '2021-02-12T15:34:15.000Z'],
  ])
})

describe('$dateEndOf', () => {
  const value = '2021-02-12T12:34:15.020-03:00'

  testAllCases([
    [value, ['$dateEndOf', ['year', 'utc']], '2021-12-31T23:59:59.999Z'],
    [value, ['$dateEndOf', ['month', 'utc']], '2021-02-28T23:59:59.999Z'],
    [value, ['$dateEndOf', ['day', 'utc']], '2021-02-12T23:59:59.999Z'],
    [value, ['$dateEndOf', ['hour', 'utc']], '2021-02-12T15:59:59.999Z'],
    [value, ['$dateEndOf', ['minute', 'utc']], '2021-02-12T15:34:59.999Z'],
    [value, ['$dateEndOf', ['second', 'utc']], '2021-02-12T15:34:15.999Z'],
  ])
})

describe('$dateSet', () => {
  // We must use the dateValue format:
  // [ISODate, options] to ensure the zone is set and
  // tests are executed in the same zone across environments
  // (local development and ci)
  const value = '2021-02-12T12:34:15.020-03:00'

  testAllCases([
    [value, ['$dateSet', [{ month: 1 }, 'utc']], '2021-01-12T15:34:15.020Z'],
    [value, ['$dateSet', [{ year: 2020 }, 'utc']], '2020-02-12T15:34:15.020Z'],
    [value, ['$dateSet', [{ day: 1 }, 'utc']], '2021-02-01T15:34:15.020Z'],
    [value, ['$dateSet', [{ hour: 1 }, 'utc']], '2021-02-12T01:34:15.020Z'],
    [value, ['$dateSet', [{ minute: 1 }, 'utc']], '2021-02-12T15:01:15.020Z'],
    [value, ['$dateSet', [{ second: 1 }, 'utc']], '2021-02-12T15:34:01.020Z'],
  ])
})

describe('$dateSetConfig', () => {
  const value = '2021-02-12T12:34:15.020-03:00'

  testAllCases([
    [value, ['$dateSetConfig', { zone: 'UTC+0' }], '2021-02-12T15:34:15.020Z'],
    [
      value,
      ['$dateSetConfig', { zone: 'UTC+1' }],
      '2021-02-12T16:34:15.020+01:00',
    ],
    [
      value,
      ['$dateSetConfig', { unknownConfig: 'value' }],
      new Error("Unknown DateTime config 'unknownConfig'"),
    ],
  ])
})

describe('date comparison', () => {
  const DATE_BEFORE = '2019-10-14T23:09:30.787Z'
  const DATE_REFERENCE = '2020-10-14T23:09:30.787Z'
  const DATE_REFERENCE_OTHER_TZ = '2020-10-14T20:09:30.787-03:00'
  const DATE_AFTER = '2021-10-14T23:09:30.787Z'

  describe('with math operators', () => {
    testAllCases([
      [DATE_REFERENCE, ['$lt', Date.now(), ['$date', 'UnixEpochMs']], true],
    ])
  })

  describe('with date operators', () => {
    testAllCases([
      [DATE_REFERENCE, ['$dateGt', DATE_BEFORE], true],
      [DATE_REFERENCE, ['$dateGt', DATE_AFTER], false],
      [DATE_REFERENCE, ['$dateGt', DATE_REFERENCE], false],
      [DATE_REFERENCE, ['$dateGt', DATE_REFERENCE_OTHER_TZ], false],

      [DATE_REFERENCE, ['$dateGte', DATE_BEFORE], true],
      [DATE_REFERENCE, ['$dateGte', DATE_AFTER], false],
      [DATE_REFERENCE, ['$dateGte', DATE_REFERENCE], true],
      [DATE_REFERENCE, ['$dateGte', DATE_REFERENCE_OTHER_TZ], true],

      [DATE_REFERENCE, ['$dateLt', DATE_BEFORE], false],
      [DATE_REFERENCE, ['$dateLt', DATE_AFTER], true],
      [DATE_REFERENCE, ['$dateLt', DATE_REFERENCE], false],
      [DATE_REFERENCE, ['$dateLt', DATE_REFERENCE_OTHER_TZ], false],

      [DATE_REFERENCE, ['$dateLte', DATE_BEFORE], false],
      [DATE_REFERENCE, ['$dateLte', DATE_AFTER], true],
      [DATE_REFERENCE, ['$dateLte', DATE_REFERENCE], true],
      [DATE_REFERENCE, ['$dateLte', DATE_REFERENCE_OTHER_TZ], true],

      [DATE_REFERENCE, ['$dateEq', DATE_BEFORE], false],
      [DATE_REFERENCE, ['$dateEq', DATE_AFTER], false],
      [DATE_REFERENCE, ['$dateEq', DATE_REFERENCE], true],
      [DATE_REFERENCE, ['$dateEq', DATE_REFERENCE_OTHER_TZ], true],
    ])
  })
})

describe('$dateMoveForward', () => {
  const value = '2021-02-12T12:34:15.020-03:00'

  // Only use zone for formatting, which helps guaranteeing same results
  // for tests runs on ci and local dev environments
  testAllCases([
    [
      value,
      ['$dateMoveForward', { month: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-03-12T15:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveForward', { year: 2 }, ['ISO', { zone: 'utc' }]],
      '2023-02-12T15:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveForward', { day: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-13T15:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveForward', { hour: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-12T16:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveForward', { minute: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-12T15:35:15.020Z',
    ],
    [
      value,
      ['$dateMoveForward', { second: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-12T15:34:16.020Z',
    ],
  ])
})

describe('$dateMoveBackward', () => {
  const value = '2021-02-12T12:34:15.020-03:00'

  testAllCases([
    [
      value,
      ['$dateMoveBackward', { month: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-01-12T15:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveBackward', { year: 1 }, ['ISO', { zone: 'utc' }]],
      '2020-02-12T15:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveBackward', { day: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-11T15:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveBackward', { hour: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-12T14:34:15.020Z',
    ],
    [
      value,
      ['$dateMoveBackward', { minute: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-12T15:33:15.020Z',
    ],
    [
      value,
      ['$dateMoveBackward', { second: 1 }, ['ISO', { zone: 'utc' }]],
      '2021-02-12T15:34:14.020Z',
    ],
  ])
})
