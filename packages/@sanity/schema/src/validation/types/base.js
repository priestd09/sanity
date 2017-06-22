// @flow
import type {TypeDef, ValidationResult} from '../../flowtypes'
import {error, warning} from '../createValidationResult'
import inspect from '../../inspect'

export default {
  validate(typeDef: TypeDef): Array<ValidationResult> {
    const result = []
    if (typeof typeDef.name !== 'string') {
      result.push(
        error(
          `Type is missing or having an invalid value for 'name': ${inspect(typeDef)}`,
          'schema-type-invalid-or-missing-attr-name'
        )
      )
    }
    if (typeof typeDef.type !== 'string') {
      result.push(
        error(
          `Type is missing or having an invalid value for 'name': ${inspect(typeDef)}`,
          'schema-type-invalid-or-missing-attr-type'
        )
      )
    }
    if (typeof typeDef.title !== 'string') {
      result.push(
        warning(
          `Type is missing or having an invalid value for 'title'. It's recommended to always add a title: ${inspect(typeDef)}`,
          'schema-type-invalid-or-missing-attr-title'
        )
      )
    }
    return result
  },
  validateMember(memberTypeDef: TypeDef): Array<ValidationResult> {
    const problems = []
    if (typeof memberTypeDef.name !== 'undefined') {
      problems.push(error('Member types should not be named', 'schema-member-type-cannot-be-named'))
    }
    // todo: validate preview config among others
    // todo: warn on unknown properties
    // todo: warn on unknown options
    return problems
  }
}
