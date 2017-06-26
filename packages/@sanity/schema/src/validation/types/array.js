// @flow
import type {TypeDef, ValidationResult} from '../../flowtypes'
import {error, warning} from '../createValidationResult'
import inspect from '../../inspect'

type MemberValidator = (TypeDef) => Array<ValidationResult>

function validateOfType(ofType: TypeDef, validateMember: MemberValidator): Array<ValidationResult> {
  // todo: check for mix of primitive / complex values
  return validateMember(ofType)
}

type OfType = {
  type: string
}

function getDuplicateTypes(array: Array<OfType>): Array<Array<OfType>> {
  const dupes: { [string]: Array<OfType> } = {}
  array.forEach(ofType => {
    if (!dupes[ofType.type]) {
      dupes[ofType.type] = []
    }
    dupes[ofType.type].push(ofType)
  })
  return Object.keys(dupes)
    .map(typeName => (dupes[typeName].length > 1 ? dupes[typeName] : null))
    .filter(Boolean)
}

export default {
  PROPS: ['of'],
  OPTIONS: [],
  validate(typeDef: TypeDef, validateMember: MemberValidator): Array<ValidationResult> {
    // name should already have been marked
    let result = []
    if (Array.isArray(typeDef.of)) {
      typeDef.of.forEach(ofType => {
        result = result.concat(validateOfType(ofType, validateMember))
      })

      getDuplicateTypes(typeDef.of).forEach(dupes => {
        result.push(
          error(
            `Found ${dupes.length} members with type "${dupes[0].type}" in ${inspect(typeDef)}`,
            'schema-array-type-of-must-have-unique-types'
          )
        )
      })

    } else {
      result.push(error('The array type is missing or having an invalid value for the required "of" property', 'schema-array-type-of-must-be-array'))
    }
    return result
  },
  validateMember(memberTypeDef: TypeDef): Array<ValidationResult> {
    const problems = []
    if (memberTypeDef.type !== 'array' && memberTypeDef.of) {
      problems.push(error(`Cannot overwrite the "of" property on array types, check ${inspect(memberTypeDef)}`, 'schema-subtype-inheritance'))
    }
    return problems
  }
}
