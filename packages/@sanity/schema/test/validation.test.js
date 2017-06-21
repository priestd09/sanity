import Schema from '../src/Schema'
import inspect from 'object-inspect'
import {validateSchemaDef} from '../src/validation/validateSchema'

const schemaDef = {name: 'empty', types: []}

describe('Passing invalid values to Schema.compile(...)', () => {
  ;[
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
  expect(result.length).toBe(1)
  expect(result[0].severity).toBe('error')
  expect(result[0].helpId).toBe('schema-type-invalid-name')
})

test('schema with duplicate types', () => {
  const result = validateSchemaDef({
    name: 'foo',
    types: [
      {name: 'foo', type: 'object'},
      {name: 'foo', type: 'object'},
    ]
  })
  expect(result.length).toBe(1)
  expect(result[0].severity).toBe('error')
  expect(result[0].helpId).toBe('schema-type-duplicate-name')
})

xtest('schema with a nonexistent type', () => {
  const result = validateSchemaDef({
    name: 'foo',
    types: [
      {name: 'foo', type: 'nonexistent'}
    ]
  })
  expect(result.length).toBe(1)
  expect(result[0].severity).toBe('error')
  expect(result[0].helpId).toBe('schema-type-missing-type')
})
