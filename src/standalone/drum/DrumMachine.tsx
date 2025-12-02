import { memo, useState, useCallback, useRef, useEffect } from 'react';
import type { Translations } from './i18n';
import {
  STEPS, INSTRUMENTS, TEMPO_RANGE, VOLUME_RANGE, VELOCITY, AUDIO,
  PRESETS, DEFAULT_VOLUMES, MAX_LOOPS,
  createEmptyPattern, copyPattern,
  type Instrument, type InstrumentVolumes, type Pattern,
} from './constants';

interface DrumMachineProps {
  translations: Translations;
}

export const DrumMachine = memo(function DrumMachine({ translations: t }: DrumMachineProps) {
  const [loops, setLoops] = useState<Pattern[]>([createEmptyPattern()]);
  const [currentLoopIndex, setCurrentLoopIndex] = useState(0);
  const [tempo, setTempo] = useState<number>(TEMPO_RANGE.DEFAULT);
  const [volumes, setVolumes] = useState<InstrumentVolumes>({ ...DEFAULT_VOLUMES });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playingLoopIndex, setPlayingLoopIndex] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);
  const loopsRef = useRef<Pattern[]>(loops);
  const currentPlayingLoopRef = useRef<number>(0);
  const tempoRef = useRef<number>(tempo);
  const volumesRef = useRef<InstrumentVolumes>(volumes);
  const isPlayingRef = useRef<boolean>(false);
  const noiseBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

  const displayLoopIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
  const pattern = loops[displayLoopIndex];

  useEffect(() => { loopsRef.current = loops; }, [loops]);
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { volumesRef.current = volumes; }, [volumes]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const getNoiseBuffer = useCallback((ctx: AudioContext, duration: number): AudioBuffer => {
    const key = `noise-${duration}`;
    const cached = noiseBufferCacheRef.current.get(key);
    if (cached && cached.sampleRate === ctx.sampleRate) return cached;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBufferCacheRef.current.set(key, buffer);
    return buffer;
  }, []);

  const playSound = useCallback((inst: Instrument, time?: number, velocity: number = VELOCITY.DEFAULT) => {
    const ctx = audioContextRef.current;
    if (!ctx || velocity <= 0) return;
    const startTime = time ?? ctx.currentTime;
    const volumeMultiplier = (volumesRef.current[inst] / 100) * (velocity / 100);

    switch (inst) {
      case 'kick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(AUDIO.KICK.FREQUENCY_START, startTime);
        osc.frequency.exponentialRampToValueAtTime(AUDIO.KICK.FREQUENCY_END, startTime + AUDIO.KICK.DURATION);
        gain.gain.setValueAtTime(AUDIO.KICK.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO.KICK.DURATION);
        osc.start(startTime);
        osc.stop(startTime + AUDIO.KICK.DURATION);
        break;
      }
      case 'snare': {
        const buffer = getNoiseBuffer(ctx, AUDIO.SNARE.DURATION);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(AUDIO.SNARE.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO.SNARE.DURATION);
        source.start(startTime);
        break;
      }
      case 'hihat':
      case 'openhat': {
        const isOpen = inst === 'openhat';
        const duration = isOpen ? AUDIO.OPENHAT.DURATION : AUDIO.HIHAT.DURATION;
        const buffer = getNoiseBuffer(ctx, duration);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = isOpen ? AUDIO.OPENHAT.FILTER_FREQUENCY : AUDIO.HIHAT.FILTER_FREQUENCY;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime((isOpen ? AUDIO.OPENHAT.GAIN : AUDIO.HIHAT.GAIN) * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        source.start(startTime);
        break;
      }
      case 'clap': {
        const buffer = getNoiseBuffer(ctx, AUDIO.CLAP.DURATION);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(AUDIO.CLAP.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + AUDIO.CLAP.DURATION);
        source.start(startTime);
        break;
      }
    }
  }, [getNoiseBuffer]);

  const scheduleStep = useCallback((stepIndex: number, loopIndex: number, time: number) => {
    const currentPattern = loopsRef.current[loopIndex];
    if (!currentPattern) return;
    INSTRUMENTS.forEach((inst) => {
      const velocity = currentPattern[inst][stepIndex];
      if (velocity > 0) playSound(inst, time, velocity);
    });
  }, [playSound]);

  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlayingRef.current) return;
    const scheduleAheadTime = 0.1;
    const stepDuration = 60 / tempoRef.current / 4;

    while (nextStepTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleStep(currentStepRef.current, currentPlayingLoopRef.current, nextStepTimeRef.current);
      const stepToShow = currentStepRef.current;
      const loopToShow = currentPlayingLoopRef.current;
      const timeUntilStep = (nextStepTimeRef.current - ctx.currentTime) * 1000;
      setTimeout(() => {
        setCurrentStep(stepToShow);
        setPlayingLoopIndex(loopToShow);
      }, Math.max(0, timeUntilStep));

      currentStepRef.current = currentStepRef.current + 1;
      if (currentStepRef.current >= STEPS) {
        currentStepRef.current = 0;
        currentPlayingLoopRef.current = (currentPlayingLoopRef.current + 1) % loopsRef.current.length;
      }
      nextStepTimeRef.current += stepDuration;
    }
    schedulerRef.current = requestAnimationFrame(scheduler);
  }, [scheduleStep]);

  const play = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (!isPlaying) {
      if (ctx.state === 'suspended') ctx.resume();
      setIsPlaying(true);
      isPlayingRef.current = true;
      nextStepTimeRef.current = ctx.currentTime;
      currentStepRef.current = currentStep;
      schedulerRef.current = requestAnimationFrame(scheduler);
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (schedulerRef.current) {
        cancelAnimationFrame(schedulerRef.current);
        schedulerRef.current = null;
      }
    }
  }, [isPlaying, currentStep, getAudioContext, scheduler]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentStep(0);
    currentStepRef.current = 0;
    setPlayingLoopIndex(0);
    currentPlayingLoopRef.current = 0;
    if (schedulerRef.current) {
      cancelAnimationFrame(schedulerRef.current);
      schedulerRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    setLoops([createEmptyPattern()]);
    setCurrentLoopIndex(0);
    setPlayingLoopIndex(0);
    currentPlayingLoopRef.current = 0;
  }, []);

  const setStepVelocity = useCallback((inst: Instrument, step: number, velocity: number) => {
    setLoops((prev) => {
      const targetIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
      const newLoops = [...prev];
      const newPattern = { ...newLoops[targetIndex] };
      newPattern[inst] = newPattern[inst].map((val, i) => (i === step ? velocity : val));
      newLoops[targetIndex] = newPattern;
      return newLoops;
    });
  }, [currentLoopIndex, isPlaying, playingLoopIndex]);

  const toggleStep = useCallback((inst: Instrument, step: number) => {
    const current = pattern[inst][step];
    setStepVelocity(inst, step, current > 0 ? VELOCITY.OFF : VELOCITY.DEFAULT);
  }, [pattern, setStepVelocity]);

  const loadPreset = useCallback((presetName: string) => {
    const preset = PRESETS[presetName];
    if (preset) {
      setLoops((prev) => {
        const newLoops = [...prev];
        newLoops[currentLoopIndex] = copyPattern(preset);
        return newLoops;
      });
    }
  }, [currentLoopIndex]);

  const addLoop = useCallback(() => {
    if (loops.length >= MAX_LOOPS) return;
    setLoops((prev) => [...prev, createEmptyPattern()]);
    setCurrentLoopIndex(loops.length);
  }, [loops.length]);

  const removeLoop = useCallback(() => {
    if (loops.length <= 1) return;
    setLoops((prev) => prev.filter((_, i) => i !== currentLoopIndex));
    setCurrentLoopIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, [loops.length, currentLoopIndex]);

  const copyLoop = useCallback(() => {
    if (loops.length >= MAX_LOOPS) return;
    setLoops((prev) => [...prev, copyPattern(prev[currentLoopIndex])]);
    setCurrentLoopIndex(loops.length);
  }, [loops, currentLoopIndex]);

  useEffect(() => {
    return () => {
      if (schedulerRef.current) cancelAnimationFrame(schedulerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const getInstrumentLabel = (inst: Instrument): string => {
    const labels: Record<Instrument, string> = {
      kick: t.kick, snare: t.snare, hihat: t.hihat, openhat: t.openhat, clap: t.clap,
    };
    return labels[inst];
  };

  const getPresetLabel = (preset: string): string => {
    const labels: Record<string, string> = {
      techno: t.presetTechno, house: t.presetHouse, trap: t.presetTrap,
      breakbeat: t.presetBreakbeat, minimal: t.presetMinimal,
    };
    return labels[preset] || preset;
  };

  return (
    <div className="drum-machine">
      {/* Transport */}
      <div className="drum-transport">
        <div className="drum-transport-buttons">
          <button className={`drum-btn ${isPlaying ? 'active' : ''}`} onClick={play}>
            {isPlaying ? t.pause : t.play}
          </button>
          <button className="drum-btn" onClick={stop}>{t.stop}</button>
          <button className="drum-btn" onClick={clear}>{t.clear}</button>
        </div>
        <div className="drum-tempo">
          <span className="drum-tempo-label">{t.tempo}</span>
          <input
            type="range"
            className="drum-slider"
            min={TEMPO_RANGE.MIN}
            max={TEMPO_RANGE.MAX}
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value, 10))}
          />
          <span className="drum-tempo-value">{tempo} BPM</span>
        </div>
      </div>

      {/* Loop Controls */}
      <div className="drum-loop-controls">
        <span className="drum-loop-label">{t.loop}</span>
        <div className="drum-loop-buttons">
          {loops.map((_, i) => (
            <button
              key={i}
              className={`drum-loop-btn ${i === currentLoopIndex ? 'selected' : ''} ${isPlaying && i === playingLoopIndex ? 'playing' : ''}`}
              onClick={() => setCurrentLoopIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="drum-loop-actions">
          <button className="drum-action-btn" onClick={addLoop} disabled={loops.length >= MAX_LOOPS}>+</button>
          <button className="drum-action-btn" onClick={copyLoop} disabled={loops.length >= MAX_LOOPS}>⎘</button>
          <button className="drum-action-btn" onClick={removeLoop} disabled={loops.length <= 1}>−</button>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div className="drum-sequencer">
        {INSTRUMENTS.map((inst) => (
          <div key={inst} className="drum-track">
            <div className="drum-track-info">
              <div className="drum-track-label">{getInstrumentLabel(inst)}</div>
              <div className="drum-track-volume">
                <input
                  type="range"
                  className="drum-volume-slider"
                  min={VOLUME_RANGE.MIN}
                  max={VOLUME_RANGE.MAX}
                  value={volumes[inst]}
                  onChange={(e) => setVolumes(prev => ({ ...prev, [inst]: parseInt(e.target.value, 10) }))}
                />
              </div>
            </div>
            <div className="drum-track-steps">
              {Array.from({ length: STEPS }).map((_, step) => {
                const velocity = pattern[inst][step];
                const isActive = velocity > 0;
                return (
                  <button
                    key={step}
                    className={`drum-step ${isActive ? 'active' : ''} ${isPlaying && currentStep === step ? 'playing' : ''}`}
                    onClick={() => toggleStep(inst, step)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="drum-presets">
        <span className="drum-presets-label">{t.presets}</span>
        <div className="drum-presets-buttons">
          {Object.keys(PRESETS).map((preset) => (
            <button key={preset} className="drum-preset-btn" onClick={() => loadPreset(preset)}>
              {getPresetLabel(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="drum-info">{t.synthesisInfo}</div>
    </div>
  );
});
