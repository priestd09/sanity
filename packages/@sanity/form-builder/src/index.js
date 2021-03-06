import * as FileInput from './inputs/File'
import * as ImageInput from './inputs/Image'
import * as SlugInput from './inputs/Slug'

export {default as FormBuilder} from './FormBuilder'
export {default as FormBuilderContext} from './FormBuilderContext'
export {default as BlockEditor} from './inputs/BlockEditor-slate'
export {default as ReferenceInput} from './inputs/Reference'

// Input component factories
export {ImageInput}
export {FileInput}
export {SlugInput}

export function createFormBuilder() {
  throw new Error('The factory function createFormBuilder(...) has been removed. Please use <FormBuilder .../> instead')
}
