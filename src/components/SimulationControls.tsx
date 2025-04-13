import { Group, Button, Switch, Stack, Slider, Text, Paper } from '@mantine/core';
import { Simulation } from '../types/simulation';
import { useState, useEffect } from 'react';

interface SimulationControlsProps {
  simulation: Simulation;
}

export function SimulationControls({ simulation }: SimulationControlsProps) {
  const [masses, setMasses] = useState(simulation.currentMasses);
  const [isRunning, setIsRunning] = useState(simulation.isRunning);

  // Update state when simulation changes
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setMasses([...simulation.currentMasses]);
      setIsRunning(simulation.isRunning);
    }, 100);

    return () => clearInterval(updateInterval);
  }, [simulation]);

  const handleMassChange = (blockIndex: number, category: string) => {
    simulation.setMassCategory(blockIndex, category);
    setMasses([...simulation.currentMasses]);
  };

  const LabelWithDesc = ({ label, description, color }: { label: string, description: string, color?: string }) => (
    <Group gap={10} wrap="nowrap">
      <Text fw={500} c={color} style={{ lineHeight: 1.3, fontSize: '1.2rem', whiteSpace: 'nowrap' }}>{label}:</Text>
      <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
        {description}
      </Text>
    </Group>
  );

  return (
    <Stack mt="xl" gap="xl">
      <Group justify="center" gap="md">
        <Button
          variant="filled"
          color={isRunning ? "red" : "blue"}
          onClick={() => {
            if (isRunning) {
              simulation.stop();
            } else {
              simulation.start();
            }
            setIsRunning(!isRunning);
          }}
          size="lg"
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button
          variant="light"
          onClick={() => {
            simulation.reset();
            setIsRunning(false);
            setMasses([...simulation.currentMasses]);
          }}
          size="lg"
        >
          Reset
        </Button>
      </Group>

      <Group grow align="stretch">
        <Paper withBorder p="xl" style={{ flex: 1 }}>
          <Stack gap="xl">
            <Text fw={600} size="lg">Simulation Controls</Text>
            
            <Stack gap="xl">
              <Stack gap="md">
                <LabelWithDesc 
                  label="Speed"
                  description="Adjust the initial velocity of the moving block"
                />
                <Slider
                  defaultValue={50}
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  onChange={(value) => simulation.setSpeed(value)}
                />
              </Stack>
              <hr style={{ 
                border: 'none',
                borderTop: '1px solid var(--mantine-color-dark-4)',
                margin: 'var(--mantine-spacing-sm) 0'
              }} />

              <Stack gap="md">
                <LabelWithDesc 
                  label="Time Scale"
                  description="Control the simulation speed. 0x pauses, 1x is normal speed, higher values speed up time"
                />
                <Slider
                  defaultValue={1}
                  min={0}
                  max={12}
                  marks={[
                    { value: 0, label: '0x' },
                    { value: 1, label: '1x' },
                    { value: 5, label: '5x' },
                    { value: 10, label: '10x' },
                    { value: 11, label: '100x' },
                    { value: 12, label: '1000x' }
                  ]}
                  onChange={(value) => {
                    // Convert slider value to actual time scale
                    let timeScale = value;
                    if (value === 11) timeScale = 100;
                    if (value === 12) timeScale = 1000;
                    simulation.setTimeScale(timeScale);
                  }}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Sound Effects"
                  description="Play a sound when blocks collide"
                />
                <Switch
                  onChange={(event) => {
                    window.enableSound = event.currentTarget.checked;
                  }}
                  size="md"
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper withBorder p="xl" style={{ flex: 1 }}>
          <Stack gap="xl">
            <Text fw={600} size="lg">Mass Controls</Text>
            
            <Stack gap="xl">
              <Stack gap="md">
                <LabelWithDesc 
                  label="Blue Block (Stationary)"
                  description="Select the mass of the stationary block"
                  color="blue"
                />
                <Group grow>
                  {Object.entries(simulation.massCategories).map(([category, mass]) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={masses[0] === mass ? "filled" : "light"}
                      onClick={() => handleMassChange(0, category)}
                    >
                      {category}
                    </Button>
                  ))}
                </Group>
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Red Block (Moving)"
                  description="Select the mass of the moving block"
                  color="red"
                />
                <Group grow>
                  {Object.entries(simulation.massCategories).map(([category, mass]) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={masses[1] === mass ? "filled" : "light"}
                      onClick={() => handleMassChange(1, category)}
                    >
                      {category}
                    </Button>
                  ))}
                </Group>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Group>
    </Stack>
  );
} 