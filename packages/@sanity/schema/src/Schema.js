// @flow
import type {SchemaDef, Type} from './flowtypes'

import * as types from './types'
import {createHelpfulError} from './helpfulError'
import inspect from 'object-inspect'
import {compileRegistry} from './compileRegistry'
import {validateSchemaDef} from './validation/validateSchema'

export default {
  compile: function (schemaDef: SchemaDef) {
    if (!(schemaDef && typeof schemaDef === 'object' && Array.isArray(schemaDef.types) && schemaDef.name && typeof schemaDef.name === 'string')) {
      throw createHelpfulError(
        `Expected schema to be an object with a name and an array of types, instead got ${inspect(schemaDef)}`,
        'schema-compile-invalid-arguments'
      )
    }

    const validation = validateSchemaDef(schemaDef, types)

    const registry = compileRegistry(schemaDef, types)

    return {
      name: schemaDef.name,
      get(name: string): Type {
        return registry[name] && registry[name].get()
      },

      has(name: string): boolean {
        return name in registry
      },
      getTypeNames(): string[] {
        return Object.keys(registry)
      }
    }
  }
}
