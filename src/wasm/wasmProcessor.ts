/**
 * WASM Processor Module
 * TypeScript wrapper for high-performance WASM functions
 */

// WASM module interface
interface WasmExports {
  memory: WebAssembly.Memory;
  allocate: (size: number) => number;
  deallocate: (ptr: number) => void;
  makeTransparent: (dataPtr: number, length: number, isWhite: boolean) => void;
  seedRandom: (seed: bigint) => void;
  generateNoiseBuffer: (bufferPtr: number, length: number) => void;
  generateEnvelopedNoise: (
    bufferPtr: number,
    length: number,
    sampleRate: number,
    attackTime: number,
    decayTime: number
  ) => void;
  makeDistortionCurve: (curvePtr: number, amount: number) => void;
  floatToInt16: (
    inputPtr: number,
    outputPtr: number,
    length: number,
    numChannels: number
  ) => void;
  interleaveStereoToInt16: (
    leftPtr: number,
    rightPtr: number,
    outputPtr: number,
    length: number
  ) => void;
  generateExpDecayEnvelope: (
    bufferPtr: number,
    length: number,
    sampleRate: number,
    decayTime: number
  ) => void;
  applyEnvelope: (
    audioPtr: number,
    envelopePtr: number,
    length: number
  ) => void;
  zeroBuffer: (ptr: number, length: number) => void;
  copyBuffer: (srcPtr: number, destPtr: number, length: number) => void;
  scaleBuffer: (ptr: number, length: number, scale: number) => void;
  mixBuffers: (
    srcPtr: number,
    destPtr: number,
    length: number,
    srcGain: number
  ) => void;
}

// Singleton instance
let wasmModule: WasmExports | null = null;
let loadPromise: Promise<WasmExports> | null = null;

/**
 * Load WASM module (singleton pattern)
 */
export async function loadWasmProcessor(): Promise<WasmExports> {
  if (wasmModule) {
    return wasmModule;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const wasmUrl = new URL('./processing.wasm', import.meta.url).href;
    const response = await fetch(wasmUrl);
    const wasmBuffer = await response.arrayBuffer();

    const wasmInstance = await WebAssembly.instantiate(wasmBuffer, {
      env: {
        abort: (
          _message: number,
          fileName: number,
          line: number,
          column: number
        ) => {
          console.error(`WASM abort at ${fileName}:${line}:${column}`);
        },
        'Math.exp': Math.exp,
      },
    });

    wasmModule = wasmInstance.instance.exports as unknown as WasmExports;

    // Seed random with current time
    wasmModule.seedRandom(BigInt(Date.now()));

    return wasmModule;
  })();

  return loadPromise;
}

/**
 * Check if WASM is loaded
 */
export function isWasmLoaded(): boolean {
  return wasmModule !== null;
}

/**
 * Get WASM module (throws if not loaded)
 */
export function getWasm(): WasmExports {
  if (!wasmModule) {
    throw new Error('WASM not loaded. Call loadWasmProcessor() first.');
  }
  return wasmModule;
}

// ============================================================================
// QR Processing Functions
// ============================================================================

/**
 * Make QR code background transparent using WASM
 * ~10-25x faster than JavaScript version
 *
 * @param imageData - Canvas ImageData object
 * @param isWhite - If true, make black pixels transparent
 * @returns Modified ImageData
 */
export function makeTransparentWasm(
  imageData: ImageData,
  isWhite: boolean
): ImageData {
  const wasm = getWasm();
  const { data } = imageData;
  const length = data.length;

  // Allocate memory in WASM
  const ptr = wasm.allocate(length);

  // Copy data to WASM memory
  const wasmMemory = new Uint8Array(wasm.memory.buffer, ptr, length);
  wasmMemory.set(data);

  // Process in WASM
  wasm.makeTransparent(ptr, length, isWhite);

  // Copy result back
  data.set(wasmMemory);

  // Free memory
  wasm.deallocate(ptr);

  return imageData;
}

// ============================================================================
// Audio Processing Functions
// ============================================================================

/**
 * Generate noise buffer using WASM
 * ~3-5x faster than JavaScript version
 *
 * @param length - Number of samples
 * @returns Float32Array with noise values between -1 and 1
 */
export function generateNoiseBufferWasm(length: number): Float32Array {
  const wasm = getWasm();
  const byteLength = length * 4; // Float32 = 4 bytes

  // Allocate memory
  const ptr = wasm.allocate(byteLength);

  // Generate noise
  wasm.generateNoiseBuffer(ptr, length);

  // Copy result
  const result = new Float32Array(length);
  const wasmView = new Float32Array(wasm.memory.buffer, ptr, length);
  result.set(wasmView);

  // Free memory
  wasm.deallocate(ptr);

  return result;
}

/**
 * Generate noise buffer with envelope (for clap synthesis)
 *
 * @param length - Number of samples
 * @param sampleRate - Audio sample rate
 * @param attackTime - Attack time in seconds
 * @param decayTime - Decay time constant
 * @returns Float32Array with enveloped noise
 */
export function generateEnvelopedNoiseWasm(
  length: number,
  sampleRate: number,
  attackTime: number,
  decayTime: number
): Float32Array {
  const wasm = getWasm();
  const byteLength = length * 4;

  const ptr = wasm.allocate(byteLength);
  wasm.generateEnvelopedNoise(ptr, length, sampleRate, attackTime, decayTime);

  const result = new Float32Array(length);
  const wasmView = new Float32Array(wasm.memory.buffer, ptr, length);
  result.set(wasmView);

  wasm.deallocate(ptr);
  return result;
}

/**
 * Generate distortion curve using WASM
 * ~5-10x faster than JavaScript version
 *
 * @param amount - Distortion amount (0-100)
 * @returns Float32Array with 44100 samples
 */
export function makeDistortionCurveWasm(amount: number): Float32Array {
  const wasm = getWasm();
  const samples = 44100;
  const byteLength = samples * 4;

  const ptr = wasm.allocate(byteLength);
  wasm.makeDistortionCurve(ptr, amount);

  const result = new Float32Array(samples);
  const wasmView = new Float32Array(wasm.memory.buffer, ptr, samples);
  result.set(wasmView);

  wasm.deallocate(ptr);
  return result;
}

/**
 * Convert Float32 samples to Int16 PCM using WASM
 * ~2-4x faster than JavaScript version
 *
 * @param samples - Float32Array of audio samples
 * @param numChannels - Number of audio channels
 * @returns Int16Array with PCM data
 */
export function floatToInt16Wasm(
  samples: Float32Array,
  numChannels: number
): Int16Array {
  const wasm = getWasm();
  const length = samples.length / numChannels;
  const inputByteLength = samples.length * 4;
  const outputByteLength = samples.length * 2;

  // Allocate input and output buffers
  const inputPtr = wasm.allocate(inputByteLength);
  const outputPtr = wasm.allocate(outputByteLength);

  // Copy input data
  const inputView = new Float32Array(wasm.memory.buffer, inputPtr, samples.length);
  inputView.set(samples);

  // Convert
  wasm.floatToInt16(inputPtr, outputPtr, length, numChannels);

  // Copy result
  const result = new Int16Array(samples.length);
  const outputView = new Int16Array(wasm.memory.buffer, outputPtr, samples.length);
  result.set(outputView);

  // Free memory
  wasm.deallocate(inputPtr);
  wasm.deallocate(outputPtr);

  return result;
}

/**
 * Generate exponential decay envelope using WASM
 *
 * @param length - Number of samples
 * @param sampleRate - Audio sample rate
 * @param decayTime - Time constant for decay
 * @returns Float32Array with envelope values
 */
export function generateExpDecayEnvelopeWasm(
  length: number,
  sampleRate: number,
  decayTime: number
): Float32Array {
  const wasm = getWasm();
  const byteLength = length * 4;

  const ptr = wasm.allocate(byteLength);
  wasm.generateExpDecayEnvelope(ptr, length, sampleRate, decayTime);

  const result = new Float32Array(length);
  const wasmView = new Float32Array(wasm.memory.buffer, ptr, length);
  result.set(wasmView);

  wasm.deallocate(ptr);
  return result;
}

// ============================================================================
// Type exports
// ============================================================================

export type { WasmExports };
