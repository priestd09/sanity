// @flow
import type {TypeDef, ValidationResult} from '../../flowtypes'
import {error, warning} from '../createValidationResult'
import inspect from '../../inspect'

export default {
  validate(typeDef: TypeDef): Array<ValidationResult> {
    return []
  },
  validateMember(memberTypeDef: TypeDef): Array<ValidationResult> {
    return []
  }
}
