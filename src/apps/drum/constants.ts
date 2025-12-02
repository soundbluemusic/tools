/**
 * Drum Machine Constants (Main App)
 * Re-exports shared constants + app-specific extensions
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
} from './constants-shared';

import { createEmptyPattern, type Pattern } from './constants-shared';

// App-specific constants
export const MAX_LOOPS = 8;
export const DEFAULT_LOOP_COUNT = 1;

/**
 * Multi-loop pattern type (array of patterns)
 */
export type MultiLoopPattern = Pattern[];

/**
 * Create initial multi-loop pattern with one empty loop
 */
export function createInitialLoops(): MultiLoopPattern {
  return [createEmptyPattern()];
}
