// Korean metronome page - reuses the same Metronome component
import type { RouteDefinition } from '@solidjs/router';
import Metronome from '../metronome';

export const route: RouteDefinition = {
  preload: () => {
    import('../../apps/metronome/components/MetronomePlayer');
  },
};

export default Metronome;
