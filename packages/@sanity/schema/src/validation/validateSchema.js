// @flow
import type {SchemaDef, TypeDef, ValidationResult} from '../flowtypes'
import inspect from '../inspect'
import {error} from './createValidationResult'
import baseTypeValidator from './types/base'

type IndexedTypes = {
  [string]: TypeDef
}

type MemberValidator = (TypeDef) => Array<ValidationResult>

type Validators = {
  [string]: {
    validate: (TypeDef, MemberValidator) => Array<ValidationResult>,
    validateMember: (TypeDef) => Array<ValidationResult>
  }
}

function isValidTypeName(typeName: any) {
  return typeof typeName === 'string' && typeName
}

function indexTypesByName(types: Array<TypeDef>): ValidationResult<IndexedTypes> {
  const problems = []
  const result = types.reduce((indexed, typeDef) => {
    if (!isValidTypeName(typeDef.name)) {
      problems.push(
        error(
          `Found a type with a missing "name" attribute. Please check the type ${inspect(typeDef)}`,
          'schema-type-invalid-or-missing-attr-name'
        )
      )
    } else if (typeDef.name in indexed) {
      problems.push(
        error(
          `Duplicate type declaration with name ${typeDef.name}. Please check the type ${inspect(typeDef)}`,
          'schema-type-duplicate-name'
        )
      )
    } else {
      indexed[typeDef.name] = typeDef
    }
    return indexed
  }, {})
  return [result, problems]
}

const flatten = arr => arr.reduce((acc, item) => item.concat(acc), [])

function validateTypes(types: Array<TypeDef>, builtinTypes): Array<ValidationResult> {
  const [indexed, problemsWhileIndexing] = indexTypesByName(types)

  return [
    ...problemsWhileIndexing,
    ...flatten(Object.keys(indexed).map(typeName => validateType(indexed[typeName], indexed, builtinTypes)))
  ]
}

function inSchema(typeName: string, indexed: IndexedTypes, builtinValidators: Object) {
  return typeName in indexed || typeName in builtinValidators
}

function createMemberValidator(indexedTypes: IndexedTypes, builtinValidators: Validators): MemberValidator {
  return memberTypeDef => {
    if (!inSchema(memberTypeDef.type, indexedTypes, builtinValidators)) {
      return [error(`Type of member ${inspect(memberTypeDef)} is not in schema`)]
    }
    const validator = builtinValidators[memberTypeDef.type]
    return [
      ...baseTypeValidator.validateMember(memberTypeDef),
      ...validator.validateMember(memberTypeDef)
    ]
  }
}

function validateType(typeDef: TypeDef, indexedTypes, builtinValidators: Validators): Array<ValidationResult> {
  if (!inSchema(typeDef.type, indexedTypes, builtinValidators)) {
    return [
      error(
        `No type with name ${typeDef.type} found in schema. Did you forgot to add a type with name "${typeDef.type}"?`, 'schema-type-missing-type'
      )
    ]
  }

  const validateMemberType = createMemberValidator(indexedTypes, builtinValidators)

  const validator = builtinValidators[typeDef.type]
  return [
    ...baseTypeValidator.validate(typeDef),
    ...validator.validate(typeDef, validateMemberType)
  ]
}

function validateSchemaName(name: any): ?ValidationResult {
  if (typeof name === 'undefined') {
    return error('The schema is missing a `name` attribute', 'schema-invalid-name')
  }
  if (typeof name !== 'string') {
    return error('The `schema.name` attribute should be a string', 'schema-invalid-name')
  }
  return null
}

export function validateSchemaDef(schemaDef: SchemaDef, builtinValidators: Validators = {}): Array<ValidationResult> {
  return [
    validateSchemaName(schemaDef.name),
    ...validateTypes(schemaDef.types, builtinValidators)
  ]
    .filter(Boolean)
}
