// ========================================
// AudioWorklet Processor
// ========================================
// 이 파일은 별도의 오디오 스레드에서 실행됩니다.
// 화면이 멈춰도 소리는 끊기지 않습니다.

// AudioWorkletProcessor 타입 선언
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

declare function registerProcessor(
  name: string,
  processor: typeof AudioWorkletProcessor
): void;

// SharedState layout: [isPlaying, bpm, currentTime, leftLevel, rightLevel, leftPeak, rightPeak]

// Scale factor for storing floats as integers (Atomics requires Int32Array)
const SCALE_FACTOR = 1000000;

class DAWAudioProcessor extends AudioWorkletProcessor {
  private wasmEngine: unknown = null;
  private sharedBuffer: SharedArrayBuffer | null = null;
  private sharedState: Int32Array | null = null;
  private isInitialized = false;

  constructor() {
    super();

    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    // Request initialization
    this.port.postMessage({ type: 'ready' });
  }

  private handleMessage(data: {
    type: string;
    wasmModule?: WebAssembly.Module;
    sharedBuffer?: SharedArrayBuffer;
  }) {
    switch (data.type) {
      case 'init':
        this.initWasm(data.wasmModule!);
        break;

      case 'shared-buffer':
        this.setupSharedBuffer(data.sharedBuffer!);
        break;

      case 'play':
        if (this.sharedState) {
          Atomics.store(this.sharedState, 0, 1);
        }
        break;

      case 'stop':
        if (this.sharedState) {
          Atomics.store(this.sharedState, 0, 0);
        }
        break;
    }
  }

  private async initWasm(_wasmModule: WebAssembly.Module) {
    try {
      // TODO: Instantiate WASM module
      // const instance = await WebAssembly.instantiate(wasmModule, imports);
      // this.wasmEngine = instance.exports;
      this.isInitialized = true;
      this.port.postMessage({ type: 'initialized' });
    } catch (error) {
      this.port.postMessage({ type: 'error', error: String(error) });
    }
  }

  private setupSharedBuffer(buffer: SharedArrayBuffer) {
    this.sharedBuffer = buffer;
    // Layout: [isPlaying, bpm, currentTime, leftLevel, rightLevel, leftPeak, rightPeak]
    // Using Int32Array for Atomics compatibility (floats stored as scaled integers)
    this.sharedState = new Int32Array(buffer);
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: Record<string, Float32Array>
  ): boolean {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !output || input.length === 0 || output.length === 0) {
      return true;
    }

    const inputL = input[0];
    const inputR = input[1] || input[0];
    const outputL = output[0];
    const outputR = output[1] || output[0];

    // Copy input to output (passthrough for now)
    outputL.set(inputL);
    if (outputR !== outputL) {
      outputR.set(inputR);
    }

    // Calculate levels for meter
    if (this.sharedState) {
      const leftLevel = this.calculateRMS(outputL);
      const rightLevel = this.calculateRMS(outputR);

      // Update shared state (atomic writes) - scale floats to integers
      const scaledLeft = Math.round(leftLevel * SCALE_FACTOR);
      const scaledRight = Math.round(rightLevel * SCALE_FACTOR);

      Atomics.store(this.sharedState, 3, scaledLeft);
      Atomics.store(this.sharedState, 4, scaledRight);

      // Update peaks
      const currentLeftPeak = Atomics.load(this.sharedState, 5);
      const currentRightPeak = Atomics.load(this.sharedState, 6);

      if (scaledLeft > currentLeftPeak) {
        Atomics.store(this.sharedState, 5, scaledLeft);
      }
      if (scaledRight > currentRightPeak) {
        Atomics.store(this.sharedState, 6, scaledRight);
      }
    }

    // TODO: Process with WASM engine
    // if (this.wasmEngine && this.isInitialized) {
    //   this.wasmEngine.process(outputL, outputR);
    // }

    return true; // Keep processor alive
  }

  private calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }
}

registerProcessor('daw-audio-processor', DAWAudioProcessor);
