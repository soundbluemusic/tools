import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from '../../../i18n';
import type { DrumTranslation } from '../../../i18n/types';
import { cn } from '../../../utils';

import type { AllDrumParams } from '../../drum-synth/constants';
import {
  playSynthSound,
  type DrumMachineInstrument,
} from '../../drum-synth/utils/soundSynth';

/**
 * Props for DrumMachine component
 * When translations are provided, they are used directly (standalone mode)
 * When not provided, useTranslations hook is used (main site mode)
 */
export interface DrumMachineProps {
  /** Optional translations for standalone mode */
  translations?: DrumTranslation;
  /** Optional synth parameters from DrumSynth (for integrated mode in DrumTool) */
  synthParams?: AllDrumParams;
}
import {
  STEPS,
  INSTRUMENTS,
  TEMPO_RANGE,
  VOLUME_RANGE,
  VELOCITY,
  AUDIO,
  PRESETS,
  DEFAULT_VOLUMES,
  MAX_LOOPS,
  createEmptyPattern,
  createInitialLoops,
  copyPattern,
  type Instrument,
  type InstrumentVolumes,
  type MultiLoopPattern,
} from '../constants';
import { exportMidi } from '../utils/midiExport';
import { importMidiFile } from '../utils/midiImport';

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
 * Download/Export icon SVG
 */
const DownloadIcon = memo(function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
});

/**
 * Upload/Import icon SVG
 */
const UploadIcon = memo(function UploadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
});

/**
 * Plus icon SVG for adding loops
 */
const PlusIcon = memo(function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
});

/**
 * Minus icon SVG for removing loops
 */
const MinusIcon = memo(function MinusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
});

/**
 * Copy icon SVG for copying loops
 */
const CopyIcon = memo(function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
});

/**
 * Chevron left icon SVG
 */
const ChevronLeftIcon = memo(function ChevronLeftIcon() {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
});

/**
 * Chevron right icon SVG
 */
const ChevronRightIcon = memo(function ChevronRightIcon() {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
});

/**
 * DrumMachine Component
 * A 16-step drum sequencer with Web Audio synthesis
 * Supports both main site mode (using i18n context) and standalone mode (using props)
 */
export const DrumMachine = memo<DrumMachineProps>(function DrumMachine({
  translations,
  synthParams,
}) {
  // Use provided translations (standalone) or i18n context (main site)
  const contextTranslations = useTranslations();
  const drum = translations ?? contextTranslations.drum;

  // State
  const [loops, setLoops] = useState<MultiLoopPattern>(createInitialLoops);
  const [loopIds, setLoopIds] = useState<number[]>([1]); // Track original loop numbers
  const [nextLoopId, setNextLoopId] = useState(2); // Next available loop ID
  const [currentLoopIndex, setCurrentLoopIndex] = useState(0);
  const [tempo, setTempo] = useState<number>(TEMPO_RANGE.DEFAULT);
  const [volumes, setVolumes] = useState<InstrumentVolumes>({
    ...DEFAULT_VOLUMES,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playingLoopIndex, setPlayingLoopIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [dragLoopIndex, setDragLoopIndex] = useState<number | null>(null);
  const [dragOverLoopIndex, setDragOverLoopIndex] = useState<number | null>(
    null
  );

  // Derived state: which loop to display (playing loop during playback, editing loop otherwise)
  const displayLoopIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
  const pattern = loops[displayLoopIndex];

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef<number>(0);
  const currentStepRef = useRef<number>(0);
  const loopsRef = useRef<MultiLoopPattern>(loops);
  const currentPlayingLoopRef = useRef<number>(0);
  const tempoRef = useRef<number>(tempo);
  const volumesRef = useRef<InstrumentVolumes>(volumes);
  const isPlayingRef = useRef<boolean>(false);
  const isDraggingRef = useRef(false);
  const paintModeRef = useRef<boolean | null>(null); // true = paint on, false = paint off
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Cached noise buffers for performance (avoid regenerating on every hit)
  const noiseBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  // Velocity drag refs
  const velocityDragRef = useRef<{
    inst: Instrument;
    step: number;
    startY: number;
    startVelocity: number;
    hasMoved: boolean; // Track if user actually dragged
  } | null>(null);
  // Ref to store the mousemove handler for dynamic add/remove during velocity drag
  const mouseMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    loopsRef.current = loops;
  }, [loops]);

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
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Get or create cached noise buffer
   * Caches noise buffers by duration to avoid expensive regeneration on every hit
   */
  const getNoiseBuffer = useCallback(
    (ctx: AudioContext, duration: number): AudioBuffer => {
      const key = `noise-${duration}`;
      const cached = noiseBufferCacheRef.current.get(key);
      if (cached && cached.sampleRate === ctx.sampleRate) {
        return cached;
      }
      // Create new noise buffer
      const buffer = ctx.createBuffer(
        1,
        ctx.sampleRate * duration,
        ctx.sampleRate
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferCacheRef.current.set(key, buffer);
      return buffer;
    },
    []
  );

  // Keep synthParams ref in sync
  const synthParamsRef = useRef<AllDrumParams | undefined>(synthParams);
  useEffect(() => {
    synthParamsRef.current = synthParams;
  }, [synthParams]);

  /**
   * Play a single instrument sound at a specific time
   * Uses synth parameters when available (integrated mode), otherwise basic synthesis
   * @param inst - Instrument to play
   * @param time - Audio context time to schedule the sound
   * @param velocity - Note velocity (0-100), affects volume
   */
  const playSound = useCallback(
    (inst: Instrument, time?: number, velocity: number = VELOCITY.DEFAULT) => {
      const ctx = audioContextRef.current;
      if (!ctx || velocity <= 0) return;

      const startTime = time ?? ctx.currentTime;

      // Use synth parameters when available (integrated mode with DrumSynth)
      if (synthParamsRef.current) {
        // Calculate delay for scheduled sounds
        const delay = Math.max(0, (startTime - ctx.currentTime) * 1000);
        const adjustedVelocity = (volumesRef.current[inst] / 100) * velocity;

        setTimeout(() => {
          if (ctx && synthParamsRef.current) {
            playSynthSound(
              ctx,
              inst as DrumMachineInstrument,
              synthParamsRef.current,
              adjustedVelocity
            );
          }
        }, delay);
        return;
      }

      // Basic synthesis (standalone mode)
      // Combine instrument volume and note velocity
      const volumeMultiplier =
        (volumesRef.current[inst] / 100) * (velocity / 100);

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
          gain.gain.setValueAtTime(
            AUDIO.KICK.GAIN * volumeMultiplier,
            startTime
          );
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            startTime + AUDIO.KICK.DURATION
          );
          osc.start(startTime);
          osc.stop(startTime + AUDIO.KICK.DURATION);
          break;
        }
        case 'snare': {
          // Use cached noise buffer for better performance
          const buffer = getNoiseBuffer(ctx, AUDIO.SNARE.DURATION);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const gain = ctx.createGain();
          source.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(
            AUDIO.SNARE.GAIN * volumeMultiplier,
            startTime
          );
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
          // Use cached noise buffer for better performance
          const buffer = getNoiseBuffer(ctx, duration);
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
          // Use cached noise buffer for better performance
          const buffer = getNoiseBuffer(ctx, AUDIO.CLAP.DURATION);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          const gain = ctx.createGain();
          source.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(
            AUDIO.CLAP.GAIN * volumeMultiplier,
            startTime
          );
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            startTime + AUDIO.CLAP.DURATION
          );
          source.start(startTime);
          break;
        }
      }
    },
    [getNoiseBuffer]
  );

  /**
   * Schedule sounds for upcoming steps using Web Audio timing
   */
  const scheduleStep = useCallback(
    (stepIndex: number, loopIndex: number, time: number) => {
      const currentPattern = loopsRef.current[loopIndex];
      if (!currentPattern) return;
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
      scheduleStep(
        currentStepRef.current,
        currentPlayingLoopRef.current,
        nextStepTimeRef.current
      );

      // Update visual step and loop (use setTimeout for UI sync)
      const stepToShow = currentStepRef.current;
      const loopToShow = currentPlayingLoopRef.current;
      const timeUntilStep = (nextStepTimeRef.current - ctx.currentTime) * 1000;
      setTimeout(
        () => {
          setCurrentStep(stepToShow);
          setPlayingLoopIndex(loopToShow);
        },
        Math.max(0, timeUntilStep)
      );

      // Advance to next step
      currentStepRef.current = currentStepRef.current + 1;

      // Check if we need to advance to next loop
      if (currentStepRef.current >= STEPS) {
        currentStepRef.current = 0;
        currentPlayingLoopRef.current =
          (currentPlayingLoopRef.current + 1) % loopsRef.current.length;
      }

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
    setPlayingLoopIndex(0);
    currentPlayingLoopRef.current = 0;
    if (schedulerRef.current) {
      cancelAnimationFrame(schedulerRef.current);
      schedulerRef.current = null;
    }
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
   * Clear all loops and reset to initial state
   */
  const clear = useCallback(() => {
    // If multiple loops exist, show warning message
    if (loops.length > 1) {
      showStatus(drum.clearAllLoops, 'info');
    }
    // Reset to single empty loop
    setLoops(createInitialLoops());
    setLoopIds([1]);
    setNextLoopId(2);
    setCurrentLoopIndex(0);
    setPlayingLoopIndex(0);
    currentPlayingLoopRef.current = 0;
  }, [loops.length, drum.clearAllLoops, showStatus]);

  /**
   * Set a step velocity value in displayed loop (follows playback during play)
   */
  const setStepVelocity = useCallback(
    (inst: Instrument, step: number, velocity: number) => {
      setLoops((prev) => {
        const targetIndex = isPlaying ? playingLoopIndex : currentLoopIndex;
        const newLoops = [...prev];
        const newPattern = { ...newLoops[targetIndex] };
        newPattern[inst] = newPattern[inst].map((val, i) =>
          i === step ? velocity : val
        );
        newLoops[targetIndex] = newPattern;
        return newLoops;
      });
    },
    [currentLoopIndex, isPlaying, playingLoopIndex]
  );

  /**
   * Handle mouse move for velocity adjustment
   * NOTE: Defined before handleStepMouseDown because it's referenced there
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
        // Dynamically add mousemove listener only during velocity drag
        mouseMoveHandlerRef.current = handleMouseMove;
        window.addEventListener('mousemove', handleMouseMove);
      } else {
        // Inactive note: start paint mode with full velocity
        isDraggingRef.current = true;
        paintModeRef.current = true;
        velocityDragRef.current = null;
        setStepVelocity(inst, step, VELOCITY.DEFAULT);
      }
    },
    [pattern, setStepVelocity, handleMouseMove]
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
   * Note: mousemove is added/removed dynamically only during velocity drag
   */
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Remove mousemove listener if it was attached
      if (mouseMoveHandlerRef.current) {
        window.removeEventListener('mousemove', mouseMoveHandlerRef.current);
        mouseMoveHandlerRef.current = null;
      }
      // If velocity drag mode was active and user didn't move, remove the note
      if (velocityDragRef.current && !velocityDragRef.current.hasMoved) {
        const { inst, step } = velocityDragRef.current;
        setStepVelocity(inst, step, VELOCITY.OFF);
      }
      isDraggingRef.current = false;
      paintModeRef.current = null;
      velocityDragRef.current = null;
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      // Clean up mousemove if still attached
      if (mouseMoveHandlerRef.current) {
        window.removeEventListener('mousemove', mouseMoveHandlerRef.current);
        mouseMoveHandlerRef.current = null;
      }
    };
  }, [setStepVelocity]);

  /**
   * Load a preset into current loop
   */
  const loadPreset = useCallback(
    (presetName: string) => {
      const preset = PRESETS[presetName];
      if (preset) {
        setLoops((prev) => {
          const newLoops = [...prev];
          newLoops[currentLoopIndex] = copyPattern(preset);
          return newLoops;
        });
        showStatus(
          drum.loadedPreset.replace('{preset}', presetName),
          'success'
        );
      }
    },
    [currentLoopIndex, drum.loadedPreset, showStatus]
  );

  /**
   * Export all loops as MIDI file
   */
  const handleExportMidi = useCallback(() => {
    exportMidi({
      loops,
      tempo,
      filename: 'drum-pattern',
    });
    showStatus(drum.exportSuccess, 'success');
  }, [loops, tempo, drum.exportSuccess, showStatus]);

  /**
   * Trigger file input for MIDI import
   */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle MIDI file import
   */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const result = await importMidiFile(file);

      if (result) {
        // Import into current loop
        setLoops((prev) => {
          const newLoops = [...prev];
          newLoops[currentLoopIndex] = result.pattern;
          return newLoops;
        });
        setTempo(result.tempo);
        showStatus(drum.importSuccess, 'success');
      } else {
        showStatus(drum.importError, 'error');
      }

      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [currentLoopIndex, drum.importSuccess, drum.importError, showStatus]
  );

  /**
   * Add a new empty loop
   */
  const addLoop = useCallback(() => {
    if (loops.length >= MAX_LOOPS) {
      showStatus(drum.maxLoopsReached, 'error');
      return;
    }
    setLoops((prev) => [...prev, createEmptyPattern()]);
    setLoopIds((prev) => [...prev, nextLoopId]);
    setNextLoopId((prev) => prev + 1);
    setCurrentLoopIndex(loops.length);
  }, [loops.length, nextLoopId, drum.maxLoopsReached, showStatus]);

  /**
   * Copy current loop and add as new loop
   */
  const copyCurrentLoop = useCallback(() => {
    if (loops.length >= MAX_LOOPS) {
      showStatus(drum.maxLoopsReached, 'error');
      return;
    }
    setLoops((prev) => [...prev, copyPattern(prev[currentLoopIndex])]);
    setLoopIds((prev) => [...prev, nextLoopId]);
    setNextLoopId((prev) => prev + 1);
    setCurrentLoopIndex(loops.length);
  }, [
    loops.length,
    currentLoopIndex,
    nextLoopId,
    drum.maxLoopsReached,
    showStatus,
  ]);

  /**
   * Remove current loop
   */
  const removeCurrentLoop = useCallback(() => {
    if (loops.length <= 1) return; // Keep at least one loop
    setLoops((prev) => prev.filter((_, i) => i !== currentLoopIndex));
    setLoopIds((prev) => prev.filter((_, i) => i !== currentLoopIndex));
    setCurrentLoopIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, [loops.length, currentLoopIndex]);

  /**
   * Move current loop left (swap with previous)
   */
  const moveLoopLeft = useCallback(() => {
    if (currentLoopIndex <= 0) return;
    setLoops((prev) => {
      const newLoops = [...prev];
      [newLoops[currentLoopIndex - 1], newLoops[currentLoopIndex]] = [
        newLoops[currentLoopIndex],
        newLoops[currentLoopIndex - 1],
      ];
      return newLoops;
    });
    setLoopIds((prev) => {
      const newIds = [...prev];
      [newIds[currentLoopIndex - 1], newIds[currentLoopIndex]] = [
        newIds[currentLoopIndex],
        newIds[currentLoopIndex - 1],
      ];
      return newIds;
    });
    setCurrentLoopIndex((prev) => prev - 1);
  }, [currentLoopIndex]);

  /**
   * Move current loop right (swap with next)
   */
  const moveLoopRight = useCallback(() => {
    if (currentLoopIndex >= loops.length - 1) return;
    setLoops((prev) => {
      const newLoops = [...prev];
      [newLoops[currentLoopIndex], newLoops[currentLoopIndex + 1]] = [
        newLoops[currentLoopIndex + 1],
        newLoops[currentLoopIndex],
      ];
      return newLoops;
    });
    setLoopIds((prev) => {
      const newIds = [...prev];
      [newIds[currentLoopIndex], newIds[currentLoopIndex + 1]] = [
        newIds[currentLoopIndex + 1],
        newIds[currentLoopIndex],
      ];
      return newIds;
    });
    setCurrentLoopIndex((prev) => prev + 1);
  }, [currentLoopIndex, loops.length]);

  /**
   * Handle loop drag start
   */
  const handleLoopDragStart = useCallback((index: number) => {
    setDragLoopIndex(index);
  }, []);

  /**
   * Handle loop drag over
   */
  const handleLoopDragOver = useCallback(
    (index: number) => {
      if (dragLoopIndex !== null && dragLoopIndex !== index) {
        setDragOverLoopIndex(index);
      }
    },
    [dragLoopIndex]
  );

  /**
   * Handle loop drag end - reorder loops
   */
  const handleLoopDragEnd = useCallback(() => {
    if (
      dragLoopIndex !== null &&
      dragOverLoopIndex !== null &&
      dragLoopIndex !== dragOverLoopIndex
    ) {
      setLoops((prev) => {
        const newLoops = [...prev];
        const [draggedLoop] = newLoops.splice(dragLoopIndex, 1);
        newLoops.splice(dragOverLoopIndex, 0, draggedLoop);
        return newLoops;
      });
      // Reorder loop IDs to match
      setLoopIds((prev) => {
        const newIds = [...prev];
        const [draggedId] = newIds.splice(dragLoopIndex, 1);
        newIds.splice(dragOverLoopIndex, 0, draggedId);
        return newIds;
      });
      // Update current loop index if needed
      if (currentLoopIndex === dragLoopIndex) {
        setCurrentLoopIndex(dragOverLoopIndex);
      } else if (
        dragLoopIndex < currentLoopIndex &&
        dragOverLoopIndex >= currentLoopIndex
      ) {
        setCurrentLoopIndex((prev) => prev - 1);
      } else if (
        dragLoopIndex > currentLoopIndex &&
        dragOverLoopIndex <= currentLoopIndex
      ) {
        setCurrentLoopIndex((prev) => prev + 1);
      }
    }
    setDragLoopIndex(null);
    setDragOverLoopIndex(null);
  }, [dragLoopIndex, dragOverLoopIndex, currentLoopIndex]);

  /**
   * Handle loop drag leave
   */
  const handleLoopDragLeave = useCallback(() => {
    setDragOverLoopIndex(null);
  }, []);

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
  const handleVolumeChange = useCallback((inst: Instrument, value: number) => {
    setVolumes((prev) => ({ ...prev, [inst]: value }));
  }, []);

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
    <div className="flex flex-col gap-8 md:gap-6 sm:gap-5 py-2 sm:py-1">
      {/* Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 md:flex-col md:items-stretch">
        <div className="flex gap-2 md:justify-center sm:flex-wrap">
          <button
            className={cn(
              'inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px]',
              isPlaying &&
                'bg-accent-primary border-accent-primary text-text-inverse hover:bg-accent-hover hover:border-accent-hover'
            )}
            onClick={play}
            aria-label={isPlaying ? drum.pause : drum.play}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            <span>{isPlaying ? drum.pause : drum.play}</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px]"
            onClick={stop}
            aria-label={drum.stop}
          >
            <StopIcon />
            <span>{drum.stop}</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px]"
            onClick={clear}
            aria-label={drum.clear}
          >
            <ClearIcon />
            <span>{drum.clear}</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-tertiary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-accent-primary hover:border-accent-primary hover:text-text-inverse sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px]"
            onClick={handleExportMidi}
            aria-label={drum.exportMidi}
          >
            <DownloadIcon />
            <span>{drum.exportMidi}</span>
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-text-primary bg-bg-tertiary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-accent-primary hover:border-accent-primary hover:text-text-inverse sm:px-3 sm:py-2 sm:text-xs sm:min-h-[40px] sm:flex-1 sm:min-w-[60px]"
            onClick={handleImportClick}
            aria-label={drum.importMidi}
          >
            <UploadIcon />
            <span>{drum.importMidi}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mid,.midi,audio/midi,audio/x-midi"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center gap-3 md:justify-center sm:flex-wrap sm:gap-2">
          <span className="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap">
            {drum.tempo}
          </span>
          <input
            type="range"
            className="w-[120px] sm:w-[100px] h-1 bg-border-primary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-secondary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-bg-secondary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
            min={TEMPO_RANGE.MIN}
            max={TEMPO_RANGE.MAX}
            value={tempo}
            onChange={handleTempoChange}
            aria-label={drum.tempo}
          />
          <span className="font-mono text-sm text-text-primary min-w-[70px] text-right">
            {tempo} BPM
            <span className="ml-2 text-text-tertiary text-xs">
              {loops.length > 1 && `x${loops.length} `}(
              {((240 / tempo) * loops.length).toFixed(1)}s)
            </span>
          </span>
        </div>
      </div>

      {/* Loop Controls */}
      <div className="flex items-center gap-4 px-4 py-3 bg-bg-tertiary border border-border-primary rounded-md flex-wrap md:justify-center sm:flex-col sm:items-stretch sm:gap-3 sm:p-3">
        <div className="flex items-center gap-3 flex-1 min-w-0 sm:w-full sm:justify-start">
          <span className="text-text-tertiary text-xs uppercase tracking-wide whitespace-nowrap">
            {drum.loop}
          </span>
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap sm:gap-1 sm:justify-start">
            {loops.map((_, index) => (
              <button
                key={loopIds[index]}
                className={cn(
                  'inline-flex items-center justify-center w-8 h-8 font-mono text-sm font-medium text-text-secondary bg-bg-secondary border-2 border-border-primary rounded-md cursor-grab transition-all duration-150 select-none touch-none hover:border-border-hover hover:scale-105 active:cursor-grabbing md:w-7 md:h-7 md:text-xs sm:text-[0.7rem]',
                  index === currentLoopIndex &&
                    'text-text-primary border-accent-primary bg-bg-tertiary',
                  isPlaying &&
                    index === playingLoopIndex &&
                    'bg-accent-primary border-accent-primary text-text-inverse animate-drum-loop-pulse',
                  dragLoopIndex === index && 'opacity-50 scale-110 z-10',
                  dragOverLoopIndex === index &&
                    'scale-[1.15] border-accent-primary',
                  index === currentLoopIndex &&
                    isPlaying &&
                    index === playingLoopIndex &&
                    'shadow-[0_0_0_3px_var(--color-bg-tertiary),0_0_0_5px_var(--color-accent-primary)]'
                )}
                draggable
                onDragStart={() => handleLoopDragStart(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleLoopDragOver(index);
                }}
                onDragLeave={handleLoopDragLeave}
                onDragEnd={handleLoopDragEnd}
                onDrop={handleLoopDragEnd}
                onClick={() => setCurrentLoopIndex(index)}
                aria-label={`${drum.loop} ${loopIds[index]}`}
                title={`${drum.loop} ${loopIds[index]}`}
              >
                {loopIds[index]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 sm:w-full sm:justify-center">
          <button
            className="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
            onClick={moveLoopLeft}
            disabled={currentLoopIndex <= 0}
            aria-label={drum.moveLoopLeft}
            title={drum.moveLoopLeft}
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
            onClick={moveLoopRight}
            disabled={currentLoopIndex >= loops.length - 1}
            aria-label={drum.moveLoopRight}
            title={drum.moveLoopRight}
          >
            <ChevronRightIcon />
          </button>
          <button
            className="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
            onClick={addLoop}
            disabled={loops.length >= MAX_LOOPS}
            aria-label={drum.addLoop}
            title={drum.addLoop}
          >
            <PlusIcon />
          </button>
          <button
            className="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
            onClick={copyCurrentLoop}
            disabled={loops.length >= MAX_LOOPS}
            aria-label={drum.copyLoop}
            title={drum.copyLoop}
          >
            <CopyIcon />
          </button>
          <button
            className="inline-flex items-center justify-center w-7 h-7 p-0 bg-bg-secondary border border-border-primary rounded-md cursor-pointer text-text-primary transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed sm:w-7 sm:h-7"
            onClick={removeCurrentLoop}
            disabled={loops.length <= 1}
            aria-label={drum.removeLoop}
            title={drum.removeLoop}
          >
            <MinusIcon />
          </button>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div
        className="bg-bg-tertiary border border-border-primary rounded-lg p-4 touch-none select-none sm:p-3 xs:p-2"
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        {INSTRUMENTS.map((inst) => (
          <div
            key={inst}
            className="grid grid-cols-[90px_1fr] md:grid-cols-[80px_1fr] sm:grid-cols-[60px_1fr] xs:grid-cols-[45px_1fr] gap-3 md:gap-3 sm:gap-2 items-center py-2 sm:py-1 first:pt-0 last:pb-0"
          >
            <div className="flex flex-col gap-1">
              <div className="text-xs uppercase tracking-wide text-text-secondary whitespace-nowrap sm:text-[0.625rem]">
                {getInstrumentLabel(inst)}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  className="w-[50px] md:w-[40px] sm:w-[35px] xs:w-[28px] h-[3px] bg-border-primary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-[1.15] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-text-primary [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                  min={VOLUME_RANGE.MIN}
                  max={VOLUME_RANGE.MAX}
                  value={volumes[inst]}
                  onChange={(e) =>
                    handleVolumeChange(inst, parseInt(e.target.value, 10))
                  }
                  aria-label={`${getInstrumentLabel(inst)} ${drum.volume}`}
                />
                <span className="hidden">{volumes[inst]}</span>
              </div>
            </div>
            <div className="flex gap-1 flex-1 min-w-0 [&>:nth-child(5)]:ml-1.5 [&>:nth-child(9)]:ml-1.5 [&>:nth-child(13)]:ml-1.5 sm:gap-[3px] sm:[&>:nth-child(5)]:ml-1 sm:[&>:nth-child(9)]:ml-1 sm:[&>:nth-child(13)]:ml-1 xs:gap-[2px] xs:[&>:nth-child(5)]:ml-[3px] xs:[&>:nth-child(9)]:ml-[3px] xs:[&>:nth-child(13)]:ml-[3px]">
              {Array.from({ length: STEPS }).map((_, step) => {
                const velocity = pattern[inst][step];
                const isActive = velocity > 0;
                // Opacity: min 0.3 at velocity 10, max 1 at velocity 100
                const opacity = isActive
                  ? 0.3 + (velocity / VELOCITY.MAX) * 0.7
                  : 1;
                return (
                  <button
                    key={step}
                    className={cn(
                      'flex-1 min-w-0 aspect-square max-w-[32px] md:max-w-[28px] sm:max-w-[24px] xs:max-w-[18px] border-[1.5px] rounded-md cursor-pointer transition-all duration-150 hover:border-accent-primary hover:scale-105 sm:rounded-sm',
                      isActive
                        ? 'bg-accent-primary border-accent-primary'
                        : 'bg-bg-secondary border-border-primary',
                      isPlaying &&
                        currentStep === step &&
                        'shadow-[0_0_0_2px_var(--color-bg-tertiary),0_0_0_4px_var(--color-accent-primary)] scale-[1.08]',
                      isActive &&
                        isPlaying &&
                        currentStep === step &&
                        'bg-accent-hover border-accent-hover'
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
      <div className="flex flex-wrap items-center gap-3 sm:gap-2">
        <span className="text-text-tertiary text-xs uppercase tracking-wide">
          {drum.presets}
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((preset) => (
            <button
              key={preset}
              className="px-4 py-2 min-h-[36px] text-xs font-medium uppercase tracking-wide text-text-primary bg-bg-secondary border border-border-primary rounded-md cursor-pointer transition-colors duration-150 hover:bg-bg-tertiary hover:border-border-hover sm:px-3 sm:text-[0.625rem] sm:min-h-[32px]"
              onClick={() => loadPreset(preset)}
            >
              {getPresetLabel(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis Info */}
      <div className="px-4 py-3 bg-bg-tertiary border border-border-primary rounded-md text-xs text-text-tertiary leading-relaxed">
        {drum.synthesisInfo}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border-primary rounded-md px-4 py-2 text-sm text-text-primary shadow-lg animate-drum-status-slide-up z-[700]',
            statusMessage.type === 'success' &&
              'border-success-border text-success',
            statusMessage.type === 'error' && 'border-error-border text-error'
          )}
        >
          {statusMessage.text}
        </div>
      )}
    </div>
  );
});

DrumMachine.displayName = 'DrumMachine';
