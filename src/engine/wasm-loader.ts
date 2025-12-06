// ========================================
// WASM Loader
// ========================================
// Rust WASM 모듈 로딩 및 초기화

export interface WasmExports {
  memory: WebAssembly.Memory;
  init: () => void;
  process: (inputPtr: number, outputPtr: number, length: number) => void;
  calculate_rms: (bufferPtr: number, length: number) => number;
  calculate_peak: (bufferPtr: number, length: number) => number;
  apply_gain: (bufferPtr: number, length: number, gain: number) => void;
}

class WasmLoader {
  private module: WebAssembly.Module | null = null;
  private instance: WebAssembly.Instance | null = null;
  private exports: WasmExports | null = null;
  private memory: WebAssembly.Memory | null = null;

  private isLoaded = false;

  async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Load WASM binary
      const wasmUrl = new URL(
        './wasm/pkg/audio_engine_bg.wasm',
        import.meta.url
      );
      const response = await fetch(wasmUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.status}`);
      }

      const wasmBytes = await response.arrayBuffer();

      // Create memory
      this.memory = new WebAssembly.Memory({
        initial: 256, // 16MB initial
        maximum: 1024, // 64MB max
        shared: true, // Required for SharedArrayBuffer
      });

      // Compile module
      this.module = await WebAssembly.compile(wasmBytes);

      // Instantiate with imports
      this.instance = await WebAssembly.instantiate(this.module, {
        env: {
          memory: this.memory,
        },
        wbg: {
          // wasm-bindgen imports
          __wbindgen_throw: (ptr: number, len: number) => {
            const message = this.readString(ptr, len);
            throw new Error(message);
          },
        },
      });

      this.exports = this.instance.exports as unknown as WasmExports;

      // Initialize WASM
      if (this.exports.init) {
        this.exports.init();
      }

      this.isLoaded = true;
      console.log('WASM module loaded successfully');
    } catch (error) {
      console.error('Failed to load WASM:', error);
      // WASM 로딩 실패 시에도 앱은 동작 (JS 폴백 사용)
    }
  }

  private readString(ptr: number, len: number): string {
    if (!this.memory) return '';
    const bytes = new Uint8Array(this.memory.buffer, ptr, len);
    return new TextDecoder().decode(bytes);
  }

  // Allocate buffer in WASM memory
  allocate(_size: number): number {
    // TODO: Implement proper allocator
    // For now, just use a simple bump allocator
    return 0;
  }

  // Get WASM exports
  getExports(): WasmExports | null {
    return this.exports;
  }

  // Get WASM module for sending to AudioWorklet
  getModule(): WebAssembly.Module | null {
    return this.module;
  }

  // Get memory for SharedArrayBuffer
  getMemory(): WebAssembly.Memory | null {
    return this.memory;
  }

  // Check if loaded
  get loaded(): boolean {
    return this.isLoaded;
  }

  // Process audio buffer using WASM
  processBuffer(input: Float32Array, output: Float32Array): void {
    if (!this.exports || !this.memory) {
      // Fallback: just copy input to output
      output.set(input);
      return;
    }

    // TODO: Implement proper buffer processing with WASM
    output.set(input);
  }

  // Calculate RMS using WASM
  calculateRMS(buffer: Float32Array): number {
    if (!this.exports) {
      // JS fallback
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer[i] * buffer[i];
      }
      return Math.sqrt(sum / buffer.length);
    }

    // TODO: Use WASM implementation
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }
}

// Singleton instance
export const wasmLoader = new WasmLoader();
