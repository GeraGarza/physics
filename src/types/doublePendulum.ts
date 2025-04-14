import p5 from 'p5';

export interface DoublePendulumState {
  isRunning: boolean;
  timeScale: number;
  initialConditions: {
    theta1: number;
    theta2: number;
    omega1: number;
    omega2: number;
  };
  physicalParameters: {
    m1: number;
    m2: number;
    l1: number;
    l2: number;
    g: number;
    damping: number;
  };
  trailLength: number;
  showTrail: boolean;
  showEnergy: boolean;
  showMinimal: boolean;
  showPhaseSpace: boolean;
  energyHistory: Array<{ kineticEnergy: number; potentialEnergy: number }>;
}

export interface DoublePendulumControls {
  stop: () => void;
  start: () => void;
  reset: () => void;
  setTimeScale: (value: number) => void;
  setInitialCondition: (param: keyof DoublePendulumState['initialConditions'], value: number) => void;
  setPhysicalParameter: (param: keyof DoublePendulumState['physicalParameters'], value: number) => void;
  toggleTrail: () => void;
  togglePhaseSpace: () => void;
  toggleEnergy: () => void;
  toggleMinimal: () => void;
  setTrailLength: (value: number) => void;
}

export interface DoublePendulumPhysics {
  init: () => void;
  update: (dt: number) => void;
  draw: (p: p5, color?: p5.Color) => void;
  getCurrentState: () => {
    theta1: number;
    theta2: number;
    omega1: number;
    omega2: number;
    energy: {
      kinetic: number;
      potential: number;
      total: number;
    };
  };
}

export interface DoublePendulum extends DoublePendulumState, DoublePendulumControls, DoublePendulumPhysics {}

// Export a type for the class constructor
export type DoublePendulumClass = new () => DoublePendulum;

declare global {
  interface Window {
    doublePendulum: DoublePendulum | null;
    DoublePendulum: DoublePendulumClass;
  }
}

export {}; 