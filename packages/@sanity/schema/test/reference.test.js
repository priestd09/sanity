import validator from '../src/validation/types/reference'
import {shapeOf, someWith} from './utils'

describe('reference types', () => {

  test('reference type with no `to`', () => {
    const result = validator.validate({
      name: 'foo'
    })

    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-reference-type-to-must-be-array',
        severity: 'error',
        message: expect.any(String)
      })))
  })

  test('reference type with invalid value for `to`', () => {
    const result = validator.validate({
      name: 'foo',
      to: 'bar'
    })
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-reference-type-to-must-be-array',
        severity: 'error',
        message: expect.any(String)
      })))
  })

  test('reference type with multiple members to same type', () => {
    const result = validator.validate({
      name: 'foo',
      to: [
        {type: 'object'},
        {type: 'object'}
      ]
    }, () => [])
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-reference-type-to-must-have-unique-types',
        severity: 'error',
        message: expect.any(String)
      })))
  })
})

describe('reference subtypes', () => {
  test('reference subtype with `to`', () => {

    const result = validator.validateMember({
      name: 'foo',
      type: 'customArray',
      to: []
    })

    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-subtype-inheritance',
        severity: 'error',
        message: expect.any(String)
      })))
  })
})
