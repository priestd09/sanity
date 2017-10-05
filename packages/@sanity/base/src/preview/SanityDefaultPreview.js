import PropTypes from 'prop-types'
import React from 'react'
import UploadProgressBar from './UploadProgressBar'

import PreviewComponentCard from 'part:@sanity/components/previews/card'
import PreviewComponentDefault from 'part:@sanity/components/previews/default'
import PreviewComponentDetail from 'part:@sanity/components/previews/detail'
import PreviewComponentInline from 'part:@sanity/components/previews/inline'
import PreviewComponentMedia from 'part:@sanity/components/previews/media'
import PreviewComponentBlock from 'part:@sanity/components/previews/block'

const previewComponentMap = {
  default: PreviewComponentDefault,
  card: PreviewComponentCard,
  media: PreviewComponentMedia,
  detail: PreviewComponentDetail,
  inline: PreviewComponentInline,
  block: PreviewComponentBlock
}

function extractUploadState(value) {
  if (!value || typeof value !== 'object') {
    return {_upload: null, value}
  }
  const {_upload, ...rest} = value
  return {_upload, value: rest}
}

export default class SanityDefaultPreview extends React.PureComponent {

  static propTypes = {
    layout: PropTypes.oneOf(Object.keys(previewComponentMap)),
    value: PropTypes.object
  }

  render() {
    const {layout, ...rest} = this.props

    const PreviewComponent = previewComponentMap.hasOwnProperty(layout)
      ? previewComponentMap[layout]
      : previewComponentMap.default

    const {_upload, value} = extractUploadState(this.props.value)

    const item = _upload ? {
      ...value,
      // todo: remove this from here and handle invalid preview urls (e.g. blob urls from another computer)
      imageUrl: _upload.previewImage
    } : value

    return (
      <div>
        {_upload && <UploadProgressBar percent={_upload.percent} />}
        <PreviewComponent item={item} {...rest} />
      </div>
    )
  }
}
