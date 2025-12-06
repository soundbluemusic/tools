// ========================================
// MIDI - WebMIDI API 유틸리티
// ========================================

import { eventBus, MIDI_NOTE_ON, MIDI_NOTE_OFF, MIDI_CC } from './event-bus';

let midiAccess: MIDIAccess | null = null;
const inputHandlers = new Map<string, (event: MIDIMessageEvent) => void>();

/**
 * Check if WebMIDI is supported
 */
export function isMidiSupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
}

/**
 * Request MIDI access
 */
export async function requestMidiAccess(): Promise<MIDIAccess | null> {
  if (!isMidiSupported()) {
    console.warn('WebMIDI is not supported in this browser');
    return null;
  }

  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    setupMidiListeners();
    return midiAccess;
  } catch (error) {
    console.error('Failed to get MIDI access:', error);
    return null;
  }
}

/**
 * Get MIDI access (must call requestMidiAccess first)
 */
export function getMidiAccess(): MIDIAccess | null {
  return midiAccess;
}

/**
 * Get all available MIDI inputs
 */
export function getMidiInputs(): MIDIInput[] {
  if (!midiAccess) return [];
  return Array.from(midiAccess.inputs.values());
}

/**
 * Get all available MIDI outputs
 */
export function getMidiOutputs(): MIDIOutput[] {
  if (!midiAccess) return [];
  return Array.from(midiAccess.outputs.values());
}

/**
 * Setup listeners for all MIDI inputs
 */
function setupMidiListeners(): void {
  if (!midiAccess) return;

  midiAccess.inputs.forEach((input) => {
    const handler = createMidiHandler(input.id || 'unknown');
    input.onmidimessage = handler;
    inputHandlers.set(input.id || 'unknown', handler);
  });

  // Listen for connection changes
  midiAccess.onstatechange = (event) => {
    const port = event.port;
    if (!port) return;

    if (port.type === 'input') {
      if (port.state === 'connected') {
        const handler = createMidiHandler(port.id || 'unknown');
        (port as MIDIInput).onmidimessage = handler;
        inputHandlers.set(port.id || 'unknown', handler);
      } else if (port.state === 'disconnected') {
        inputHandlers.delete(port.id || 'unknown');
      }
    }
  };
}

/**
 * Create a MIDI message handler for an input
 */
function createMidiHandler(inputId: string) {
  return (event: MIDIMessageEvent) => {
    const data = event.data;
    if (!data || data.length < 2) return;

    const status = data[0];
    const channel = status & 0x0f;
    const messageType = status & 0xf0;

    switch (messageType) {
      case 0x90: // Note On
        if (data[2] > 0) {
          eventBus.emit(MIDI_NOTE_ON, {
            note: data[1],
            velocity: data[2],
            channel,
            inputId,
          });
        } else {
          // Note On with velocity 0 = Note Off
          eventBus.emit(MIDI_NOTE_OFF, {
            note: data[1],
            velocity: 0,
            channel,
            inputId,
          });
        }
        break;

      case 0x80: // Note Off
        eventBus.emit(MIDI_NOTE_OFF, {
          note: data[1],
          velocity: data[2],
          channel,
          inputId,
        });
        break;

      case 0xb0: // Control Change
        eventBus.emit(MIDI_CC, {
          controller: data[1],
          value: data[2],
          channel,
          inputId,
        });
        break;
    }
  };
}

/**
 * Send MIDI message to an output
 */
export function sendMidiMessage(outputId: string, message: number[]): void {
  if (!midiAccess) return;

  const output = midiAccess.outputs.get(outputId);
  if (output) {
    output.send(message);
  }
}

/**
 * Send Note On message
 */
export function sendNoteOn(
  outputId: string,
  note: number,
  velocity: number = 127,
  channel: number = 0
): void {
  sendMidiMessage(outputId, [0x90 | channel, note, velocity]);
}

/**
 * Send Note Off message
 */
export function sendNoteOff(
  outputId: string,
  note: number,
  velocity: number = 0,
  channel: number = 0
): void {
  sendMidiMessage(outputId, [0x80 | channel, note, velocity]);
}

/**
 * Send Control Change message
 */
export function sendCC(
  outputId: string,
  controller: number,
  value: number,
  channel: number = 0
): void {
  sendMidiMessage(outputId, [0xb0 | channel, controller, value]);
}

/**
 * Convert MIDI note number to note name
 */
export function midiNoteToName(note: number): string {
  const noteNames = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ];
  const octave = Math.floor(note / 12) - 1;
  const noteName = noteNames[note % 12];
  return `${noteName}${octave}`;
}

/**
 * Convert note name to MIDI note number
 */
export function noteNameToMidi(name: string): number {
  const noteNames: Record<string, number> = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
  };

  const match = name.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!match) return -1;

  const noteName = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const octave = parseInt(match[2], 10);
  const noteNum = noteNames[noteName];

  if (noteNum === undefined) return -1;

  return (octave + 1) * 12 + noteNum;
}

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidi(frequency: number, a4: number = 440): number {
  return Math.round(12 * Math.log2(frequency / a4) + 69);
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(note: number, a4: number = 440): number {
  return a4 * Math.pow(2, (note - 69) / 12);
}
