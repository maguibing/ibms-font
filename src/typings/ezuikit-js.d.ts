declare module 'ezuikit-js' {
  interface EZUIKitPlayerOptions {
    id: string;
    accessToken: string;
    url: string;
    width?: string | number;
    height?: string | number;
    template?: string;
    scaleMode?: number;
    handleError?: (error: unknown) => void;
    [key: string]: unknown;
  }

  export class EZUIKitPlayer {
    constructor(options: EZUIKitPlayerOptions);
    stop?: () => void;
    destroy?: () => void;
    resize?: (width: string | number, height: string | number) => void;
  }
}
