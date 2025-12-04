/**
 * useImageProcessor Hook
 * Solid.js hook for image processing utilities
 */
import { createSignal } from 'solid-js';
import {
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

/**
 * Processing state
 */
export interface ProcessingState {
  isProcessing: boolean;
  error: Error | null;
}

/**
 * Hook return type
 */
export interface UseImageProcessorReturn {
  state: () => ProcessingState;
  resize: (
    source: File | Blob,
    options: ImageProcessOptions
  ) => Promise<Blob | null>;
  crop: (
    source: File | Blob,
    crop: { x: number; y: number; width: number; height: number },
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => Promise<Blob | null>;
  applyFilters: (
    source: File | Blob,
    filters: FilterOptions,
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => Promise<Blob | null>;
  rotate: (
    source: File | Blob,
    degrees: number,
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => Promise<Blob | null>;
  flip: (
    source: File | Blob,
    direction: 'horizontal' | 'vertical',
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => Promise<Blob | null>;
  convert: (
    source: File | Blob,
    format: 'jpeg' | 'png' | 'webp',
    quality?: number
  ) => Promise<Blob | null>;
  getDimensions: (
    source: File | Blob
  ) => Promise<{ width: number; height: number } | null>;
  thumbnail: (
    source: File | Blob,
    maxSize: number,
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => Promise<Blob | null>;
}

/**
 * Hook for image processing in Solid.js components
 */
export function useImageProcessor(): UseImageProcessorReturn {
  const [state, setState] = createSignal<ProcessingState>({
    isProcessing: false,
    error: null,
  });

  const wrapOperation =
    <T>(operation: () => Promise<T>) =>
    async (): Promise<T | null> => {
      setState({ isProcessing: true, error: null });
      try {
        const result = await operation();
        setState({ isProcessing: false, error: null });
        return result;
      } catch (error) {
        setState({
          isProcessing: false,
          error:
            error instanceof Error ? error : new Error('Processing failed'),
        });
        return null;
      }
    };

  const resize = async (source: File | Blob, options: ImageProcessOptions) => {
    return wrapOperation(() => resizeImage(source, options))();
  };

  const crop = async (
    source: File | Blob,
    cropArea: { x: number; y: number; width: number; height: number },
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => {
    return wrapOperation(() => cropImage(source, cropArea, options))();
  };

  const applyFiltersWrapped = async (
    source: File | Blob,
    filters: FilterOptions,
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => {
    return wrapOperation(() => applyFilters(source, filters, options))();
  };

  const rotate = async (
    source: File | Blob,
    degrees: number,
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => {
    return wrapOperation(() => rotateImage(source, degrees, options))();
  };

  const flip = async (
    source: File | Blob,
    direction: 'horizontal' | 'vertical',
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => {
    return wrapOperation(() => flipImage(source, direction, options))();
  };

  const convert = async (
    source: File | Blob,
    format: 'jpeg' | 'png' | 'webp',
    quality?: number
  ) => {
    return wrapOperation(() => convertImage(source, format, quality))();
  };

  const getDimensions = async (source: File | Blob) => {
    return wrapOperation(() => getImageDimensions(source))();
  };

  const thumbnail = async (
    source: File | Blob,
    maxSize: number,
    options?: Omit<ImageProcessOptions, 'width' | 'height'>
  ) => {
    return wrapOperation(() => createThumbnail(source, maxSize, options))();
  };

  return {
    state,
    resize,
    crop,
    applyFilters: applyFiltersWrapped,
    rotate,
    flip,
    convert,
    getDimensions,
    thumbnail,
  };
}

export default useImageProcessor;
