import rawSchemas from './fixtures/legacy-schemas'
import createValidator from '../src/validation/createValidator'
import * as baseTypes from '../src/validation/types'


const validate = createValidator(baseTypes)

test('legacy schema smoke test', () => {
  Object.keys(rawSchemas).forEach(name => {
    console.log(validate(rawSchemas[name]).filter(problem => problem.severity === 'error'))
  })
})
