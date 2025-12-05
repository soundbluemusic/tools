// Korean drum-tool page - reuses the same DrumToolPage component
import type { RouteDefinition } from '@solidjs/router';
import DrumToolPage from '../drum-tool';

export const route: RouteDefinition = {
  preload: () => {
    import('../../apps/drum-tool/components/DrumTool');
  },
};

export default DrumToolPage;
