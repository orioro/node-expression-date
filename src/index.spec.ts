import {
  evaluate,
  VALUE_EXPRESSIONS,
  COMPARISON_EXPRESSIONS,
} from '@orioro/expression'
import { DATE_EXPRESSIONS } from './'

const interpreters = {
  ...VALUE_EXPRESSIONS,
  ...DATE_EXPRESSIONS,
  ...COMPARISON_EXPRESSIONS,
}

describe('$date', () => {
  test('ISO > Custom format', () => {
    const context = {
      interpreters,
      scope: { $$VALUE: '2020-10-14T23:09:30.787Z' },
    }

    const expectations = [
      ['y', '2020'],
      ['MMMM', 'October'],
    ]

    expectations.forEach(([format, expected]) => {
      expect(evaluate(context, ['$date', format])).toEqual(expected)
    })
  })

  test('UnixEpochMs > ISO (default)', () => {
    const ISODate = '2020-10-14T23:09:30.787Z'
    const context = {
      interpreters,
      scope: {
        $$VALUE: [new Date(ISODate).getTime(), 'UnixEpochMs', { zone: 'utc' }],
      },
    }

    expect(evaluate(context, ['$date'])).toEqual(ISODate)
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

test('$dateIsValid', () => {
  const expectations = [
    [undefined, false],
    [null, false],
    ['', false],
    ['2021 02 12T12:34:15.020-03:00', false],
    ['2021-02-12T12:34:15.020-03:00', true],
    ['2021-02-12T12:34:15.020', true],
    ['2021-02-12T12:34:15', true],
    ['2021-02-12', true],
    ['2021-02', true],
    ['2021', true],
    ['202', false],
    ['some random string', false],
    [10, false],
    [['2021 02 12', 'ISO'], false],
    [[10, 'ISO'], false],
  ]

  expectations.forEach(([input, result]) => {
    expect(
      evaluate(
        {
          interpreters,
          scope: { $$VALUE: input },
        },
        ['$dateIsValid']
      )
    ).toEqual(result)
  })
})

test('$dateStartOf', () => {
  const context = {
    interpreters,
    scope: { $$VALUE: '2021-02-12T12:34:15.020-03:00' },
  }

  const expectations = [
    [['year', 'utc'], '2021-01-01T00:00:00.000Z'],
    [['year', 'utc'], '2021-01-01T00:00:00.000Z'],
    [['month', 'utc'], '2021-02-01T00:00:00.000Z'],
    [['day', 'utc'], '2021-02-12T00:00:00.000Z'],
    [['hour', 'utc'], '2021-02-12T15:00:00.000Z'],
    [['minute', 'utc'], '2021-02-12T15:34:00.000Z'],
    [['second', 'utc'], '2021-02-12T15:34:15.000Z'],
  ]

  expectations.forEach(([input, result]) => {
    expect(evaluate(context, ['$dateStartOf', input])).toEqual(result)
  })
})

test('$dateEndOf', () => {
  const context = {
    interpreters,
    scope: { $$VALUE: '2021-02-12T12:34:15.020-03:00' },
  }

  const expectations = [
    [['year', 'utc'], '2021-12-31T23:59:59.999Z'],
    [['month', 'utc'], '2021-02-28T23:59:59.999Z'],
    [['day', 'utc'], '2021-02-12T23:59:59.999Z'],
    [['hour', 'utc'], '2021-02-12T15:59:59.999Z'],
    [['minute', 'utc'], '2021-02-12T15:34:59.999Z'],
    [['second', 'utc'], '2021-02-12T15:34:15.999Z'],
  ]

  expectations.forEach(([input, result]) => {
    expect(evaluate(context, ['$dateEndOf', input])).toEqual(result)
  })
})

test('$dateSet', () => {
  const context = {
    interpreters,
    // We must use the dateValue format:
    // [ISODate, options] to ensure the zone is set and
    // tests are executed in the same zone across environments
    // (local development and ci)
    scope: { $$VALUE: '2021-02-12T12:34:15.020-03:00' },
  }

  const expectations = [
    [[{ month: 1 }, 'utc'], '2021-01-12T15:34:15.020Z'],
    [[{ year: 2020 }, 'utc'], '2020-02-12T15:34:15.020Z'],
    [[{ day: 1 }, 'utc'], '2021-02-01T15:34:15.020Z'],
    [[{ hour: 1 }, 'utc'], '2021-02-12T01:34:15.020Z'],
    [[{ minute: 1 }, 'utc'], '2021-02-12T15:01:15.020Z'],
    [[{ second: 1 }, 'utc'], '2021-02-12T15:34:01.020Z'],
  ]

  expectations.forEach(([input, result]) => {
    expect(evaluate(context, ['$dateSet', input])).toEqual(result)
  })
})

test('$dateSetConfig', () => {
  const context = {
    interpreters,
    scope: { $$VALUE: '2021-02-12T12:34:15.020-03:00' },
  }

  const expectations = [
    [{ zone: 'UTC+0' }, '2021-02-12T15:34:15.020Z'],
    [{ zone: 'UTC+1' }, '2021-02-12T16:34:15.020+01:00'],
  ]

  expectations.forEach(([input, result]) => {
    expect(evaluate(context, ['$dateSetConfig', input])).toEqual(result)
  })

  expect(() => {
    evaluate(context, [
      '$dateSetConfig',
      {
        unknownConfig: 'value',
      },
    ])
  }).toThrow('Unknown DateTime config')
})

describe('date comparison', () => {
  const DATE_BEFORE = '2019-10-14T23:09:30.787Z'
  const DATE_REFERENCE = '2020-10-14T23:09:30.787Z'
  const DATE_REFERENCE_OTHER_TZ = '2020-10-14T20:09:30.787-03:00'
  const DATE_AFTER = '2021-10-14T23:09:30.787Z'
  const context = {
    interpreters,
    scope: { $$VALUE: DATE_REFERENCE },
  }

  test('with math operators', () => {
    expect(
      evaluate(context, ['$lt', Date.now(), ['$date', 'UnixEpochMs']])
    ).toEqual(true)
  })

  test('with date operators', () => {
    const expectations = [
      ['$dateGt', DATE_BEFORE, true],
      ['$dateGt', DATE_AFTER, false],
      ['$dateGt', DATE_REFERENCE, false],
      ['$dateGt', DATE_REFERENCE_OTHER_TZ, false],

      ['$dateGte', DATE_BEFORE, true],
      ['$dateGte', DATE_AFTER, false],
      ['$dateGte', DATE_REFERENCE, true],
      ['$dateGte', DATE_REFERENCE_OTHER_TZ, true],

      ['$dateLt', DATE_BEFORE, false],
      ['$dateLt', DATE_AFTER, true],
      ['$dateLt', DATE_REFERENCE, false],
      ['$dateLt', DATE_REFERENCE_OTHER_TZ, false],

      ['$dateLte', DATE_BEFORE, false],
      ['$dateLte', DATE_AFTER, true],
      ['$dateLte', DATE_REFERENCE, true],
      ['$dateLte', DATE_REFERENCE_OTHER_TZ, true],

      ['$dateEq', DATE_BEFORE, false],
      ['$dateEq', DATE_AFTER, false],
      ['$dateEq', DATE_REFERENCE, true],
      ['$dateEq', DATE_REFERENCE_OTHER_TZ, true],
    ]

    expectations.forEach(([expression, input, result]) => {
      expect(evaluate(context, [expression, input])).toEqual(result)
    })
  })
})

test('$dateMoveForward', () => {
  const context = {
    interpreters,
    scope: { $$VALUE: '2021-02-12T12:34:15.020-03:00' },
  }

  const expectations = [
    [{ month: 1 }, '2021-03-12T15:34:15.020Z'],
    [{ year: 2 }, '2023-02-12T15:34:15.020Z'],
    [{ day: 1 }, '2021-02-13T15:34:15.020Z'],
    [{ hour: 1 }, '2021-02-12T16:34:15.020Z'],
    [{ minute: 1 }, '2021-02-12T15:35:15.020Z'],
    [{ second: 1 }, '2021-02-12T15:34:16.020Z'],
  ]

  expectations.forEach(([input, result]) => {
    // Only use zone for formatting, which helps guaranteeing same results
    // for tests runs on ci and local dev environments
    expect(
      evaluate(context, ['$dateMoveForward', input, ['ISO', { zone: 'utc' }]])
    ).toEqual(result)
  })
})

test('$dateMoveBackward', () => {
  const context = {
    interpreters,
    scope: { $$VALUE: '2021-02-12T12:34:15.020-03:00' },
  }

  const expectations = [
    [{ month: 1 }, '2021-01-12T15:34:15.020Z'],
    [{ year: 1 }, '2020-02-12T15:34:15.020Z'],
    [{ day: 1 }, '2021-02-11T15:34:15.020Z'],
    [{ hour: 1 }, '2021-02-12T14:34:15.020Z'],
    [{ minute: 1 }, '2021-02-12T15:33:15.020Z'],
    [{ second: 1 }, '2021-02-12T15:34:14.020Z'],
  ]

  expectations.forEach(([input, result]) => {
    // Only use zone for formatting, which helps guaranteeing same results
    // for tests runs on ci and local dev environments
    expect(
      evaluate(context, ['$dateMoveBackward', input, ['ISO', { zone: 'utc' }]])
    ).toEqual(result)
  })
})
