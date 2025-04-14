import { create } from 'zustand';

interface NewtonsCradleState {
  numBalls: number;
  ballRadius: number;
  stringLength: number;
  friction: number;
  restitution: number;
  isPaused: boolean;
  resetCounter: number;  // Use a counter to trigger resets
  setNumBalls: (value: number) => void;
  setBallRadius: (value: number) => void;
  setStringLength: (value: number) => void;
  setFriction: (value: number) => void;
  setRestitution: (value: number) => void;
  togglePause: () => void;
  reset: () => void;
}

export const useNewtonsCradleStore = create<NewtonsCradleState>((set) => ({
  numBalls: 5,
  ballRadius: 20,
  stringLength: 200,
  friction: 0.5,
  restitution: 0.9,
  isPaused: false,
  resetCounter: 0,

  setNumBalls: (value) => set({ numBalls: value }),
  setBallRadius: (value) => set({ ballRadius: value }),
  setStringLength: (value) => set({ stringLength: value }),
  setFriction: (value) => set({ friction: value }),
  setRestitution: (value) => set({ restitution: value }),
  
  togglePause: () => set((state) => {
    console.log('Store: Toggling pause state from', state.isPaused, 'to', !state.isPaused);
    return { isPaused: !state.isPaused };
  }),
  
  reset: () => set((state) => {
    console.log('Store: Triggering reset, counter:', state.resetCounter + 1);
    return {
      resetCounter: state.resetCounter + 1,
      isPaused: false
    };
  }),
})); 