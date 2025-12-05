// Korean QR page - reuses the same QR component
import type { RouteDefinition } from '@solidjs/router';
import QR from '../qr';

export const route: RouteDefinition = {
  preload: () => {
    import('../../apps/qr/components/QRGenerator');
  },
};

export default QR;
