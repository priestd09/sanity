// @flow
import type {TypeDef, ValidationResult} from '../../flowtypes'
import {error, warning} from '../createValidationResult'

type MemberValidator = (TypeDef) => Array<ValidationResult>

function validateOfType(ofType: TypeDef, validateMember: MemberValidator): Array<ValidationResult> {
  // todo: check for mix of primitive / complex values
  return validateMember(ofType)
}

export default {
  validate(typeDef: TypeDef, validateMember: MemberValidator): Array<ValidationResult> {
    // name should already have been marked
    let result = []
    if (Array.isArray(typeDef.of)) {
      typeDef.of.forEach(ofType => {
        result = result.concat(validateOfType(ofType, validateMember))
      })
    } else if (typeDef.fields) {
      result.push(error('The "fields" property on object types must be an array of fields', 'schema-object-type-fields-must-be-array'))
    } else {
      result.push(error('The object type is missing a required "fields" property', 'schema-array-type-of-must-be-array'))
    }
    return result
  },
  validateMember(memberTypeDef: TypeDef): Array<ValidationResult> {
    const problems = []
    if (memberTypeDef.of) {
      problems.push(error('Cannot overwrite the `of` property on object types', 'schema-subtype-inheritance'))
    }
    return problems
  }
}
