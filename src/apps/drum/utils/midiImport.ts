/**
 * MIDI Import Utility for Drum Machine
 *
 * Parses Standard MIDI Files and extracts drum patterns
 */

import type { Pattern, Instrument } from '../constants';
import { STEPS, createEmptyPattern } from '../constants';

/**
 * Reverse mapping: MIDI note number to instrument
 * Includes common variations for each drum type
 */
const NOTE_TO_INSTRUMENT: Record<number, Instrument> = {
  // Kick drums
  35: 'kick', // Acoustic Bass Drum
  36: 'kick', // Bass Drum 1
  // Snare drums
  38: 'snare', // Acoustic Snare
  40: 'snare', // Electric Snare
  37: 'snare', // Side Stick (map to snare)
  // Closed hi-hat
  42: 'hihat', // Closed Hi-Hat
  44: 'hihat', // Pedal Hi-Hat
  // Open hi-hat
  46: 'openhat', // Open Hi-Hat
  // Claps and similar
  39: 'clap', // Hand Clap
  54: 'clap', // Tambourine (map to clap)
};

/**
 * MIDI constants for parsing
 */
const MIDI = {
  NOTE_ON: 0x90,
  NOTE_OFF: 0x80,
  DRUM_CHANNEL: 9,
} as const;

/**
 * Read a variable-length quantity from data
 */
function readVLQ(
  data: Uint8Array,
  offset: number
): { value: number; length: number } {
  let value = 0;
  let length = 0;

  while (offset + length < data.length) {
    const byte = data[offset + length];
    value = (value << 7) | (byte & 0x7f);
    length++;

    if ((byte & 0x80) === 0) break;
    if (length > 4) break; // Safety limit
  }

  return { value, length };
}

/**
 * Read a 16-bit big-endian value
 */
function read16(data: Uint8Array, offset: number): number {
  return (data[offset] << 8) | data[offset + 1];
}

/**
 * Read a 32-bit big-endian value
 */
function read32(data: Uint8Array, offset: number): number {
  return (
    (data[offset] << 24) |
    (data[offset + 1] << 16) |
    (data[offset + 2] << 8) |
    data[offset + 3]
  );
}

/**
 * Check if data starts with expected bytes
 */
function startsWith(
  data: Uint8Array,
  offset: number,
  expected: number[]
): boolean {
  for (let i = 0; i < expected.length; i++) {
    if (data[offset + i] !== expected[i]) return false;
  }
  return true;
}

interface MidiImportResult {
  pattern: Pattern;
  tempo: number;
}

interface NoteEvent {
  tick: number;
  note: number;
  velocity: number;
}

/**
 * Parse MIDI file data and extract drum pattern
 */
export function parseMidiData(data: Uint8Array): MidiImportResult | null {
  // Validate MIDI header "MThd"
  if (!startsWith(data, 0, [0x4d, 0x54, 0x68, 0x64])) {
    return null;
  }

  // Read header
  const headerLength = read32(data, 4);
  const ticksPerBeat = read16(data, 12);

  if (ticksPerBeat === 0) return null;

  // Find and parse tracks
  let offset = 8 + headerLength;
  const noteEvents: NoteEvent[] = [];
  let tempo = 120; // Default tempo

  while (offset < data.length) {
    // Look for track chunk "MTrk"
    if (!startsWith(data, offset, [0x4d, 0x54, 0x72, 0x6b])) {
      offset++;
      continue;
    }

    const trackLength = read32(data, offset + 4);
    const trackEnd = offset + 8 + trackLength;
    let trackOffset = offset + 8;
    let currentTick = 0;
    let runningStatus = 0;

    while (trackOffset < trackEnd) {
      // Read delta time
      const delta = readVLQ(data, trackOffset);
      trackOffset += delta.length;
      currentTick += delta.value;

      if (trackOffset >= trackEnd) break;

      let status = data[trackOffset];

      // Handle running status
      if (status < 0x80) {
        status = runningStatus;
      } else {
        trackOffset++;
        if (status < 0xf0) {
          runningStatus = status;
        }
      }

      const statusType = status & 0xf0;
      const channel = status & 0x0f;

      if (statusType === MIDI.NOTE_ON && trackOffset + 1 < trackEnd) {
        const note = data[trackOffset];
        const velocity = data[trackOffset + 1];
        trackOffset += 2;

        // Only process drum channel or if velocity > 0
        if (channel === MIDI.DRUM_CHANNEL || NOTE_TO_INSTRUMENT[note]) {
          if (velocity > 0) {
            noteEvents.push({ tick: currentTick, note, velocity });
          }
        }
      } else if (statusType === MIDI.NOTE_OFF && trackOffset + 1 < trackEnd) {
        trackOffset += 2;
      } else if (statusType === 0xa0 && trackOffset + 1 < trackEnd) {
        // Polyphonic aftertouch
        trackOffset += 2;
      } else if (statusType === 0xb0 && trackOffset + 1 < trackEnd) {
        // Control change
        trackOffset += 2;
      } else if (statusType === 0xc0) {
        // Program change
        trackOffset += 1;
      } else if (statusType === 0xd0) {
        // Channel aftertouch
        trackOffset += 1;
      } else if (statusType === 0xe0 && trackOffset + 1 < trackEnd) {
        // Pitch bend
        trackOffset += 2;
      } else if (status === 0xff && trackOffset + 1 < trackEnd) {
        // Meta event
        const metaType = data[trackOffset];
        trackOffset++;
        const metaLength = readVLQ(data, trackOffset);
        trackOffset += metaLength.length;

        if (
          metaType === 0x51 &&
          metaLength.value === 3 &&
          trackOffset + 2 < trackEnd
        ) {
          // Tempo meta event
          const microsecondsPerBeat =
            (data[trackOffset] << 16) |
            (data[trackOffset + 1] << 8) |
            data[trackOffset + 2];
          tempo = Math.round(60000000 / microsecondsPerBeat);
        }

        trackOffset += metaLength.value;
      } else if (status === 0xf0 || status === 0xf7) {
        // SysEx
        const sysexLength = readVLQ(data, trackOffset);
        trackOffset += sysexLength.length + sysexLength.value;
      } else {
        // Unknown, skip
        break;
      }
    }

    offset = trackEnd;
  }

  if (noteEvents.length === 0) return null;

  // Convert note events to pattern
  const pattern = createEmptyPattern();
  const ticksPerStep = ticksPerBeat / 4; // 16th notes

  // Find the minimum tick to normalize
  const minTick = Math.min(...noteEvents.map((e) => e.tick));

  for (const event of noteEvents) {
    const instrument = NOTE_TO_INSTRUMENT[event.note];
    if (!instrument) continue;

    // Calculate step index
    const normalizedTick = event.tick - minTick;
    const step = Math.round(normalizedTick / ticksPerStep) % STEPS;

    // Convert velocity from 0-127 to 0-100
    const velocity = Math.min(100, Math.round((event.velocity / 127) * 100));

    // Only set if velocity is higher than existing (in case of overlaps)
    if (velocity > pattern[instrument][step]) {
      pattern[instrument][step] = velocity;
    }
  }

  return { pattern, tempo };
}

/**
 * Import MIDI from File object
 */
export async function importMidiFile(
  file: File
): Promise<MidiImportResult | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        const data = new Uint8Array(reader.result);
        resolve(parseMidiData(data));
      } else {
        resolve(null);
      }
    };

    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Import MIDI from clipboard (if supported)
 */
export async function importMidiFromClipboard(): Promise<MidiImportResult | null> {
  try {
    const items = await navigator.clipboard.read();

    for (const item of items) {
      // Check for MIDI file types
      const midiTypes = ['audio/midi', 'audio/x-midi', 'application/x-midi'];

      for (const type of midiTypes) {
        if (item.types.includes(type)) {
          const blob = await item.getType(type);
          const buffer = await blob.arrayBuffer();
          return parseMidiData(new Uint8Array(buffer));
        }
      }

      // Check for generic file
      if (item.types.includes('application/octet-stream')) {
        const blob = await item.getType('application/octet-stream');
        const buffer = await blob.arrayBuffer();
        const data = new Uint8Array(buffer);

        // Verify it's a MIDI file
        if (startsWith(data, 0, [0x4d, 0x54, 0x68, 0x64])) {
          return parseMidiData(data);
        }
      }
    }
  } catch {
    // Clipboard API not supported or permission denied
  }

  return null;
}
