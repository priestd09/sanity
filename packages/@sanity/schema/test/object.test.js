import validator from '../src/validation/types/object'
import {shapeOf, someWith} from './utils'

describe('object types', () => {
  test('object type with no fields', () => {
    const result = validator.validate({
      name: 'foo',
    })
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-object-type-fields-must-be-array',
        severity: 'error',
        message: expect.any(String)
      })))
  })
  test('object type with non-array as fields', () => {
    const result = validator.validate({
      name: 'foo',
      fields: {}
    })
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-object-type-fields-must-be-array',
        severity: 'error',
        message: expect.any(String)
      })))
  })

  test('object type with duplicate field names', () => {
    const result = validator.validate({
      name: 'foo',
      fields: [
        {name: 'foo', type: 'string'},
        {name: 'foo', type: 'string'}
      ]
    }, () => [])
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-object-type-fields-not-unique',
        severity: 'error',
        message: expect.any(String)
      })))
  })
})

describe('object subtypes', () => {
  test('object subtype with fields', () => {

    const result = validator.validateMember({
      name: 'foo',
      type: 'customObject',
      fields: []
    })

    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-subtype-inheritance',
        severity: 'error',
        message: expect.any(String)
      })))
  })
})
