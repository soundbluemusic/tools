'use client';

// ========================================
// Audio Engine Manager
// ========================================
// AudioContext, AudioWorklet, WASM 통합 관리

export interface AudioEngineOptions {
  sampleRate?: number;
  bufferSize?: number;
}

// SharedStateLayout: [isPlaying, bpm, currentTime, leftLevel, rightLevel, leftPeak, rightPeak]

// SharedArrayBuffer layout (Int32Array for Atomics compatibility)
// We store floats as integers scaled by 1000000 for precision
const SHARED_STATE_SIZE = 7 * Int32Array.BYTES_PER_ELEMENT;
const SCALE_FACTOR = 1000000;

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  private sharedBuffer: SharedArrayBuffer | null = null;
  private sharedState: Int32Array | null = null;

  private isInitialized = false;
  private isWorkletReady = false;

  private onMeterUpdate?: (left: number, right: number) => void;
  private meterAnimationId?: number;

  async initialize(options: AudioEngineOptions = {}): Promise<void> {
    if (this.isInitialized) return;

    const { sampleRate = 48000 } = options;

    try {
      // Create AudioContext
      this.audioContext = new AudioContext({
        sampleRate,
        latencyHint: 'interactive',
      });

      // Create master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      // Create analyser for visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.connect(this.masterGain);

      // Setup SharedArrayBuffer for zero-copy communication
      if (typeof SharedArrayBuffer !== 'undefined') {
        this.sharedBuffer = new SharedArrayBuffer(SHARED_STATE_SIZE);
        this.sharedState = new Int32Array(this.sharedBuffer);
      }

      // Load AudioWorklet
      await this.loadWorklet();

      this.isInitialized = true;
      console.log('Audio Engine initialized:', {
        sampleRate: this.audioContext.sampleRate,
        baseLatency: this.audioContext.baseLatency,
        outputLatency: this.audioContext.outputLatency,
      });
    } catch (error) {
      console.error('Failed to initialize Audio Engine:', error);
      throw error;
    }
  }

  private async loadWorklet(): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Register worklet processor
      const workletUrl = new URL(
        './worklet/audio-processor.ts',
        import.meta.url
      );

      await this.audioContext.audioWorklet.addModule(workletUrl);

      // Create worklet node
      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        'daw-audio-processor',
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [2],
        }
      );

      // Connect worklet to analyser
      this.workletNode.connect(this.analyser!);

      // Setup message handling
      this.workletNode.port.onmessage = (event) => {
        this.handleWorkletMessage(event.data);
      };

      // Send shared buffer to worklet
      if (this.sharedBuffer) {
        this.workletNode.port.postMessage({
          type: 'shared-buffer',
          sharedBuffer: this.sharedBuffer,
        });
      }

      this.isWorkletReady = true;
    } catch (error) {
      console.error('Failed to load AudioWorklet:', error);
      // Fallback: could use ScriptProcessorNode (deprecated)
    }
  }

  private handleWorkletMessage(data: { type: string }) {
    switch (data.type) {
      case 'ready':
        console.log('AudioWorklet is ready');
        break;
      case 'initialized':
        console.log('WASM engine initialized in worklet');
        break;
      case 'error':
        console.error('Worklet error:', data);
        break;
    }
  }

  // Transport controls
  play(): void {
    if (!this.audioContext || !this.workletNode) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.workletNode.port.postMessage({ type: 'play' });
    this.startMeterUpdates();
  }

  stop(): void {
    if (!this.workletNode) return;

    this.workletNode.port.postMessage({ type: 'stop' });
    this.stopMeterUpdates();
  }

  // Master volume
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext!.currentTime
      );
    }
  }

  // Meter updates
  onMeter(callback: (left: number, right: number) => void): void {
    this.onMeterUpdate = callback;
  }

  private startMeterUpdates(): void {
    const updateMeter = () => {
      if (this.sharedState && this.onMeterUpdate) {
        // Convert scaled integers back to floats
        const left = Atomics.load(this.sharedState, 3) / SCALE_FACTOR;
        const right = Atomics.load(this.sharedState, 4) / SCALE_FACTOR;
        this.onMeterUpdate(left, right);
      }
      this.meterAnimationId = requestAnimationFrame(updateMeter);
    };
    updateMeter();
  }

  private stopMeterUpdates(): void {
    if (this.meterAnimationId) {
      cancelAnimationFrame(this.meterAnimationId);
    }
  }

  // Get frequency data for visualization
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  // Get time domain data for waveform
  getTimeDomainData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  // Get context info
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      isWorkletReady: this.isWorkletReady,
      sampleRate: this.audioContext?.sampleRate ?? 0,
      baseLatency: this.audioContext?.baseLatency ?? 0,
      outputLatency: this.audioContext?.outputLatency ?? 0,
      state: this.audioContext?.state ?? 'closed',
    };
  }

  // Cleanup
  dispose(): void {
    this.stopMeterUpdates();

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
    this.isWorkletReady = false;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
