export const BLOCK_DEFAULT_STYLE = 'normal'

// Slate block
export const SLATE_DEFAULT_BLOCK = Object.freeze({
  kind: 'block',
  type: 'contentBlock',
  data: {
    style: BLOCK_DEFAULT_STYLE
  }
})

export const DEFAULT_BLOCK = Object.freeze({
  _type: 'block',
  style: BLOCK_DEFAULT_STYLE
})
