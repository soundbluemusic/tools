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
 */
export const DrumMachine = memo(function DrumMachine() {
  const { drum } = useTranslations();

  // State
  const [loops, setLoops] = useState<MultiLoopPattern>(createInitialLoops);
  const [currentLoopIndex, setCurrentLoopIndex] = useState(0);
  const [tempo, setTempo] = useState<number>(TEMPO_RANGE.DEFAULT);
  const [volumes, setVolumes] = useState<InstrumentVolumes>({ ...DEFAULT_VOLUMES });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playingLoopIndex, setPlayingLoopIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [dragLoopIndex, setDragLoopIndex] = useState<number | null>(null);
  const [dragOverLoopIndex, setDragOverLoopIndex] = useState<number | null>(null);

  // Derived state: current pattern being edited
  const pattern = loops[currentLoopIndex];

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
      scheduleStep(currentStepRef.current, currentPlayingLoopRef.current, nextStepTimeRef.current);

      // Update visual step and loop (use setTimeout for UI sync)
      const stepToShow = currentStepRef.current;
      const loopToShow = currentPlayingLoopRef.current;
      const timeUntilStep = (nextStepTimeRef.current - ctx.currentTime) * 1000;
      setTimeout(() => {
        setCurrentStep(stepToShow);
        setPlayingLoopIndex(loopToShow);
      }, Math.max(0, timeUntilStep));

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
    setCurrentLoopIndex(0);
    setPlayingLoopIndex(0);
    currentPlayingLoopRef.current = 0;
  }, [loops.length, drum.clearAllLoops, showStatus]);

  /**
   * Set a step velocity value in current loop
   */
  const setStepVelocity = useCallback((inst: Instrument, step: number, velocity: number) => {
    setLoops((prev) => {
      const newLoops = [...prev];
      const newPattern = { ...newLoops[currentLoopIndex] };
      newPattern[inst] = newPattern[inst].map((val, i) => (i === step ? velocity : val));
      newLoops[currentLoopIndex] = newPattern;
      return newLoops;
    });
  }, [currentLoopIndex]);

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
        showStatus(drum.loadedPreset.replace('{preset}', presetName), 'success');
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
    setCurrentLoopIndex(loops.length);
  }, [loops.length, drum.maxLoopsReached, showStatus]);

  /**
   * Copy current loop and add as new loop
   */
  const copyCurrentLoop = useCallback(() => {
    if (loops.length >= MAX_LOOPS) {
      showStatus(drum.maxLoopsReached, 'error');
      return;
    }
    setLoops((prev) => [...prev, copyPattern(prev[currentLoopIndex])]);
    setCurrentLoopIndex(loops.length);
  }, [loops.length, currentLoopIndex, drum.maxLoopsReached, showStatus]);

  /**
   * Remove current loop
   */
  const removeCurrentLoop = useCallback(() => {
    if (loops.length <= 1) return; // Keep at least one loop
    setLoops((prev) => prev.filter((_, i) => i !== currentLoopIndex));
    setCurrentLoopIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, [loops.length, currentLoopIndex]);

  /**
   * Move current loop left (swap with previous)
   */
  const moveLoopLeft = useCallback(() => {
    if (currentLoopIndex <= 0) return;
    setLoops((prev) => {
      const newLoops = [...prev];
      [newLoops[currentLoopIndex - 1], newLoops[currentLoopIndex]] =
        [newLoops[currentLoopIndex], newLoops[currentLoopIndex - 1]];
      return newLoops;
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
      [newLoops[currentLoopIndex], newLoops[currentLoopIndex + 1]] =
        [newLoops[currentLoopIndex + 1], newLoops[currentLoopIndex]];
      return newLoops;
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
  const handleLoopDragOver = useCallback((index: number) => {
    if (dragLoopIndex !== null && dragLoopIndex !== index) {
      setDragOverLoopIndex(index);
    }
  }, [dragLoopIndex]);

  /**
   * Handle loop drag end - reorder loops
   */
  const handleLoopDragEnd = useCallback(() => {
    if (dragLoopIndex !== null && dragOverLoopIndex !== null && dragLoopIndex !== dragOverLoopIndex) {
      setLoops((prev) => {
        const newLoops = [...prev];
        const [draggedLoop] = newLoops.splice(dragLoopIndex, 1);
        newLoops.splice(dragOverLoopIndex, 0, draggedLoop);
        return newLoops;
      });
      // Update current loop index if needed
      if (currentLoopIndex === dragLoopIndex) {
        setCurrentLoopIndex(dragOverLoopIndex);
      } else if (
        dragLoopIndex < currentLoopIndex && dragOverLoopIndex >= currentLoopIndex
      ) {
        setCurrentLoopIndex((prev) => prev - 1);
      } else if (
        dragLoopIndex > currentLoopIndex && dragOverLoopIndex <= currentLoopIndex
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
          <button
            className="drum-btn drum-btn--export"
            onClick={handleExportMidi}
            aria-label={drum.exportMidi}
          >
            <DownloadIcon />
            <span>{drum.exportMidi}</span>
          </button>
          <button
            className="drum-btn drum-btn--import"
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

      {/* Loop Controls */}
      <div className="drum-loop-controls">
        <div className="drum-loop-row">
          <span className="drum-loop-label">{drum.loop}</span>
          <div className="drum-loop-blocks">
            {loops.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'drum-loop-block',
                  index === currentLoopIndex && 'drum-loop-block--selected',
                  isPlaying && index === playingLoopIndex && 'drum-loop-block--playing',
                  dragLoopIndex === index && 'drum-loop-block--dragging',
                  dragOverLoopIndex === index && 'drum-loop-block--drag-over'
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
                aria-label={`${drum.loop} ${index + 1}`}
                title={`${drum.loop} ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="drum-loop-actions">
          <button
            className="drum-loop-btn drum-loop-btn--action"
            onClick={moveLoopLeft}
            disabled={currentLoopIndex <= 0}
            aria-label={drum.moveLoopLeft}
            title={drum.moveLoopLeft}
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="drum-loop-btn drum-loop-btn--action"
            onClick={moveLoopRight}
            disabled={currentLoopIndex >= loops.length - 1}
            aria-label={drum.moveLoopRight}
            title={drum.moveLoopRight}
          >
            <ChevronRightIcon />
          </button>
          <button
            className="drum-loop-btn drum-loop-btn--action"
            onClick={addLoop}
            disabled={loops.length >= MAX_LOOPS}
            aria-label={drum.addLoop}
            title={drum.addLoop}
          >
            <PlusIcon />
          </button>
          <button
            className="drum-loop-btn drum-loop-btn--action"
            onClick={copyCurrentLoop}
            disabled={loops.length >= MAX_LOOPS}
            aria-label={drum.copyLoop}
            title={drum.copyLoop}
          >
            <CopyIcon />
          </button>
          <button
            className="drum-loop-btn drum-loop-btn--action"
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
