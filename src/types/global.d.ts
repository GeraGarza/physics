export {};

declare global {
  interface Window {
    digits: number;
    enableSound: boolean;
    simulation: import('./simulation').Simulation | null;
    remove: () => void; // p5.js remove function
    p5: any; // p5.js constructor
    Simulation: new () => import('./simulation').Simulation; // Simulation constructor
  }
} 