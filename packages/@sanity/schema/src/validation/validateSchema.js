// @flow
import type {SchemaDef, Type, TypeDef} from '../flowtypes'
import inspect from '../inspect'

type Problem = {
  message: string,
  severity: 'info' | 'warning' | 'error',
  helpId?: string
}

function isValidTypeName(typeName: any) {
  return typeof typeName === 'string' && typeName
}

type ValidationResult<T> = [T, Array<Problem>]

function indexTypesByName(types: Array<TypeDef>): ValidationResult<{[string]: TypeDef}> {
  const problems = []
  const result = types.reduce((indexed, typeDef) => {
    if (!isValidTypeName(typeDef.name)) {
      problems.push(
        {
          severity: 'error',
          message: `Found a type with a missing "name" attribute. Please check the type ${inspect(typeDef)}`,
          helpId: 'schema-type-invalid-name'
        }
      )
    }
    else if (typeDef.name in indexed) {
      problems.push(
        {
          severity: 'error',
          message: `Duplicate type declaration with name ${typeDef.name}. Please check the type ${inspect(typeDef)}`,
          helpId: 'schema-type-duplicate-name'
        }
      )
    }
    else {
      indexed[typeDef.name] = typeDef
    }
    return indexed
  }, {})
  return [result, problems]
}

const flatten = arr => arr.reduce((acc, item) => item.concat(acc), [])

function validateTypes(types: Array<TypeDef>, builtinTypes): Array<Problem> {
  const [indexed, problemsWhileIndexing] = indexTypesByName(types)

  return [
    ...problemsWhileIndexing,
    ...flatten(Object.keys(indexed).map(typeName => validateType(indexed[typeName], indexed, builtinTypes)))
  ]
}

function inSchema(typeName : string, indexed: {[string]: TypeDef}, builtinTypes: Array<*>) {
  return typeName in indexed || builtinTypes.find(builtin => builtin.name === indexed)
}

function validateType(typeDef : TypeDef, indexedTypes, builtinTypes) : Array<Problem> {
  return [
    inSchema(typeDef.name, indexedTypes, builtinTypes)
    ? null
    : {severity: 'error', message: 'The `schema.name` attribute should be a string'}
  ]
    .filter(Boolean)
}

function validateSchemaName(name: any): ?Problem {
  if (typeof name === 'undefined') {
    return {
      severity: 'error',
      message: 'The schema is missing a `name` attribute',
      helpId: 'schema-invalid-name'
    }
  }
  if (typeof name !== 'string') {
    return {
      severity: 'error',
      message: 'The `schema.name` attribute should be a string',
      helpId: 'schema-invalid-name'
    }
  }
}

export function validateSchemaDef(schemaDef: SchemaDef, builtinTypes: any): Array<Problem> {
  return [
    validateSchemaName(schemaDef.name),
    ...validateTypes(schemaDef.types, builtinTypes)
  ]
    .filter(Boolean)
}
