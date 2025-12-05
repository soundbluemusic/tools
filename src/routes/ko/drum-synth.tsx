// Korean drum-synth page - reuses the same DrumSynthPage component
import type { RouteDefinition } from '@solidjs/router';
import DrumSynthPage from '../drum-synth';

export const route: RouteDefinition = {
  preload: () => {
    import('../../apps/drum-synth/components/DrumSynth');
  },
};

export default DrumSynthPage;
