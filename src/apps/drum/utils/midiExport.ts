/**
 * MIDI Export Utility for Drum Machine
 *
 * Generates Standard MIDI File (SMF) format 0 from drum patterns
 */

import type { Instrument, MultiLoopPattern } from '../constants';
import { STEPS } from '../constants';

/**
 * General MIDI drum note mapping
 */
const DRUM_NOTES: Record<Instrument, number> = {
  kick: 36, // C1 - Bass Drum 1
  snare: 38, // D1 - Acoustic Snare
  hihat: 42, // F#1 - Closed Hi-Hat
  openhat: 46, // A#1 - Open Hi-Hat
  clap: 39, // D#1 - Hand Clap
};

/**
 * MIDI constants
 */
const MIDI = {
  HEADER: [0x4d, 0x54, 0x68, 0x64], // "MThd"
  TRACK: [0x4d, 0x54, 0x72, 0x6b], // "MTrk"
  FORMAT_0: 0,
  DRUM_CHANNEL: 9, // Channel 10 (0-indexed)
  TICKS_PER_BEAT: 480, // Standard resolution
  NOTE_ON: 0x90,
  NOTE_OFF: 0x80,
  END_OF_TRACK: [0xff, 0x2f, 0x00],
  TEMPO_META: 0xff51,
} as const;

/**
 * Write a variable-length quantity (VLQ)
 */
function writeVLQ(value: number): number[] {
  if (value === 0) return [0];

  const bytes: number[] = [];
  let v = value;

  while (v > 0) {
    bytes.unshift(v & 0x7f);
    v >>= 7;
  }

  // Set continuation bit on all but last byte
  for (let i = 0; i < bytes.length - 1; i++) {
    bytes[i] |= 0x80;
  }

  return bytes;
}

/**
 * Write a 16-bit big-endian value
 */
function write16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

/**
 * Write a 32-bit big-endian value
 */
function write32(value: number): number[] {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

/**
 * Create tempo meta event
 * Tempo is in microseconds per beat
 */
function createTempoEvent(bpm: number): number[] {
  const microsecondsPerBeat = Math.round(60000000 / bpm);
  return [
    0x00, // Delta time
    0xff,
    0x51,
    0x03, // Tempo meta event
    (microsecondsPerBeat >> 16) & 0xff,
    (microsecondsPerBeat >> 8) & 0xff,
    microsecondsPerBeat & 0xff,
  ];
}

/**
 * Create time signature meta event (4/4)
 */
function createTimeSignatureEvent(): number[] {
  return [
    0x00, // Delta time
    0xff,
    0x58,
    0x04, // Time signature meta event
    0x04, // Numerator (4)
    0x02, // Denominator (2^2 = 4)
    0x18, // MIDI clocks per metronome click (24)
    0x08, // 32nd notes per quarter note (8)
  ];
}

/**
 * Create track name meta event
 */
function createTrackNameEvent(name: string): number[] {
  const nameBytes = Array.from(new TextEncoder().encode(name));
  return [
    0x00, // Delta time
    0xff,
    0x03, // Track name meta event
    ...writeVLQ(nameBytes.length),
    ...nameBytes,
  ];
}

interface MidiExportOptions {
  loops: MultiLoopPattern;
  tempo: number;
  filename?: string;
}

/**
 * Generate MIDI file data from drum patterns (multiple loops)
 */
export function generateMidiData(options: MidiExportOptions): Uint8Array {
  const { loops, tempo } = options;

  // Calculate ticks per step (16th note = 1/4 of a beat)
  const ticksPerStep = MIDI.TICKS_PER_BEAT / 4;
  const ticksPerLoop = STEPS * ticksPerStep;

  // Note duration (slightly less than step duration for separation)
  const noteDuration = Math.floor(ticksPerStep * 0.9);

  // Build track data
  const trackData: number[] = [];

  // Add meta events at the start
  trackData.push(...createTrackNameEvent('Drum Machine Pattern'));
  trackData.push(...createTimeSignatureEvent());
  trackData.push(...createTempoEvent(tempo));

  // Collect all note events
  interface NoteEvent {
    tick: number;
    type: 'on' | 'off';
    note: number;
    velocity: number;
  }

  const events: NoteEvent[] = [];

  // Generate note events for each loop and step
  for (let loopIndex = 0; loopIndex < loops.length; loopIndex++) {
    const pattern = loops[loopIndex];
    const loopStartTick = loopIndex * ticksPerLoop;

    for (let step = 0; step < STEPS; step++) {
      const stepTick = loopStartTick + step * ticksPerStep;

      for (const instrument of Object.keys(pattern) as Instrument[]) {
        const velocity = pattern[instrument][step];
        if (velocity > 0) {
          const note = DRUM_NOTES[instrument];
          // Scale velocity from 0-100 to 0-127
          const midiVelocity = Math.min(127, Math.round((velocity / 100) * 127));

          events.push({
            tick: stepTick,
            type: 'on',
            note,
            velocity: midiVelocity,
          });

          events.push({
            tick: stepTick + noteDuration,
            type: 'off',
            note,
            velocity: 0,
          });
        }
      }
    }
  }

  // Sort events by tick, then by type (note-off before note-on at same tick)
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    if (a.type !== b.type) return a.type === 'off' ? -1 : 1;
    return a.note - b.note;
  });

  // Convert events to MIDI bytes with delta times
  let lastTick = 0;
  for (const event of events) {
    const deltaTime = event.tick - lastTick;
    lastTick = event.tick;

    trackData.push(...writeVLQ(deltaTime));

    const status =
      event.type === 'on'
        ? MIDI.NOTE_ON | MIDI.DRUM_CHANNEL
        : MIDI.NOTE_OFF | MIDI.DRUM_CHANNEL;

    trackData.push(status, event.note, event.velocity);
  }

  // Add end of track event
  // Delta time to make the pattern exactly N bars (N loops * 16 steps)
  const endTick = loops.length * ticksPerLoop;
  const endDelta = endTick - lastTick;
  trackData.push(...writeVLQ(endDelta), ...MIDI.END_OF_TRACK);

  // Build complete MIDI file
  const midiData: number[] = [];

  // Header chunk
  midiData.push(...MIDI.HEADER);
  midiData.push(...write32(6)); // Header length
  midiData.push(...write16(MIDI.FORMAT_0)); // Format 0
  midiData.push(...write16(1)); // 1 track
  midiData.push(...write16(MIDI.TICKS_PER_BEAT)); // Ticks per beat

  // Track chunk
  midiData.push(...MIDI.TRACK);
  midiData.push(...write32(trackData.length));
  midiData.push(...trackData);

  return new Uint8Array(midiData);
}

/**
 * Export drum pattern as MIDI file download
 */
export function exportMidi(options: MidiExportOptions): void {
  const { filename = 'drum-pattern' } = options;
  const midiData = generateMidiData(options);

  // Create blob and download
  const blob = new Blob([midiData.buffer.slice(0) as ArrayBuffer], {
    type: 'audio/midi',
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.mid`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}
