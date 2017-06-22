
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

export type TypeFactory = {
  get() : TypeFactory,
  extend: (TypeDef) => TypeFactory,
  validate: (TypeDef) => ValidationResult
}

export type Registry = { [string]: TypeFactory }

export type IndexedTypes = {
  [string]: TypeDef
}
