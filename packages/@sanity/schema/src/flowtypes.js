
export type TypeDef = {
  name: string,
  type: string,
  title: ?string,
  description: ?string,
  options: ?Object
}

export type SchemaDef = {
  name: string,
  types: Array<TypeDef>
}

export type Type = {
  name: string
}

export type ValidationResult = {
  severity: 'warning' | 'info' | 'error',
  message: string,
  helpId?: string,
  path?: string[],
}

export type MemberValidator = (TypeDef) => Array<ValidationResult>

export type TypeFactory = {
  get() : TypeFactory,
  extend: (TypeDef) => TypeFactory
}

export type Registry = { [string]: TypeFactory }

export type IndexedTypes = {
  [string]: TypeDef
}

export type Validators = {
  [string]: {
    validate: (TypeDef, MemberValidator) => Array<ValidationResult>,
    validateMember: (TypeDef) => Array<ValidationResult>
  }
}