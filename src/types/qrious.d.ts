declare module 'qrious' {
  interface QRiousOptions {
    element?: HTMLCanvasElement;
    value?: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    background?: string;
    foreground?: string;
    padding?: number;
    mime?: string;
  }

  class QRious {
    constructor(options?: QRiousOptions);
    toDataURL(mime?: string): string;
    set(options: QRiousOptions): QRious;
  }

  export default QRious;
}
