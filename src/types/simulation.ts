import p5 from 'p5';

export interface MassCategory {
  name: string;
  value: number;
}

export interface SimulationState {
  isRunning: boolean;
  massCategories: Record<string, number>;
  currentMasses: number[];
  timeScale: number;
}

export interface SimulationControls {
  stop: () => void;
  start: () => void;
  reset: () => void;
  setSpeed: (value: number) => void;
  setTimeScale: (value: number) => void;
  setMassCategory: (blockIndex: number, category: string) => void;
}

export interface SimulationPhysics {
  init: (digits: number) => void;
  update: (dt: number) => void;
  draw: (p: p5) => void;
  handleClick: (x: number, y: number) => void;
}

export interface Simulation extends SimulationState, SimulationControls, SimulationPhysics {}

declare global {
  interface Window {
    digits: number;
    enableSound: boolean;
    simulation: Simulation | null;
    remove: () => void; // p5.js remove function
  }
}

export {}; 