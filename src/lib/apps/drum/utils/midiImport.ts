/**
 * MIDI Import Utility for Drum Machine
 */

import type { Pattern, Instrument } from '../constants';
import { STEPS, createEmptyPattern } from '../constants';

const NOTE_TO_INSTRUMENT: Record<number, Instrument> = {
  35: 'kick', 36: 'kick',
  38: 'snare', 40: 'snare', 37: 'snare',
  42: 'hihat', 44: 'hihat',
  46: 'openhat',
  39: 'clap', 54: 'clap',
};

const MIDI = {
  NOTE_ON: 0x90,
  NOTE_OFF: 0x80,
  DRUM_CHANNEL: 9,
} as const;

function readVLQ(data: Uint8Array, offset: number): { value: number; length: number } {
  let value = 0;
  let length = 0;
  while (offset + length < data.length) {
    const byte = data[offset + length];
    value = (value << 7) | (byte & 0x7f);
    length++;
    if ((byte & 0x80) === 0) break;
    if (length > 4) break;
  }
  return { value, length };
}

function read16(data: Uint8Array, offset: number): number {
  return (data[offset] << 8) | data[offset + 1];
}

function read32(data: Uint8Array, offset: number): number {
  return (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
}

function startsWith(data: Uint8Array, offset: number, expected: number[]): boolean {
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

export function parseMidiData(data: Uint8Array): MidiImportResult | null {
  if (!startsWith(data, 0, [0x4d, 0x54, 0x68, 0x64])) return null;

  const headerLength = read32(data, 4);
  const ticksPerBeat = read16(data, 12);
  if (ticksPerBeat === 0) return null;

  let offset = 8 + headerLength;
  const noteEvents: NoteEvent[] = [];
  let tempo = 120;

  while (offset < data.length) {
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
      const delta = readVLQ(data, trackOffset);
      trackOffset += delta.length;
      currentTick += delta.value;

      if (trackOffset >= trackEnd) break;

      let status = data[trackOffset];

      if (status < 0x80) {
        status = runningStatus;
      } else {
        trackOffset++;
        if (status < 0xf0) runningStatus = status;
      }

      const statusType = status & 0xf0;
      const channel = status & 0x0f;

      if (statusType === MIDI.NOTE_ON && trackOffset + 1 < trackEnd) {
        const note = data[trackOffset];
        const velocity = data[trackOffset + 1];
        trackOffset += 2;
        if (channel === MIDI.DRUM_CHANNEL || NOTE_TO_INSTRUMENT[note]) {
          if (velocity > 0) noteEvents.push({ tick: currentTick, note, velocity });
        }
      } else if (statusType === MIDI.NOTE_OFF && trackOffset + 1 < trackEnd) {
        trackOffset += 2;
      } else if (statusType === 0xa0 && trackOffset + 1 < trackEnd) {
        trackOffset += 2;
      } else if (statusType === 0xb0 && trackOffset + 1 < trackEnd) {
        trackOffset += 2;
      } else if (statusType === 0xc0) {
        trackOffset += 1;
      } else if (statusType === 0xd0) {
        trackOffset += 1;
      } else if (statusType === 0xe0 && trackOffset + 1 < trackEnd) {
        trackOffset += 2;
      } else if (status === 0xff && trackOffset + 1 < trackEnd) {
        const metaType = data[trackOffset];
        trackOffset++;
        const metaLength = readVLQ(data, trackOffset);
        trackOffset += metaLength.length;
        if (metaType === 0x51 && metaLength.value === 3 && trackOffset + 2 < trackEnd) {
          const microsecondsPerBeat = (data[trackOffset] << 16) | (data[trackOffset + 1] << 8) | data[trackOffset + 2];
          tempo = Math.round(60000000 / microsecondsPerBeat);
        }
        trackOffset += metaLength.value;
      } else if (status === 0xf0 || status === 0xf7) {
        const sysexLength = readVLQ(data, trackOffset);
        trackOffset += sysexLength.length + sysexLength.value;
      } else {
        break;
      }
    }
    offset = trackEnd;
  }

  if (noteEvents.length === 0) return null;

  const pattern = createEmptyPattern();
  const ticksPerStep = ticksPerBeat / 4;
  const minTick = Math.min(...noteEvents.map((e) => e.tick));

  for (const event of noteEvents) {
    const instrument = NOTE_TO_INSTRUMENT[event.note];
    if (!instrument) continue;
    const normalizedTick = event.tick - minTick;
    const step = Math.round(normalizedTick / ticksPerStep) % STEPS;
    const velocity = Math.min(100, Math.round((event.velocity / 127) * 100));
    if (velocity > pattern[instrument][step]) {
      pattern[instrument][step] = velocity;
    }
  }

  return { pattern, tempo };
}

export async function importMidiFile(file: File): Promise<MidiImportResult | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(parseMidiData(new Uint8Array(reader.result)));
      } else {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}
