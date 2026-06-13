import { Image as InternalImage } from './image'
import { ImagePreviewGroup } from './preview-group'
import type { ImageComponent } from './interface'

export const Image = InternalImage as ImageComponent
Image.PreviewGroup = ImagePreviewGroup

export type * from './interface'
