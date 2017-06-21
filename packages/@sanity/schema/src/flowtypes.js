
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

export type Type = any
export type Registry = { [string]: Type }

export type CompileProblem = {
  level: 'warning' | 'info' | 'error',
  message: string
}
