// Korean drum page - reuses the same Drum component
import type { RouteDefinition } from '@solidjs/router';
import Drum from '../drum';

export const route: RouteDefinition = {
  preload: () => {
    import('../../apps/drum/components/DrumMachine');
  },
};

export default Drum;
