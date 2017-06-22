import Schema from '../src/Schema'
import inspect from 'object-inspect'
import {validateSchemaDef} from '../src/validation/validateSchema'
import {shapeOf, someWith} from './utils'

describe('Passing invalid values to Schema.compile(...)', () => {
  [
    undefined,
    null,
    false,
    [],
    {},
    {foo: 'bar'},
    {types: 'ugh'},
    {name: false, types: []},
    {name: '', types: []}
  ]
    .forEach(val => {
      test(`Passing ${inspect(val)}`, () => {
        expect(() => Schema.compile(val)).toThrow(/.*schema-compile-invalid-arguments.*/)
      })
    })
})

test('schema with an unnamed type', () => {
  const result = validateSchemaDef({
    name: 'foo',
    types: [
      {type: 'object'}
    ]
  })
  expect(result).toEqual(someWith(shapeOf({
    severity: 'error',
    helpId: 'schema-type-invalid-or-missing-attr-name'
  })))
})

test('schema with duplicate types', () => {
  const result = validateSchemaDef({
    name: 'foo',
    types: [
      {name: 'foo', type: 'string'},
      {name: 'foo', type: 'string'},
    ]
  }, {string: {validate: () => []}})

  expect(result).toEqual(someWith(shapeOf({
    severity: 'error',
    helpId: 'schema-type-duplicate-name'
  })))
})

test('schema with a nonexistent type', () => {
  const result = validateSchemaDef({
    name: 'foo',
    types: [
      {name: 'foo', type: 'nonexistent'}
    ]
  })
  expect(result).toEqual(someWith(shapeOf({
    severity: 'error',
    helpId: 'schema-type-missing-type'
  })))
})
