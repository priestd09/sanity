import validator from '../src/validation/types/array'
import {shapeOf, someWith} from './utils'

describe('array types', () => {

  test('array type with no `of`', () => {
    const result = validator.validate({
      name: 'foo'
    })

    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-array-type-of-must-be-array',
        severity: 'error',
        message: expect.any(String)
      })))
  })

  test('array type with invalid value of `of`', () => {
    const result = validator.validate({
      name: 'foo',
      of: {}
    })
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-array-type-of-must-be-array',
        severity: 'error',
        message: expect.any(String)
      })))
  })
})

describe('array subtypes', () => {
  test('array subtype with `of`', () => {

    const result = validator.validateMember({
      name: 'foo',
      type: 'customArray',
      of: []
    })

    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-subtype-inheritance',
        severity: 'error',
        message: expect.any(String)
      })))
  })
})
