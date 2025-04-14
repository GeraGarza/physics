import { useEffect, useState, useCallback } from 'react';
import { Container, Stack, Group, Button, Text } from '@mantine/core';
import { DoublePendulumControls } from '../components/DoublePendulumControls';
import { DoublePendulumSimulation } from '../components/DoublePendulumSimulation';
import { DoublePendulum } from '../types/doublePendulum';
import { DoublePendulum as DoublePendulumImpl } from '../physics/doublePendulum';

export function DoublePendulumSimulator() {
  const [pendulums, setPendulums] = useState<DoublePendulum[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Force a re-render when simulation state changes
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const addPendulum = useCallback(() => {
    const pendulum = new DoublePendulumImpl();
    
    // Inherit visualization settings from existing pendulums if any exist
    if (pendulums.length > 0) {
      const firstPendulum = pendulums[0];
      pendulum.showTrail = firstPendulum.showTrail;
      pendulum.showMinimal = firstPendulum.showMinimal;
      pendulum.showEnergy = firstPendulum.showEnergy;
      pendulum.showPhaseSpace = firstPendulum.showPhaseSpace;
      pendulum.trailLength = firstPendulum.trailLength;
    }

    // Randomize initial conditions
    pendulum.initialConditions = {
      theta1: (Math.random() - 0.5) * Math.PI,
      theta2: (Math.random() - 0.5) * Math.PI,
      omega1: (Math.random() - 0.5) * 2,
      omega2: (Math.random() - 0.5) * 2
    };
    pendulum.init();
    
    // If any existing pendulum is running, start this one too
    if (pendulums.some(p => p.isRunning)) {
      pendulum.start();
    }
    setPendulums(prev => [...prev, pendulum]);
  }, [pendulums]);

  const removePendulum = useCallback(() => {
    setPendulums(prev => {
      if (prev.length <= 1) return prev;
      const newPendulums = [...prev];
      newPendulums.pop();
      return newPendulums;
    });
  }, []);

  // Methods to control all pendulums
  const startAll = useCallback(() => {
    pendulums.forEach(p => p.start());
    forceUpdate();
  }, [pendulums, forceUpdate]);

  const stopAll = useCallback(() => {
    pendulums.forEach(p => p.stop());
    forceUpdate();
  }, [pendulums, forceUpdate]);

  const resetAll = useCallback(() => {
    pendulums.forEach(p => p.reset());
    forceUpdate();
  }, [pendulums, forceUpdate]);

  useEffect(() => {
    // Initialize with one pendulum
    if (pendulums.length === 0) {
      addPendulum();
    }
  }, [addPendulum]);

  if (pendulums.length === 0) return null;

  // Sync visualization settings across all pendulums
  const syncVisualization = (pendulum: DoublePendulum) => {
    pendulums.forEach(p => {
      p.showTrail = pendulum.showTrail;
      p.showMinimal = pendulum.showMinimal;
      p.showEnergy = pendulum.showEnergy;
      p.showPhaseSpace = pendulum.showPhaseSpace;
      p.trailLength = pendulum.trailLength;
    });
    forceUpdate(); // Force update to ensure UI reflects changes
  };

  return (
    <Container size="xl">
      <Stack align="center" gap="xl">

        <DoublePendulumSimulation 
          pendulums={pendulums}
          onVisualizationChange={syncVisualization}
        />
        <DoublePendulumControls 
          simulation={pendulums[0]}
          onVisualizationChange={syncVisualization}
          onStart={startAll}
          onStop={stopAll}
          onReset={resetAll}
          onAddPendulum={addPendulum}
          onRemovePendulum={removePendulum}
          canAddPendulum={pendulums.length < 9}
          canRemovePendulum={pendulums.length > 1}
        />
      </Stack>
    </Container>
  );
} 