// @flow
import {pick, keyBy, startCase} from 'lodash'
import {lazyGetter} from './utils'
import createPreviewGetter from '../preview/createPreviewGetter'
import type {TypeFactory} from '../flowtypes'

const OVERRIDABLE_FIELDS = ['jsonType', 'type', 'name', 'title', 'description', 'options', 'inputComponent']

const OBJECT_CORE = {
  name: 'object',
  type: null,
  jsonType: 'object'
}

export const ObjectType : TypeFactory = {
  get() {
    return OBJECT_CORE
  },
  extend(typeDef, createMemberType) : TypeFactory {
    const options = {...(typeDef.options || {})}
    const parsed = Object.assign(pick(OBJECT_CORE, OVERRIDABLE_FIELDS), typeDef, {
      type: OBJECT_CORE,
      title: typeDef.title || (typeDef.name ? startCase(typeDef.name) : ''),
      options: options,
      fields: typeDef.fields.map(fieldDef => {
        const {name, fieldset, ...rest} = fieldDef

        const compiledField = {
          name,
          fieldset,
        }

        return lazyGetter(compiledField, 'type', () => {
          return createMemberType({
            ...rest,
            title: fieldDef.title || startCase(name)
          })
        })
      })
    })

    lazyGetter(parsed, 'fieldsets', () => {
      return createFieldsets(typeDef, parsed.fields)
    })

    lazyGetter(parsed, 'preview', createPreviewGetter(typeDef))

    return extend(parsed)

    function extend(parent) : TypeFactory {
      return {
        get() {
          return parent
        },
        extend: subTypeDef => {
          return extend(Object.assign({}, parent, pick(subTypeDef, OVERRIDABLE_FIELDS), {
            title: subTypeDef.title || typeDef.title,
            type: parent
          }))
        }
      }
    }
  }
}

function createFieldsets(typeDef, fields) {
  const fieldsetsDef = (typeDef.fieldsets || [])
  const fieldsets = fieldsetsDef.map(fieldset => {
    const {name, title, description, options} = fieldset
    return {
      name,
      title,
      description,
      options,
      fields: []
    }
  })

  const fieldsetsByName = keyBy(fieldsets, 'name')

  return fields
    .map(field => {
      if (field.fieldset) {
        const fieldset = fieldsetsByName[field.fieldset]
        if (!fieldset) {
          throw new Error(`Group '${field.fieldset}' is not defined in schema for type '${typeDef.name}'`)
        }
        fieldset.fields.push(field)
        // Return the fieldset if its the first time we encounter a field in this fieldset
        return fieldset.fields.length === 1 ? fieldset : null
      }
      return {single: true, field}
    })
    .filter(Boolean)
}
