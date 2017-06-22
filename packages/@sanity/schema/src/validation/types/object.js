// @flow
import type {TypeDef, ValidationResult} from '../../flowtypes'
import {error, warning} from '../createValidationResult'
import inspect from '../../inspect'

// import validators from '../validation/validators'
const VALID_FIELD_RE = /[0-9A-Za-z_]/

type MemberValidator = (TypeDef) => Array<ValidationResult>

type Field = {
  name: string,
  fieldset: string
}

function getDuplicateFields(array: Array<Field>): Array<Array<Field>> {
  const dupes: { [string]: Array<Field> } = {}
  array.forEach(field => {
    if (!dupes[field.name]) {
      dupes[field.name] = []
    }
    dupes[field.name].push(field)
  })
  return Object.keys(dupes)
    .map(fieldName => (dupes[fieldName].length > 1 ? dupes[fieldName] : null))
    .filter(Boolean)
}

function validateField(field: Field, validateMember: MemberValidator): Array<ValidationResult> {
  const {name, fieldset, ...fieldType} = field

  const fieldValidation = [
    field.name.startsWith('_') && error(
      `Invalid field name "${field.name}". Field names cannot start with underscores "_" as it's reserved for system fields.`,
    ),
    !VALID_FIELD_RE.test(field.name) && error(`Invalid field name: ${field.name}. Fields must match ${String(VALID_FIELD_RE)}`),
  ]
    .filter(Boolean)

  const memberValidation = validateMember(fieldType)

  return fieldValidation.concat(memberValidation)
}

export default {
  validate(typeDef: TypeDef, validateMember: MemberValidator): Array<ValidationResult> {
    let result = []
    if (Array.isArray(typeDef.fields)) {
      typeDef.fields.forEach((field, index) => {
        result = result.concat(validateField(field, validateMember))
      })

      const fieldsWithNames = typeDef.fields
        .filter(field => typeof field.name === 'string')

      getDuplicateFields(fieldsWithNames).forEach(dupes => {
        result.push(
          error(
            `Found fields with duplicate name ${dupes[0].name} in ${inspect(typeDef)}`,
            'schema-object-type-fields-not-unique'
          )
        )
      })

    } else {
      result.push(error('The "fields" property on object types must be an array of fields', 'schema-object-type-fields-must-be-array'))
    }

    return result
  },
  validateMember(memberTypeDef: TypeDef): Array<ValidationResult> {
    const problems = []
    if (memberTypeDef.fields) {
      problems.push(error('Cannot overwrite the `fields` property on object types', 'schema-subtype-inheritance'))
    }
    return problems
  }
}
