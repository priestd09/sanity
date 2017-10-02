import defaultSchema from '../../../fixtures/defaultSchema'

const blockContentType = defaultSchema.get('blogPost')
  .fields.find(field => field.name === 'body').type

export default (input, HtmlDeserializer, commonOptions) => {
  const options = {
    ...commonOptions
  }
  const htmlDeserializer = new HtmlDeserializer(blockContentType, options)
  return htmlDeserializer.deserialize(input)
}
