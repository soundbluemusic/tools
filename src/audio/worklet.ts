/**
 * AudioWorklet Manager
 * Provides high-level API for AudioWorklet processors
 *
 * Architecture:
 * - Loads AudioWorklet processors from public/audio-worklet/
 * - Provides typed interfaces for each processor
 * - Handles fallback to ScriptProcessorNode if needed
 */

// ============================================
// Types
// ============================================

/**
 * Metronome processor message types
 */
interface MetronomeMessage {
  type: 'start' | 'stop' | 'setBpm' | 'setVolume' | 'setTimeSignature';
  data?: {
    bpm?: number;
    volume?: number;
    beatsPerMeasure?: number;
  };
}

/**
 * Metronome beat event
 */
interface MetronomeBeatEvent {
  beat: number;
  isAccent: boolean;
  time: number;
}

/**
 * Drum synth processor message types
 */
interface DrumSynthMessage {
  type: 'trigger' | 'setVolume' | 'stop';
  data?: {
    drum?: string;
    velocity?: number;
    params?: Record<string, number>;
    volume?: number;
  };
}

/**
 * Noise generator message types
 */
interface NoiseGeneratorMessage {
  type: 'start' | 'stop' | 'setType' | 'setVolume';
  data?: {
    type?: 'white' | 'pink' | 'brown';
    volume?: number;
  };
}

// ============================================
// Feature Detection
// ============================================

/**
 * Check if AudioWorklet is supported
 */
export function isAudioWorkletSupported(): boolean {
  return (
    typeof AudioContext !== 'undefined' &&
    typeof AudioWorkletNode !== 'undefined'
  );
}

// ============================================
// Worklet Loading
// ============================================

let workletLoaded = false;
let workletLoadPromise: Promise<void> | null = null;

/**
 * Load AudioWorklet processors
 */
export async function loadAudioWorklet(
  audioContext: AudioContext
): Promise<void> {
  if (workletLoaded) return;

  if (workletLoadPromise) {
    return workletLoadPromise;
  }

  workletLoadPromise = (async () => {
    if (!isAudioWorkletSupported()) {
      console.warn('AudioWorklet not supported, falling back to main thread');
      return;
    }

    try {
      await audioContext.audioWorklet.addModule('/audio-worklet/dsp-processor.js');
      workletLoaded = true;
    } catch (error) {
      console.error('Failed to load AudioWorklet:', error);
      throw error;
    }
  })();

  return workletLoadPromise;
}

/**
 * Check if worklet is loaded
 */
export function isWorkletLoaded(): boolean {
  return workletLoaded;
}

// ============================================
// Metronome Worklet
// ============================================

/**
 * Metronome AudioWorklet wrapper
 */
export class MetronomeWorklet {
  private node: AudioWorkletNode | null = null;
  private audioContext: AudioContext;
  private onBeat: ((event: MetronomeBeatEvent) => void) | null = null;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Initialize the worklet node
   */
  async init(): Promise<void> {
    await loadAudioWorklet(this.audioContext);

    if (!workletLoaded) {
      throw new Error('AudioWorklet not available');
    }

    this.node = new AudioWorkletNode(
      this.audioContext,
      'metronome-processor'
    );

    // Handle messages from processor
    this.node.port.onmessage = (event) => {
      const { type, data } = event.data;

      if (type === 'beat' && this.onBeat) {
        this.onBeat(data);
      }
    };

    // Connect to destination
    this.node.connect(this.audioContext.destination);
  }

  /**
   * Start the metronome
   */
  start(): void {
    this.sendMessage({ type: 'start' });
  }

  /**
   * Stop the metronome
   */
  stop(): void {
    this.sendMessage({ type: 'stop' });
  }

  /**
   * Set BPM
   */
  setBpm(bpm: number): void {
    this.sendMessage({ type: 'setBpm', data: { bpm } });
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.sendMessage({ type: 'setVolume', data: { volume } });
  }

  /**
   * Set time signature
   */
  setTimeSignature(beatsPerMeasure: number): void {
    this.sendMessage({ type: 'setTimeSignature', data: { beatsPerMeasure } });
  }

  /**
   * Set beat callback
   */
  setOnBeat(callback: (event: MetronomeBeatEvent) => void): void {
    this.onBeat = callback;
  }

  /**
   * Disconnect and cleanup
   */
  dispose(): void {
    if (this.node) {
      this.node.disconnect();
      this.node = null;
    }
    this.onBeat = null;
  }

  private sendMessage(message: MetronomeMessage): void {
    if (this.node) {
      this.node.port.postMessage(message);
    }
  }
}

// ============================================
// Drum Synth Worklet
// ============================================

/**
 * Drum synth AudioWorklet wrapper
 */
export class DrumSynthWorklet {
  private node: AudioWorkletNode | null = null;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Initialize the worklet node
   */
  async init(): Promise<void> {
    await loadAudioWorklet(this.audioContext);

    if (!workletLoaded) {
      throw new Error('AudioWorklet not available');
    }

    this.node = new AudioWorkletNode(
      this.audioContext,
      'drum-synth-processor'
    );

    this.node.connect(this.audioContext.destination);
  }

  /**
   * Trigger a drum sound
   */
  trigger(
    drum: 'kick' | 'snare' | 'hihat' | 'openhat' | 'clap',
    velocity: number = 100,
    params?: Record<string, number>
  ): void {
    this.sendMessage({
      type: 'trigger',
      data: { drum, velocity, params },
    });
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.sendMessage({ type: 'setVolume', data: { volume } });
  }

  /**
   * Stop all sounds
   */
  stop(): void {
    this.sendMessage({ type: 'stop' });
  }

  /**
   * Disconnect and cleanup
   */
  dispose(): void {
    if (this.node) {
      this.node.disconnect();
      this.node = null;
    }
  }

  private sendMessage(message: DrumSynthMessage): void {
    if (this.node) {
      this.node.port.postMessage(message);
    }
  }
}

// ============================================
// Noise Generator Worklet
// ============================================

/**
 * Noise generator AudioWorklet wrapper
 */
export class NoiseGeneratorWorklet {
  private node: AudioWorkletNode | null = null;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Initialize the worklet node
   */
  async init(): Promise<void> {
    await loadAudioWorklet(this.audioContext);

    if (!workletLoaded) {
      throw new Error('AudioWorklet not available');
    }

    this.node = new AudioWorkletNode(
      this.audioContext,
      'noise-generator-processor'
    );

    this.node.connect(this.audioContext.destination);
  }

  /**
   * Start noise generation
   */
  start(): void {
    this.sendMessage({ type: 'start' });
  }

  /**
   * Stop noise generation
   */
  stop(): void {
    this.sendMessage({ type: 'stop' });
  }

  /**
   * Set noise type
   */
  setType(type: 'white' | 'pink' | 'brown'): void {
    this.sendMessage({ type: 'setType', data: { type } });
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.sendMessage({ type: 'setVolume', data: { volume } });
  }

  /**
   * Disconnect and cleanup
   */
  dispose(): void {
    if (this.node) {
      this.node.disconnect();
      this.node = null;
    }
  }

  private sendMessage(message: NoiseGeneratorMessage): void {
    if (this.node) {
      this.node.port.postMessage(message);
    }
  }
}

// ============================================
// Export
// ============================================

export type {
  MetronomeMessage,
  MetronomeBeatEvent,
  DrumSynthMessage,
  NoiseGeneratorMessage,
};
