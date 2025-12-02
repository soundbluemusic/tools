import { memo, useState, useCallback, useRef, useEffect } from 'react';
import type { Translations } from './i18n';
import {
  DrumType, DRUM_TYPES, AllDrumParams, KickParams, SnareParams, HihatParams, ClapParams, TomParams, RimParams,
  KICK_RANGES, SNARE_RANGES, HIHAT_RANGES, CLAP_RANGES, TOM_RANGES, RIM_RANGES, MASTER_RANGES,
  DEFAULT_ALL_PARAMS, SYNTH_PRESETS,
} from './constants';

interface DrumSynthProps {
  translations: Translations;
}

interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

const ParamSlider = memo(function ParamSlider({ label, value, min, max, step, unit = '', onChange }: ParamSliderProps) {
  const displayValue = step < 1 ? value.toFixed(2) : value;
  return (
    <div className="synth-param">
      <div className="synth-param-header">
        <span className="synth-param-label">{label}</span>
        <span className="synth-param-value">{displayValue}{unit}</span>
      </div>
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
  );
});

export const DrumSynth = memo(function DrumSynth({ translations: t }: DrumSynthProps) {
  const [selectedDrum, setSelectedDrum] = useState<DrumType>('kick');
  const [params, setParams] = useState<AllDrumParams>(DEFAULT_ALL_PARAMS);
  const [isPlaying, setIsPlaying] = useState<DrumType | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const getNoiseBuffer = useCallback((ctx: AudioContext, duration: number): AudioBuffer => {
    const key = `noise-${Math.round(duration * 1000)}`;
    const cached = noiseBufferCacheRef.current.get(key);
    if (cached && cached.sampleRate === ctx.sampleRate) return cached;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBufferCacheRef.current.set(key, buffer);
    return buffer;
  }, []);

  const playKick = useCallback((kickParams: KickParams, masterVolume: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const volume = masterVolume / 100;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = kickParams.tone > 50 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(kickParams.pitchStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(kickParams.pitchEnd, 0.01), now + kickParams.pitchDecay);
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

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + kickParams.ampDecay + 0.1);
  }, [getAudioContext]);

  const playSnare = useCallback((snareParams: SnareParams, masterVolume: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const volume = masterVolume / 100;
    const toneMix = snareParams.toneMix / 100;

    const toneOsc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    toneOsc.type = 'triangle';
    toneOsc.frequency.setValueAtTime(snareParams.toneFreq, now);
    toneGain.gain.setValueAtTime(volume * toneMix * 0.5, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + snareParams.toneDecay);
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
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * (1 - toneMix) * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + snareParams.noiseDecay);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
  }, [getAudioContext, getNoiseBuffer]);

  const playHihat = useCallback((hihatParams: HihatParams, masterVolume: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const volume = masterVolume / 100;
    const actualDecay = hihatParams.decay + (hihatParams.openness / 100) * 0.3;

    const noiseBuffer = getNoiseBuffer(ctx, actualDecay);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(hihatParams.filterFreq, now);
    noiseFilter.Q.setValueAtTime(hihatParams.filterQ, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + actualDecay);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);
  }, [getAudioContext, getNoiseBuffer]);

  const playClap = useCallback((clapParams: ClapParams, masterVolume: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const volume = masterVolume / 100;

    for (let c = 0; c < 4; c++) {
      const clapTime = now + c * 0.01;
      const noiseBuffer = getNoiseBuffer(ctx, clapParams.decay);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.setValueAtTime(clapParams.filterFreq, clapTime);
      bpFilter.Q.setValueAtTime(clapParams.filterQ, clapTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.3 * Math.pow(0.8, c), clapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + clapParams.decay);
      noiseSource.connect(bpFilter);
      bpFilter.connect(gain);
      gain.connect(ctx.destination);
      noiseSource.start(clapTime);
    }
  }, [getAudioContext, getNoiseBuffer]);

  const playTom = useCallback((tomParams: TomParams, masterVolume: number) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const volume = masterVolume / 100;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    const pitchDrop = (tomParams.pitchDecay / 100) * tomParams.pitch * 0.3;
    osc.frequency.setValueAtTime(tomParams.pitch, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(tomParams.pitch - pitchDrop, 20), now + tomParams.decay * 0.3);
    gainNode.gain.setValueAtTime(volume * 0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + tomParams.decay);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + tomParams.decay + 0.1);
  }, [getAudioContext]);

  const playRim = useCallback((rimParams: RimParams, masterVolume: number) => {
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
    metalOsc.connect(metalGain);
    metalGain.connect(ctx.destination);
    metalOsc.start(now);
    metalOsc.stop(now + rimParams.decay + 0.1);
  }, [getAudioContext]);

  const playDrum = useCallback((drumType: DrumType) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    setIsPlaying(drumType);
    setTimeout(() => setIsPlaying(null), 150);

    const masterVolume = params.master.volume;
    switch (drumType) {
      case 'kick': playKick(params.kick, masterVolume); break;
      case 'snare': playSnare(params.snare, masterVolume); break;
      case 'hihat': playHihat(params.hihat, masterVolume); break;
      case 'clap': playClap(params.clap, masterVolume); break;
      case 'tom': playTom(params.tom, masterVolume); break;
      case 'rim': playRim(params.rim, masterVolume); break;
    }
  }, [getAudioContext, params, playKick, playSnare, playHihat, playClap, playTom, playRim]);

  const updateParam = useCallback(<T extends keyof AllDrumParams>(drum: T, param: keyof AllDrumParams[T], value: number) => {
    setParams((prev) => ({ ...prev, [drum]: { ...prev[drum], [param]: value } }));
  }, []);

  const resetParams = useCallback(() => setParams(DEFAULT_ALL_PARAMS), []);

  const loadPreset = useCallback((presetName: string) => {
    const preset = SYNTH_PRESETS[presetName];
    if (preset) setParams(preset);
  }, []);

  useEffect(() => {
    return () => { if (audioContextRef.current) audioContextRef.current.close(); };
  }, []);

  const getDrumLabel = (drum: DrumType): string => {
    const labels: Record<DrumType, string> = {
      kick: t.kick, snare: t.snare, hihat: t.hihat, clap: t.clap, tom: t.tom, rim: t.rim,
    };
    return labels[drum];
  };

  const renderParams = () => {
    switch (selectedDrum) {
      case 'kick':
        return (
          <>
            <ParamSlider label={t.pitchStart} value={params.kick.pitchStart} min={KICK_RANGES.pitchStart.min} max={KICK_RANGES.pitchStart.max} step={KICK_RANGES.pitchStart.step} unit="Hz" onChange={(v) => updateParam('kick', 'pitchStart', v)} />
            <ParamSlider label={t.pitchEnd} value={params.kick.pitchEnd} min={KICK_RANGES.pitchEnd.min} max={KICK_RANGES.pitchEnd.max} step={KICK_RANGES.pitchEnd.step} unit="Hz" onChange={(v) => updateParam('kick', 'pitchEnd', v)} />
            <ParamSlider label={t.pitchDecay} value={params.kick.pitchDecay} min={KICK_RANGES.pitchDecay.min} max={KICK_RANGES.pitchDecay.max} step={KICK_RANGES.pitchDecay.step} unit="s" onChange={(v) => updateParam('kick', 'pitchDecay', v)} />
            <ParamSlider label={t.ampDecay} value={params.kick.ampDecay} min={KICK_RANGES.ampDecay.min} max={KICK_RANGES.ampDecay.max} step={KICK_RANGES.ampDecay.step} unit="s" onChange={(v) => updateParam('kick', 'ampDecay', v)} />
            <ParamSlider label={t.click} value={params.kick.click} min={KICK_RANGES.click.min} max={KICK_RANGES.click.max} step={KICK_RANGES.click.step} unit="%" onChange={(v) => updateParam('kick', 'click', v)} />
            <ParamSlider label={t.drive} value={params.kick.drive} min={KICK_RANGES.drive.min} max={KICK_RANGES.drive.max} step={KICK_RANGES.drive.step} unit="%" onChange={(v) => updateParam('kick', 'drive', v)} />
            <ParamSlider label={t.tone} value={params.kick.tone} min={KICK_RANGES.tone.min} max={KICK_RANGES.tone.max} step={KICK_RANGES.tone.step} unit="%" onChange={(v) => updateParam('kick', 'tone', v)} />
          </>
        );
      case 'snare':
        return (
          <>
            <ParamSlider label={t.toneFreq} value={params.snare.toneFreq} min={SNARE_RANGES.toneFreq.min} max={SNARE_RANGES.toneFreq.max} step={SNARE_RANGES.toneFreq.step} unit="Hz" onChange={(v) => updateParam('snare', 'toneFreq', v)} />
            <ParamSlider label={t.toneDecay} value={params.snare.toneDecay} min={SNARE_RANGES.toneDecay.min} max={SNARE_RANGES.toneDecay.max} step={SNARE_RANGES.toneDecay.step} unit="s" onChange={(v) => updateParam('snare', 'toneDecay', v)} />
            <ParamSlider label={t.noiseDecay} value={params.snare.noiseDecay} min={SNARE_RANGES.noiseDecay.min} max={SNARE_RANGES.noiseDecay.max} step={SNARE_RANGES.noiseDecay.step} unit="s" onChange={(v) => updateParam('snare', 'noiseDecay', v)} />
            <ParamSlider label={t.noiseFilter} value={params.snare.noiseFilter} min={SNARE_RANGES.noiseFilter.min} max={SNARE_RANGES.noiseFilter.max} step={SNARE_RANGES.noiseFilter.step} unit="Hz" onChange={(v) => updateParam('snare', 'noiseFilter', v)} />
            <ParamSlider label={t.toneMix} value={params.snare.toneMix} min={SNARE_RANGES.toneMix.min} max={SNARE_RANGES.toneMix.max} step={SNARE_RANGES.toneMix.step} unit="%" onChange={(v) => updateParam('snare', 'toneMix', v)} />
            <ParamSlider label={t.snappy} value={params.snare.snappy} min={SNARE_RANGES.snappy.min} max={SNARE_RANGES.snappy.max} step={SNARE_RANGES.snappy.step} unit="%" onChange={(v) => updateParam('snare', 'snappy', v)} />
          </>
        );
      case 'hihat':
        return (
          <>
            <ParamSlider label={t.filterFreq} value={params.hihat.filterFreq} min={HIHAT_RANGES.filterFreq.min} max={HIHAT_RANGES.filterFreq.max} step={HIHAT_RANGES.filterFreq.step} unit="Hz" onChange={(v) => updateParam('hihat', 'filterFreq', v)} />
            <ParamSlider label={t.filterQ} value={params.hihat.filterQ} min={HIHAT_RANGES.filterQ.min} max={HIHAT_RANGES.filterQ.max} step={HIHAT_RANGES.filterQ.step} onChange={(v) => updateParam('hihat', 'filterQ', v)} />
            <ParamSlider label={t.decay} value={params.hihat.decay} min={HIHAT_RANGES.decay.min} max={HIHAT_RANGES.decay.max} step={HIHAT_RANGES.decay.step} unit="s" onChange={(v) => updateParam('hihat', 'decay', v)} />
            <ParamSlider label={t.openness} value={params.hihat.openness} min={HIHAT_RANGES.openness.min} max={HIHAT_RANGES.openness.max} step={HIHAT_RANGES.openness.step} unit="%" onChange={(v) => updateParam('hihat', 'openness', v)} />
            <ParamSlider label={t.pitch} value={params.hihat.pitch} min={HIHAT_RANGES.pitch.min} max={HIHAT_RANGES.pitch.max} step={HIHAT_RANGES.pitch.step} unit="%" onChange={(v) => updateParam('hihat', 'pitch', v)} />
            <ParamSlider label={t.ring} value={params.hihat.ring} min={HIHAT_RANGES.ring.min} max={HIHAT_RANGES.ring.max} step={HIHAT_RANGES.ring.step} unit="%" onChange={(v) => updateParam('hihat', 'ring', v)} />
          </>
        );
      case 'clap':
        return (
          <>
            <ParamSlider label={t.filterFreq} value={params.clap.filterFreq} min={CLAP_RANGES.filterFreq.min} max={CLAP_RANGES.filterFreq.max} step={CLAP_RANGES.filterFreq.step} unit="Hz" onChange={(v) => updateParam('clap', 'filterFreq', v)} />
            <ParamSlider label={t.filterQ} value={params.clap.filterQ} min={CLAP_RANGES.filterQ.min} max={CLAP_RANGES.filterQ.max} step={CLAP_RANGES.filterQ.step} onChange={(v) => updateParam('clap', 'filterQ', v)} />
            <ParamSlider label={t.decay} value={params.clap.decay} min={CLAP_RANGES.decay.min} max={CLAP_RANGES.decay.max} step={CLAP_RANGES.decay.step} unit="s" onChange={(v) => updateParam('clap', 'decay', v)} />
            <ParamSlider label={t.spread} value={params.clap.spread} min={CLAP_RANGES.spread.min} max={CLAP_RANGES.spread.max} step={CLAP_RANGES.spread.step} unit="%" onChange={(v) => updateParam('clap', 'spread', v)} />
            <ParamSlider label={t.tone} value={params.clap.tone} min={CLAP_RANGES.tone.min} max={CLAP_RANGES.tone.max} step={CLAP_RANGES.tone.step} unit="%" onChange={(v) => updateParam('clap', 'tone', v)} />
            <ParamSlider label={t.reverb} value={params.clap.reverb} min={CLAP_RANGES.reverb.min} max={CLAP_RANGES.reverb.max} step={CLAP_RANGES.reverb.step} unit="%" onChange={(v) => updateParam('clap', 'reverb', v)} />
          </>
        );
      case 'tom':
        return (
          <>
            <ParamSlider label={t.pitch} value={params.tom.pitch} min={TOM_RANGES.pitch.min} max={TOM_RANGES.pitch.max} step={TOM_RANGES.pitch.step} unit="Hz" onChange={(v) => updateParam('tom', 'pitch', v)} />
            <ParamSlider label={t.pitchDecay} value={params.tom.pitchDecay} min={TOM_RANGES.pitchDecay.min} max={TOM_RANGES.pitchDecay.max} step={TOM_RANGES.pitchDecay.step} unit="%" onChange={(v) => updateParam('tom', 'pitchDecay', v)} />
            <ParamSlider label={t.decay} value={params.tom.decay} min={TOM_RANGES.decay.min} max={TOM_RANGES.decay.max} step={TOM_RANGES.decay.step} unit="s" onChange={(v) => updateParam('tom', 'decay', v)} />
            <ParamSlider label={t.body} value={params.tom.body} min={TOM_RANGES.body.min} max={TOM_RANGES.body.max} step={TOM_RANGES.body.step} unit="%" onChange={(v) => updateParam('tom', 'body', v)} />
            <ParamSlider label={t.attack} value={params.tom.attack} min={TOM_RANGES.attack.min} max={TOM_RANGES.attack.max} step={TOM_RANGES.attack.step} unit="%" onChange={(v) => updateParam('tom', 'attack', v)} />
          </>
        );
      case 'rim':
        return (
          <>
            <ParamSlider label={t.pitch} value={params.rim.pitch} min={RIM_RANGES.pitch.min} max={RIM_RANGES.pitch.max} step={RIM_RANGES.pitch.step} unit="Hz" onChange={(v) => updateParam('rim', 'pitch', v)} />
            <ParamSlider label={t.decay} value={params.rim.decay} min={RIM_RANGES.decay.min} max={RIM_RANGES.decay.max} step={RIM_RANGES.decay.step} unit="s" onChange={(v) => updateParam('rim', 'decay', v)} />
            <ParamSlider label={t.metallic} value={params.rim.metallic} min={RIM_RANGES.metallic.min} max={RIM_RANGES.metallic.max} step={RIM_RANGES.metallic.step} unit="%" onChange={(v) => updateParam('rim', 'metallic', v)} />
            <ParamSlider label={t.body} value={params.rim.body} min={RIM_RANGES.body.min} max={RIM_RANGES.body.max} step={RIM_RANGES.body.step} unit="%" onChange={(v) => updateParam('rim', 'body', v)} />
            <ParamSlider label={t.click} value={params.rim.click} min={RIM_RANGES.click.min} max={RIM_RANGES.click.max} step={RIM_RANGES.click.step} unit="%" onChange={(v) => updateParam('rim', 'click', v)} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="drum-synth">
      {/* Quick Play Pads */}
      <div className="synth-pads">
        <span className="synth-pads-label">{t.quickPlay}</span>
        <div className="synth-pads-grid">
          {DRUM_TYPES.map((drum) => (
            <button
              key={drum}
              className={`synth-pad ${isPlaying === drum ? 'playing' : ''}`}
              onClick={() => playDrum(drum)}
            >
              {getDrumLabel(drum)}
            </button>
          ))}
        </div>
      </div>

      {/* Drum Selector */}
      <div className="synth-selector">
        {DRUM_TYPES.map((drum) => (
          <button
            key={drum}
            className={`synth-drum-btn ${selectedDrum === drum ? 'selected' : ''} ${isPlaying === drum ? 'playing' : ''}`}
            onClick={() => setSelectedDrum(drum)}
          >
            {getDrumLabel(drum)}
          </button>
        ))}
      </div>

      {/* Parameters */}
      <div className="synth-params">
        <div className="synth-params-header">
          <h3 className="synth-params-title">{getDrumLabel(selectedDrum)} {t.parameters}</h3>
          <button className="synth-reset-btn" onClick={resetParams} title={t.reset}>↺</button>
        </div>
        <div className="synth-params-grid">{renderParams()}</div>
      </div>

      {/* Play Button */}
      <div className="synth-play-section">
        <button className={`synth-play-btn ${isPlaying === selectedDrum ? 'playing' : ''}`} onClick={() => playDrum(selectedDrum)}>
          ▶ {t.play}
        </button>
      </div>

      {/* Master */}
      <div className="synth-master">
        <h3 className="synth-section-title">{t.master}</h3>
        <ParamSlider
          label={t.volume}
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
        <span className="synth-presets-label">{t.presets}</span>
        <div className="synth-presets-buttons">
          {Object.keys(SYNTH_PRESETS).map((preset) => {
            const presetLabels: Record<string, string> = {
              classic808: t.presetClassic808,
              hardTechno: t.presetHardTechno,
              lofi: t.presetLofi,
              minimal: t.presetMinimal,
              acoustic: t.presetAcoustic,
            };
            return (
              <button key={preset} className="synth-preset-btn" onClick={() => loadPreset(preset)}>
                {presetLabels[preset] || preset}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
