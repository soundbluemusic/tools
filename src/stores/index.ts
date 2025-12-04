/**
 * Stores barrel export
 * Central export for all Solid.js stores
 */

// Drum Machine Store
export {
  useDrumStore,
  selectLoops,
  selectCurrentPattern,
  selectIsPlaying as selectDrumIsPlaying,
  selectCurrentStep,
  selectTempo,
  selectVolumes,
  selectDisplayLoopIndex,
  type DrumStore,
  type MultiLoopPattern,
  type StatusMessage,
} from './drumStore';

// Metronome Store
export {
  useMetronomeStore,
  selectBpm,
  selectVolume,
  selectIsPlaying as selectMetronomeIsPlaying,
  selectBeat,
  selectTimeSignature,
  type MetronomeStore,
} from './metronomeStore';

// Audio Store
export {
  useAudioStore,
  selectMasterVolume,
  selectIsMuted,
  selectEffectiveVolume,
  type AudioStore,
} from './audioStore';
