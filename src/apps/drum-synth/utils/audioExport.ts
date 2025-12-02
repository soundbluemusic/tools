/**
 * Audio Export Utilities
 * Export synthesized drum sounds as WAV or MP3 files
 */

import type {
  DrumType,
  KickParams,
  SnareParams,
  HihatParams,
  ClapParams,
  TomParams,
  RimParams,
  AllDrumParams,
} from '../constants';

export type ExportFormat = 'wav' | 'mp3';

/**
 * Create distortion curve for drive effect
 */
function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 44100;
  const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
  const k = (amount / 100) * 50;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] =
      ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

/**
 * Render kick sound to offline context
 */
function renderKick(
  ctx: OfflineAudioContext,
  kickParams: KickParams,
  masterVolume: number
): void {
  const now = 0;
  const volume = masterVolume / 100;

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
    distortion.curve = makeDistortionCurve(kickParams.drive);
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
 * Render snare sound to offline context
 */
function renderSnare(
  ctx: OfflineAudioContext,
  snareParams: SnareParams,
  masterVolume: number
): void {
  const now = 0;
  const volume = masterVolume / 100;
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

  const noiseBuffer = ctx.createBuffer(
    1,
    ctx.sampleRate * snareParams.noiseDecay,
    ctx.sampleRate
  );
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

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
 * Render hi-hat sound to offline context
 */
function renderHihat(
  ctx: OfflineAudioContext,
  hihatParams: HihatParams,
  masterVolume: number
): void {
  const now = 0;
  const volume = masterVolume / 100;
  const actualDecay = hihatParams.decay + (hihatParams.openness / 100) * 0.3;

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

  const noiseBuffer = ctx.createBuffer(
    1,
    ctx.sampleRate * actualDecay,
    ctx.sampleRate
  );
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

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
 * Render clap sound to offline context
 */
function renderClap(
  ctx: OfflineAudioContext,
  clapParams: ClapParams,
  masterVolume: number
): void {
  const now = 0;
  const volume = masterVolume / 100;

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

  // Crack
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

  // Reverb
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
 * Render tom sound to offline context
 */
function renderTom(
  ctx: OfflineAudioContext,
  tomParams: TomParams,
  masterVolume: number
): void {
  const now = 0;
  const volume = masterVolume / 100;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';

  const pitchDrop = (tomParams.pitchDecay / 100) * tomParams.pitch * 0.3;
  osc.frequency.setValueAtTime(tomParams.pitch, now);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(tomParams.pitch - pitchDrop, 20),
    now + tomParams.decay * 0.3
  );

  const attackTime = 0.005 + (1 - tomParams.attack / 100) * 0.02;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + tomParams.decay);

  const bodyOsc = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  bodyOsc.type = 'sine';
  bodyOsc.frequency.setValueAtTime(tomParams.pitch * 1.5, now);
  bodyGain.gain.setValueAtTime(volume * (tomParams.body / 100) * 0.3, now);
  bodyGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + tomParams.decay * 0.6
  );

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  bodyOsc.connect(bodyGain);
  bodyGain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + tomParams.decay + 0.1);
  bodyOsc.start(now);
  bodyOsc.stop(now + tomParams.decay + 0.1);
}

/**
 * Render rim sound to offline context
 */
function renderRim(
  ctx: OfflineAudioContext,
  rimParams: RimParams,
  masterVolume: number
): void {
  const now = 0;
  const volume = masterVolume / 100;

  if (rimParams.click > 0) {
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(rimParams.pitch * 2, now);
    clickGain.gain.setValueAtTime((rimParams.click / 100) * volume * 0.4, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.005);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.01);
  }

  const metalOsc = ctx.createOscillator();
  const metalGain = ctx.createGain();
  metalOsc.type = 'triangle';
  metalOsc.frequency.setValueAtTime(rimParams.pitch, now);
  metalGain.gain.setValueAtTime((rimParams.metallic / 100) * volume * 0.5, now);
  metalGain.gain.exponentialRampToValueAtTime(0.001, now + rimParams.decay);

  const metalFilter = ctx.createBiquadFilter();
  metalFilter.type = 'bandpass';
  metalFilter.frequency.setValueAtTime(rimParams.pitch, now);
  metalFilter.Q.setValueAtTime(5, now);

  metalOsc.connect(metalFilter);
  metalFilter.connect(metalGain);
  metalGain.connect(ctx.destination);
  metalOsc.start(now);
  metalOsc.stop(now + rimParams.decay + 0.1);

  if (rimParams.body > 0) {
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(rimParams.pitch * 0.5, now);
    bodyGain.gain.setValueAtTime((rimParams.body / 100) * volume * 0.3, now);
    bodyGain.gain.exponentialRampToValueAtTime(
      0.001,
      now + rimParams.decay * 1.5
    );
    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + rimParams.decay * 1.5 + 0.1);
  }
}

/**
 * Calculate duration for each drum type
 */
function getDrumDuration(drumType: DrumType, params: AllDrumParams): number {
  switch (drumType) {
    case 'kick':
      return params.kick.ampDecay + 0.2;
    case 'snare':
      return Math.max(params.snare.toneDecay, params.snare.noiseDecay) + 0.2;
    case 'hihat':
      return params.hihat.decay + (params.hihat.openness / 100) * 0.3 + 0.2;
    case 'clap':
      return params.clap.decay + (params.clap.reverb / 100) * 0.5 + 0.3;
    case 'tom':
      return params.tom.decay + 0.2;
    case 'rim':
      return params.rim.decay * 1.5 + 0.2;
    default:
      return 1;
  }
}

/**
 * Render drum to AudioBuffer using OfflineAudioContext
 */
export async function renderDrumToBuffer(
  drumType: DrumType,
  params: AllDrumParams
): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const duration = getDrumDuration(drumType, params);
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

  const masterVolume = params.master.volume;

  switch (drumType) {
    case 'kick':
      renderKick(ctx, params.kick, masterVolume);
      break;
    case 'snare':
      renderSnare(ctx, params.snare, masterVolume);
      break;
    case 'hihat':
      renderHihat(ctx, params.hihat, masterVolume);
      break;
    case 'clap':
      renderClap(ctx, params.clap, masterVolume);
      break;
    case 'tom':
      renderTom(ctx, params.tom, masterVolume);
      break;
    case 'rim':
      renderRim(ctx, params.rim, masterVolume);
      break;
  }

  return ctx.startRendering();
}

/**
 * Convert AudioBuffer to WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File length
  view.setUint32(4, bufferLength - 8, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (raw)
  view.setUint16(20, format, true);
  // Channel count
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * blockAlign, true);
  // Block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // Bits per sample
  view.setUint16(34, bitDepth, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, dataLength, true);

  // Write interleaved audio data
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Write string to DataView
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Convert AudioBuffer to MP3 Blob using MediaRecorder
 * Falls back to WAV if MP3 is not supported
 */
export async function audioBufferToMp3(buffer: AudioBuffer): Promise<Blob> {
  // Check if MediaRecorder supports audio/mpeg or audio/webm
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
  ];
  let supportedType = '';

  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      supportedType = type;
      break;
    }
  }

  if (!supportedType) {
    // Fallback to WAV if no compressed format is supported
    return audioBufferToWav(buffer);
  }

  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext({ sampleRate: buffer.sampleRate });
    const destination = audioContext.createMediaStreamDestination();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(destination);

    const mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType: supportedType,
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      audioContext.close();
      const blob = new Blob(chunks, { type: supportedType });
      resolve(blob);
    };

    mediaRecorder.onerror = (e) => {
      audioContext.close();
      reject(e);
    };

    mediaRecorder.start();
    source.start(0);

    // Stop recording after buffer duration + small padding
    setTimeout(
      () => {
        source.stop();
        mediaRecorder.stop();
      },
      (buffer.duration + 0.1) * 1000
    );
  });
}

/**
 * Download a Blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export drum sound to file
 */
export async function exportDrum(
  drumType: DrumType,
  params: AllDrumParams,
  format: ExportFormat = 'wav'
): Promise<void> {
  const buffer = await renderDrumToBuffer(drumType, params);

  let blob: Blob;
  let extension: string;

  if (format === 'mp3') {
    blob = await audioBufferToMp3(buffer);
    // Check actual mime type for extension
    extension = blob.type.includes('webm')
      ? 'webm'
      : blob.type.includes('ogg')
        ? 'ogg'
        : 'mp3';
  } else {
    blob = audioBufferToWav(buffer);
    extension = 'wav';
  }

  const filename = `${drumType}_${Date.now()}.${extension}`;
  downloadBlob(blob, filename);
}

/**
 * Export all drums as a zip-like collection (individual downloads)
 */
export async function exportAllDrums(
  params: AllDrumParams,
  format: ExportFormat = 'wav'
): Promise<void> {
  const drumTypes: DrumType[] = [
    'kick',
    'snare',
    'hihat',
    'clap',
    'tom',
    'rim',
  ];

  for (const drumType of drumTypes) {
    await exportDrum(drumType, params, format);
    // Small delay between downloads
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
