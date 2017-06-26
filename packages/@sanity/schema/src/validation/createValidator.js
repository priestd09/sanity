import type {SchemaDef, Validators} from '../flowtypes'
import {validateSchemaDef} from './validateSchema'

export default function createValidator(builtins : Validators) {
  return (schemaDef : SchemaDef) => {
    return validateSchemaDef(schemaDef, builtins)
  }
}
