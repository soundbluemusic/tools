/**
 * useFFmpeg Hook
 * Solid.js hook for using FFmpeg WASM
 */
import { createSignal, createEffect, onCleanup } from 'solid-js';
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
  state: () => FFmpegLoadingState;

  // Actions
  load: () => Promise<void>;
  convertAudio: typeof convertAudio;
  extractAudio: typeof extractAudio;
  trimMedia: typeof trimMedia;
  getMediaInfo: typeof getMediaInfo;
}

/**
 * Hook for using FFmpeg in Solid.js components
 * Handles loading state and provides convenient methods
 */
export function useFFmpeg(autoLoad = false): UseFFmpegReturn {
  const [state, setState] = createSignal<FFmpegLoadingState>({
    isLoading: false,
    isLoaded: isFFmpegLoaded(),
    progress: 0,
    error: null,
  });

  let loadingRef = false;

  const load = async () => {
    if (state().isLoaded || loadingRef) return;

    loadingRef = true;
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
      loadingRef = false;
    }
  };

  // Auto-load if requested
  createEffect(() => {
    if (autoLoad && !state().isLoaded && !state().isLoading) {
      load();
    }
  });

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
