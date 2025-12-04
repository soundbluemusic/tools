/**
 * WASM Processing Module
 * High-performance computation functions for audio and image processing
 */

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Allocate memory buffer for data exchange
 * @param size - Size in bytes
 * @returns Pointer to allocated memory
 */
export function allocate(size: i32): usize {
  return heap.alloc(size);
}

/**
 * Free allocated memory
 * @param ptr - Pointer to memory to free
 */
export function deallocate(ptr: usize): void {
  heap.free(ptr);
}

// ============================================================================
// QR Code Processing
// ============================================================================

// Color thresholds for QR processing
const BLACK_THRESHOLD: u8 = 5;
const WHITE_THRESHOLD: u8 = 250;

/**
 * Make QR code background transparent (optimized SIMD version)
 * Processes RGBA pixel data in-place
 *
 * @param dataPtr - Pointer to RGBA pixel data
 * @param length - Total length of data (width * height * 4)
 * @param isWhite - If true, make black pixels transparent (for white QR on dark bg)
 *                  If false, make white pixels transparent (for black QR on light bg)
 */
export function makeTransparent(dataPtr: usize, length: i32, isWhite: bool): void {
  // Process 4 bytes at a time (one pixel: RGBA)
  for (let i: i32 = 0; i < length; i += 4) {
    const r = load<u8>(dataPtr + i);
    const g = load<u8>(dataPtr + i + 1);
    const b = load<u8>(dataPtr + i + 2);

    if (isWhite) {
      // For white QR: make black pixels transparent, keep white pixels
      if (r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD) {
        // Make transparent
        store<u8>(dataPtr + i + 3, 0);
      } else {
        // Make white and opaque
        store<u8>(dataPtr + i, 255);
        store<u8>(dataPtr + i + 1, 255);
        store<u8>(dataPtr + i + 2, 255);
        store<u8>(dataPtr + i + 3, 255);
      }
    } else {
      // For black QR: make white pixels transparent, keep black pixels
      if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
        // Make transparent
        store<u8>(dataPtr + i + 3, 0);
      } else {
        // Make black and opaque
        store<u8>(dataPtr + i, 0);
        store<u8>(dataPtr + i + 1, 0);
        store<u8>(dataPtr + i + 2, 0);
        store<u8>(dataPtr + i + 3, 255);
      }
    }
  }
}

// ============================================================================
// Audio Processing - Noise Generation
// ============================================================================

// XorShift128+ PRNG state (faster than Math.random)
let s0: u64 = 1;
let s1: u64 = 2;

/**
 * Seed the random number generator
 */
export function seedRandom(seed: u64): void {
  s0 = seed;
  s1 = seed ^ 0xdeadbeef;
  if (s0 == 0) s0 = 1;
  if (s1 == 0) s1 = 1;
}

/**
 * Generate random float between -1 and 1 using XorShift128+
 */
function randomFloat(): f32 {
  // XorShift128+
  let x = s0;
  const y = s1;
  s0 = y;
  x ^= x << 23;
  s1 = x ^ y ^ (x >> 17) ^ (y >> 26);

  // Convert to float in range [-1, 1]
  const result = s1 + y;
  return f32((result & 0x7FFFFFFF) as f64 / 0x7FFFFFFF as f64) * 2.0 - 1.0;
}

/**
 * Generate noise buffer for audio synthesis
 * Fills buffer with random values between -1 and 1
 *
 * @param bufferPtr - Pointer to Float32 buffer
 * @param length - Number of samples
 */
export function generateNoiseBuffer(bufferPtr: usize, length: i32): void {
  for (let i: i32 = 0; i < length; i++) {
    store<f32>(bufferPtr + (i << 2), randomFloat());
  }
}

/**
 * Generate noise buffer with envelope (for clap synthesis)
 * Applies attack and exponential decay envelope
 *
 * @param bufferPtr - Pointer to Float32 buffer
 * @param length - Number of samples
 * @param sampleRate - Audio sample rate
 * @param attackTime - Attack time in seconds
 * @param decayTime - Decay time constant
 */
export function generateEnvelopedNoise(
  bufferPtr: usize,
  length: i32,
  sampleRate: f32,
  attackTime: f32,
  decayTime: f32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const t = f32(i) / sampleRate;
    const attackEnv = min<f32>(1.0, t / attackTime);
    const decayEnv = f32(Math.exp(-t / decayTime));
    const noise = randomFloat();
    store<f32>(bufferPtr + (i << 2), noise * attackEnv * decayEnv);
  }
}

// ============================================================================
// Audio Processing - Distortion Curve
// ============================================================================

/**
 * Generate distortion curve for waveshaper
 * Uses the formula: ((3 + k) * x * 20 * (PI/180)) / (PI + k * |x|)
 *
 * @param curvePtr - Pointer to Float32 buffer (44100 samples)
 * @param amount - Distortion amount (0-100)
 */
export function makeDistortionCurve(curvePtr: usize, amount: f32): void {
  const samples: i32 = 44100;
  const k: f32 = (amount / 100.0) * 50.0;
  const piOver180: f32 = f32(Math.PI / 180.0);
  const pi: f32 = f32(Math.PI);

  for (let i: i32 = 0; i < samples; i++) {
    const x: f32 = (f32(i) * 2.0 / f32(samples)) - 1.0;
    const numerator: f32 = (3.0 + k) * x * 20.0 * piOver180;
    const denominator: f32 = pi + k * abs<f32>(x);
    store<f32>(curvePtr + (i << 2), numerator / denominator);
  }
}

// ============================================================================
// Audio Processing - WAV Encoding
// ============================================================================

/**
 * Convert Float32 audio samples to Int16 PCM
 * Used for WAV file encoding
 *
 * @param inputPtr - Pointer to Float32 samples
 * @param outputPtr - Pointer to Int16 output buffer
 * @param length - Number of samples
 * @param numChannels - Number of audio channels
 */
export function floatToInt16(
  inputPtr: usize,
  outputPtr: usize,
  length: i32,
  numChannels: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    for (let ch: i32 = 0; ch < numChannels; ch++) {
      const inputOffset = (i * numChannels + ch) << 2;
      const outputOffset = (i * numChannels + ch) << 1;

      // Clamp to [-1, 1]
      let sample = load<f32>(inputPtr + inputOffset);
      sample = max<f32>(-1.0, min<f32>(1.0, sample));

      // Convert to Int16
      const intSample: i16 = sample < 0
        ? i16(sample * 32768.0)
        : i16(sample * 32767.0);

      store<i16>(outputPtr + outputOffset, intSample);
    }
  }
}

/**
 * Interleave stereo channels for WAV encoding
 *
 * @param leftPtr - Pointer to left channel Float32 data
 * @param rightPtr - Pointer to right channel Float32 data
 * @param outputPtr - Pointer to interleaved Int16 output
 * @param length - Number of samples per channel
 */
export function interleaveStereoToInt16(
  leftPtr: usize,
  rightPtr: usize,
  outputPtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    // Left channel
    let leftSample = load<f32>(leftPtr + (i << 2));
    leftSample = max<f32>(-1.0, min<f32>(1.0, leftSample));
    const leftInt: i16 = leftSample < 0
      ? i16(leftSample * 32768.0)
      : i16(leftSample * 32767.0);
    store<i16>(outputPtr + (i << 2), leftInt);

    // Right channel
    let rightSample = load<f32>(rightPtr + (i << 2));
    rightSample = max<f32>(-1.0, min<f32>(1.0, rightSample));
    const rightInt: i16 = rightSample < 0
      ? i16(rightSample * 32768.0)
      : i16(rightSample * 32767.0);
    store<i16>(outputPtr + (i << 2) + 2, rightInt);
  }
}

// ============================================================================
// Audio Processing - Envelope Generation
// ============================================================================

/**
 * Generate exponential decay envelope
 * Used for drum sounds
 *
 * @param bufferPtr - Pointer to Float32 buffer
 * @param length - Number of samples
 * @param sampleRate - Audio sample rate
 * @param decayTime - Time constant for decay
 */
export function generateExpDecayEnvelope(
  bufferPtr: usize,
  length: i32,
  sampleRate: f32,
  decayTime: f32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const t = f32(i) / sampleRate;
    const value = f32(Math.exp(-t / decayTime));
    store<f32>(bufferPtr + (i << 2), value);
  }
}

/**
 * Apply envelope to audio buffer (multiply in-place)
 *
 * @param audioPtr - Pointer to audio samples
 * @param envelopePtr - Pointer to envelope values
 * @param length - Number of samples
 */
export function applyEnvelope(
  audioPtr: usize,
  envelopePtr: usize,
  length: i32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset = i << 2;
    const audio = load<f32>(audioPtr + offset);
    const envelope = load<f32>(envelopePtr + offset);
    store<f32>(audioPtr + offset, audio * envelope);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Fill buffer with zero values
 */
export function zeroBuffer(ptr: usize, length: i32): void {
  memory.fill(ptr, 0, length);
}

/**
 * Copy data between buffers
 */
export function copyBuffer(srcPtr: usize, destPtr: usize, length: i32): void {
  memory.copy(destPtr, srcPtr, length);
}

/**
 * Scale buffer values by a constant
 */
export function scaleBuffer(ptr: usize, length: i32, scale: f32): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset = i << 2;
    const value = load<f32>(ptr + offset);
    store<f32>(ptr + offset, value * scale);
  }
}

/**
 * Mix two buffers (add together)
 */
export function mixBuffers(
  srcPtr: usize,
  destPtr: usize,
  length: i32,
  srcGain: f32
): void {
  for (let i: i32 = 0; i < length; i++) {
    const offset = i << 2;
    const src = load<f32>(srcPtr + offset);
    const dest = load<f32>(destPtr + offset);
    store<f32>(destPtr + offset, dest + src * srcGain);
  }
}
