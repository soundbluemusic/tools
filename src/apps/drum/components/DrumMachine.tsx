import {
  type Component,
  onMount,
  onCleanup,
  For,
  Show,
} from 'solid-js';
import { useTranslations } from '../../../i18n';
import type { DrumTranslation } from '../../../i18n/types';
import { cn } from '../../../utils';
import { useDrumStore } from '../../../stores';

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
  MAX_LOOPS,
  type Instrument,
  type InstrumentVolumes,
  type MultiLoopPattern,
} from '../constants';
import { exportMidi } from '../utils/midiExport';
import { importMidiFile } from '../utils/midiImport';
import './DrumMachine.css';

/**
 * Play icon SVG
 */
const PlayIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
};

/**
 * Pause icon SVG
 */
const PauseIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
};

/**
 * Stop icon SVG
 */
const StopIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
};

/**
 * Clear icon SVG
 */
const ClearIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  );
};

/**
 * Download/Export icon SVG
 */
const DownloadIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
};

/**
 * Upload/Import icon SVG
 */
const UploadIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
};

/**
 * Plus icon SVG for adding loops
 */
const PlusIcon: Component = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
};

/**
 * Minus icon SVG for removing loops
 */
const MinusIcon: Component = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
};

/**
 * Copy icon SVG for copying loops
 */
const CopyIcon: Component = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
};

/**
 * Chevron left icon SVG
 */
const ChevronLeftIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
};

/**
 * Chevron right icon SVG
 */
const ChevronRightIcon: Component = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
};

/**
 * DrumMachine Component
 * A 16-step drum sequencer with Web Audio synthesis
 * Supports both main site mode (using i18n context) and standalone mode (using props)
 */
export const DrumMachine: Component<DrumMachineProps> = (props) => {
  // Use provided translations (standalone) or i18n context (main site)
  const contextTranslations = useTranslations();
  const drum = () => props.translations ?? contextTranslations().drum;

  // Zustand store state
  const store = useDrumStore();

  // Derived state: which loop to display (playing loop during playback, editing loop otherwise)
  const displayLoopIndex = () =>
    store.isPlaying ? store.playingLoopIndex : store.currentLoopIndex;
  const pattern = () => store.loops[displayLoopIndex()];

  // Refs
  let audioContext: AudioContext | null = null;
  let schedulerAnimationId: number | null = null;
  let nextStepTime = 0;
  let currentStepValue = 0;
  let currentPlayingLoop = 0;
  let isPlayingValue = false;
  let isDragging = false;
  let paintMode: boolean | null = null; // true = paint on, false = paint off
  let fileInputEl: HTMLInputElement | undefined;
  // Cached noise buffers for performance (avoid regenerating on every hit)
  const noiseBufferCache = new Map<string, AudioBuffer>();
  // Velocity drag refs
  let velocityDrag: {
    inst: Instrument;
    step: number;
    startY: number;
    startVelocity: number;
    hasMoved: boolean;
  } | null = null;
  // Ref to store the mousemove handler for dynamic add/remove during velocity drag
  let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

  /**
   * Get or create audio context
   */
  const getAudioContext = () => {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    }
    return audioContext;
  };

  /**
   * Get or create cached noise buffer
   * Caches noise buffers by duration to avoid expensive regeneration on every hit
   */
  const getNoiseBuffer = (ctx: AudioContext, duration: number): AudioBuffer => {
    const key = `noise-${duration}`;
    const cached = noiseBufferCache.get(key);
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
    noiseBufferCache.set(key, buffer);
    return buffer;
  };

  /**
   * Play a single instrument sound at a specific time
   * Uses synth parameters when available (integrated mode), otherwise basic synthesis
   */
  const playSound = (
    inst: Instrument,
    time?: number,
    velocity: number = VELOCITY.DEFAULT
  ) => {
    const ctx = audioContext;
    if (!ctx || velocity <= 0) return;

    const startTime = time ?? ctx.currentTime;

    // Use synth parameters when available (integrated mode with DrumSynth)
    if (props.synthParams) {
      // Calculate delay for scheduled sounds
      const delay = Math.max(0, (startTime - ctx.currentTime) * 1000);
      const adjustedVelocity = (store.volumes[inst] / 100) * velocity;

      setTimeout(() => {
        if (ctx && props.synthParams) {
          playSynthSound(
            ctx,
            inst as DrumMachineInstrument,
            props.synthParams,
            adjustedVelocity
          );
        }
      }, delay);
      return;
    }

    // Basic synthesis (standalone mode)
    // Combine instrument volume and note velocity
    const volumeMultiplier = (store.volumes[inst] / 100) * (velocity / 100);

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
        const duration = isOpen ? AUDIO.OPENHAT.DURATION : AUDIO.HIHAT.DURATION;
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
        gain.gain.setValueAtTime(AUDIO.CLAP.GAIN * volumeMultiplier, startTime);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          startTime + AUDIO.CLAP.DURATION
        );
        source.start(startTime);
        break;
      }
    }
  };

  /**
   * Schedule sounds for upcoming steps using Web Audio timing
   */
  const scheduleStep = (stepIndex: number, loopIndex: number, time: number) => {
    const currentPattern = store.loops[loopIndex];
    if (!currentPattern) return;
    INSTRUMENTS.forEach((inst) => {
      const velocity = currentPattern[inst][stepIndex];
      if (velocity > 0) {
        playSound(inst, time, velocity);
      }
    });
  };

  /**
   * Scheduler loop using requestAnimationFrame
   * Schedules notes ahead of time for accurate timing
   */
  const scheduler = () => {
    const ctx = audioContext;
    if (!ctx || !isPlayingValue) return;

    const scheduleAheadTime = 0.1; // Schedule 100ms ahead
    const stepDuration = 60 / store.tempo / 4; // Duration of one 16th note in seconds

    // Schedule all notes that fall within the look-ahead window
    while (nextStepTime < ctx.currentTime + scheduleAheadTime) {
      scheduleStep(currentStepValue, currentPlayingLoop, nextStepTime);

      // Update visual step and loop (use setTimeout for UI sync)
      const stepToShow = currentStepValue;
      const loopToShow = currentPlayingLoop;
      const timeUntilStep = (nextStepTime - ctx.currentTime) * 1000;
      setTimeout(
        () => {
          store.setCurrentStep(stepToShow);
          store.setPlayingLoopIndex(loopToShow);
        },
        Math.max(0, timeUntilStep)
      );

      // Advance to next step
      currentStepValue = currentStepValue + 1;

      // Check if we need to advance to next loop
      if (currentStepValue >= STEPS) {
        currentStepValue = 0;
        currentPlayingLoop = (currentPlayingLoop + 1) % store.loops.length;
      }

      nextStepTime += stepDuration;
    }

    // Continue scheduling if still playing
    schedulerAnimationId = requestAnimationFrame(scheduler);
  };

  /**
   * Start playback
   */
  const play = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!store.isPlaying) {
      // Resume audio context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      store.setIsPlaying(true);
      isPlayingValue = true;
      // Initialize timing from current audio context time
      nextStepTime = ctx.currentTime;
      currentStepValue = store.currentStep;
      // Start the scheduler
      schedulerAnimationId = requestAnimationFrame(scheduler);
    } else {
      // Pause
      store.setIsPlaying(false);
      isPlayingValue = false;
      if (schedulerAnimationId) {
        cancelAnimationFrame(schedulerAnimationId);
        schedulerAnimationId = null;
      }
    }
  };

  /**
   * Stop playback
   */
  const stop = () => {
    store.stop();
    isPlayingValue = false;
    currentStepValue = 0;
    currentPlayingLoop = 0;
    if (schedulerAnimationId) {
      cancelAnimationFrame(schedulerAnimationId);
      schedulerAnimationId = null;
    }
  };

  /**
   * Clear all loops and reset to initial state
   */
  const clear = () => {
    // If multiple loops exist, show warning message
    if (store.loops.length > 1) {
      store.showStatus(drum().clearAllLoops, 'info');
    }
    // Reset to initial state via store
    store.reset();
    currentPlayingLoop = 0;
  };

  /**
   * Set a step velocity value in displayed loop (follows playback during play)
   */
  const setStepVelocity = (
    inst: Instrument,
    step: number,
    velocity: number
  ) => {
    const targetIndex = store.isPlaying
      ? store.playingLoopIndex
      : store.currentLoopIndex;
    store.setStepVelocity(targetIndex, inst, step, velocity);
  };

  /**
   * Handle mouse move for velocity adjustment
   * NOTE: Defined before handleStepMouseDown because it's referenced there
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!velocityDrag) return;

    const { inst, step, startY, startVelocity } = velocityDrag;
    // Drag down = decrease velocity, drag up = increase velocity
    const deltaY = e.clientY - startY;

    // Only process if moved more than 3px (threshold to distinguish click from drag)
    if (Math.abs(deltaY) > 3) {
      velocityDrag.hasMoved = true;
      // 100px drag = full velocity change
      const velocityChange = Math.round(-deltaY * 1);
      const newVelocity = Math.max(
        VELOCITY.OFF,
        Math.min(VELOCITY.MAX, startVelocity + velocityChange)
      );
      setStepVelocity(inst, step, newVelocity);
    }
  };

  /**
   * Handle drag start on a step
   */
  const handleStepMouseDown = (
    inst: Instrument,
    step: number,
    clientY: number
  ) => {
    const currentValue = pattern()[inst][step];

    if (currentValue > 0) {
      // Active note: start velocity drag mode (or remove on click without drag)
      velocityDrag = {
        inst,
        step,
        startY: clientY,
        startVelocity: currentValue,
        hasMoved: false,
      };
      isDragging = false;
      paintMode = null;
      // Dynamically add mousemove listener only during velocity drag
      mouseMoveHandler = handleMouseMove;
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      // Inactive note: start paint mode with full velocity
      isDragging = true;
      paintMode = true;
      velocityDrag = null;
      setStepVelocity(inst, step, VELOCITY.DEFAULT);
    }
  };

  /**
   * Handle mouse enter while dragging (paint mode only)
   */
  const handleStepMouseEnter = (inst: Instrument, step: number) => {
    if (isDragging && paintMode) {
      setStepVelocity(inst, step, VELOCITY.DEFAULT);
    }
  };

  /**
   * Handle drag end - remove note if clicked without dragging
   */
  const handleDragEnd = () => {
    // If velocity drag mode was active and user didn't move, remove the note
    if (velocityDrag && !velocityDrag.hasMoved) {
      const { inst, step } = velocityDrag;
      setStepVelocity(inst, step, VELOCITY.OFF);
    }
    isDragging = false;
    paintMode = null;
    velocityDrag = null;
  };

  /**
   * Handle touch move for mobile (paint mode and velocity adjustment)
   */
  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];

    // Velocity drag mode
    if (velocityDrag) {
      const { inst, step, startY, startVelocity } = velocityDrag;
      const deltaY = touch.clientY - startY;

      // Only process if moved more than 3px
      if (Math.abs(deltaY) > 3) {
        velocityDrag.hasMoved = true;
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
    if (!isDragging || !paintMode) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.classList.contains('drum-step')) {
      const inst = element.getAttribute('data-instrument') as Instrument;
      const stepAttr = element.getAttribute('data-step');
      const stepNum = stepAttr ? parseInt(stepAttr, 10) : NaN;

      if (inst && !isNaN(stepNum)) {
        setStepVelocity(inst, stepNum, VELOCITY.DEFAULT);
      }
    }
  };

  /**
   * Add global mouse listeners for drag handling
   * Note: mousemove is added/removed dynamically only during velocity drag
   */
  onMount(() => {
    const handleGlobalMouseUp = () => {
      // Remove mousemove listener if it was attached
      if (mouseMoveHandler) {
        window.removeEventListener('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
      }
      // If velocity drag mode was active and user didn't move, remove the note
      if (velocityDrag && !velocityDrag.hasMoved) {
        const { inst, step } = velocityDrag;
        setStepVelocity(inst, step, VELOCITY.OFF);
      }
      isDragging = false;
      paintMode = null;
      velocityDrag = null;
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);

    onCleanup(() => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      // Clean up mousemove if still attached
      if (mouseMoveHandler) {
        window.removeEventListener('mousemove', mouseMoveHandler);
        mouseMoveHandler = null;
      }
    });
  });

  /**
   * Load a preset into current loop
   */
  const loadPreset = (presetName: string) => {
    const preset = PRESETS[presetName];
    if (preset) {
      store.loadPreset(store.currentLoopIndex, preset);
      store.showStatus(
        drum().loadedPreset.replace('{preset}', presetName),
        'success'
      );
    }
  };

  /**
   * Export all loops as MIDI file
   */
  const handleExportMidi = () => {
    exportMidi({
      loops: store.loops,
      tempo: store.tempo,
      filename: 'drum-pattern',
    });
    store.showStatus(drum().exportSuccess, 'success');
  };

  /**
   * Trigger file input for MIDI import
   */
  const handleImportClick = () => {
    fileInputEl?.click();
  };

  /**
   * Handle MIDI file import
   */
  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const result = await importMidiFile(file);

    if (result) {
      // Import into current loop
      store.loadPreset(store.currentLoopIndex, result.pattern);
      store.setTempo(result.tempo);
      store.showStatus(drum().importSuccess, 'success');
    } else {
      store.showStatus(drum().importError, 'error');
    }

    // Reset input so same file can be selected again
    target.value = '';
  };

  /**
   * Add a new empty loop
   */
  const addLoop = () => {
    if (store.loops.length >= MAX_LOOPS) {
      store.showStatus(drum().maxLoopsReached, 'error');
      return;
    }
    store.addLoop();
    store.setCurrentLoopIndex(store.loops.length);
  };

  /**
   * Copy current loop and add as new loop
   */
  const copyCurrentLoop = () => {
    if (store.loops.length >= MAX_LOOPS) {
      store.showStatus(drum().maxLoopsReached, 'error');
      return;
    }
    store.copyLoop(store.currentLoopIndex);
    store.setCurrentLoopIndex(store.loops.length);
  };

  /**
   * Remove current loop
   */
  const removeCurrentLoop = () => {
    if (store.loops.length <= 1) return; // Keep at least one loop
    store.removeLoop(store.currentLoopIndex);
  };

  /**
   * Move current loop left (swap with previous)
   */
  const moveLoopLeft = () => {
    if (store.currentLoopIndex <= 0) return;
    store.reorderLoops(store.currentLoopIndex, store.currentLoopIndex - 1);
  };

  /**
   * Move current loop right (swap with next)
   */
  const moveLoopRight = () => {
    if (store.currentLoopIndex >= store.loops.length - 1) return;
    store.reorderLoops(store.currentLoopIndex, store.currentLoopIndex + 1);
  };

  /**
   * Handle loop drag start
   */
  const handleLoopDragStart = (index: number) => {
    store.setDragLoopIndex(index);
  };

  /**
   * Handle loop drag over
   */
  const handleLoopDragOver = (index: number) => {
    if (store.dragLoopIndex !== null && store.dragLoopIndex !== index) {
      store.setDragOverLoopIndex(index);
    }
  };

  /**
   * Handle loop drag end - reorder loops
   */
  const handleLoopDragEnd = () => {
    if (
      store.dragLoopIndex !== null &&
      store.dragOverLoopIndex !== null &&
      store.dragLoopIndex !== store.dragOverLoopIndex
    ) {
      store.reorderLoops(store.dragLoopIndex, store.dragOverLoopIndex);
    }
    store.setDragLoopIndex(null);
    store.setDragOverLoopIndex(null);
  };

  /**
   * Handle loop drag leave
   */
  const handleLoopDragLeave = () => {
    store.setDragOverLoopIndex(null);
  };

  /**
   * Handle tempo change
   */
  const handleTempoChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newTempo = parseInt(target.value, 10);
    store.setTempo(newTempo);
    // Scheduler will pick up new tempo automatically on next iteration
  };

  /**
   * Handle instrument volume change
   */
  const handleVolumeChange = (inst: Instrument, value: number) => {
    store.setVolume(inst, value);
  };

  /**
   * Cleanup on unmount
   */
  onCleanup(() => {
    if (schedulerAnimationId) {
      cancelAnimationFrame(schedulerAnimationId);
    }
    if (audioContext) {
      audioContext.close();
    }
  });

  /**
   * Get translated instrument label
   */
  const getInstrumentLabel = (inst: Instrument): string => {
    const labels: Record<Instrument, string> = {
      kick: drum().kick,
      snare: drum().snare,
      hihat: drum().hihat,
      openhat: drum().openhat,
      clap: drum().clap,
    };
    return labels[inst];
  };

  /**
   * Get translated preset label
   */
  const getPresetLabel = (preset: string): string => {
    const labels: Record<string, string> = {
      techno: drum().presetTechno,
      house: drum().presetHouse,
      trap: drum().presetTrap,
      breakbeat: drum().presetBreakbeat,
      minimal: drum().presetMinimal,
    };
    return labels[preset] || preset;
  };

  return (
    <div class="drum-machine">
      {/* Transport Controls */}
      <div class="drum-transport">
        <div class="drum-transport-controls">
          <button
            class={cn('drum-btn', store.isPlaying && 'drum-btn--active')}
            onClick={play}
            aria-label={store.isPlaying ? drum().pause : drum().play}
          >
            <Show when={store.isPlaying} fallback={<PlayIcon />}>
              <PauseIcon />
            </Show>
            <span>{store.isPlaying ? drum().pause : drum().play}</span>
          </button>
          <button class="drum-btn" onClick={stop} aria-label={drum().stop}>
            <StopIcon />
            <span>{drum().stop}</span>
          </button>
          <button class="drum-btn" onClick={clear} aria-label={drum().clear}>
            <ClearIcon />
            <span>{drum().clear}</span>
          </button>
          <button
            class="drum-btn drum-btn--export"
            onClick={handleExportMidi}
            aria-label={drum().exportMidi}
          >
            <DownloadIcon />
            <span>{drum().exportMidi}</span>
          </button>
          <button
            class="drum-btn drum-btn--import"
            onClick={handleImportClick}
            aria-label={drum().importMidi}
          >
            <UploadIcon />
            <span>{drum().importMidi}</span>
          </button>
          <input
            ref={fileInputEl}
            type="file"
            accept=".mid,.midi,audio/midi,audio/x-midi"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
        </div>

        <div class="drum-tempo">
          <span class="drum-tempo-label">{drum().tempo}</span>
          <input
            type="range"
            class="drum-slider"
            min={TEMPO_RANGE.MIN}
            max={TEMPO_RANGE.MAX}
            value={store.tempo}
            onInput={handleTempoChange}
            aria-label={drum().tempo}
          />
          <span class="drum-tempo-value">
            {store.tempo} BPM
            <span class="drum-tempo-duration">
              {store.loops.length > 1 && `x${store.loops.length} `}(
              {((240 / store.tempo) * store.loops.length).toFixed(1)}s)
            </span>
          </span>
        </div>
      </div>

      {/* Loop Controls */}
      <div class="drum-loop-controls">
        <div class="drum-loop-row">
          <span class="drum-loop-label">{drum().loop}</span>
          <div class="drum-loop-blocks">
            <For each={store.loops}>
              {(_, index) => (
                <button
                  class={cn(
                    'drum-loop-block',
                    index() === store.currentLoopIndex &&
                      'drum-loop-block--selected',
                    store.isPlaying &&
                      index() === store.playingLoopIndex &&
                      'drum-loop-block--playing',
                    store.dragLoopIndex === index() &&
                      'drum-loop-block--dragging',
                    store.dragOverLoopIndex === index() &&
                      'drum-loop-block--drag-over'
                  )}
                  draggable={true}
                  onDragStart={() => handleLoopDragStart(index())}
                  onDragOver={(e) => {
                    e.preventDefault();
                    handleLoopDragOver(index());
                  }}
                  onDragLeave={handleLoopDragLeave}
                  onDragEnd={handleLoopDragEnd}
                  onDrop={handleLoopDragEnd}
                  onClick={() => store.setCurrentLoopIndex(index())}
                  aria-label={`${drum().loop} ${store.loopIds[index()]}`}
                  title={`${drum().loop} ${store.loopIds[index()]}`}
                >
                  {store.loopIds[index()]}
                </button>
              )}
            </For>
          </div>
        </div>
        <div class="drum-loop-actions">
          <button
            class="drum-loop-btn drum-loop-btn--action"
            onClick={moveLoopLeft}
            disabled={store.currentLoopIndex <= 0}
            aria-label={drum().moveLoopLeft}
            title={drum().moveLoopLeft}
          >
            <ChevronLeftIcon />
          </button>
          <button
            class="drum-loop-btn drum-loop-btn--action"
            onClick={moveLoopRight}
            disabled={store.currentLoopIndex >= store.loops.length - 1}
            aria-label={drum().moveLoopRight}
            title={drum().moveLoopRight}
          >
            <ChevronRightIcon />
          </button>
          <button
            class="drum-loop-btn drum-loop-btn--action"
            onClick={addLoop}
            disabled={store.loops.length >= MAX_LOOPS}
            aria-label={drum().addLoop}
            title={drum().addLoop}
          >
            <PlusIcon />
          </button>
          <button
            class="drum-loop-btn drum-loop-btn--action"
            onClick={copyCurrentLoop}
            disabled={store.loops.length >= MAX_LOOPS}
            aria-label={drum().copyLoop}
            title={drum().copyLoop}
          >
            <CopyIcon />
          </button>
          <button
            class="drum-loop-btn drum-loop-btn--action"
            onClick={removeCurrentLoop}
            disabled={store.loops.length <= 1}
            aria-label={drum().removeLoop}
            title={drum().removeLoop}
          >
            <MinusIcon />
          </button>
        </div>
      </div>

      {/* Sequencer Grid */}
      <div
        class="drum-sequencer"
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <For each={INSTRUMENTS}>
          {(inst) => (
            <div class="drum-track">
              <div class="drum-track-info">
                <div class="drum-track-label">{getInstrumentLabel(inst)}</div>
                <div class="drum-track-volume">
                  <input
                    type="range"
                    class="drum-volume-slider"
                    min={VOLUME_RANGE.MIN}
                    max={VOLUME_RANGE.MAX}
                    value={store.volumes[inst]}
                    onInput={(e) =>
                      handleVolumeChange(
                        inst,
                        parseInt((e.target as HTMLInputElement).value, 10)
                      )
                    }
                    aria-label={`${getInstrumentLabel(inst)} ${drum().volume}`}
                  />
                  <span class="drum-volume-value">{store.volumes[inst]}</span>
                </div>
              </div>
              <div class="drum-track-steps">
                <For each={Array.from({ length: STEPS })}>
                  {(_, stepIndex) => {
                    const step = stepIndex();
                    const velocity = () => pattern()[inst][step];
                    const isActive = () => velocity() > 0;
                    // Opacity: min 0.3 at velocity 10, max 1 at velocity 100
                    const opacity = () =>
                      isActive() ? 0.3 + (velocity() / VELOCITY.MAX) * 0.7 : 1;
                    return (
                      <button
                        class={cn(
                          'drum-step',
                          isActive() && 'drum-step--active',
                          store.isPlaying &&
                            store.currentStep === step &&
                            'drum-step--playing'
                        )}
                        style={isActive() ? { opacity: opacity() } : undefined}
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
                        aria-label={`${getInstrumentLabel(inst)} ${drum().step} ${step + 1}${isActive() ? ` (${velocity()}%)` : ''}`}
                        aria-pressed={isActive()}
                      />
                    );
                  }}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Presets */}
      <div class="drum-presets">
        <span class="drum-presets-label">{drum().presets}</span>
        <div class="drum-presets-buttons">
          <For each={Object.keys(PRESETS)}>
            {(preset) => (
              <button
                class="drum-preset-btn"
                onClick={() => loadPreset(preset)}
              >
                {getPresetLabel(preset)}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Synthesis Info */}
      <div class="drum-synthesis-info">{drum().synthesisInfo}</div>

      {/* Status Message */}
      <Show when={store.statusMessage}>
        <div
          class={cn('drum-status', `drum-status--${store.statusMessage?.type}`)}
        >
          {store.statusMessage?.text}
        </div>
      </Show>
    </div>
  );
};
