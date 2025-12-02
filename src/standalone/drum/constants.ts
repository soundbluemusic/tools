/**
 * Drum Machine Constants (Standalone)
 * Re-exports shared constants + standalone-specific values
 */

// Re-export all shared constants
export {
  STEPS,
  INSTRUMENTS,
  TEMPO_RANGE,
  VOLUME_RANGE,
  VELOCITY,
  DEFAULT_VOLUMES,
  AUDIO,
  PRESETS,
  createEmptyPattern,
  copyPattern,
  type Instrument,
  type InstrumentVolumes,
  type Pattern,
} from '../../apps/drum/constants-shared';

// Standalone-specific: fewer loops for simpler UI
export const MAX_LOOPS = 4;
