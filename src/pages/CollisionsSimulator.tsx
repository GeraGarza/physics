import { useEffect, useRef, useState } from 'react';
import { Box, Container, Stack } from '@mantine/core';
import { SimulationControls } from '../components';
import { Simulation } from '../types/simulation';
import p5 from 'p5';

interface P5Instance extends p5 {
  remove: () => void;
}

export function CollisionsSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const checkIntervalRef = useRef<number>();
  const p5InstanceRef = useRef<P5Instance | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up any existing p5 instances and canvases
    const cleanup = () => {
      // Clear check interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = undefined;
      }

      // Remove all canvas containers
      const existingCanvases = document.querySelectorAll('#canvas-container');
      existingCanvases.forEach(canvas => canvas.remove());

      // Remove all p5 canvases
      const p5Canvases = document.querySelectorAll('canvas');
      p5Canvases.forEach(canvas => canvas.remove());

      // Clean up existing p5 instance
      if (p5InstanceRef.current && typeof p5InstanceRef.current.remove === 'function') {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }

      // Reset simulation
      if (window.simulation) {
        window.simulation = null;
        setSimulation(null);
      }
    };

    // Clean up existing instances
    cleanup();

    // Wait for scripts to load
    const initSimulation = () => {
      if (!window.p5 || !window.Simulation) {
        setTimeout(initSimulation, 100);
        return;
      }

      // Create canvas container if it doesn't exist
      let canvasContainer = document.getElementById('canvas-container');
      if (!canvasContainer) {
        canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvas-container';
        container.appendChild(canvasContainer);
      }

      // Reset simulation-related globals
      window.digits = 1;
      window.enableSound = false;

      // Create new p5 instance
      if (!p5InstanceRef.current) {
        p5InstanceRef.current = new window.p5((p: p5) => {
          p.setup = function() {
            console.log('Setting up simulation...');
            const canvas = p.createCanvas(1000, 400);
            canvas.parent('canvas-container');
            p.frameRate(60);

            // Initialize simulation
            window.simulation = new window.Simulation();
            window.simulation.init(window.digits);
          };

          let lastTime = 0;
          const fixedTimeStep = 1/60;

          p.draw = function() {
            if (!window.simulation) return;
            
            // Calculate delta time
            const currentTime = p.millis();
            const dt = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            // Clear with slight transparency for motion blur effect
            p.background(255, 20);

            // Update and draw simulation
            if (window.simulation.isRunning) {
              // Apply time scale to the physics steps
              const scaledDt = dt * window.simulation.timeScale;
              const physicsSteps = Math.ceil(scaledDt / fixedTimeStep);
              for (let i = 0; i < physicsSteps; i++) {
                window.simulation.update(fixedTimeStep);
              }
            }
            window.simulation.draw(p);
          };

          p.mousePressed = function() {
            if (window.simulation && 
                p.mouseX >= 0 && p.mouseX <= p.width && 
                p.mouseY >= 0 && p.mouseY <= p.height) {
              window.simulation.handleClick(p.mouseX, p.mouseY);
            }
          };
        }) as P5Instance;

        // Wait for simulation to be ready
        const checkSimulation = setInterval(() => {
          if (window.simulation) {
            setSimulation(window.simulation);
            clearInterval(checkSimulation);
          }
        }, 100);
        checkIntervalRef.current = checkSimulation;
      }
    };

    initSimulation();

    return cleanup;
  }, []);

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Box 
          ref={containerRef} 
          style={{ 
            width: '100%',
            backgroundColor: 'transparent'
          }} 
        />
        {simulation && <SimulationControls simulation={simulation} />}
      </Stack>
    </Container>
  );
} 