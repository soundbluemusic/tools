/**
 * FFmpeg WASM Wrapper
 * Provides audio/video processing capabilities using FFmpeg compiled to WebAssembly
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Singleton FFmpeg instance
let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * Convert FFmpeg FileData to ArrayBuffer for Blob creation
 * FFmpeg returns FileData which can be string | Uint8Array
 */
function toArrayBuffer(data: Uint8Array | string): ArrayBuffer {
  if (data instanceof Uint8Array) {
    // Create a new ArrayBuffer to ensure compatibility (avoid SharedArrayBuffer issues)
    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(data);
    return buffer;
  }
  // If string (rare case), convert using TextEncoder
  const encoded = new TextEncoder().encode(data);
  const buffer = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(buffer).set(encoded);
  return buffer;
}

/**
 * FFmpeg loading state
 */
export interface FFmpegLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  progress: number;
  error: Error | null;
}

/**
 * Load FFmpeg instance (singleton pattern)
 * Uses CDN for WASM files to avoid bundling issues
 */
export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  // Return existing instance if loaded
  if (ffmpeg?.loaded) {
    return ffmpeg;
  }

  // Return existing loading promise if in progress
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    ffmpeg = new FFmpeg();

    // Set up progress callback
    ffmpeg.on('progress', ({ progress }) => {
      onProgress?.(progress);
    });

    // Load FFmpeg with CDN-hosted WASM files
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    });

    return ffmpeg;
  })();

  return loadPromise;
}

/**
 * Get FFmpeg instance (throws if not loaded)
 */
export function getFFmpeg(): FFmpeg {
  if (!ffmpeg?.loaded) {
    throw new Error('FFmpeg not loaded. Call loadFFmpeg() first.');
  }
  return ffmpeg;
}

/**
 * Check if FFmpeg is loaded
 */
export function isFFmpegLoaded(): boolean {
  return ffmpeg?.loaded ?? false;
}

/**
 * Convert audio file to different format
 */
export async function convertAudio(
  inputFile: File | Blob,
  outputFormat: 'mp3' | 'wav' | 'ogg' | 'flac' | 'aac',
  options?: {
    bitrate?: string;
    sampleRate?: number;
    channels?: number;
  }
): Promise<Blob> {
  const ff = getFFmpeg();
  const inputName = 'input';
  const outputName = `output.${outputFormat}`;

  // Write input file to FFmpeg virtual filesystem
  await ff.writeFile(inputName, await fetchFile(inputFile));

  // Build FFmpeg command
  const args = ['-i', inputName];

  if (options?.bitrate) {
    args.push('-b:a', options.bitrate);
  }
  if (options?.sampleRate) {
    args.push('-ar', options.sampleRate.toString());
  }
  if (options?.channels) {
    args.push('-ac', options.channels.toString());
  }

  args.push(outputName);

  // Execute conversion
  await ff.exec(args);

  // Read output file
  const data = await ff.readFile(outputName);

  // Cleanup
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  // Return as Blob (convert Uint8Array to ensure compatibility)
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
  };

  const buffer = toArrayBuffer(data);
  return new Blob([buffer], { type: mimeTypes[outputFormat] });
}

/**
 * Extract audio from video file
 */
export async function extractAudio(
  videoFile: File | Blob,
  outputFormat: 'mp3' | 'wav' | 'ogg' = 'mp3'
): Promise<Blob> {
  const ff = getFFmpeg();
  const inputName = 'input';
  const outputName = `output.${outputFormat}`;

  await ff.writeFile(inputName, await fetchFile(videoFile));
  await ff.exec(['-i', inputName, '-vn', '-acodec', 'libmp3lame', outputName]);

  const data = await ff.readFile(outputName);

  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
  };

  const buffer = toArrayBuffer(data);
  return new Blob([buffer], { type: mimeTypes[outputFormat] });
}

/**
 * Trim audio/video file
 */
export async function trimMedia(
  file: File | Blob,
  startTime: number,
  endTime: number,
  outputFormat?: string
): Promise<Blob> {
  const ff = getFFmpeg();
  const inputName = 'input';
  const format = outputFormat || (file as File).name?.split('.').pop() || 'mp3';
  const outputName = `output.${format}`;

  await ff.writeFile(inputName, await fetchFile(file));

  const duration = endTime - startTime;
  await ff.exec([
    '-i',
    inputName,
    '-ss',
    startTime.toString(),
    '-t',
    duration.toString(),
    '-c',
    'copy',
    outputName,
  ]);

  const data = await ff.readFile(outputName);

  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  const buffer = toArrayBuffer(data);
  return new Blob([buffer]);
}

/**
 * Get media file metadata
 */
export async function getMediaInfo(
  file: File | Blob
): Promise<{ duration: number; format: string }> {
  const ff = getFFmpeg();
  const inputName = 'input';

  await ff.writeFile(inputName, await fetchFile(file));

  let output = '';
  ff.on('log', ({ message }) => {
    output += message + '\n';
  });

  try {
    await ff.exec(['-i', inputName]);
  } catch {
    // FFmpeg exits with error when only getting info, but output is still captured
  }

  await ff.deleteFile(inputName);

  // Parse duration from output
  const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
  const duration = durationMatch
    ? parseInt(durationMatch[1]) * 3600 +
      parseInt(durationMatch[2]) * 60 +
      parseInt(durationMatch[3])
    : 0;

  return {
    duration,
    format: (file as File).type || 'unknown',
  };
}

// Re-export fetchFile for convenience
export { fetchFile };
