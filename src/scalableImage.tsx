import * as React from 'react'
import { Image, StyleSheet, ImageProps, ImageStyle, ImageURISource, StyleProp, } from 'react-native'

interface Size {
  width?: number
  height?: number
}

interface ScalableImageState {
  size: Size
  style?: StyleProp<ImageStyle>
}

export type ScalableImageProps = {
  onSize?: (size: Size) => void
} & Partial<DefaultProps>

const defaultProps = {
  source: {}
}

type DefaultProps = Readonly<typeof defaultProps>

export const scalableImage = <Q extends ImageProps, P extends Q & ScalableImageProps> (Component: React.ComponentType<Q>) =>
  class ScalableImage extends React.Component<P, ScalableImageState> {
    static defaultProps = defaultProps

    state: ScalableImageState = {
      size: {}
    }

    mounted = false

    static isImageUri (source: any): source is ImageURISource {
      return source.uri
    }

    componentWillReceiveProps (props: P) {
      if (ScalableImage.isImageUri(props.source) && props.source.uri) {
        Image.getSize(props.source.uri,
          (width, height) => this.adjustSize(width, height, props),
          console.error)
      } else {
        const source = Image.resolveAssetSource(this.props.source)
        this.adjustSize(source.width, source.height, props)
      }
    }

    componentWillMount () {
      this.mounted = true
    }

    componentWillUnmount () {
      this.mounted = false
    }

    adjustSize (sourceWidth: number, sourceHeight: number, props: P) {
      const { style } = props
      if (!style) return

      const { width, height } = StyleSheet.flatten(style) as { width: number, height: number }

      let ratio = 1

      if (width && height) {
        ratio = Math.min(width / sourceWidth, height / sourceHeight)
      } else if (width) {
        ratio = width / sourceWidth
      } else if (height) {
        ratio = height / sourceHeight
      }

      if (this.mounted) {
        this.setState({
          size: {
            width: sourceWidth * ratio,
            height: sourceHeight * ratio
          }
        }, () => {
          if (typeof this.props.onSize == 'function') {
            this.props.onSize(this.state.size)
          }
        })
      }
    }

    render () {
      return (
        <Component
          {...this.props}
          style={[this.props.style, this.state.size]}
        />
      )
    }
  }

export const ScalableImage = scalableImage(Image)
