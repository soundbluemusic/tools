// ========================================
// Tools Index - 모든 도구 등록
// ========================================

// Types
export * from './types';

// Registry
export * from './registry';

// Import all tools to trigger auto-registration
import './metronome';
import './tuner';
import './qr-generator';
import './world-clock';
import './piano-roll';
import './sheet-editor';
import './drum-machine';
import './drum-synth';

// Re-export tool definitions for direct access
export { metronomeTool } from './metronome';
export { tunerTool } from './tuner';
export { qrGeneratorTool } from './qr-generator';
export { worldClockTool } from './world-clock';
export { pianoRollTool } from './piano-roll';
export { sheetEditorTool } from './sheet-editor';
export { drumMachineTool } from './drum-machine';
export { drumSynthTool } from './drum-synth';
