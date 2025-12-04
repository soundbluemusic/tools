/**
 * OPFS (Origin Private File System) Storage
 * High-performance file system for audio streaming and large file handling
 *
 * Architecture:
 * - Uses File System Access API (OPFS)
 * - Provides sync access for audio processing (via FileSystemSyncAccessHandle)
 * - Handles large audio files without blocking main thread
 * - Supports streaming reads/writes
 */

// ============================================
// Types
// ============================================

/**
 * File metadata stored alongside files
 */
export interface OPFSFileMetadata {
  name: string;
  size: number;
  type: string;
  createdAt: number;
  updatedAt: number;
  duration?: number; // For audio files
  sampleRate?: number;
  channels?: number;
}

/**
 * Result of reading a file
 */
export interface OPFSFileResult {
  data: ArrayBuffer;
  metadata: OPFSFileMetadata;
}

/**
 * Streaming reader for large files
 */
export interface OPFSStreamReader {
  read(offset: number, length: number): Promise<ArrayBuffer>;
  getSize(): number;
  close(): void;
}

// ============================================
// Feature Detection
// ============================================

/**
 * Check if OPFS is supported
 */
export function isOPFSSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    'getDirectory' in navigator.storage
  );
}

/**
 * Check if sync access handles are supported (for AudioWorklet)
 */
export function isSyncAccessSupported(): boolean {
  return (
    isOPFSSupported() &&
    typeof FileSystemFileHandle !== 'undefined' &&
    'createSyncAccessHandle' in FileSystemFileHandle.prototype
  );
}

// ============================================
// Directory Management
// ============================================

/**
 * Get the root OPFS directory
 */
async function getRootDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isOPFSSupported()) {
    throw new Error('OPFS is not supported in this browser');
  }
  return navigator.storage.getDirectory();
}

/**
 * Get or create a subdirectory
 */
async function getDirectory(
  path: string
): Promise<FileSystemDirectoryHandle> {
  const root = await getRootDirectory();
  const parts = path.split('/').filter(Boolean);

  let current = root;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }

  return current;
}

/**
 * Directory paths for different file types
 */
const DIRECTORIES = {
  audio: 'audio',
  projects: 'projects',
  temp: 'temp',
  cache: 'cache',
} as const;

// ============================================
// File Operations
// ============================================

/**
 * Write file to OPFS
 */
export async function writeFile(
  directory: keyof typeof DIRECTORIES,
  fileName: string,
  data: ArrayBuffer | Blob,
  metadata?: Partial<OPFSFileMetadata>
): Promise<OPFSFileMetadata> {
  const dir = await getDirectory(DIRECTORIES[directory]);
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();

  // Write the actual data
  if (data instanceof Blob) {
    await writable.write(data);
  } else {
    await writable.write(new Blob([data]));
  }
  await writable.close();

  // Create and store metadata
  const fullMetadata: OPFSFileMetadata = {
    name: fileName,
    size: data instanceof Blob ? data.size : data.byteLength,
    type: metadata?.type || 'application/octet-stream',
    createdAt: metadata?.createdAt || Date.now(),
    updatedAt: Date.now(),
    duration: metadata?.duration,
    sampleRate: metadata?.sampleRate,
    channels: metadata?.channels,
  };

  // Store metadata in a companion file
  const metaHandle = await dir.getFileHandle(`${fileName}.meta`, {
    create: true,
  });
  const metaWritable = await metaHandle.createWritable();
  await metaWritable.write(JSON.stringify(fullMetadata));
  await metaWritable.close();

  return fullMetadata;
}

/**
 * Read file from OPFS
 */
export async function readFile(
  directory: keyof typeof DIRECTORIES,
  fileName: string
): Promise<OPFSFileResult> {
  const dir = await getDirectory(DIRECTORIES[directory]);

  // Read metadata
  let metadata: OPFSFileMetadata;
  try {
    const metaHandle = await dir.getFileHandle(`${fileName}.meta`);
    const metaFile = await metaHandle.getFile();
    metadata = JSON.parse(await metaFile.text());
  } catch {
    // If no metadata, create basic one
    const fileHandle = await dir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    metadata = {
      name: fileName,
      size: file.size,
      type: file.type || 'application/octet-stream',
      createdAt: file.lastModified,
      updatedAt: file.lastModified,
    };
  }

  // Read file data
  const fileHandle = await dir.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  const data = await file.arrayBuffer();

  return { data, metadata };
}

/**
 * Delete file from OPFS
 */
export async function deleteFile(
  directory: keyof typeof DIRECTORIES,
  fileName: string
): Promise<void> {
  const dir = await getDirectory(DIRECTORIES[directory]);

  // Delete main file
  try {
    await dir.removeEntry(fileName);
  } catch {
    // File might not exist
  }

  // Delete metadata file
  try {
    await dir.removeEntry(`${fileName}.meta`);
  } catch {
    // Metadata might not exist
  }
}

/**
 * List files in directory
 */
export async function listFiles(
  directory: keyof typeof DIRECTORIES
): Promise<OPFSFileMetadata[]> {
  const dir = await getDirectory(DIRECTORIES[directory]);
  const files: OPFSFileMetadata[] = [];

  for await (const [name, handle] of dir.entries()) {
    // Skip metadata files
    if (name.endsWith('.meta')) continue;

    if (handle.kind === 'file') {
      try {
        // Try to read metadata
        const metaHandle = await dir.getFileHandle(`${name}.meta`);
        const metaFile = await metaHandle.getFile();
        const metadata = JSON.parse(await metaFile.text());
        files.push(metadata);
      } catch {
        // If no metadata, create basic one
        const file = await handle.getFile();
        files.push({
          name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          createdAt: file.lastModified,
          updatedAt: file.lastModified,
        });
      }
    }
  }

  return files;
}

/**
 * Check if file exists
 */
export async function fileExists(
  directory: keyof typeof DIRECTORIES,
  fileName: string
): Promise<boolean> {
  try {
    const dir = await getDirectory(DIRECTORIES[directory]);
    await dir.getFileHandle(fileName);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Streaming Operations (for large audio files)
// ============================================

/**
 * Create streaming reader for large files
 * Allows reading chunks without loading entire file into memory
 */
export async function createStreamReader(
  directory: keyof typeof DIRECTORIES,
  fileName: string
): Promise<OPFSStreamReader> {
  const dir = await getDirectory(DIRECTORIES[directory]);
  const fileHandle = await dir.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  const size = file.size;

  return {
    async read(offset: number, length: number): Promise<ArrayBuffer> {
      const blob = file.slice(offset, offset + length);
      return blob.arrayBuffer();
    },
    getSize(): number {
      return size;
    },
    close(): void {
      // No cleanup needed for async reads
    },
  };
}

/**
 * Stream write large data in chunks
 */
export async function streamWrite(
  directory: keyof typeof DIRECTORIES,
  fileName: string,
  dataGenerator: AsyncGenerator<ArrayBuffer>,
  metadata?: Partial<OPFSFileMetadata>
): Promise<OPFSFileMetadata> {
  const dir = await getDirectory(DIRECTORIES[directory]);
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();

  let totalSize = 0;
  for await (const chunk of dataGenerator) {
    await writable.write(chunk);
    totalSize += chunk.byteLength;
  }
  await writable.close();

  // Create metadata
  const fullMetadata: OPFSFileMetadata = {
    name: fileName,
    size: totalSize,
    type: metadata?.type || 'application/octet-stream',
    createdAt: metadata?.createdAt || Date.now(),
    updatedAt: Date.now(),
    duration: metadata?.duration,
    sampleRate: metadata?.sampleRate,
    channels: metadata?.channels,
  };

  // Store metadata
  const metaHandle = await dir.getFileHandle(`${fileName}.meta`, {
    create: true,
  });
  const metaWritable = await metaHandle.createWritable();
  await metaWritable.write(JSON.stringify(fullMetadata));
  await metaWritable.close();

  return fullMetadata;
}

// ============================================
// Audio-Specific Operations
// ============================================

/**
 * Store audio file with auto-extracted metadata
 */
export async function storeAudioFile(
  fileName: string,
  audioBuffer: AudioBuffer
): Promise<OPFSFileMetadata> {
  // Convert AudioBuffer to WAV ArrayBuffer
  const wavData = audioBufferToWav(audioBuffer);

  return writeFile('audio', fileName, wavData, {
    type: 'audio/wav',
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
  });
}

/**
 * Load audio file and decode to AudioBuffer
 */
export async function loadAudioFile(
  fileName: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const { data } = await readFile('audio', fileName);
  return audioContext.decodeAudioData(data);
}

/**
 * Convert AudioBuffer to WAV format
 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const samples = buffer.length;
  const dataSize = samples * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels and write samples
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ============================================
// Cleanup Operations
// ============================================

/**
 * Clear temporary files
 */
export async function clearTempFiles(): Promise<void> {
  try {
    const root = await getRootDirectory();
    await root.removeEntry(DIRECTORIES.temp, { recursive: true });
  } catch {
    // Directory might not exist
  }
}

/**
 * Clear cache files
 */
export async function clearCache(): Promise<void> {
  try {
    const root = await getRootDirectory();
    await root.removeEntry(DIRECTORIES.cache, { recursive: true });
  } catch {
    // Directory might not exist
  }
}

/**
 * Get total OPFS storage usage
 */
export async function getStorageUsage(): Promise<{
  used: number;
  available: number;
}> {
  if (!navigator.storage?.estimate) {
    return { used: 0, available: 0 };
  }

  const estimate = await navigator.storage.estimate();
  return {
    used: estimate.usage || 0,
    available: estimate.quota || 0,
  };
}

/**
 * Clear all OPFS data
 */
export async function clearAllOPFS(): Promise<void> {
  const root = await getRootDirectory();

  for await (const [name] of root.entries()) {
    await root.removeEntry(name, { recursive: true });
  }
}

// ============================================
// Export
// ============================================

export { DIRECTORIES };
