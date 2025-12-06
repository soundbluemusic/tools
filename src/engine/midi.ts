// ========================================
// WebMIDI API Wrapper
// ========================================
// 실제 MIDI 건반/컨트롤러 연결 지원

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
}

export interface MIDIMessage {
  command: number; // Note On, Note Off, CC, etc.
  channel: number; // 0-15
  note?: number; // 0-127
  velocity?: number; // 0-127
  controller?: number; // CC number
  value?: number; // CC value
  timestamp: number;
}

// MIDI Commands
export const MIDI_COMMANDS = {
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  AFTERTOUCH: 0xa0,
  CONTROL_CHANGE: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  CHANNEL_PRESSURE: 0xd0,
  PITCH_BEND: 0xe0,
} as const;

// Common CC numbers
export const MIDI_CC = {
  MODULATION: 1,
  BREATH: 2,
  VOLUME: 7,
  PAN: 10,
  EXPRESSION: 11,
  SUSTAIN: 64,
  PORTAMENTO: 65,
  SOSTENUTO: 66,
  SOFT_PEDAL: 67,
  ALL_SOUND_OFF: 120,
  ALL_NOTES_OFF: 123,
} as const;

type MIDIMessageCallback = (message: MIDIMessage) => void;
type MIDIDeviceCallback = (devices: MIDIDevice[]) => void;

class MIDIManager {
  private midiAccess: MIDIAccess | null = null;
  private inputs: Map<string, MIDIInput> = new Map();
  private outputs: Map<string, MIDIOutput> = new Map();

  private messageCallbacks: Set<MIDIMessageCallback> = new Set();
  private deviceCallbacks: Set<MIDIDeviceCallback> = new Set();

  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!navigator.requestMIDIAccess) {
      console.warn('WebMIDI API not supported');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });

      // Setup state change handler
      this.midiAccess.onstatechange = () => {
        this.updateDevices();
      };

      // Initial device scan
      this.updateDevices();

      this.isInitialized = true;
      console.log('MIDI initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize MIDI:', error);
      return false;
    }
  }

  private updateDevices(): void {
    if (!this.midiAccess) return;

    // Clear old connections
    this.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    this.inputs.clear();
    this.outputs.clear();

    // Add inputs
    this.midiAccess.inputs.forEach((input, id) => {
      this.inputs.set(id, input);
      input.onmidimessage = (event) => this.handleMIDIMessage(event);
    });

    // Add outputs
    this.midiAccess.outputs.forEach((output, id) => {
      this.outputs.set(id, output);
    });

    // Notify listeners
    const devices = this.getDevices();
    this.deviceCallbacks.forEach((callback) => callback(devices));
  }

  private handleMIDIMessage(event: MIDIMessageEvent): void {
    const data = event.data;
    if (!data || data.length < 1) return;

    const command = data[0] & 0xf0;
    const channel = data[0] & 0x0f;

    const message: MIDIMessage = {
      command,
      channel,
      timestamp: event.timeStamp,
    };

    switch (command) {
      case MIDI_COMMANDS.NOTE_ON:
      case MIDI_COMMANDS.NOTE_OFF:
        message.note = data[1];
        message.velocity = data[2];
        // Note On with velocity 0 is Note Off
        if (command === MIDI_COMMANDS.NOTE_ON && message.velocity === 0) {
          message.command = MIDI_COMMANDS.NOTE_OFF;
        }
        break;

      case MIDI_COMMANDS.CONTROL_CHANGE:
        message.controller = data[1];
        message.value = data[2];
        break;

      case MIDI_COMMANDS.AFTERTOUCH:
        message.note = data[1];
        message.value = data[2];
        break;

      case MIDI_COMMANDS.PITCH_BEND:
        message.value = (data[2] << 7) | data[1]; // 14-bit value
        break;

      case MIDI_COMMANDS.PROGRAM_CHANGE:
        message.value = data[1];
        break;

      case MIDI_COMMANDS.CHANNEL_PRESSURE:
        message.value = data[1];
        break;
    }

    // Notify listeners
    this.messageCallbacks.forEach((callback) => callback(message));
  }

  // Get all connected devices
  getDevices(): MIDIDevice[] {
    const devices: MIDIDevice[] = [];

    this.inputs.forEach((input, id) => {
      devices.push({
        id,
        name: input.name || 'Unknown',
        manufacturer: input.manufacturer || 'Unknown',
        type: 'input',
        state: input.state as 'connected' | 'disconnected',
      });
    });

    this.outputs.forEach((output, id) => {
      devices.push({
        id,
        name: output.name || 'Unknown',
        manufacturer: output.manufacturer || 'Unknown',
        type: 'output',
        state: output.state as 'connected' | 'disconnected',
      });
    });

    return devices;
  }

  // Subscribe to MIDI messages
  onMessage(callback: MIDIMessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  // Subscribe to device changes
  onDeviceChange(callback: MIDIDeviceCallback): () => void {
    this.deviceCallbacks.add(callback);
    return () => this.deviceCallbacks.delete(callback);
  }

  // Send MIDI message to output
  send(outputId: string, data: number[]): void {
    const output = this.outputs.get(outputId);
    if (output) {
      output.send(data);
    }
  }

  // Send Note On
  noteOn(
    outputId: string,
    channel: number,
    note: number,
    velocity: number
  ): void {
    this.send(outputId, [MIDI_COMMANDS.NOTE_ON | channel, note, velocity]);
  }

  // Send Note Off
  noteOff(outputId: string, channel: number, note: number): void {
    this.send(outputId, [MIDI_COMMANDS.NOTE_OFF | channel, note, 0]);
  }

  // Send Control Change
  controlChange(
    outputId: string,
    channel: number,
    controller: number,
    value: number
  ): void {
    this.send(outputId, [
      MIDI_COMMANDS.CONTROL_CHANGE | channel,
      controller,
      value,
    ]);
  }

  // Check if initialized
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const midiManager = new MIDIManager();

// React hook for MIDI
import { useState, useEffect } from 'react';

export function useMIDI() {
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof navigator.requestMIDIAccess === 'function');

    midiManager.initialize().then((success) => {
      if (success) {
        setDevices(midiManager.getDevices());
      }
    });

    const unsubscribe = midiManager.onDeviceChange(setDevices);
    return unsubscribe;
  }, []);

  return {
    devices,
    isSupported,
    onMessage: midiManager.onMessage.bind(midiManager),
    send: midiManager.send.bind(midiManager),
    noteOn: midiManager.noteOn.bind(midiManager),
    noteOff: midiManager.noteOff.bind(midiManager),
    controlChange: midiManager.controlChange.bind(midiManager),
  };
}
