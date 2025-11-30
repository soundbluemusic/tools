import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from '../../../i18n';
import { cn } from '../../../utils';
import {
  STEPS,
  INSTRUMENTS,
  TEMPO_RANGE,
  VOLUME_RANGE,
  AUDIO,
  PRESETS,
  DEFAULT_VOLUMES,
  createEmptyPattern,
  type Instrument,
  type Pattern,
  type InstrumentVolumes,
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
  const [volumes, setVolumes] = useState<InstrumentVolumes>({ ...DEFAULT_VOLUMES });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const paintModeRef = useRef<boolean | null>(null); // true = paint on, false = paint off

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
   * Play a single instrument sound at a specific time
   */
  const playSound = useCallback(
    (inst: Instrument, time?: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const startTime = time ?? ctx.currentTime;
      const volumeMultiplier = volumes[inst] / 100;

      switch (inst) {
        case 'kick': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(AUDIO.KICK.FREQUENCY_START, startTime);
          osc.frequency.exponentialRampToValueAtTime(
            AUDIO.KICK.FREQUENCY_END,
            startTime + AUDIO.KICK.DURATION
          );
          gain.gain.setValueAtTime(AUDIO.KICK.GAIN * volumeMultiplier, startTime);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            startTime + AUDIO.KICK.DURATION
          );
          osc.start(startTime);
          osc.stop(startTime + AUDIO.KICK.DURATION);
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
          gain.gain.setValueAtTime(AUDIO.SNARE.GAIN * volumeMultiplier, startTime);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            startTime + AUDIO.SNARE.DURATION
          );
          source.start(startTime);
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
            (isOpen ? AUDIO.OPENHAT.GAIN : AUDIO.HIHAT.GAIN) * volumeMultiplier,
            startTime
          );
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          source.start(startTime);
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
          gain.gain.setValueAtTime(AUDIO.CLAP.GAIN * volumeMultiplier, startTime);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            startTime + AUDIO.CLAP.DURATION
          );
          source.start(startTime);
          break;
        }
      }
    },
    [getAudioContext, volumes]
  );

  /**
   * Schedule sounds for upcoming steps using Web Audio timing
   * This is called frequently by requestAnimationFrame
   */
  const scheduleStep = useCallback(
    (stepIndex: number, time: number) => {
      INSTRUMENTS.forEach((inst) => {
        if (pattern[inst][stepIndex]) {
          playSound(inst, time);
        }
      });
    },
    [pattern, playSound]
  );

  /**
   * Scheduler loop using requestAnimationFrame
   * Schedules notes ahead of time for accurate timing
   */
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const scheduleAheadTime = 0.1; // Schedule 100ms ahead
    const stepDuration = 60 / tempo / 4; // Duration of one 16th note in seconds

    // Schedule all notes that fall within the look-ahead window
    while (nextStepTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleStep(currentStepRef.current, nextStepTimeRef.current);

      // Update visual step (use setTimeout for UI sync)
      const stepToShow = currentStepRef.current;
      const timeUntilStep = (nextStepTimeRef.current - ctx.currentTime) * 1000;
      setTimeout(() => {
        setCurrentStep(stepToShow);
      }, Math.max(0, timeUntilStep));

      // Advance to next step
      currentStepRef.current = (currentStepRef.current + 1) % STEPS;
      nextStepTimeRef.current += stepDuration;
    }

    // Continue scheduling if still playing
    schedulerRef.current = requestAnimationFrame(scheduler);
  }, [tempo, scheduleStep]);

  /**
   * Start playback
   */
  const play = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!isPlaying) {
      setIsPlaying(true);
      // Initialize timing from current audio context time
      nextStepTimeRef.current = ctx.currentTime;
      currentStepRef.current = currentStep;
      // Start the scheduler
      schedulerRef.current = requestAnimationFrame(scheduler);
    } else {
      // Pause
      setIsPlaying(false);
      if (schedulerRef.current) {
        cancelAnimationFrame(schedulerRef.current);
        schedulerRef.current = null;
      }
    }
  }, [isPlaying, currentStep, getAudioContext, scheduler]);

  /**
   * Stop playback
   */
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    currentStepRef.current = 0;
    if (schedulerRef.current) {
      cancelAnimationFrame(schedulerRef.current);
      schedulerRef.current = null;
    }
  }, []);

  /**
   * Clear pattern
   */
  const clear = useCallback(() => {
    setPattern(createEmptyPattern());
  }, []);

  /**
   * Set a step to a specific value (for drag painting)
   */
  const setStep = useCallback((inst: Instrument, step: number, value: boolean) => {
    setPattern((prev) => ({
      ...prev,
      [inst]: prev[inst].map((val, i) => (i === step ? (value ? 1 : 0) : val)),
    }));
  }, []);

  /**
   * Handle drag start on a step
   */
  const handleStepMouseDown = useCallback(
    (inst: Instrument, step: number) => {
      isDraggingRef.current = true;
      // Determine paint mode based on current step state (toggle it)
      const currentValue = pattern[inst][step];
      paintModeRef.current = !currentValue;
      setStep(inst, step, !currentValue);
    },
    [pattern, setStep]
  );

  /**
   * Handle mouse enter while dragging
   */
  const handleStepMouseEnter = useCallback(
    (inst: Instrument, step: number) => {
      if (isDraggingRef.current && paintModeRef.current !== null) {
        setStep(inst, step, paintModeRef.current);
      }
    },
    [setStep]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    paintModeRef.current = null;
  }, []);

  /**
   * Handle touch move for mobile drag painting
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current || paintModeRef.current === null) return;

      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (element && element.classList.contains('drum-step')) {
        const inst = element.getAttribute('data-instrument') as Instrument;
        const step = parseInt(element.getAttribute('data-step') || '', 10);

        if (inst && !isNaN(step)) {
          setStep(inst, step, paintModeRef.current);
        }
      }
    },
    [setStep]
  );

  /**
   * Add global mouse up listener for drag end
   */
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
      paintModeRef.current = null;
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

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
      // Scheduler will pick up new tempo automatically on next iteration
    },
    []
  );

  /**
   * Handle instrument volume change
   */
  const handleVolumeChange = useCallback(
    (inst: Instrument, value: number) => {
      setVolumes((prev) => ({ ...prev, [inst]: value }));
    },
    []
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (schedulerRef.current) {
        cancelAnimationFrame(schedulerRef.current);
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
      <div
        className="drum-sequencer"
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
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
                  onChange={(e) => handleVolumeChange(inst, parseInt(e.target.value, 10))}
                  aria-label={`${getInstrumentLabel(inst)} ${drum.volume}`}
                />
                <span className="drum-volume-value">{volumes[inst]}</span>
              </div>
            </div>
            <div className="drum-track-steps">
              {Array.from({ length: STEPS }).map((_, step) => (
                <button
                  key={step}
                  className={cn(
                    'drum-step',
                    pattern[inst][step] && 'drum-step--active',
                    isPlaying && currentStep === step && 'drum-step--playing'
                  )}
                  data-instrument={inst}
                  data-step={step}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleStepMouseDown(inst, step);
                  }}
                  onMouseEnter={() => handleStepMouseEnter(inst, step)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleStepMouseDown(inst, step);
                  }}
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
