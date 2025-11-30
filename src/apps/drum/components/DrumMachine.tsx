import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from '../../../i18n';
import { cn } from '../../../utils';
import {
  STEPS,
  INSTRUMENTS,
  TEMPO_RANGE,
  AUDIO,
  PRESETS,
  createEmptyPattern,
  type Instrument,
  type Pattern,
} from '../constants';
import './DrumMachine.css';

/**
 * Play icon SVG
 */
const PlayIcon = memo(function PlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
});

/**
 * Pause icon SVG
 */
const PauseIcon = memo(function PauseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
});

/**
 * Stop icon SVG
 */
const StopIcon = memo(function StopIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
});

/**
 * Clear icon SVG
 */
const ClearIcon = memo(function ClearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  );
});

/**
 * DrumMachine Component
 * A 16-step drum sequencer with Web Audio synthesis
 */
export const DrumMachine = memo(function DrumMachine() {
  const { drum } = useTranslations();

  // State
  const [pattern, setPattern] = useState<Pattern>(createEmptyPattern);
  const [tempo, setTempo] = useState<number>(TEMPO_RANGE.DEFAULT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

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
   * Play a single instrument sound
   */
  const playSound = useCallback(
    (inst: Instrument) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (inst) {
        case 'kick': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(AUDIO.KICK.FREQUENCY_START, now);
          osc.frequency.exponentialRampToValueAtTime(
            AUDIO.KICK.FREQUENCY_END,
            now + AUDIO.KICK.DURATION
          );
          gain.gain.setValueAtTime(AUDIO.KICK.GAIN, now);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            now + AUDIO.KICK.DURATION
          );
          osc.start(now);
          osc.stop(now + AUDIO.KICK.DURATION);
          break;
        }
        case 'snare': {
          const buffer = ctx.createBuffer(
            1,
            ctx.sampleRate * AUDIO.SNARE.DURATION,
            ctx.sampleRate
          );
          const data = buffer.getChannelData(0);
          for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const gain = ctx.createGain();
          source.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(AUDIO.SNARE.GAIN, now);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            now + AUDIO.SNARE.DURATION
          );
          source.start(now);
          break;
        }
        case 'hihat':
        case 'openhat': {
          const isOpen = inst === 'openhat';
          const duration = isOpen
            ? AUDIO.OPENHAT.DURATION
            : AUDIO.HIHAT.DURATION;
          const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < buffer.length; i++) {
            data[i] =
              (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
          }
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = isOpen
            ? AUDIO.OPENHAT.FILTER_FREQUENCY
            : AUDIO.HIHAT.FILTER_FREQUENCY;
          source.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(
            isOpen ? AUDIO.OPENHAT.GAIN : AUDIO.HIHAT.GAIN,
            now
          );
          gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
          source.start(now);
          break;
        }
        case 'clap': {
          const buffer = ctx.createBuffer(
            1,
            ctx.sampleRate * AUDIO.CLAP.DURATION,
            ctx.sampleRate
          );
          const data = buffer.getChannelData(0);
          for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const gain = ctx.createGain();
          source.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(AUDIO.CLAP.GAIN, now);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            now + AUDIO.CLAP.DURATION
          );
          source.start(now);
          break;
        }
      }
    },
    [getAudioContext]
  );

  /**
   * Advance sequencer to next step
   */
  const advanceStep = useCallback(() => {
    setCurrentStep((prev) => {
      const nextStep = (prev + 1) % STEPS;
      return nextStep;
    });
  }, []);

  /**
   * Play sounds for current step
   */
  useEffect(() => {
    if (!isPlaying) return;

    INSTRUMENTS.forEach((inst) => {
      if (pattern[inst][currentStep]) {
        playSound(inst);
      }
    });
  }, [currentStep, isPlaying, pattern, playSound]);

  /**
   * Start playback
   */
  const play = useCallback(() => {
    getAudioContext(); // Initialize audio context
    if (!isPlaying) {
      setIsPlaying(true);
      const interval = (60 / tempo / 4) * 1000; // 16th notes
      intervalRef.current = window.setInterval(advanceStep, interval);
    } else {
      // Pause
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isPlaying, tempo, advanceStep, getAudioContext]);

  /**
   * Stop playback
   */
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Clear pattern
   */
  const clear = useCallback(() => {
    setPattern(createEmptyPattern());
  }, []);

  /**
   * Toggle a step
   */
  const toggleStep = useCallback((inst: Instrument, step: number) => {
    setPattern((prev) => ({
      ...prev,
      [inst]: prev[inst].map((val, i) => (i === step ? (val ? 0 : 1) : val)),
    }));
  }, []);

  /**
   * Load a preset
   */
  const loadPreset = useCallback(
    (presetName: string) => {
      const preset = PRESETS[presetName];
      if (preset) {
        setPattern({
          kick: [...preset.kick],
          snare: [...preset.snare],
          hihat: [...preset.hihat],
          openhat: [...preset.openhat],
          clap: [...preset.clap],
        });
        showStatus(drum.loadedPreset.replace('{preset}', presetName), 'success');
      }
    },
    [drum.loadedPreset, showStatus]
  );

  /**
   * Handle tempo change
   */
  const handleTempoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTempo = parseInt(e.target.value, 10);
      setTempo(newTempo);

      // Restart interval if playing
      if (isPlaying && intervalRef.current) {
        clearInterval(intervalRef.current);
        const interval = (60 / newTempo / 4) * 1000;
        intervalRef.current = window.setInterval(advanceStep, interval);
      }
    },
    [isPlaying, advanceStep]
  );

  /**
   * Show status message
   */
  const showStatus = useCallback(
    (text: string, type: 'success' | 'error' | 'info') => {
      setStatusMessage({ text, type });
      setTimeout(() => setStatusMessage(null), 3000);
    },
    []
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Get translated instrument label
   */
  const getInstrumentLabel = useCallback(
    (inst: Instrument): string => {
      const labels: Record<Instrument, string> = {
        kick: drum.kick,
        snare: drum.snare,
        hihat: drum.hihat,
        openhat: drum.openhat,
        clap: drum.clap,
      };
      return labels[inst];
    },
    [drum]
  );

  /**
   * Get translated preset label
   */
  const getPresetLabel = useCallback(
    (preset: string): string => {
      const labels: Record<string, string> = {
        techno: drum.presetTechno,
        house: drum.presetHouse,
        trap: drum.presetTrap,
        breakbeat: drum.presetBreakbeat,
        minimal: drum.presetMinimal,
      };
      return labels[preset] || preset;
    },
    [drum]
  );

  return (
    <div className="drum-machine">
      {/* Transport Controls */}
      <div className="drum-transport">
        <div className="drum-transport-controls">
          <button
            className={cn('drum-btn', isPlaying && 'drum-btn--active')}
            onClick={play}
            aria-label={isPlaying ? drum.pause : drum.play}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            <span>{isPlaying ? drum.pause : drum.play}</span>
          </button>
          <button
            className="drum-btn"
            onClick={stop}
            aria-label={drum.stop}
          >
            <StopIcon />
            <span>{drum.stop}</span>
          </button>
          <button
            className="drum-btn"
            onClick={clear}
            aria-label={drum.clear}
          >
            <ClearIcon />
            <span>{drum.clear}</span>
          </button>
        </div>

        <div className="drum-tempo">
          <span className="drum-tempo-label">{drum.tempo}</span>
          <input
            type="range"
            className="drum-slider"
            min={TEMPO_RANGE.MIN}
            max={TEMPO_RANGE.MAX}
            value={tempo}
            onChange={handleTempoChange}
            aria-label={drum.tempo}
          />
          <span className="drum-tempo-value">{tempo} BPM</span>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div className="drum-sequencer">
        {INSTRUMENTS.map((inst) => (
          <div key={inst} className="drum-track">
            <div className="drum-track-label">{getInstrumentLabel(inst)}</div>
            <div className="drum-track-steps">
              {Array.from({ length: STEPS }).map((_, step) => (
                <button
                  key={step}
                  className={cn(
                    'drum-step',
                    pattern[inst][step] && 'drum-step--active',
                    isPlaying && currentStep === step && 'drum-step--playing'
                  )}
                  onClick={() => toggleStep(inst, step)}
                  aria-label={`${getInstrumentLabel(inst)} ${drum.step} ${step + 1}`}
                  aria-pressed={Boolean(pattern[inst][step])}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="drum-presets">
        <span className="drum-presets-label">{drum.presets}</span>
        <div className="drum-presets-buttons">
          {Object.keys(PRESETS).map((preset) => (
            <button
              key={preset}
              className="drum-preset-btn"
              onClick={() => loadPreset(preset)}
            >
              {getPresetLabel(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={cn('drum-status', `drum-status--${statusMessage.type}`)}>
          {statusMessage.text}
        </div>
      )}
    </div>
  );
});

DrumMachine.displayName = 'DrumMachine';
