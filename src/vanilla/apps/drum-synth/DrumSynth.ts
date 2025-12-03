/**
 * Drum Synth - Vanilla TypeScript
 * Detailed drum sound synthesis with parameter control
 */

import { Component, html } from '../../../core/Component';
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
} from './constants';
import {
  exportDrum,
  exportAllDrums,
  type ExportFormat,
} from './utils/audioExport';

// Translations
const TRANSLATIONS = {
  ko: {
    quickPlay: '빠른 재생',
    parameters: '파라미터',
    play: '재생',
    reset: '초기화',
    master: '마스터',
    volume: '볼륨',
    presets: '프리셋',
    export: '내보내기',
    exportWav: 'WAV 저장',
    exportCompressed: '압축 저장',
    exportAll: '전체 저장',
    exporting: '내보내는 중...',
    exportSuccess: '저장 완료!',
    exportError: '저장 실패. 다시 시도해주세요.',
    kick: '킥',
    snare: '스네어',
    hihat: '하이햇',
    clap: '클랩',
    tom: '탐',
    rim: '림',
    pitchStart: '시작 피치',
    pitchEnd: '끝 피치',
    pitchDecay: '피치 감쇠',
    ampDecay: '진폭 감쇠',
    click: '클릭',
    drive: '드라이브',
    tone: '톤',
    toneFreq: '톤 주파수',
    toneDecay: '톤 감쇠',
    noiseDecay: '노이즈 감쇠',
    noiseFilter: '노이즈 필터',
    toneMix: '톤 믹스',
    snappy: '스내피',
    filterFreq: '필터 주파수',
    filterQ: '필터 Q',
    decay: '감쇠',
    openness: '오픈',
    pitch: '피치',
    ring: '링',
    spread: '스프레드',
    reverb: '리버브',
    body: '바디',
    attack: '어택',
    metallic: '메탈릭',
    presetClassic808: '클래식 808',
    presetHardTechno: '하드 테크노',
    presetLofi: '로파이',
    presetMinimal: '미니멀',
    presetAcoustic: '어쿠스틱',
  },
  en: {
    quickPlay: 'Quick Play',
    parameters: 'Parameters',
    play: 'Play',
    reset: 'Reset',
    master: 'Master',
    volume: 'Volume',
    presets: 'Presets',
    export: 'Export',
    exportWav: 'Save WAV',
    exportCompressed: 'Save Compressed',
    exportAll: 'Save All',
    exporting: 'Exporting...',
    exportSuccess: 'Export complete!',
    exportError: 'Export failed. Please try again.',
    kick: 'Kick',
    snare: 'Snare',
    hihat: 'Hi-Hat',
    clap: 'Clap',
    tom: 'Tom',
    rim: 'Rim',
    pitchStart: 'Pitch Start',
    pitchEnd: 'Pitch End',
    pitchDecay: 'Pitch Decay',
    ampDecay: 'Amp Decay',
    click: 'Click',
    drive: 'Drive',
    tone: 'Tone',
    toneFreq: 'Tone Freq',
    toneDecay: 'Tone Decay',
    noiseDecay: 'Noise Decay',
    noiseFilter: 'Noise Filter',
    toneMix: 'Tone Mix',
    snappy: 'Snappy',
    filterFreq: 'Filter Freq',
    filterQ: 'Filter Q',
    decay: 'Decay',
    openness: 'Openness',
    pitch: 'Pitch',
    ring: 'Ring',
    spread: 'Spread',
    reverb: 'Reverb',
    body: 'Body',
    attack: 'Attack',
    metallic: 'Metallic',
    presetClassic808: 'Classic 808',
    presetHardTechno: 'Hard Techno',
    presetLofi: 'Lo-Fi',
    presetMinimal: 'Minimal',
    presetAcoustic: 'Acoustic',
  },
};

type Language = 'ko' | 'en';

interface DrumSynthState {
  selectedDrum: DrumType;
  params: AllDrumParams;
  isPlaying: DrumType | null;
  isExporting: boolean;
  statusMessage: { text: string; type: 'success' | 'error' } | null;
  language: Language;
  [key: string]: unknown;
}

interface DrumSynthProps {
  [key: string]: unknown;
}

export class DrumSynth extends Component<DrumSynthProps, DrumSynthState> {
  private audioContext: AudioContext | null = null;
  private noiseBufferCache: Map<string, AudioBuffer> = new Map();
  private distortionCurveCache: Map<number, Float32Array> = new Map();
  private statusTimeout: number | null = null;
  private isPlayingTimeout: number | null = null;
  private handleStorageChange: ((e: StorageEvent) => void) | null = null;

  protected getInitialState(): DrumSynthState {
    const lang = (localStorage.getItem('tools-language') || 'en') as Language;
    return {
      selectedDrum: 'kick',
      params: { ...DEFAULT_ALL_PARAMS },
      isPlaying: null,
      isExporting: false,
      statusMessage: null,
      language: lang,
    };
  }

  private get t() {
    return TRANSLATIONS[this.state.language];
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    }
    return this.audioContext;
  }

  private getNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const key = `noise-${Math.round(duration * 1000)}`;
    const cached = this.noiseBufferCache.get(key);
    if (cached && cached.sampleRate === ctx.sampleRate) {
      return cached;
    }
    const buffer = ctx.createBuffer(
      1,
      ctx.sampleRate * duration,
      ctx.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBufferCache.set(key, buffer);
    return buffer;
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const roundedAmount = Math.round(amount);
    const cached = this.distortionCurveCache.get(roundedAmount);
    if (cached) return cached as Float32Array<ArrayBuffer>;

    const samples = 44100;
    const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
    const k = (roundedAmount / 100) * 50;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] =
        ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
    }
    this.distortionCurveCache.set(roundedAmount, curve);
    return curve;
  }

  private playKick(kickParams: KickParams, masterVolume: number): void {
    const ctx = this.getAudioContext();
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
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      now + kickParams.ampDecay
    );

    if (kickParams.click > 0) {
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(kickParams.pitchStart * 4, now);
      clickGain.gain.setValueAtTime(
        (kickParams.click / 100) * volume * 0.3,
        now
      );
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.01);
    }

    if (kickParams.drive > 0) {
      const distortion = ctx.createWaveShaper();
      distortion.curve = this.makeDistortionCurve(kickParams.drive);
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

  private playSnare(snareParams: SnareParams, masterVolume: number): void {
    const ctx = this.getAudioContext();
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
    toneGain.gain.exponentialRampToValueAtTime(
      0.001,
      now + snareParams.toneDecay
    );
    toneOsc.connect(toneGain);
    toneGain.connect(ctx.destination);
    toneOsc.start(now);
    toneOsc.stop(now + snareParams.toneDecay + 0.1);

    const noiseBuffer = this.getNoiseBuffer(ctx, snareParams.noiseDecay);
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

  private playHihat(hihatParams: HihatParams, masterVolume: number): void {
    const ctx = this.getAudioContext();
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

    const noiseBuffer = this.getNoiseBuffer(ctx, actualDecay);
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

  private playClap(clapParams: ClapParams, masterVolume: number): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
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

  private playTom(tomParams: TomParams, masterVolume: number): void {
    const ctx = this.getAudioContext();
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

  private playRim(rimParams: RimParams, masterVolume: number): void {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const volume = masterVolume / 100;

    if (rimParams.click > 0) {
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(rimParams.pitch * 2, now);
      clickGain.gain.setValueAtTime(
        (rimParams.click / 100) * volume * 0.4,
        now
      );
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
    metalGain.gain.setValueAtTime(
      (rimParams.metallic / 100) * volume * 0.5,
      now
    );
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

  private playDrum(drumType: DrumType): void {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    this.setState({ isPlaying: drumType });
    // Clear any existing isPlaying timeout
    if (this.isPlayingTimeout) {
      clearTimeout(this.isPlayingTimeout);
    }
    this.isPlayingTimeout = window.setTimeout(() => {
      this.isPlayingTimeout = null;
      this.setState({ isPlaying: null });
    }, 150);

    const masterVolume = this.state.params.master.volume;

    switch (drumType) {
      case 'kick':
        this.playKick(this.state.params.kick, masterVolume);
        break;
      case 'snare':
        this.playSnare(this.state.params.snare, masterVolume);
        break;
      case 'hihat':
        this.playHihat(this.state.params.hihat, masterVolume);
        break;
      case 'clap':
        this.playClap(this.state.params.clap, masterVolume);
        break;
      case 'tom':
        this.playTom(this.state.params.tom, masterVolume);
        break;
      case 'rim':
        this.playRim(this.state.params.rim, masterVolume);
        break;
    }
  }

  private getDrumLabel(drum: DrumType): string {
    const labels: Record<DrumType, string> = {
      kick: this.t.kick,
      snare: this.t.snare,
      hihat: this.t.hihat,
      clap: this.t.clap,
      tom: this.t.tom,
      rim: this.t.rim,
    };
    return labels[drum];
  }

  private showStatus(text: string, type: 'success' | 'error'): void {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
    this.setState({ statusMessage: { text, type } });
    this.statusTimeout = window.setTimeout(() => {
      this.setState({ statusMessage: null });
    }, 3000);
  }

  private async handleExport(format: ExportFormat): Promise<void> {
    if (this.state.isExporting) return;

    this.setState({ isExporting: true });
    try {
      await exportDrum(this.state.selectedDrum, this.state.params, format);
      this.showStatus(this.t.exportSuccess, 'success');
    } catch {
      this.showStatus(this.t.exportError, 'error');
    } finally {
      this.setState({ isExporting: false });
    }
  }

  private async handleExportAll(format: ExportFormat): Promise<void> {
    if (this.state.isExporting) return;

    this.setState({ isExporting: true });
    try {
      await exportAllDrums(this.state.params, format);
      this.showStatus(this.t.exportSuccess, 'success');
    } catch {
      this.showStatus(this.t.exportError, 'error');
    } finally {
      this.setState({ isExporting: false });
    }
  }

  private renderSlider(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    unit: string,
    dataKey: string
  ): string {
    const displayValue = step < 1 ? value.toFixed(2) : value;
    return html`
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium text-text-secondary">${label}</span>
          <span
            class="text-xs font-semibold text-text-primary tabular-nums min-w-[50px] text-right"
          >
            ${displayValue}${unit}
          </span>
        </div>
        <div class="relative h-11 flex items-center">
          <input
            type="range"
            class="synth-slider w-full h-1 appearance-none bg-border-primary rounded-sm outline-none cursor-pointer touch-pan-x"
            min="${min}"
            max="${max}"
            step="${step}"
            value="${value}"
            data-param="${dataKey}"
          />
        </div>
      </div>
    `;
  }

  private renderKickParams(): string {
    const p = this.state.params.kick;
    return html`
      ${this.renderSlider(
        this.t.pitchStart,
        p.pitchStart,
        KICK_RANGES.pitchStart.min,
        KICK_RANGES.pitchStart.max,
        KICK_RANGES.pitchStart.step,
        'Hz',
        'kick.pitchStart'
      )}
      ${this.renderSlider(
        this.t.pitchEnd,
        p.pitchEnd,
        KICK_RANGES.pitchEnd.min,
        KICK_RANGES.pitchEnd.max,
        KICK_RANGES.pitchEnd.step,
        'Hz',
        'kick.pitchEnd'
      )}
      ${this.renderSlider(
        this.t.pitchDecay,
        p.pitchDecay,
        KICK_RANGES.pitchDecay.min,
        KICK_RANGES.pitchDecay.max,
        KICK_RANGES.pitchDecay.step,
        's',
        'kick.pitchDecay'
      )}
      ${this.renderSlider(
        this.t.ampDecay,
        p.ampDecay,
        KICK_RANGES.ampDecay.min,
        KICK_RANGES.ampDecay.max,
        KICK_RANGES.ampDecay.step,
        's',
        'kick.ampDecay'
      )}
      ${this.renderSlider(
        this.t.click,
        p.click,
        KICK_RANGES.click.min,
        KICK_RANGES.click.max,
        KICK_RANGES.click.step,
        '%',
        'kick.click'
      )}
      ${this.renderSlider(
        this.t.drive,
        p.drive,
        KICK_RANGES.drive.min,
        KICK_RANGES.drive.max,
        KICK_RANGES.drive.step,
        '%',
        'kick.drive'
      )}
      ${this.renderSlider(
        this.t.tone,
        p.tone,
        KICK_RANGES.tone.min,
        KICK_RANGES.tone.max,
        KICK_RANGES.tone.step,
        '%',
        'kick.tone'
      )}
    `;
  }

  private renderSnareParams(): string {
    const p = this.state.params.snare;
    return html`
      ${this.renderSlider(
        this.t.toneFreq,
        p.toneFreq,
        SNARE_RANGES.toneFreq.min,
        SNARE_RANGES.toneFreq.max,
        SNARE_RANGES.toneFreq.step,
        'Hz',
        'snare.toneFreq'
      )}
      ${this.renderSlider(
        this.t.toneDecay,
        p.toneDecay,
        SNARE_RANGES.toneDecay.min,
        SNARE_RANGES.toneDecay.max,
        SNARE_RANGES.toneDecay.step,
        's',
        'snare.toneDecay'
      )}
      ${this.renderSlider(
        this.t.noiseDecay,
        p.noiseDecay,
        SNARE_RANGES.noiseDecay.min,
        SNARE_RANGES.noiseDecay.max,
        SNARE_RANGES.noiseDecay.step,
        's',
        'snare.noiseDecay'
      )}
      ${this.renderSlider(
        this.t.noiseFilter,
        p.noiseFilter,
        SNARE_RANGES.noiseFilter.min,
        SNARE_RANGES.noiseFilter.max,
        SNARE_RANGES.noiseFilter.step,
        'Hz',
        'snare.noiseFilter'
      )}
      ${this.renderSlider(
        this.t.toneMix,
        p.toneMix,
        SNARE_RANGES.toneMix.min,
        SNARE_RANGES.toneMix.max,
        SNARE_RANGES.toneMix.step,
        '%',
        'snare.toneMix'
      )}
      ${this.renderSlider(
        this.t.snappy,
        p.snappy,
        SNARE_RANGES.snappy.min,
        SNARE_RANGES.snappy.max,
        SNARE_RANGES.snappy.step,
        '%',
        'snare.snappy'
      )}
    `;
  }

  private renderHihatParams(): string {
    const p = this.state.params.hihat;
    return html`
      ${this.renderSlider(
        this.t.filterFreq,
        p.filterFreq,
        HIHAT_RANGES.filterFreq.min,
        HIHAT_RANGES.filterFreq.max,
        HIHAT_RANGES.filterFreq.step,
        'Hz',
        'hihat.filterFreq'
      )}
      ${this.renderSlider(
        this.t.filterQ,
        p.filterQ,
        HIHAT_RANGES.filterQ.min,
        HIHAT_RANGES.filterQ.max,
        HIHAT_RANGES.filterQ.step,
        '',
        'hihat.filterQ'
      )}
      ${this.renderSlider(
        this.t.decay,
        p.decay,
        HIHAT_RANGES.decay.min,
        HIHAT_RANGES.decay.max,
        HIHAT_RANGES.decay.step,
        's',
        'hihat.decay'
      )}
      ${this.renderSlider(
        this.t.openness,
        p.openness,
        HIHAT_RANGES.openness.min,
        HIHAT_RANGES.openness.max,
        HIHAT_RANGES.openness.step,
        '%',
        'hihat.openness'
      )}
      ${this.renderSlider(
        this.t.pitch,
        p.pitch,
        HIHAT_RANGES.pitch.min,
        HIHAT_RANGES.pitch.max,
        HIHAT_RANGES.pitch.step,
        '%',
        'hihat.pitch'
      )}
      ${this.renderSlider(
        this.t.ring,
        p.ring,
        HIHAT_RANGES.ring.min,
        HIHAT_RANGES.ring.max,
        HIHAT_RANGES.ring.step,
        '%',
        'hihat.ring'
      )}
    `;
  }

  private renderClapParams(): string {
    const p = this.state.params.clap;
    return html`
      ${this.renderSlider(
        this.t.filterFreq,
        p.filterFreq,
        CLAP_RANGES.filterFreq.min,
        CLAP_RANGES.filterFreq.max,
        CLAP_RANGES.filterFreq.step,
        'Hz',
        'clap.filterFreq'
      )}
      ${this.renderSlider(
        this.t.filterQ,
        p.filterQ,
        CLAP_RANGES.filterQ.min,
        CLAP_RANGES.filterQ.max,
        CLAP_RANGES.filterQ.step,
        '',
        'clap.filterQ'
      )}
      ${this.renderSlider(
        this.t.decay,
        p.decay,
        CLAP_RANGES.decay.min,
        CLAP_RANGES.decay.max,
        CLAP_RANGES.decay.step,
        's',
        'clap.decay'
      )}
      ${this.renderSlider(
        this.t.spread,
        p.spread,
        CLAP_RANGES.spread.min,
        CLAP_RANGES.spread.max,
        CLAP_RANGES.spread.step,
        '%',
        'clap.spread'
      )}
      ${this.renderSlider(
        this.t.tone,
        p.tone,
        CLAP_RANGES.tone.min,
        CLAP_RANGES.tone.max,
        CLAP_RANGES.tone.step,
        '%',
        'clap.tone'
      )}
      ${this.renderSlider(
        this.t.reverb,
        p.reverb,
        CLAP_RANGES.reverb.min,
        CLAP_RANGES.reverb.max,
        CLAP_RANGES.reverb.step,
        '%',
        'clap.reverb'
      )}
    `;
  }

  private renderTomParams(): string {
    const p = this.state.params.tom;
    return html`
      ${this.renderSlider(
        this.t.pitch,
        p.pitch,
        TOM_RANGES.pitch.min,
        TOM_RANGES.pitch.max,
        TOM_RANGES.pitch.step,
        'Hz',
        'tom.pitch'
      )}
      ${this.renderSlider(
        this.t.pitchDecay,
        p.pitchDecay,
        TOM_RANGES.pitchDecay.min,
        TOM_RANGES.pitchDecay.max,
        TOM_RANGES.pitchDecay.step,
        '%',
        'tom.pitchDecay'
      )}
      ${this.renderSlider(
        this.t.decay,
        p.decay,
        TOM_RANGES.decay.min,
        TOM_RANGES.decay.max,
        TOM_RANGES.decay.step,
        's',
        'tom.decay'
      )}
      ${this.renderSlider(
        this.t.body,
        p.body,
        TOM_RANGES.body.min,
        TOM_RANGES.body.max,
        TOM_RANGES.body.step,
        '%',
        'tom.body'
      )}
      ${this.renderSlider(
        this.t.attack,
        p.attack,
        TOM_RANGES.attack.min,
        TOM_RANGES.attack.max,
        TOM_RANGES.attack.step,
        '%',
        'tom.attack'
      )}
    `;
  }

  private renderRimParams(): string {
    const p = this.state.params.rim;
    return html`
      ${this.renderSlider(
        this.t.pitch,
        p.pitch,
        RIM_RANGES.pitch.min,
        RIM_RANGES.pitch.max,
        RIM_RANGES.pitch.step,
        'Hz',
        'rim.pitch'
      )}
      ${this.renderSlider(
        this.t.decay,
        p.decay,
        RIM_RANGES.decay.min,
        RIM_RANGES.decay.max,
        RIM_RANGES.decay.step,
        's',
        'rim.decay'
      )}
      ${this.renderSlider(
        this.t.metallic,
        p.metallic,
        RIM_RANGES.metallic.min,
        RIM_RANGES.metallic.max,
        RIM_RANGES.metallic.step,
        '%',
        'rim.metallic'
      )}
      ${this.renderSlider(
        this.t.body,
        p.body,
        RIM_RANGES.body.min,
        RIM_RANGES.body.max,
        RIM_RANGES.body.step,
        '%',
        'rim.body'
      )}
      ${this.renderSlider(
        this.t.click,
        p.click,
        RIM_RANGES.click.min,
        RIM_RANGES.click.max,
        RIM_RANGES.click.step,
        '%',
        'rim.click'
      )}
    `;
  }

  private renderParams(): string {
    switch (this.state.selectedDrum) {
      case 'kick':
        return this.renderKickParams();
      case 'snare':
        return this.renderSnareParams();
      case 'hihat':
        return this.renderHihatParams();
      case 'clap':
        return this.renderClapParams();
      case 'tom':
        return this.renderTomParams();
      case 'rim':
        return this.renderRimParams();
      default:
        return '';
    }
  }

  protected render(): string {
    const { selectedDrum, isPlaying, isExporting, statusMessage, params } =
      this.state;

    const presetLabels: Record<string, string> = {
      classic808: this.t.presetClassic808,
      hardTechno: this.t.presetHardTechno,
      lofi: this.t.presetLofi,
      minimal: this.t.presetMinimal,
      acoustic: this.t.presetAcoustic,
    };

    return html`
      <style>
        .synth-slider::-webkit-slider-thumb {
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          background: var(--color-text-primary);
          border-radius: 9999px;
          cursor: grab;
          transition: transform 100ms;
        }
        .synth-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .synth-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.15);
        }
        .synth-slider::-moz-range-thumb {
          width: 1.25rem;
          height: 1.25rem;
          background: var(--color-text-primary);
          border: 0;
          border-radius: 9999px;
          cursor: grab;
        }
        @keyframes synth-status-slide-in {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      </style>

      <div
        class="flex flex-col gap-6 max-w-[800px] mx-auto p-4 sm:gap-6 sm:p-6 md:gap-8 md:p-8 max-[380px]:gap-4 max-[380px]:p-3"
      >
        <!-- Quick Play Pads -->
        <div class="flex flex-col gap-3">
          <span
            class="text-[0.6875rem] font-medium text-text-secondary uppercase tracking-wide"
          >
            ${this.t.quickPlay}
          </span>
          <div
            class="grid grid-cols-6 gap-2 sm:gap-2.5 max-[380px]:grid-cols-3 max-[380px]:gap-1.5"
          >
            ${DRUM_TYPES.map(
              (drum) => html`
                <button
                  class="aspect-square flex items-center justify-center p-2 text-[0.6875rem] font-semibold uppercase tracking-tight bg-bg-primary border border-border-primary rounded-lg cursor-pointer transition-[background-color,border-color,transform] duration-[100ms,100ms,80ms] select-none touch-manipulation hover:bg-interactive-hover hover:border-text-secondary focus-visible:outline-2 focus-visible:outline-text-primary focus-visible:outline-offset-2 active:bg-text-primary active:text-bg-primary active:scale-95 sm:text-xs md:text-[0.8125rem] max-[380px]:text-[0.625rem] ${isPlaying ===
                  drum
                    ? 'bg-text-primary text-bg-primary scale-95'
                    : 'text-text-primary'}"
                  data-quick-play="${drum}"
                >
                  ${this.getDrumLabel(drum)}
                </button>
              `
            ).join('')}
          </div>
        </div>

        <!-- Drum Type Selector -->
        <div
          class="flex gap-1 p-1 bg-bg-secondary rounded-lg overflow-x-auto scrollbar-none"
        >
          ${DRUM_TYPES.map(
            (drum) => html`
              <button
                class="flex-1 min-w-0 py-2.5 px-2 text-xs font-medium bg-transparent border-0 rounded-md cursor-pointer transition-[background-color,color] duration-150 touch-manipulation whitespace-nowrap hover:text-text-primary md:py-3 md:px-4 md:text-[0.8125rem] max-[380px]:py-2 max-[380px]:px-1.5 max-[380px]:text-[0.6875rem] ${selectedDrum ===
                drum
                  ? 'text-text-primary bg-bg-primary font-semibold shadow-xs'
                  : 'text-text-secondary'} ${isPlaying === drum
                  ? 'bg-text-primary text-bg-primary'
                  : ''}"
                data-select-drum="${drum}"
              >
                ${this.getDrumLabel(drum)}
              </button>
            `
          ).join('')}
        </div>

        <!-- Main Content -->
        <div
          class="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_auto] lg:gap-8 lg:items-start"
        >
          <!-- Parameter Controls -->
          <div class="bg-bg-secondary rounded-xl p-5 md:p-6 lg:col-start-1">
            <div
              class="flex justify-between items-center mb-5 pb-3 border-b border-border-primary"
            >
              <h3
                class="m-0 text-sm font-semibold text-text-primary md:text-[0.9375rem]"
              >
                ${this.getDrumLabel(selectedDrum)} ${this.t.parameters}
              </h3>
              <button
                class="flex items-center justify-center w-9 h-9 p-0 text-text-secondary bg-bg-primary border border-border-primary rounded-md cursor-pointer transition-[background-color,color] duration-150 touch-manipulation hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-text-primary focus-visible:outline-offset-2"
                data-action="reset"
                title="${this.t.reset}"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
            <div
              class="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3"
            >
              ${this.renderParams()}
            </div>
          </div>

          <!-- Play Button -->
          <div class="flex justify-center py-2 lg:sticky lg:top-4">
            <button
              class="flex items-center justify-center gap-2 min-w-[140px] py-3.5 px-7 text-sm font-semibold text-bg-primary bg-text-primary border-0 rounded-lg cursor-pointer transition-[background-color,transform] duration-[150ms,100ms] touch-manipulation hover:bg-text-secondary focus-visible:outline-2 focus-visible:outline-text-primary focus-visible:outline-offset-[3px] active:scale-[0.97] max-[380px]:min-w-[120px] max-[380px]:py-3 max-[380px]:px-5 max-[380px]:text-[0.8125rem] lg:flex-col lg:min-w-[100px] lg:py-5 lg:px-4 ${isPlaying ===
              selectedDrum
                ? 'scale-[0.97]'
                : ''}"
              data-action="play"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>${this.t.play}</span>
            </button>
          </div>
        </div>

        <!-- Master Section -->
        <div class="bg-bg-secondary rounded-xl p-5">
          <h3
            class="m-0 mb-4 text-[0.6875rem] font-medium text-text-secondary uppercase tracking-wide"
          >
            ${this.t.master}
          </h3>
          ${this.renderSlider(
            this.t.volume,
            params.master.volume,
            MASTER_RANGES.volume.min,
            MASTER_RANGES.volume.max,
            MASTER_RANGES.volume.step,
            '%',
            'master.volume'
          )}
        </div>

        <!-- Presets -->
        <div class="flex flex-col gap-3 p-5 bg-bg-secondary rounded-xl">
          <span
            class="text-[0.6875rem] font-medium text-text-secondary uppercase tracking-wide"
          >
            ${this.t.presets}
          </span>
          <div class="flex flex-wrap gap-2">
            ${Object.keys(SYNTH_PRESETS)
              .map(
                (preset) => html`
                  <button
                    class="flex-1 min-w-[90px] py-2.5 px-4 text-xs font-medium text-text-primary bg-bg-primary border border-border-primary rounded-md cursor-pointer transition-[background-color,border-color] duration-150 touch-manipulation hover:bg-interactive-hover hover:border-text-secondary focus-visible:outline-2 focus-visible:outline-text-primary focus-visible:outline-offset-2 max-[380px]:min-w-[70px] max-[380px]:py-2 max-[380px]:px-2.5 max-[380px]:text-[0.6875rem]"
                    data-preset="${preset}"
                  >
                    ${presetLabels[preset] || preset}
                  </button>
                `
              )
              .join('')}
          </div>
        </div>

        <!-- Export Section -->
        <div class="flex flex-col gap-3 p-5 bg-bg-secondary rounded-xl">
          <span
            class="text-[0.6875rem] font-medium text-text-secondary uppercase tracking-wide"
          >
            ${this.t.export}
          </span>
          <div class="flex flex-wrap gap-2">
            <button
              class="flex items-center justify-center gap-1.5 flex-1 min-w-[120px] py-2.5 px-4 text-xs font-medium text-text-primary bg-bg-primary border border-border-primary rounded-md cursor-pointer transition-[background-color,border-color,opacity] duration-150 touch-manipulation hover:bg-interactive-hover hover:border-text-secondary focus-visible:outline-2 focus-visible:outline-text-primary focus-visible:outline-offset-2 ${isExporting
                ? 'opacity-50 cursor-not-allowed'
                : ''}"
              data-export="wav"
              ${isExporting ? 'disabled' : ''}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>${this.t.exportWav}</span>
            </button>
            <button
              class="flex items-center justify-center gap-1.5 flex-1 min-w-[120px] py-2.5 px-4 text-xs font-medium text-text-primary bg-bg-primary border border-border-primary rounded-md cursor-pointer transition-[background-color,border-color,opacity] duration-150 touch-manipulation hover:bg-interactive-hover hover:border-text-secondary focus-visible:outline-2 focus-visible:outline-text-primary focus-visible:outline-offset-2 ${isExporting
                ? 'opacity-50 cursor-not-allowed'
                : ''}"
              data-export="mp3"
              ${isExporting ? 'disabled' : ''}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>${this.t.exportCompressed}</span>
            </button>
            <button
              class="flex items-center justify-center gap-1.5 flex-1 min-w-[120px] py-2.5 px-4 text-xs font-medium text-bg-primary bg-text-primary border border-text-primary rounded-md cursor-pointer transition-[background-color,border-color,opacity] duration-150 touch-manipulation hover:bg-text-secondary hover:border-text-secondary focus-visible:outline-2 focus-visible:outline-text-primary focus-visible:outline-offset-2 ${isExporting
                ? 'opacity-50 cursor-not-allowed'
                : ''}"
              data-export="all"
              ${isExporting ? 'disabled' : ''}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>${this.t.exportAll}</span>
            </button>
          </div>
          ${isExporting
            ? html`
                <div class="text-xs text-text-secondary text-center p-2">
                  ${this.t.exporting}
                </div>
              `
            : ''}
        </div>

        <!-- Status Message -->
        ${statusMessage
          ? html`
              <div
                class="fixed bottom-6 left-1/2 -translate-x-1/2 py-3 px-5 text-[0.8125rem] font-medium rounded-lg shadow-lg z-[100] text-white ${statusMessage.type ===
                'success'
                  ? 'bg-success'
                  : 'bg-error'}"
                style="animation: synth-status-slide-in 200ms ease-out"
              >
                ${statusMessage.text}
              </div>
            `
          : ''}
      </div>
    `;
  }

  protected bindEvents(): void {
    // Quick play buttons
    this.queryAll('[data-quick-play]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drum = btn.getAttribute('data-quick-play') as DrumType;
        this.playDrum(drum);
      });
    });

    // Drum type selector
    this.queryAll('[data-select-drum]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drum = btn.getAttribute('data-select-drum') as DrumType;
        this.setState({ selectedDrum: drum });
      });
    });

    // Play button
    const playBtn = this.query('[data-action="play"]');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.playDrum(this.state.selectedDrum);
      });
    }

    // Reset button
    const resetBtn = this.query('[data-action="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.setState({ params: { ...DEFAULT_ALL_PARAMS } });
      });
    }

    // Parameter sliders
    this.queryAll('.synth-slider').forEach((slider) => {
      slider.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        const paramKey = input.getAttribute('data-param');
        if (!paramKey) return;

        const [drum, param] = paramKey.split('.') as [
          keyof AllDrumParams,
          string,
        ];
        const value = parseFloat(input.value);

        this.setState({
          params: {
            ...this.state.params,
            [drum]: {
              ...this.state.params[drum],
              [param]: value,
            },
          },
        });
      });
    });

    // Preset buttons
    this.queryAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset') as string;
        const presetParams = SYNTH_PRESETS[preset];
        if (presetParams) {
          this.setState({ params: { ...presetParams } });
        }
      });
    });

    // Export buttons
    const exportWavBtn = this.query('[data-export="wav"]');
    if (exportWavBtn) {
      exportWavBtn.addEventListener('click', () => this.handleExport('wav'));
    }

    const exportMp3Btn = this.query('[data-export="mp3"]');
    if (exportMp3Btn) {
      exportMp3Btn.addEventListener('click', () => this.handleExport('mp3'));
    }

    const exportAllBtn = this.query('[data-export="all"]');
    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', () => this.handleExportAll('wav'));
    }

    // Language change listener - store reference for cleanup
    this.handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tools-language') {
        const lang = (e.newValue || 'en') as Language;
        this.setState({ language: lang });
      }
    };
    window.addEventListener('storage', this.handleStorageChange);
  }

  protected onDestroy(): void {
    // Clean up audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Clean up storage listener
    if (this.handleStorageChange) {
      window.removeEventListener('storage', this.handleStorageChange);
      this.handleStorageChange = null;
    }

    // Clean up timeouts
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }
    if (this.isPlayingTimeout) {
      clearTimeout(this.isPlayingTimeout);
      this.isPlayingTimeout = null;
    }

    // Clear caches
    this.noiseBufferCache.clear();
    this.distortionCurveCache.clear();
  }
}
