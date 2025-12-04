/**
 * Shared Sound Synthesis Utility
 * Play functions that can be used by both DrumSynth and DrumMachine
 * Uses WASM for performance-critical operations
 */
import type {
  AllDrumParams,
  KickParams,
  SnareParams,
  HihatParams,
  ClapParams,
} from '../constants';
import {
  isWasmLoaded,
  generateNoiseBufferWasm,
  makeDistortionCurveWasm,
} from '../../../wasm';

/**
 * Noise buffer cache for performance
 */
const noiseBufferCache = new Map<string, AudioBuffer>();
const distortionCurveCache = new Map<number, Float32Array>();

/**
 * Get or create cached noise buffer
 * Uses WASM if available (~3-5x faster)
 */
export function getNoiseBuffer(
  ctx: AudioContext,
  duration: number
): AudioBuffer {
  const key = `noise-${Math.round(duration * 1000)}`;
  const cached = noiseBufferCache.get(key);
  if (cached && cached.sampleRate === ctx.sampleRate) {
    return cached;
  }

  const bufferLength = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferLength, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Use WASM if loaded, otherwise JS fallback
  if (isWasmLoaded()) {
    const noiseData = generateNoiseBufferWasm(bufferLength);
    data.set(noiseData);
  } else {
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  noiseBufferCache.set(key, buffer);
  return buffer;
}

/**
 * Create distortion curve for drive effect (cached by amount)
 * Uses WASM if available (~5-10x faster)
 */
export function makeDistortionCurve(amount: number): Float32Array {
  const roundedAmount = Math.round(amount);
  const cached = distortionCurveCache.get(roundedAmount);
  if (cached) {
    return cached;
  }

  let curve: Float32Array;

  // Use WASM if loaded, otherwise JS fallback
  if (isWasmLoaded()) {
    curve = makeDistortionCurveWasm(roundedAmount);
  } else {
    const samples = 44100;
    curve = new Float32Array(samples);
    const k = (roundedAmount / 100) * 50;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] =
        ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
    }
  }

  distortionCurveCache.set(roundedAmount, curve);
  return curve;
}

/**
 * Play Kick sound with synth parameters
 */
export function playKick(
  ctx: AudioContext,
  kickParams: KickParams,
  masterVolume: number,
  velocity: number = 100
): void {
  const now = ctx.currentTime;
  const volume = (masterVolume / 100) * (velocity / 100);

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = kickParams.tone > 50 ? 'triangle' : 'sine';

  osc.frequency.setValueAtTime(kickParams.pitchStart, now);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(kickParams.pitchEnd, 0.01),
    now + kickParams.pitchDecay
  );

  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + kickParams.ampDecay);

  if (kickParams.click > 0) {
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(kickParams.pitchStart * 4, now);
    clickGain.gain.setValueAtTime((kickParams.click / 100) * volume * 0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.01);
  }

  if (kickParams.drive > 0) {
    const distortion = ctx.createWaveShaper();
    const curve = makeDistortionCurve(kickParams.drive);
    distortion.curve = new Float32Array(curve);
    distortion.oversample = '2x';
    osc.connect(distortion);
    distortion.connect(gainNode);
  } else {
    osc.connect(gainNode);
  }

  gainNode.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + kickParams.ampDecay + 0.1);
}

/**
 * Play Snare sound with synth parameters
 */
export function playSnare(
  ctx: AudioContext,
  snareParams: SnareParams,
  masterVolume: number,
  velocity: number = 100
): void {
  const now = ctx.currentTime;
  const volume = (masterVolume / 100) * (velocity / 100);
  const toneMix = snareParams.toneMix / 100;

  const toneOsc = ctx.createOscillator();
  const toneGain = ctx.createGain();
  toneOsc.type = 'triangle';
  toneOsc.frequency.setValueAtTime(snareParams.toneFreq, now);
  toneOsc.frequency.exponentialRampToValueAtTime(
    snareParams.toneFreq * 0.5,
    now + snareParams.toneDecay
  );
  toneGain.gain.setValueAtTime(volume * toneMix * 0.5, now);
  toneGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + snareParams.toneDecay
  );
  toneOsc.connect(toneGain);
  toneGain.connect(ctx.destination);
  toneOsc.start(now);
  toneOsc.stop(now + snareParams.toneDecay + 0.1);

  const noiseBuffer = getNoiseBuffer(ctx, snareParams.noiseDecay);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(snareParams.noiseFilter, now);
  noiseFilter.Q.setValueAtTime(snareParams.snappy / 20, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * (1 - toneMix) * 0.4, now);
  noiseGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + snareParams.noiseDecay
  );

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(now);
}

/**
 * Play Hi-Hat sound with synth parameters
 * @param isOpen - If true, plays as open hi-hat (longer decay)
 */
export function playHihat(
  ctx: AudioContext,
  hihatParams: HihatParams,
  masterVolume: number,
  velocity: number = 100,
  isOpen: boolean = false
): void {
  const now = ctx.currentTime;
  const volume = (masterVolume / 100) * (velocity / 100);

  // Use openness parameter for open hi-hat, or override if explicitly open
  const openness = isOpen ? 100 : hihatParams.openness;
  const actualDecay = hihatParams.decay + (openness / 100) * 0.3;

  const numOscs = 6;
  const baseFreq = 4000 + (hihatParams.pitch / 100) * 4000;
  const ratios = [1, 1.342, 1.2312, 1.6532, 1.9523, 2.1523];

  for (let i = 0; i < numOscs; i++) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq * ratios[i], now);

    const oscVolume = (volume * 0.08) / numOscs;
    oscGain.gain.setValueAtTime(oscVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + actualDecay);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(hihatParams.filterFreq, now);
    filter.Q.setValueAtTime(hihatParams.filterQ, now);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + actualDecay + 0.1);
  }

  const noiseBuffer = getNoiseBuffer(ctx, actualDecay);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(hihatParams.filterFreq, now);
  noiseFilter.Q.setValueAtTime(
    hihatParams.filterQ + hihatParams.ring / 50,
    now
  );

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + actualDecay);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(now);
}

/**
 * Play Clap sound with synth parameters
 */
export function playClap(
  ctx: AudioContext,
  clapParams: ClapParams,
  masterVolume: number,
  velocity: number = 100
): void {
  const now = ctx.currentTime;
  const volume = (masterVolume / 100) * (velocity / 100);

  const numClaps = Math.floor(3 + (clapParams.spread / 100) * 5);
  const baseSpacing = 0.008;

  for (let c = 0; c < numClaps; c++) {
    const randomOffset = (Math.random() - 0.5) * 0.006;
    const clapTime =
      now + c * baseSpacing * (1 + clapParams.spread / 200) + randomOffset;

    const hitDuration = clapParams.decay * (0.7 + Math.random() * 0.3);
    const bufferLength = Math.max(
      ctx.sampleRate * hitDuration,
      ctx.sampleRate * 0.1
    );

    const noiseBuffer = ctx.createBuffer(1, bufferLength, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < noiseBuffer.length; i++) {
      const t = i / ctx.sampleRate;
      const attackEnv = Math.min(1, t / 0.002);
      const decayEnv = Math.exp(-t / (hitDuration * 0.3));
      noiseData[i] = (Math.random() * 2 - 1) * attackEnv * decayEnv;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    const freqVariation = 1 + (Math.random() - 0.5) * 0.2;
    const baseFreq = clapParams.filterFreq + (clapParams.tone / 100) * 800;
    bpFilter.frequency.setValueAtTime(baseFreq * freqVariation, clapTime);
    bpFilter.Q.setValueAtTime(clapParams.filterQ * 0.8, clapTime);

    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.setValueAtTime(3000, clapTime);
    highShelf.gain.setValueAtTime(3 + (clapParams.tone / 100) * 4, clapTime);

    const gain = ctx.createGain();
    const hitVolume =
      volume *
      0.35 *
      (c === 0 ? 1 : 0.6 + Math.random() * 0.3) *
      Math.pow(0.85, c);
    gain.gain.setValueAtTime(hitVolume, clapTime);

    noiseSource.connect(bpFilter);
    bpFilter.connect(highShelf);
    highShelf.connect(gain);
    gain.connect(ctx.destination);
    noiseSource.start(clapTime);
  }

  // Initial transient "crack"
  const crackDuration = 0.015;
  const crackBuffer = ctx.createBuffer(
    1,
    ctx.sampleRate * crackDuration,
    ctx.sampleRate
  );
  const crackData = crackBuffer.getChannelData(0);
  for (let i = 0; i < crackBuffer.length; i++) {
    const t = i / ctx.sampleRate;
    const env = Math.exp(-t / 0.003);
    crackData[i] = (Math.random() * 2 - 1) * env;
  }

  const crackSource = ctx.createBufferSource();
  crackSource.buffer = crackBuffer;

  const crackFilter = ctx.createBiquadFilter();
  crackFilter.type = 'highpass';
  crackFilter.frequency.setValueAtTime(
    2500 + (clapParams.tone / 100) * 2000,
    now
  );
  crackFilter.Q.setValueAtTime(0.7, now);

  const crackGain = ctx.createGain();
  crackGain.gain.setValueAtTime(volume * 0.4, now);

  crackSource.connect(crackFilter);
  crackFilter.connect(crackGain);
  crackGain.connect(ctx.destination);
  crackSource.start(now);

  // Room/reverb tail
  if (clapParams.reverb > 0) {
    const reverbLength = 0.15 + (clapParams.reverb / 100) * 0.35;
    const reverbBuffer = ctx.createBuffer(
      1,
      ctx.sampleRate * reverbLength,
      ctx.sampleRate
    );
    const reverbData = reverbBuffer.getChannelData(0);
    for (let i = 0; i < reverbBuffer.length; i++) {
      const t = i / ctx.sampleRate;
      reverbData[i] =
        (Math.random() * 2 - 1) * Math.exp(-t / (reverbLength * 0.4));
    }

    const reverbSource = ctx.createBufferSource();
    reverbSource.buffer = reverbBuffer;

    const reverbLowpass = ctx.createBiquadFilter();
    reverbLowpass.type = 'lowpass';
    reverbLowpass.frequency.setValueAtTime(2500, now);

    const reverbHighpass = ctx.createBiquadFilter();
    reverbHighpass.type = 'highpass';
    reverbHighpass.frequency.setValueAtTime(400, now);

    const reverbGain = ctx.createGain();
    const reverbStart = now + clapParams.decay * 0.3;
    reverbGain.gain.setValueAtTime(0, reverbStart);
    reverbGain.gain.linearRampToValueAtTime(
      volume * (clapParams.reverb / 100) * 0.2,
      reverbStart + 0.01
    );
    reverbGain.gain.exponentialRampToValueAtTime(
      0.001,
      reverbStart + reverbLength
    );

    reverbSource.connect(reverbHighpass);
    reverbHighpass.connect(reverbLowpass);
    reverbLowpass.connect(reverbGain);
    reverbGain.connect(ctx.destination);
    reverbSource.start(reverbStart);
  }
}

/**
 * Play any drum sound using synth parameters
 */
export type DrumMachineInstrument =
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'openhat'
  | 'clap';

export function playSynthSound(
  ctx: AudioContext,
  instrument: DrumMachineInstrument,
  params: AllDrumParams,
  velocity: number = 100
): void {
  const masterVolume = params.master.volume;

  switch (instrument) {
    case 'kick':
      playKick(ctx, params.kick, masterVolume, velocity);
      break;
    case 'snare':
      playSnare(ctx, params.snare, masterVolume, velocity);
      break;
    case 'hihat':
      playHihat(ctx, params.hihat, masterVolume, velocity, false);
      break;
    case 'openhat':
      playHihat(ctx, params.hihat, masterVolume, velocity, true);
      break;
    case 'clap':
      playClap(ctx, params.clap, masterVolume, velocity);
      break;
  }
}

/**
 * Schedule a synth sound at a specific time
 */
export function scheduleSynthSound(
  ctx: AudioContext,
  instrument: DrumMachineInstrument,
  params: AllDrumParams,
  time: number,
  velocity: number = 100
): void {
  // Calculate delay from now to scheduled time
  const delay = Math.max(0, (time - ctx.currentTime) * 1000);

  // Schedule the sound
  setTimeout(() => {
    playSynthSound(ctx, instrument, params, velocity);
  }, delay);
}
