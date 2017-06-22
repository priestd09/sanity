import validator from '../src/validation/types/base'
import {shapeOf, someWith} from './utils'

describe('all types', () => {

  test('type definition with no type', () => {
    const result = validator.validate({})
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-type-invalid-or-missing-attr-type',
        severity: 'error',
        message: expect.any(String)
      })))
  })

  test('type with no name', () => {
    const result = validator.validate({})
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-type-invalid-or-missing-attr-name',
        severity: 'error',
        message: expect.any(String)
      })))
  })

  test('type with no title', () => {
    const result = validator.validate({})
    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-type-invalid-or-missing-attr-title',
        severity: 'warning',
        message: expect.any(String)
      })))
  })

})

describe('all member types', () => {

  test('member types with name', () => {
    const result = validator.validateMember({
      name: 'foo'
    })

    expect(result).toEqual(
      someWith(shapeOf({
        helpId: 'schema-member-type-cannot-be-named',
        severity: 'error',
        message: expect.any(String)
      })))
  })

})
