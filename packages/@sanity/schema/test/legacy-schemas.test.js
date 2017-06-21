import Schema from '../src/Schema'

import rawSchemas from './fixtures/legacy-schemas'

test('legacy schema smoke test', () => {
  function parseSchema(schemaDef) {
    const schema = Schema.compile(schemaDef)
    schema.getTypeNames().forEach(typeName => {
      const type = schema.get(typeName)
      expect(type).toBeDefined()
    })
  }

  Object.keys(rawSchemas).forEach(name => {
    parseSchema(rawSchemas[name])
  })

})
