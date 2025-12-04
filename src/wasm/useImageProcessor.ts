/**
 * useImageProcessor Hook
 * React hook for image processing utilities
 */
import { useState, useCallback } from 'react';
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
  state: ProcessingState;
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
 * Hook for image processing in React components
 */
export function useImageProcessor(): UseImageProcessorReturn {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
  });

  const wrapOperation = useCallback(
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
      },
    []
  );

  const resize = useCallback(
    async (source: File | Blob, options: ImageProcessOptions) => {
      return wrapOperation(() => resizeImage(source, options))();
    },
    [wrapOperation]
  );

  const crop = useCallback(
    async (
      source: File | Blob,
      cropArea: { x: number; y: number; width: number; height: number },
      options?: Omit<ImageProcessOptions, 'width' | 'height'>
    ) => {
      return wrapOperation(() => cropImage(source, cropArea, options))();
    },
    [wrapOperation]
  );

  const applyFiltersWrapped = useCallback(
    async (
      source: File | Blob,
      filters: FilterOptions,
      options?: Omit<ImageProcessOptions, 'width' | 'height'>
    ) => {
      return wrapOperation(() => applyFilters(source, filters, options))();
    },
    [wrapOperation]
  );

  const rotate = useCallback(
    async (
      source: File | Blob,
      degrees: number,
      options?: Omit<ImageProcessOptions, 'width' | 'height'>
    ) => {
      return wrapOperation(() => rotateImage(source, degrees, options))();
    },
    [wrapOperation]
  );

  const flip = useCallback(
    async (
      source: File | Blob,
      direction: 'horizontal' | 'vertical',
      options?: Omit<ImageProcessOptions, 'width' | 'height'>
    ) => {
      return wrapOperation(() => flipImage(source, direction, options))();
    },
    [wrapOperation]
  );

  const convert = useCallback(
    async (
      source: File | Blob,
      format: 'jpeg' | 'png' | 'webp',
      quality?: number
    ) => {
      return wrapOperation(() => convertImage(source, format, quality))();
    },
    [wrapOperation]
  );

  const getDimensions = useCallback(
    async (source: File | Blob) => {
      return wrapOperation(() => getImageDimensions(source))();
    },
    [wrapOperation]
  );

  const thumbnail = useCallback(
    async (
      source: File | Blob,
      maxSize: number,
      options?: Omit<ImageProcessOptions, 'width' | 'height'>
    ) => {
      return wrapOperation(() => createThumbnail(source, maxSize, options))();
    },
    [wrapOperation]
  );

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
