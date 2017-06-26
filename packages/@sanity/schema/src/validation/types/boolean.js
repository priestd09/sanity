// @flow
import type {TypeDef, ValidationResult} from '../../flowtypes'
import {error, warning} from '../createValidationResult'
import inspect from '../../inspect'

export default {
  PROPS: ['defaultChecked'],
  validate(typeDef: TypeDef): Array<ValidationResult> {
    return []
  },
  validateMember(memberTypeDef: TypeDef): Array<ValidationResult> {
    return []
  }
}
