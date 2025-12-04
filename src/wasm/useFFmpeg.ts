/**
 * useFFmpeg Hook
 * React hook for using FFmpeg WASM
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  loadFFmpeg,
  isFFmpegLoaded,
  convertAudio,
  extractAudio,
  trimMedia,
  getMediaInfo,
  type FFmpegLoadingState,
} from './ffmpeg';

/**
 * FFmpeg hook return type
 */
export interface UseFFmpegReturn {
  // State
  state: FFmpegLoadingState;

  // Actions
  load: () => Promise<void>;
  convertAudio: typeof convertAudio;
  extractAudio: typeof extractAudio;
  trimMedia: typeof trimMedia;
  getMediaInfo: typeof getMediaInfo;
}

/**
 * Hook for using FFmpeg in React components
 * Handles loading state and provides convenient methods
 */
export function useFFmpeg(autoLoad = false): UseFFmpegReturn {
  const [state, setState] = useState<FFmpegLoadingState>({
    isLoading: false,
    isLoaded: isFFmpegLoaded(),
    progress: 0,
    error: null,
  });

  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (state.isLoaded || loadingRef.current) return;

    loadingRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await loadFFmpeg((progress) => {
        setState((prev) => ({ ...prev, progress }));
      });
      setState({
        isLoading: false,
        isLoaded: true,
        progress: 1,
        error: null,
      });
    } catch (error) {
      setState({
        isLoading: false,
        isLoaded: false,
        progress: 0,
        error:
          error instanceof Error ? error : new Error('Failed to load FFmpeg'),
      });
    } finally {
      loadingRef.current = false;
    }
  }, [state.isLoaded]);

  // Auto-load if requested
  useEffect(() => {
    if (autoLoad && !state.isLoaded && !state.isLoading) {
      load();
    }
  }, [autoLoad, state.isLoaded, state.isLoading, load]);

  return {
    state,
    load,
    convertAudio,
    extractAudio,
    trimMedia,
    getMediaInfo,
  };
}

export default useFFmpeg;
