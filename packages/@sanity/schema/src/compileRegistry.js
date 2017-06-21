import type {Registry, SchemaDef} from './flowtypes'

export function compileRegistry(schemaDef: SchemaDef, builtinTypes): Registry {
  const registry = Object.assign(Object.create(null), builtinTypes)

  const defsByName = schemaDef.types.reduce((acc, def) => {
    if (acc[def.name]) {
      throw new Error(`Duplicate type name added to schema: ${def.name}`)
    }
    acc[def.name] = def
    return acc
  }, {})

  schemaDef.types.forEach(add)

  return registry

  function ensure(typeName) {
    if (!registry[typeName]) {
      if (!defsByName[typeName]) {
        throw new Error(`Unknown type: ${typeName}`)
      }
      add(defsByName[typeName])
    }
  }

  function extendMember(memberDef) {
    ensure(memberDef.type)
    return registry[memberDef.type].extend(memberDef, extendMember).get()
  }

  function add(typeDef) {
    ensure(typeDef.type)
    if (registry[typeDef.name]) {
      return
    }
    registry[typeDef.name] = registry[typeDef.type].extend(typeDef, extendMember)
  }
}
