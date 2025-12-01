/**
 * MIDI Export Utility for Drum Machine
 */

import type { Instrument, MultiLoopPattern } from '../constants';
import { STEPS } from '../constants';

const DRUM_NOTES: Record<Instrument, number> = {
  kick: 36,
  snare: 38,
  hihat: 42,
  openhat: 46,
  clap: 39,
};

const MIDI = {
  HEADER: [0x4d, 0x54, 0x68, 0x64],
  TRACK: [0x4d, 0x54, 0x72, 0x6b],
  FORMAT_0: 0,
  DRUM_CHANNEL: 9,
  TICKS_PER_BEAT: 480,
  NOTE_ON: 0x90,
  NOTE_OFF: 0x80,
  END_OF_TRACK: [0xff, 0x2f, 0x00],
} as const;

function writeVLQ(value: number): number[] {
  if (value === 0) return [0];
  const bytes: number[] = [];
  let v = value;
  while (v > 0) {
    bytes.unshift(v & 0x7f);
    v >>= 7;
  }
  for (let i = 0; i < bytes.length - 1; i++) {
    bytes[i] |= 0x80;
  }
  return bytes;
}

function write16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

function write32(value: number): number[] {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

function createTempoEvent(bpm: number): number[] {
  const microsecondsPerBeat = Math.round(60000000 / bpm);
  return [
    0x00, 0xff, 0x51, 0x03,
    (microsecondsPerBeat >> 16) & 0xff,
    (microsecondsPerBeat >> 8) & 0xff,
    microsecondsPerBeat & 0xff,
  ];
}

function createTimeSignatureEvent(): number[] {
  return [0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08];
}

function createTrackNameEvent(name: string): number[] {
  const nameBytes = Array.from(new TextEncoder().encode(name));
  return [0x00, 0xff, 0x03, ...writeVLQ(nameBytes.length), ...nameBytes];
}

interface MidiExportOptions {
  loops: MultiLoopPattern;
  tempo: number;
  filename?: string;
}

export function generateMidiData(options: MidiExportOptions): Uint8Array {
  const { loops, tempo } = options;
  const ticksPerStep = MIDI.TICKS_PER_BEAT / 4;
  const ticksPerLoop = STEPS * ticksPerStep;
  const noteDuration = Math.floor(ticksPerStep * 0.9);

  const trackData: number[] = [];
  trackData.push(...createTrackNameEvent('Drum Machine Pattern'));
  trackData.push(...createTimeSignatureEvent());
  trackData.push(...createTempoEvent(tempo));

  interface NoteEvent {
    tick: number;
    type: 'on' | 'off';
    note: number;
    velocity: number;
  }

  const events: NoteEvent[] = [];

  for (let loopIndex = 0; loopIndex < loops.length; loopIndex++) {
    const pattern = loops[loopIndex];
    const loopStartTick = loopIndex * ticksPerLoop;

    for (let step = 0; step < STEPS; step++) {
      const stepTick = loopStartTick + step * ticksPerStep;

      for (const instrument of Object.keys(pattern) as Instrument[]) {
        const velocity = pattern[instrument][step];
        if (velocity > 0) {
          const note = DRUM_NOTES[instrument];
          const midiVelocity = Math.min(127, Math.round((velocity / 100) * 127));

          events.push({ tick: stepTick, type: 'on', note, velocity: midiVelocity });
          events.push({ tick: stepTick + noteDuration, type: 'off', note, velocity: 0 });
        }
      }
    }
  }

  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    if (a.type !== b.type) return a.type === 'off' ? -1 : 1;
    return a.note - b.note;
  });

  let lastTick = 0;
  for (const event of events) {
    const deltaTime = event.tick - lastTick;
    lastTick = event.tick;
    trackData.push(...writeVLQ(deltaTime));
    const status = event.type === 'on'
      ? MIDI.NOTE_ON | MIDI.DRUM_CHANNEL
      : MIDI.NOTE_OFF | MIDI.DRUM_CHANNEL;
    trackData.push(status, event.note, event.velocity);
  }

  const endTick = loops.length * ticksPerLoop;
  const endDelta = endTick - lastTick;
  trackData.push(...writeVLQ(endDelta), ...MIDI.END_OF_TRACK);

  const midiData: number[] = [];
  midiData.push(...MIDI.HEADER);
  midiData.push(...write32(6));
  midiData.push(...write16(MIDI.FORMAT_0));
  midiData.push(...write16(1));
  midiData.push(...write16(MIDI.TICKS_PER_BEAT));
  midiData.push(...MIDI.TRACK);
  midiData.push(...write32(trackData.length));
  midiData.push(...trackData);

  return new Uint8Array(midiData);
}

export function exportMidi(options: MidiExportOptions): void {
  const { filename = 'drum-pattern' } = options;
  const midiData = generateMidiData(options);
  const blob = new Blob([midiData.buffer.slice(0) as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.mid`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
