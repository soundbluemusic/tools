import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from '../../../i18n';
import { cn } from '../../../utils';
import {
  STEPS,
  INSTRUMENTS,
  TEMPO_RANGE,
  VOLUME_RANGE,
  VELOCITY,
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
  const patternRef = useRef<Pattern>(pattern);
  const tempoRef = useRef<number>(tempo);
  const volumesRef = useRef<InstrumentVolumes>(volumes);
  const isPlayingRef = useRef<boolean>(false);
  const isDraggingRef = useRef(false);
  const paintModeRef = useRef<boolean | null>(null); // true = paint on, false = paint off
  // Velocity drag refs
  const velocityDragRef = useRef<{
    inst: Instrument;
    step: number;
    startY: number;
    startVelocity: number;
    hasMoved: boolean; // Track if user actually dragged
  } | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

  useEffect(() => {
    volumesRef.current = volumes;
  }, [volumes]);

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
   * @param inst - Instrument to play
   * @param time - Audio context time to schedule the sound
   * @param velocity - Note velocity (0-100), affects volume
   */
  const playSound = useCallback(
    (inst: Instrument, time?: number, velocity: number = VELOCITY.DEFAULT) => {
      const ctx = audioContextRef.current;
      if (!ctx || velocity <= 0) return;

      const startTime = time ?? ctx.currentTime;
      // Combine instrument volume and note velocity
      const volumeMultiplier = (volumesRef.current[inst] / 100) * (velocity / 100);

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
    []
  );

  /**
   * Schedule sounds for upcoming steps using Web Audio timing
   */
  const scheduleStep = useCallback(
    (stepIndex: number, time: number) => {
      const currentPattern = patternRef.current;
      INSTRUMENTS.forEach((inst) => {
        const velocity = currentPattern[inst][stepIndex];
        if (velocity > 0) {
          playSound(inst, time, velocity);
        }
      });
    },
    [playSound]
  );

  /**
   * Scheduler loop using requestAnimationFrame
   * Schedules notes ahead of time for accurate timing
   */
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlayingRef.current) return;

    const scheduleAheadTime = 0.1; // Schedule 100ms ahead
    const stepDuration = 60 / tempoRef.current / 4; // Duration of one 16th note in seconds

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
  }, [scheduleStep]);

  /**
   * Start playback
   */
  const play = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!isPlaying) {
      // Resume audio context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      setIsPlaying(true);
      isPlayingRef.current = true;
      // Initialize timing from current audio context time
      nextStepTimeRef.current = ctx.currentTime;
      currentStepRef.current = currentStep;
      // Start the scheduler
      schedulerRef.current = requestAnimationFrame(scheduler);
    } else {
      // Pause
      setIsPlaying(false);
      isPlayingRef.current = false;
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
    isPlayingRef.current = false;
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
   * Set a step velocity value
   */
  const setStepVelocity = useCallback((inst: Instrument, step: number, velocity: number) => {
    setPattern((prev) => ({
      ...prev,
      [inst]: prev[inst].map((val, i) => (i === step ? velocity : val)),
    }));
  }, []);

  /**
   * Handle drag start on a step
   */
  const handleStepMouseDown = useCallback(
    (inst: Instrument, step: number, clientY: number) => {
      const currentValue = pattern[inst][step];

      if (currentValue > 0) {
        // Active note: start velocity drag mode (or remove on click without drag)
        velocityDragRef.current = {
          inst,
          step,
          startY: clientY,
          startVelocity: currentValue,
          hasMoved: false,
        };
        isDraggingRef.current = false;
        paintModeRef.current = null;
      } else {
        // Inactive note: start paint mode with full velocity
        isDraggingRef.current = true;
        paintModeRef.current = true;
        velocityDragRef.current = null;
        setStepVelocity(inst, step, VELOCITY.DEFAULT);
      }
    },
    [pattern, setStepVelocity]
  );

  /**
   * Handle mouse enter while dragging (paint mode only)
   */
  const handleStepMouseEnter = useCallback(
    (inst: Instrument, step: number) => {
      if (isDraggingRef.current && paintModeRef.current) {
        setStepVelocity(inst, step, VELOCITY.DEFAULT);
      }
    },
    [setStepVelocity]
  );

  /**
   * Handle mouse move for velocity adjustment
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!velocityDragRef.current) return;

      const { inst, step, startY, startVelocity } = velocityDragRef.current;
      // Drag down = decrease velocity, drag up = increase velocity
      const deltaY = e.clientY - startY;

      // Only process if moved more than 3px (threshold to distinguish click from drag)
      if (Math.abs(deltaY) > 3) {
        velocityDragRef.current.hasMoved = true;
        // 100px drag = full velocity change
        const velocityChange = Math.round(-deltaY * 1);
        const newVelocity = Math.max(
          VELOCITY.OFF,
          Math.min(VELOCITY.MAX, startVelocity + velocityChange)
        );
        setStepVelocity(inst, step, newVelocity);
      }
    },
    [setStepVelocity]
  );

  /**
   * Handle drag end - remove note if clicked without dragging
   */
  const handleDragEnd = useCallback(() => {
    // If velocity drag mode was active and user didn't move, remove the note
    if (velocityDragRef.current && !velocityDragRef.current.hasMoved) {
      const { inst, step } = velocityDragRef.current;
      setStepVelocity(inst, step, VELOCITY.OFF);
    }
    isDraggingRef.current = false;
    paintModeRef.current = null;
    velocityDragRef.current = null;
  }, [setStepVelocity]);

  /**
   * Handle touch move for mobile (paint mode and velocity adjustment)
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];

      // Velocity drag mode
      if (velocityDragRef.current) {
        const { inst, step, startY, startVelocity } = velocityDragRef.current;
        const deltaY = touch.clientY - startY;

        // Only process if moved more than 3px
        if (Math.abs(deltaY) > 3) {
          velocityDragRef.current.hasMoved = true;
          const velocityChange = Math.round(-deltaY * 1);
          const newVelocity = Math.max(
            VELOCITY.OFF,
            Math.min(VELOCITY.MAX, startVelocity + velocityChange)
          );
          setStepVelocity(inst, step, newVelocity);
        }
        return;
      }

      // Paint mode
      if (!isDraggingRef.current || !paintModeRef.current) return;

      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (element && element.classList.contains('drum-step')) {
        const inst = element.getAttribute('data-instrument') as Instrument;
        const stepAttr = element.getAttribute('data-step');
        const step = stepAttr ? parseInt(stepAttr, 10) : NaN;

        if (inst && !isNaN(step)) {
          setStepVelocity(inst, step, VELOCITY.DEFAULT);
        }
      }
    },
    [setStepVelocity]
  );

  /**
   * Add global mouse listeners for drag handling
   */
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // If velocity drag mode was active and user didn't move, remove the note
      if (velocityDragRef.current && !velocityDragRef.current.hasMoved) {
        const { inst, step } = velocityDragRef.current;
        setStepVelocity(inst, step, VELOCITY.OFF);
      }
      isDraggingRef.current = false;
      paintModeRef.current = null;
      velocityDragRef.current = null;
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (velocityDragRef.current) {
        handleMouseMove(e);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [handleMouseMove, setStepVelocity]);

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
              {Array.from({ length: STEPS }).map((_, step) => {
                const velocity = pattern[inst][step];
                const isActive = velocity > 0;
                // Opacity: min 0.3 at velocity 10, max 1 at velocity 100
                const opacity = isActive ? 0.3 + (velocity / VELOCITY.MAX) * 0.7 : 1;
                return (
                  <button
                    key={step}
                    className={cn(
                      'drum-step',
                      isActive && 'drum-step--active',
                      isPlaying && currentStep === step && 'drum-step--playing'
                    )}
                    style={isActive ? { opacity } : undefined}
                    data-instrument={inst}
                    data-step={step}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleStepMouseDown(inst, step, e.clientY);
                    }}
                    onMouseEnter={() => handleStepMouseEnter(inst, step)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      handleStepMouseDown(inst, step, touch.clientY);
                    }}
                    aria-label={`${getInstrumentLabel(inst)} ${drum.step} ${step + 1}${isActive ? ` (${velocity}%)` : ''}`}
                    aria-pressed={isActive}
                  />
                );
              })}
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
