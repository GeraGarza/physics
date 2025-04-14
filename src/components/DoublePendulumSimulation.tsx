import { useEffect, useRef, useMemo } from 'react';
import p5 from 'p5';
import { DoublePendulum } from '../types/doublePendulum';
import { DoublePendulum as DoublePendulumImpl } from '../physics/doublePendulum';
import { EnergyGraph } from './EnergyGraph';
import { Paper, Stack, Box, Group, Title, Container } from '@mantine/core';
import { simulationTheme } from '../theme/simulationTheme';

interface DoublePendulumSimulationProps {
  pendulums: DoublePendulum[];
  onVisualizationChange: (pendulum: DoublePendulum) => void;
}

export function DoublePendulumSimulation({ pendulums, onVisualizationChange }: DoublePendulumSimulationProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(1000, 600);
        canvas.parent(canvasRef.current!);
        p.frameRate(60);
      };

      p.draw = () => {
        const currentTime = performance.now();
        const dt = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;

        p.clear();
        p.background(simulationTheme.background);

        // Draw from center
        const centerX = p.width / 2;
        const centerY = p.height / 2;  // Use true center

        // Update all pendulums first
        pendulums.forEach(pendulum => {
          if (pendulum.isRunning) {
            const fixedDt = 1/60;
            const steps = Math.ceil(dt * pendulum.timeScale / fixedDt);
            for (let i = 0; i < steps; i++) {
              pendulum.update(fixedDt);
            }
          }
        });

        // Then draw all pendulums
        p.push();  // Save the current transformation state
        p.translate(centerX, centerY);  // Move to center once
        
        pendulums.forEach((pendulum, index) => {
          // Generate vibrant colors with good saturation and brightness
          const hue = (index * (360 / Math.max(9, pendulums.length))) % 360;
          const saturation = 80;  // Increased from 70
          const lightness = 50;   // Keep at 50 for good visibility
          const alpha = 0.7;      // Keep some transparency
          
          const color = p.color(`hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
          pendulum.draw(p, color);
        });
        
        p.pop();  // Restore the transformation state
      };
    };

    // Only create p5 instance once
    if (!p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch);
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [pendulums]);

  return (
    <Container size="xl" style={{ maxWidth: '1400px' }}>
      <Stack gap="xl" align="center">
        <Box 
          style={{ 
            width: '100%',
            maxWidth: '1000px',
            height: '600px',
            backgroundColor: 'transparent',
            position: 'relative'
          }}
        >
          <Paper 
            withBorder 
            shadow="md"
            style={{ 
              width: '100%',
              height: '100%',
              backgroundColor: simulationTheme.background,
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <div 
              ref={canvasRef} 
              style={{ 
                width: '100%',
                height: '100%'
              }}
            />
          </Paper>
        </Box>

        {pendulums[0].showEnergy && (
          <Paper 
            withBorder 
            shadow="md" 
            style={{
              width: '100%',
              maxWidth: '1400px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <Box p="md" style={{ borderBottom: '1px solid #eee' }}>
              <Title order={2} size="h3">Energy Analysis</Title>
            </Box>
            <Box p="md" style={{ height: '400px' }}>
              <EnergyGraph 
                simulation={pendulums[0]} 
                key={`${pendulums[0].isRunning}-${pendulums[0].showEnergy}`} 
              />
            </Box>
          </Paper>
        )}
      </Stack>
    </Container>
  );
} 