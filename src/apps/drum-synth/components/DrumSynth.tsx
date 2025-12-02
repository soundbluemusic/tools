import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from '../../../i18n';
import { cn } from '../../../utils';
import {
  DrumType,
  DRUM_TYPES,
  AllDrumParams,
  KickParams,
  SnareParams,
  HihatParams,
  ClapParams,
  TomParams,
  RimParams,
  KICK_RANGES,
  SNARE_RANGES,
  HIHAT_RANGES,
  CLAP_RANGES,
  TOM_RANGES,
  RIM_RANGES,
  MASTER_RANGES,
  DEFAULT_ALL_PARAMS,
  SYNTH_PRESETS,
} from '../constants';
import { exportDrum, exportAllDrums, type ExportFormat } from '../utils/audioExport';
import './DrumSynth.css';

/**
 * Parameter Slider Component
 */
interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

const ParamSlider = memo(function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
}: ParamSliderProps) {
  const displayValue = step < 1 ? value.toFixed(2) : value;
  return (
    <div className="synth-param">
      <div className="synth-param-header">
        <span className="synth-param-label">{label}</span>
        <span className="synth-param-value">
          {displayValue}
          {unit}
        </span>
      </div>
      <div className="synth-param-slider-wrap">
        <input
          type="range"
          className="synth-param-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
});

/**
 * Play Icon
 */
const PlayIcon = memo(function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
});

/**
 * Reset Icon
 */
const ResetIcon = memo(function ResetIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
});

/**
 * Download Icon
 */
const DownloadIcon = memo(function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
});

/**
 * DrumSynth Component
 * Detailed drum sound synthesis with parameter control
 */
export const DrumSynth = memo(function DrumSynth() {
  const { drumSynth } = useTranslations();

  // State
  const [selectedDrum, setSelectedDrum] = useState<DrumType>('kick');
  const [params, setParams] = useState<AllDrumParams>(DEFAULT_ALL_PARAMS);
  const [isPlaying, setIsPlaying] = useState<DrumType | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  // Cached buffers for performance
  const noiseBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const distortionCurveCache = useRef<Map<number, Float32Array<ArrayBuffer>>>(new Map());

  /**
   * Get or create audio context
   */
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Get or create cached noise buffer
   */
  const getNoiseBuffer = useCallback((ctx: AudioContext, duration: number): AudioBuffer => {
    const key = `noise-${Math.round(duration * 1000)}`;
    const cached = noiseBufferCacheRef.current.get(key);
    if (cached && cached.sampleRate === ctx.sampleRate) {
      return cached;
    }
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBufferCacheRef.current.set(key, buffer);
    return buffer;
  }, []);

  /**
   * Create distortion curve for drive effect (cached by amount)
   */
  const makeDistortionCurve = useCallback((amount: number): Float32Array<ArrayBuffer> => {
    // Round to avoid too many cache entries
    const roundedAmount = Math.round(amount);
    const cached = distortionCurveCache.current.get(roundedAmount);
    if (cached) {
      return cached;
    }
    const samples = 44100;
    const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
    const k = (roundedAmount / 100) * 50;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
    }
    distortionCurveCache.current.set(roundedAmount, curve);
    return curve;
  }, []);

  /**
   * Play Kick sound
   */
  const playKick = useCallback(
    (kickParams: KickParams, masterVolume: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
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
    },
    [getAudioContext, makeDistortionCurve]
  );

  /**
   * Play Snare sound
   */
  const playSnare = useCallback(
    (snareParams: SnareParams, masterVolume: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
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
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + snareParams.toneDecay);
      toneOsc.connect(toneGain);
      toneGain.connect(ctx.destination);
      toneOsc.start(now);
      toneOsc.stop(now + snareParams.toneDecay + 0.1);

      // Use cached noise buffer for better performance
      const noiseBuffer = getNoiseBuffer(ctx, snareParams.noiseDecay);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(snareParams.noiseFilter, now);
      noiseFilter.Q.setValueAtTime(snareParams.snappy / 20, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * (1 - toneMix) * 0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + snareParams.noiseDecay);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(now);
    },
    [getAudioContext, getNoiseBuffer]
  );

  /**
   * Play Hi-Hat sound
   */
  const playHihat = useCallback(
    (hihatParams: HihatParams, masterVolume: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
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

      // Use cached noise buffer for better performance
      const noiseBuffer = getNoiseBuffer(ctx, actualDecay);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(hihatParams.filterFreq, now);
      noiseFilter.Q.setValueAtTime(hihatParams.filterQ + (hihatParams.ring / 50), now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + actualDecay);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(now);
    },
    [getAudioContext, getNoiseBuffer]
  );

  /**
   * Play Clap sound
   */
  const playClap = useCallback(
    (clapParams: ClapParams, masterVolume: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const volume = masterVolume / 100;

      // Real clap characteristics:
      // - Multiple micro-hits from fingers colliding
      // - Sharp initial transient (crack)
      // - Broadband noise with emphasis 1-3kHz
      // - Very fast attack, medium decay

      const numClaps = Math.floor(3 + (clapParams.spread / 100) * 5);
      const baseSpacing = 0.008; // ~8ms between hits for realistic feel

      // Create main clap layers
      for (let c = 0; c < numClaps; c++) {
        // Randomize timing slightly for organic feel
        const randomOffset = (Math.random() - 0.5) * 0.006;
        const clapTime = now + c * baseSpacing * (1 + clapParams.spread / 200) + randomOffset;

        // Each clap hit duration
        const hitDuration = clapParams.decay * (0.7 + Math.random() * 0.3);
        const bufferLength = Math.max(ctx.sampleRate * hitDuration, ctx.sampleRate * 0.1);

        const noiseBuffer = ctx.createBuffer(1, bufferLength, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        // Generate noise with natural envelope baked in
        for (let i = 0; i < noiseBuffer.length; i++) {
          const t = i / ctx.sampleRate;
          // Sharp attack (~2ms), then exponential decay
          const attackEnv = Math.min(1, t / 0.002);
          const decayEnv = Math.exp(-t / (hitDuration * 0.3));
          noiseData[i] = (Math.random() * 2 - 1) * attackEnv * decayEnv;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Bandpass filter for body (1-3kHz range)
        const bpFilter = ctx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        const freqVariation = 1 + (Math.random() - 0.5) * 0.2;
        const baseFreq = clapParams.filterFreq + (clapParams.tone / 100) * 800;
        bpFilter.frequency.setValueAtTime(baseFreq * freqVariation, clapTime);
        bpFilter.Q.setValueAtTime(clapParams.filterQ * 0.8, clapTime);

        // High shelf for presence/air
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.setValueAtTime(3000, clapTime);
        highShelf.gain.setValueAtTime(3 + (clapParams.tone / 100) * 4, clapTime);

        const gain = ctx.createGain();
        // First hit loudest, subsequent hits softer with variation
        const hitVolume = volume * 0.35 * (c === 0 ? 1 : 0.6 + Math.random() * 0.3) * Math.pow(0.85, c);
        gain.gain.setValueAtTime(hitVolume, clapTime);

        noiseSource.connect(bpFilter);
        bpFilter.connect(highShelf);
        highShelf.connect(gain);
        gain.connect(ctx.destination);
        noiseSource.start(clapTime);
      }

      // Initial transient "crack" - very short, high frequency burst
      const crackDuration = 0.015;
      const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * crackDuration, ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackBuffer.length; i++) {
        const t = i / ctx.sampleRate;
        // Ultra-fast decay for crack
        const env = Math.exp(-t / 0.003);
        crackData[i] = (Math.random() * 2 - 1) * env;
      }

      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;

      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.setValueAtTime(2500 + (clapParams.tone / 100) * 2000, now);
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
        const reverbBuffer = ctx.createBuffer(1, ctx.sampleRate * reverbLength, ctx.sampleRate);
        const reverbData = reverbBuffer.getChannelData(0);
        for (let i = 0; i < reverbBuffer.length; i++) {
          const t = i / ctx.sampleRate;
          reverbData[i] = (Math.random() * 2 - 1) * Math.exp(-t / (reverbLength * 0.4));
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
        reverbGain.gain.linearRampToValueAtTime(volume * (clapParams.reverb / 100) * 0.2, reverbStart + 0.01);
        reverbGain.gain.exponentialRampToValueAtTime(0.001, reverbStart + reverbLength);

        reverbSource.connect(reverbHighpass);
        reverbHighpass.connect(reverbLowpass);
        reverbLowpass.connect(reverbGain);
        reverbGain.connect(ctx.destination);
        reverbSource.start(reverbStart);
      }
    },
    [getAudioContext]
  );

  /**
   * Play Tom sound
   */
  const playTom = useCallback(
    (tomParams: TomParams, masterVolume: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
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
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + tomParams.decay * 0.6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + tomParams.decay + 0.1);
      bodyOsc.start(now);
      bodyOsc.stop(now + tomParams.decay + 0.1);
    },
    [getAudioContext]
  );

  /**
   * Play Rim sound
   */
  const playRim = useCallback(
    (rimParams: RimParams, masterVolume: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
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
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + rimParams.decay * 1.5);
        bodyOsc.connect(bodyGain);
        bodyGain.connect(ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + rimParams.decay * 1.5 + 0.1);
      }
    },
    [getAudioContext]
  );

  /**
   * Play the selected drum sound
   */
  const playDrum = useCallback(
    (drumType: DrumType) => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      setIsPlaying(drumType);
      setTimeout(() => setIsPlaying(null), 150);

      const masterVolume = params.master.volume;

      switch (drumType) {
        case 'kick':
          playKick(params.kick, masterVolume);
          break;
        case 'snare':
          playSnare(params.snare, masterVolume);
          break;
        case 'hihat':
          playHihat(params.hihat, masterVolume);
          break;
        case 'clap':
          playClap(params.clap, masterVolume);
          break;
        case 'tom':
          playTom(params.tom, masterVolume);
          break;
        case 'rim':
          playRim(params.rim, masterVolume);
          break;
      }
    },
    [getAudioContext, params, playKick, playSnare, playHihat, playClap, playTom, playRim]
  );

  /**
   * Update parameter for selected drum
   */
  const updateParam = useCallback(
    <T extends keyof AllDrumParams>(
      drum: T,
      param: keyof AllDrumParams[T],
      value: number
    ) => {
      setParams((prev) => ({
        ...prev,
        [drum]: {
          ...prev[drum],
          [param]: value,
        },
      }));
    },
    []
  );

  /**
   * Reset parameters to defaults
   */
  const resetParams = useCallback(() => {
    setParams(DEFAULT_ALL_PARAMS);
  }, []);

  /**
   * Load preset
   */
  const loadPreset = useCallback((presetName: string) => {
    const preset = SYNTH_PRESETS[presetName];
    if (preset) {
      setParams(preset);
    }
  }, []);

  /**
   * Show status message
   */
  const showStatus = useCallback((text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  /**
   * Export current drum sound
   */
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (isExporting) return;

      setIsExporting(true);
      try {
        await exportDrum(selectedDrum, params, format);
        showStatus(drumSynth.exportSuccess, 'success');
      } catch {
        showStatus(drumSynth.exportError, 'error');
      } finally {
        setIsExporting(false);
      }
    },
    [selectedDrum, params, isExporting, drumSynth, showStatus]
  );

  /**
   * Export all drum sounds
   */
  const handleExportAll = useCallback(
    async (format: ExportFormat) => {
      if (isExporting) return;

      setIsExporting(true);
      try {
        await exportAllDrums(params, format);
        showStatus(drumSynth.exportSuccess, 'success');
      } catch {
        showStatus(drumSynth.exportError, 'error');
      } finally {
        setIsExporting(false);
      }
    },
    [params, isExporting, drumSynth, showStatus]
  );

  /**
   * Get translated drum name
   */
  const getDrumLabel = useCallback(
    (drum: DrumType): string => {
      const labels: Record<DrumType, string> = {
        kick: drumSynth.kick,
        snare: drumSynth.snare,
        hihat: drumSynth.hihat,
        clap: drumSynth.clap,
        tom: drumSynth.tom,
        rim: drumSynth.rim,
      };
      return labels[drum];
    },
    [drumSynth]
  );

  /**
   * Render parameter controls for selected drum
   */
  const renderParams = useCallback(() => {
    switch (selectedDrum) {
      case 'kick':
        return (
          <>
            <ParamSlider
              label={drumSynth.pitchStart}
              value={params.kick.pitchStart}
              min={KICK_RANGES.pitchStart.min}
              max={KICK_RANGES.pitchStart.max}
              step={KICK_RANGES.pitchStart.step}
              unit="Hz"
              onChange={(v) => updateParam('kick', 'pitchStart', v)}
            />
            <ParamSlider
              label={drumSynth.pitchEnd}
              value={params.kick.pitchEnd}
              min={KICK_RANGES.pitchEnd.min}
              max={KICK_RANGES.pitchEnd.max}
              step={KICK_RANGES.pitchEnd.step}
              unit="Hz"
              onChange={(v) => updateParam('kick', 'pitchEnd', v)}
            />
            <ParamSlider
              label={drumSynth.pitchDecay}
              value={params.kick.pitchDecay}
              min={KICK_RANGES.pitchDecay.min}
              max={KICK_RANGES.pitchDecay.max}
              step={KICK_RANGES.pitchDecay.step}
              unit="s"
              onChange={(v) => updateParam('kick', 'pitchDecay', v)}
            />
            <ParamSlider
              label={drumSynth.ampDecay}
              value={params.kick.ampDecay}
              min={KICK_RANGES.ampDecay.min}
              max={KICK_RANGES.ampDecay.max}
              step={KICK_RANGES.ampDecay.step}
              unit="s"
              onChange={(v) => updateParam('kick', 'ampDecay', v)}
            />
            <ParamSlider
              label={drumSynth.click}
              value={params.kick.click}
              min={KICK_RANGES.click.min}
              max={KICK_RANGES.click.max}
              step={KICK_RANGES.click.step}
              unit="%"
              onChange={(v) => updateParam('kick', 'click', v)}
            />
            <ParamSlider
              label={drumSynth.drive}
              value={params.kick.drive}
              min={KICK_RANGES.drive.min}
              max={KICK_RANGES.drive.max}
              step={KICK_RANGES.drive.step}
              unit="%"
              onChange={(v) => updateParam('kick', 'drive', v)}
            />
            <ParamSlider
              label={drumSynth.tone}
              value={params.kick.tone}
              min={KICK_RANGES.tone.min}
              max={KICK_RANGES.tone.max}
              step={KICK_RANGES.tone.step}
              unit="%"
              onChange={(v) => updateParam('kick', 'tone', v)}
            />
          </>
        );
      case 'snare':
        return (
          <>
            <ParamSlider
              label={drumSynth.toneFreq}
              value={params.snare.toneFreq}
              min={SNARE_RANGES.toneFreq.min}
              max={SNARE_RANGES.toneFreq.max}
              step={SNARE_RANGES.toneFreq.step}
              unit="Hz"
              onChange={(v) => updateParam('snare', 'toneFreq', v)}
            />
            <ParamSlider
              label={drumSynth.toneDecay}
              value={params.snare.toneDecay}
              min={SNARE_RANGES.toneDecay.min}
              max={SNARE_RANGES.toneDecay.max}
              step={SNARE_RANGES.toneDecay.step}
              unit="s"
              onChange={(v) => updateParam('snare', 'toneDecay', v)}
            />
            <ParamSlider
              label={drumSynth.noiseDecay}
              value={params.snare.noiseDecay}
              min={SNARE_RANGES.noiseDecay.min}
              max={SNARE_RANGES.noiseDecay.max}
              step={SNARE_RANGES.noiseDecay.step}
              unit="s"
              onChange={(v) => updateParam('snare', 'noiseDecay', v)}
            />
            <ParamSlider
              label={drumSynth.noiseFilter}
              value={params.snare.noiseFilter}
              min={SNARE_RANGES.noiseFilter.min}
              max={SNARE_RANGES.noiseFilter.max}
              step={SNARE_RANGES.noiseFilter.step}
              unit="Hz"
              onChange={(v) => updateParam('snare', 'noiseFilter', v)}
            />
            <ParamSlider
              label={drumSynth.toneMix}
              value={params.snare.toneMix}
              min={SNARE_RANGES.toneMix.min}
              max={SNARE_RANGES.toneMix.max}
              step={SNARE_RANGES.toneMix.step}
              unit="%"
              onChange={(v) => updateParam('snare', 'toneMix', v)}
            />
            <ParamSlider
              label={drumSynth.snappy}
              value={params.snare.snappy}
              min={SNARE_RANGES.snappy.min}
              max={SNARE_RANGES.snappy.max}
              step={SNARE_RANGES.snappy.step}
              unit="%"
              onChange={(v) => updateParam('snare', 'snappy', v)}
            />
          </>
        );
      case 'hihat':
        return (
          <>
            <ParamSlider
              label={drumSynth.filterFreq}
              value={params.hihat.filterFreq}
              min={HIHAT_RANGES.filterFreq.min}
              max={HIHAT_RANGES.filterFreq.max}
              step={HIHAT_RANGES.filterFreq.step}
              unit="Hz"
              onChange={(v) => updateParam('hihat', 'filterFreq', v)}
            />
            <ParamSlider
              label={drumSynth.filterQ}
              value={params.hihat.filterQ}
              min={HIHAT_RANGES.filterQ.min}
              max={HIHAT_RANGES.filterQ.max}
              step={HIHAT_RANGES.filterQ.step}
              onChange={(v) => updateParam('hihat', 'filterQ', v)}
            />
            <ParamSlider
              label={drumSynth.decay}
              value={params.hihat.decay}
              min={HIHAT_RANGES.decay.min}
              max={HIHAT_RANGES.decay.max}
              step={HIHAT_RANGES.decay.step}
              unit="s"
              onChange={(v) => updateParam('hihat', 'decay', v)}
            />
            <ParamSlider
              label={drumSynth.openness}
              value={params.hihat.openness}
              min={HIHAT_RANGES.openness.min}
              max={HIHAT_RANGES.openness.max}
              step={HIHAT_RANGES.openness.step}
              unit="%"
              onChange={(v) => updateParam('hihat', 'openness', v)}
            />
            <ParamSlider
              label={drumSynth.pitch}
              value={params.hihat.pitch}
              min={HIHAT_RANGES.pitch.min}
              max={HIHAT_RANGES.pitch.max}
              step={HIHAT_RANGES.pitch.step}
              unit="%"
              onChange={(v) => updateParam('hihat', 'pitch', v)}
            />
            <ParamSlider
              label={drumSynth.ring}
              value={params.hihat.ring}
              min={HIHAT_RANGES.ring.min}
              max={HIHAT_RANGES.ring.max}
              step={HIHAT_RANGES.ring.step}
              unit="%"
              onChange={(v) => updateParam('hihat', 'ring', v)}
            />
          </>
        );
      case 'clap':
        return (
          <>
            <ParamSlider
              label={drumSynth.filterFreq}
              value={params.clap.filterFreq}
              min={CLAP_RANGES.filterFreq.min}
              max={CLAP_RANGES.filterFreq.max}
              step={CLAP_RANGES.filterFreq.step}
              unit="Hz"
              onChange={(v) => updateParam('clap', 'filterFreq', v)}
            />
            <ParamSlider
              label={drumSynth.filterQ}
              value={params.clap.filterQ}
              min={CLAP_RANGES.filterQ.min}
              max={CLAP_RANGES.filterQ.max}
              step={CLAP_RANGES.filterQ.step}
              onChange={(v) => updateParam('clap', 'filterQ', v)}
            />
            <ParamSlider
              label={drumSynth.decay}
              value={params.clap.decay}
              min={CLAP_RANGES.decay.min}
              max={CLAP_RANGES.decay.max}
              step={CLAP_RANGES.decay.step}
              unit="s"
              onChange={(v) => updateParam('clap', 'decay', v)}
            />
            <ParamSlider
              label={drumSynth.spread}
              value={params.clap.spread}
              min={CLAP_RANGES.spread.min}
              max={CLAP_RANGES.spread.max}
              step={CLAP_RANGES.spread.step}
              unit="%"
              onChange={(v) => updateParam('clap', 'spread', v)}
            />
            <ParamSlider
              label={drumSynth.tone}
              value={params.clap.tone}
              min={CLAP_RANGES.tone.min}
              max={CLAP_RANGES.tone.max}
              step={CLAP_RANGES.tone.step}
              unit="%"
              onChange={(v) => updateParam('clap', 'tone', v)}
            />
            <ParamSlider
              label={drumSynth.reverb}
              value={params.clap.reverb}
              min={CLAP_RANGES.reverb.min}
              max={CLAP_RANGES.reverb.max}
              step={CLAP_RANGES.reverb.step}
              unit="%"
              onChange={(v) => updateParam('clap', 'reverb', v)}
            />
          </>
        );
      case 'tom':
        return (
          <>
            <ParamSlider
              label={drumSynth.pitch}
              value={params.tom.pitch}
              min={TOM_RANGES.pitch.min}
              max={TOM_RANGES.pitch.max}
              step={TOM_RANGES.pitch.step}
              unit="Hz"
              onChange={(v) => updateParam('tom', 'pitch', v)}
            />
            <ParamSlider
              label={drumSynth.pitchDecay}
              value={params.tom.pitchDecay}
              min={TOM_RANGES.pitchDecay.min}
              max={TOM_RANGES.pitchDecay.max}
              step={TOM_RANGES.pitchDecay.step}
              unit="%"
              onChange={(v) => updateParam('tom', 'pitchDecay', v)}
            />
            <ParamSlider
              label={drumSynth.decay}
              value={params.tom.decay}
              min={TOM_RANGES.decay.min}
              max={TOM_RANGES.decay.max}
              step={TOM_RANGES.decay.step}
              unit="s"
              onChange={(v) => updateParam('tom', 'decay', v)}
            />
            <ParamSlider
              label={drumSynth.body}
              value={params.tom.body}
              min={TOM_RANGES.body.min}
              max={TOM_RANGES.body.max}
              step={TOM_RANGES.body.step}
              unit="%"
              onChange={(v) => updateParam('tom', 'body', v)}
            />
            <ParamSlider
              label={drumSynth.attack}
              value={params.tom.attack}
              min={TOM_RANGES.attack.min}
              max={TOM_RANGES.attack.max}
              step={TOM_RANGES.attack.step}
              unit="%"
              onChange={(v) => updateParam('tom', 'attack', v)}
            />
          </>
        );
      case 'rim':
        return (
          <>
            <ParamSlider
              label={drumSynth.pitch}
              value={params.rim.pitch}
              min={RIM_RANGES.pitch.min}
              max={RIM_RANGES.pitch.max}
              step={RIM_RANGES.pitch.step}
              unit="Hz"
              onChange={(v) => updateParam('rim', 'pitch', v)}
            />
            <ParamSlider
              label={drumSynth.decay}
              value={params.rim.decay}
              min={RIM_RANGES.decay.min}
              max={RIM_RANGES.decay.max}
              step={RIM_RANGES.decay.step}
              unit="s"
              onChange={(v) => updateParam('rim', 'decay', v)}
            />
            <ParamSlider
              label={drumSynth.metallic}
              value={params.rim.metallic}
              min={RIM_RANGES.metallic.min}
              max={RIM_RANGES.metallic.max}
              step={RIM_RANGES.metallic.step}
              unit="%"
              onChange={(v) => updateParam('rim', 'metallic', v)}
            />
            <ParamSlider
              label={drumSynth.body}
              value={params.rim.body}
              min={RIM_RANGES.body.min}
              max={RIM_RANGES.body.max}
              step={RIM_RANGES.body.step}
              unit="%"
              onChange={(v) => updateParam('rim', 'body', v)}
            />
            <ParamSlider
              label={drumSynth.click}
              value={params.rim.click}
              min={RIM_RANGES.click.min}
              max={RIM_RANGES.click.max}
              step={RIM_RANGES.click.step}
              unit="%"
              onChange={(v) => updateParam('rim', 'click', v)}
            />
          </>
        );
      default:
        return null;
    }
  }, [selectedDrum, params, drumSynth, updateParam]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="drum-synth">
      {/* Quick Play Pads */}
      <div className="synth-pads">
        <span className="synth-pads-label">{drumSynth.quickPlay}</span>
        <div className="synth-pads-grid">
          {DRUM_TYPES.map((drum) => (
            <button
              key={drum}
              className={cn(
                'synth-pad',
                isPlaying === drum && 'synth-pad--playing'
              )}
              onClick={() => playDrum(drum)}
              aria-label={getDrumLabel(drum)}
            >
              {getDrumLabel(drum)}
            </button>
          ))}
        </div>
      </div>

      {/* Drum Type Selector */}
      <div className="synth-selector">
        {DRUM_TYPES.map((drum) => (
          <button
            key={drum}
            className={cn(
              'synth-drum-btn',
              selectedDrum === drum && 'synth-drum-btn--selected',
              isPlaying === drum && 'synth-drum-btn--playing'
            )}
            onClick={() => setSelectedDrum(drum)}
          >
            {getDrumLabel(drum)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="synth-content">
        {/* Parameter Controls */}
        <div className="synth-params">
          <div className="synth-params-header">
            <h3 className="synth-params-title">
              {getDrumLabel(selectedDrum)} {drumSynth.parameters}
            </h3>
            <button
              className="synth-reset-btn"
              onClick={resetParams}
              aria-label={drumSynth.reset}
              title={drumSynth.reset}
            >
              <ResetIcon />
            </button>
          </div>
          <div className="synth-params-grid">{renderParams()}</div>
        </div>

        {/* Play Button */}
        <div className="synth-play-section">
          <button
            className={cn(
              'synth-play-btn',
              isPlaying === selectedDrum && 'synth-play-btn--playing'
            )}
            onClick={() => playDrum(selectedDrum)}
            aria-label={`${drumSynth.play} ${getDrumLabel(selectedDrum)}`}
          >
            <PlayIcon />
            <span>{drumSynth.play}</span>
          </button>
        </div>
      </div>

      {/* Master Section */}
      <div className="synth-master">
        <h3 className="synth-section-title">{drumSynth.master}</h3>
        <ParamSlider
          label={drumSynth.volume}
          value={params.master.volume}
          min={MASTER_RANGES.volume.min}
          max={MASTER_RANGES.volume.max}
          step={MASTER_RANGES.volume.step}
          unit="%"
          onChange={(v) => updateParam('master', 'volume', v)}
        />
      </div>

      {/* Presets */}
      <div className="synth-presets">
        <span className="synth-presets-label">{drumSynth.presets}</span>
        <div className="synth-presets-buttons">
          {Object.keys(SYNTH_PRESETS).map((preset) => {
            const presetLabels: Record<string, string> = {
              classic808: drumSynth.presetClassic808,
              hardTechno: drumSynth.presetHardTechno,
              lofi: drumSynth.presetLofi,
              minimal: drumSynth.presetMinimal,
              acoustic: drumSynth.presetAcoustic,
            };
            return (
              <button
                key={preset}
                className="synth-preset-btn"
                onClick={() => loadPreset(preset)}
              >
                {presetLabels[preset] || preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Section */}
      <div className="synth-export">
        <span className="synth-export-label">{drumSynth.export}</span>
        <div className="synth-export-buttons">
          <button
            className={cn('synth-export-btn', isExporting && 'synth-export-btn--disabled')}
            onClick={() => handleExport('wav')}
            disabled={isExporting}
            title={`${getDrumLabel(selectedDrum)} - ${drumSynth.exportWav}`}
          >
            <DownloadIcon />
            <span>{drumSynth.exportWav}</span>
          </button>
          <button
            className={cn('synth-export-btn', isExporting && 'synth-export-btn--disabled')}
            onClick={() => handleExport('mp3')}
            disabled={isExporting}
            title={`${getDrumLabel(selectedDrum)} - ${drumSynth.exportCompressed}`}
          >
            <DownloadIcon />
            <span>{drumSynth.exportCompressed}</span>
          </button>
          <button
            className={cn(
              'synth-export-btn',
              'synth-export-btn--all',
              isExporting && 'synth-export-btn--disabled'
            )}
            onClick={() => handleExportAll('wav')}
            disabled={isExporting}
            title={drumSynth.exportAll}
          >
            <DownloadIcon />
            <span>{drumSynth.exportAll}</span>
          </button>
        </div>
        {isExporting && (
          <div className="synth-export-status">{drumSynth.exporting}</div>
        )}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={cn('synth-status', `synth-status--${statusMessage.type}`)}>
          {statusMessage.text}
        </div>
      )}
    </div>
  );
});

DrumSynth.displayName = 'DrumSynth';
