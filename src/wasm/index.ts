/**
 * WASM Utilities
 * High-performance media processing using WebAssembly
 */

// FFmpeg - Audio/Video processing
export {
  loadFFmpeg,
  getFFmpeg,
  isFFmpegLoaded,
  convertAudio,
  extractAudio,
  trimMedia,
  getMediaInfo,
  fetchFile,
  type FFmpegLoadingState,
} from './ffmpeg';

export { useFFmpeg, type UseFFmpegReturn } from './useFFmpeg';

// Image Processing
export {
  loadImage,
  resizeImage,
  cropImage,
  applyFilters,
  rotateImage,
  flipImage,
  convertImage,
  getImageDimensions,
  createThumbnail,
  type ImageProcessOptions,
  type FilterOptions,
} from './imageProcessor';

export {
  useImageProcessor,
  type UseImageProcessorReturn,
  type ProcessingState,
} from './useImageProcessor';
