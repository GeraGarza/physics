import { useEffect, useRef, useState, useCallback } from 'react';
import p5 from 'p5';
import { DoublePendulum } from '../types/doublePendulum';
import { DoublePendulum as DoublePendulumImpl } from '../physics/doublePendulum';
import { Paper, Text } from '@mantine/core';
import { simulationTheme } from '../theme/simulationTheme';

interface EnergyGraphProps {
  simulation: DoublePendulum;
}

export function EnergyGraph({ simulation }: EnergyGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    values: { total: number; kinetic: number; potential: number };
  } | null>(null);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !p5InstanceRef.current) return;
    
    const parentWidth = canvasRef.current.clientWidth;
    const parentHeight = canvasRef.current.clientHeight;
    
    // Only resize if dimensions have changed
    if (dimensionsRef.current?.width !== parentWidth || 
        dimensionsRef.current?.height !== parentHeight) {
      p5InstanceRef.current.resizeCanvas(parentWidth, parentHeight);
      dimensionsRef.current = { width: parentWidth, height: parentHeight };
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      const margin = { top: 40, right: 100, bottom: 50, left: 80 };
      let graphWidth: number;
      let graphHeight: number;
      let maxEnergy = 0;
      let minEnergy = 0;
      const displayPoints = 300;
      let resizeTimeout: number;

      p.setup = () => {
        const parentWidth = canvasRef.current?.clientWidth || 1400;
        const parentHeight = canvasRef.current?.clientHeight || 400;
        const canvas = p.createCanvas(parentWidth, parentHeight);
        canvas.parent(canvasRef.current!);
        dimensionsRef.current = { width: parentWidth, height: parentHeight };
        p.frameRate(30);

        // Add resize listener
        window.addEventListener('resize', () => {
          // Debounce resize
          if (resizeTimeout) window.clearTimeout(resizeTimeout);
          resizeTimeout = window.setTimeout(handleResize, 100);
        });
      };

      const drawGrid = () => {
        p.stroke(simulationTheme.grid);
        p.strokeWeight(1);

        // Vertical grid lines
        const timeStep = graphWidth / 20;
        for (let x = margin.left; x <= graphWidth + margin.left; x += timeStep) {
          p.line(x, margin.top, x, graphHeight + margin.top);
        }

        // Horizontal grid lines
        const energyStep = graphHeight / 8;
        for (let y = margin.top; y <= graphHeight + margin.top; y += energyStep) {
          p.line(margin.left, y, graphWidth + margin.left, y);
        }
      };

      const drawAxes = () => {
        p.stroke(simulationTheme.axis);
        p.strokeWeight(2);
        
        // X-axis
        p.line(margin.left, graphHeight + margin.top, graphWidth + margin.left, graphHeight + margin.top);
        
        // Y-axis
        p.line(margin.left, margin.top, margin.left, graphHeight + margin.top);

        // Axis labels
        p.noStroke();
        p.fill(simulationTheme.text);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(14);

        // X-axis ticks and labels
        const timeStep = graphWidth / 20;
        for (let x = margin.left; x <= graphWidth + margin.left; x += timeStep) {
          const time = ((x - margin.left) / graphWidth * Math.min(simulation.energyHistory.length, displayPoints)) / 60;
          if (Math.round(time * 10) % 20 === 0) {
            p.text(time.toFixed(1), x, graphHeight + margin.top + 25);
          }
        }
        p.textSize(16);
        p.text('Time (s)', graphWidth/2 + margin.left, graphHeight + margin.top + 45);

        // Y-axis ticks and labels
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(14);
        const energyStep = graphHeight / 8;
        for (let y = margin.top; y <= graphHeight + margin.top; y += energyStep) {
          const energy = maxEnergy - ((y - margin.top) / graphHeight) * (maxEnergy - minEnergy);
          p.text(energy.toFixed(1), margin.left - 15, y);
        }
        p.push();
        p.translate(margin.left - 55, graphHeight/2 + margin.top);
        p.rotate(-p.HALF_PI);
        p.textSize(16);
        p.text('Energy (J)', 0, 0);
        p.pop();
      };

      const drawLegend = () => {
        const legendX = graphWidth + margin.left - 80;
        const legendY = margin.top;
        const legendSpacing = 25;

        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(14);
        p.noStroke();

        // Total Energy
        p.fill(simulationTheme.energy.total);
        p.rect(legendX - 25, legendY, 20, 3);
        p.fill(simulationTheme.text);
        p.text('Total', legendX, legendY);

        // Kinetic Energy
        p.fill(simulationTheme.energy.kinetic);
        p.rect(legendX - 25, legendY + legendSpacing, 20, 3);
        p.fill(simulationTheme.text);
        p.text('Kinetic', legendX, legendY + legendSpacing);

        // Potential Energy
        p.fill(simulationTheme.energy.potential);
        p.rect(legendX - 25, legendY + 2 * legendSpacing, 20, 3);
        p.fill(simulationTheme.text);
        p.text('Potential', legendX, legendY + 2 * legendSpacing);
      };

      p.draw = () => {
        // Ensure canvas dimensions are maintained
        if (canvasRef.current && 
            (p.width !== canvasRef.current.clientWidth || 
             p.height !== canvasRef.current.clientHeight)) {
          handleResize();
        }

        p.clear();
        p.background(simulationTheme.background);

        if (!simulation.energyHistory || simulation.energyHistory.length < 2) {
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(18);
          p.fill(simulationTheme.text);
          p.text('No energy data available', p.width/2, p.height/2);
          return;
        }

        graphWidth = p.width - margin.left - margin.right;
        graphHeight = p.height - margin.top - margin.bottom;

        // Calculate visible data range
        const startIdx = Math.max(0, simulation.energyHistory.length - displayPoints);
        const visibleData = simulation.energyHistory.slice(startIdx);

        // Calculate energy bounds with 15% padding
        maxEnergy = -Infinity;
        minEnergy = Infinity;
        visibleData.forEach(point => {
          const total = point.kineticEnergy + point.potentialEnergy;
          maxEnergy = Math.max(maxEnergy, total, point.kineticEnergy, point.potentialEnergy);
          minEnergy = Math.min(minEnergy, total, point.kineticEnergy, point.potentialEnergy);
        });

        // Ensure we have valid energy bounds
        if (maxEnergy === -Infinity || minEnergy === Infinity || maxEnergy === minEnergy) {
          maxEnergy = 100;
          minEnergy = -100;
        }

        // Add padding to the energy range
        const energyRange = Math.max(1, maxEnergy - minEnergy); // Prevent zero range
        maxEnergy += energyRange * 0.15;
        minEnergy -= energyRange * 0.15;

        drawGrid();
        drawAxes();

        // Draw energy curves
        if (visibleData.length >= 2) {
          const timeStep = graphWidth / (visibleData.length - 1);

          // Helper function to draw a curve
          const drawCurve = (getEnergy: (point: any) => number, color: string) => {
            p.stroke(color);
            p.strokeWeight(3);
            p.noFill();
            p.beginShape();
            visibleData.forEach((point, i) => {
              const x = margin.left + i * timeStep;
              const y = margin.top + graphHeight * (1 - (getEnergy(point) - minEnergy) / (maxEnergy - minEnergy));
              p.vertex(x, y);
            });
            p.endShape();
          };

          // Draw curves in order: potential, kinetic, total (on top)
          drawCurve(
            point => point.potentialEnergy,
            simulationTheme.energy.potential
          );
          drawCurve(
            point => point.kineticEnergy,
            simulationTheme.energy.kinetic
          );
          drawCurve(
            point => point.kineticEnergy + point.potentialEnergy,
            simulationTheme.energy.total
          );
        }

        drawLegend();

        // Handle hover
        if (
          p.mouseX > margin.left &&
          p.mouseX < graphWidth + margin.left &&
          p.mouseY > margin.top &&
          p.mouseY < graphHeight + margin.top
        ) {
          const relativeX = p.mouseX - margin.left;
          const index = Math.floor((relativeX / graphWidth) * (visibleData.length - 1));
          if (index >= 0 && index < visibleData.length) {
            const point = visibleData[index];
            setHoverData({
              x: p.mouseX,
              y: p.mouseY,
              values: {
                kinetic: point.kineticEnergy,
                potential: point.potentialEnergy,
                total: point.kineticEnergy + point.potentialEnergy
              }
            });
          }
        } else {
          setHoverData(null);
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        window.removeEventListener('resize', handleResize);
        p5InstanceRef.current.remove();
      }
    };
  }, [handleResize]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {hoverData && (
        <Paper
          shadow="sm"
          style={{
            position: 'absolute',
            left: Math.min(hoverData.x + 10, window.innerWidth - 150),
            top: Math.max(hoverData.y - 70, 10),
            padding: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Text size="md" fw={500} c={simulationTheme.energy.total}>Total: {hoverData.values.total.toFixed(1)} J</Text>
          <Text size="md" fw={500} c={simulationTheme.energy.kinetic}>Kinetic: {hoverData.values.kinetic.toFixed(1)} J</Text>
          <Text size="md" fw={500} c={simulationTheme.energy.potential}>Potential: {hoverData.values.potential.toFixed(1)} J</Text>
        </Paper>
      )}
    </div>
  );
} 