declare global {
  interface Window {
    webkitAudioContext?: {
      new (): AudioContext;
    };
  }
}

export {};
