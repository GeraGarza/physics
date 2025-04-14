import { Group, Button, Switch, Stack, Slider, Text, Paper, NumberInput } from '@mantine/core';
import { DoublePendulum } from '../types/doublePendulum';
import { DoublePendulum as DoublePendulumImpl } from '../physics/doublePendulum';
import { useState, useEffect } from 'react';

interface DoublePendulumControlsProps {
  simulation: DoublePendulum;
  onVisualizationChange: (pendulum: DoublePendulum) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onAddPendulum: () => void;
  onRemovePendulum: () => void;
  canAddPendulum: boolean;
  canRemovePendulum: boolean;
}

export function DoublePendulumControls({ 
  simulation, 
  onVisualizationChange,
  onStart,
  onStop,
  onReset,
  onAddPendulum,
  onRemovePendulum,
  canAddPendulum,
  canRemovePendulum
}: DoublePendulumControlsProps) {
  // Track all control states locally
  const [timeScale, setTimeScale] = useState(simulation.timeScale);
  const [trailLength, setTrailLength] = useState(simulation.trailLength);
  const [showTrail, setShowTrail] = useState(simulation.showTrail);
  const [showMinimal, setShowMinimal] = useState(simulation.showMinimal);
  const [showPhaseSpace, setShowPhaseSpace] = useState(simulation.showPhaseSpace);
  const [showEnergy, setShowEnergy] = useState(simulation.showEnergy);
  const [damping, setDamping] = useState(simulation.physicalParameters.damping);
  const [initialConditions, setInitialConditions] = useState(simulation.initialConditions);
  const [physicalParameters, setPhysicalParameters] = useState(simulation.physicalParameters);
  const [state, setState] = useState(simulation.getCurrentState());
  const [isRunning, setIsRunning] = useState(simulation.isRunning);

  // Update state when simulation changes
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setState(simulation.getCurrentState());
      setIsRunning(simulation.isRunning);
      setTimeScale(simulation.timeScale);
      setTrailLength(simulation.trailLength);
      setShowTrail(simulation.showTrail);
      setShowMinimal(simulation.showMinimal);
      setShowPhaseSpace(simulation.showPhaseSpace);
      setShowEnergy(simulation.showEnergy);
      setDamping(simulation.physicalParameters.damping);
      setInitialConditions(simulation.initialConditions);
      setPhysicalParameters(simulation.physicalParameters);
    }, 100);

    return () => clearInterval(updateInterval);
  }, [simulation]);

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
              onStop();
            } else {
              onStart();
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
            onReset();
            setIsRunning(false);
            setState(simulation.getCurrentState());
          }}
          size="lg"
        >
          Reset
        </Button>
        <Button
          variant="light"
          onClick={onAddPendulum}
          disabled={!canAddPendulum}
          size="lg"
        >
          Add Pendulum
        </Button>
        <Button
          variant="light"
          onClick={onRemovePendulum}
          disabled={!canRemovePendulum}
          size="lg"
        >
          Remove Pendulum
        </Button>
      </Group>

      {/* Visualization Options */}
      <Paper withBorder p="xl">
        <Stack gap="xl">
          <Text fw={600} size="lg">Visualization Options</Text>
          
          <Stack gap="xl">
            <Stack gap="md">
              <LabelWithDesc 
                label="Time Scale"
                description="Control the simulation speed. 0 pauses, 1 is normal speed, higher values speed up time"
              />
              <Slider
                value={timeScale}
                onChange={(value) => {
                  setTimeScale(value);
                  simulation.setTimeScale(value);
                }}
                min={0}
                max={10}
                step={0.1}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1, label: '1' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' }
                ]}
                label={(value) => value.toFixed(1)}
              />
            </Stack>

            <Group grow>
              <Stack gap="md">
                <LabelWithDesc 
                  label="Show Trail"
                  description="Display the path of the second pendulum bob"
                />
                <Switch
                  checked={showTrail}
                  onChange={(event) => {
                    setShowTrail(event.currentTarget.checked);
                    simulation.toggleTrail();
                    onVisualizationChange(simulation);
                  }}
                  size="md"
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Minimal View"
                  description="Show only the pendulum bobs without arms"
                />
                <Switch
                  checked={showMinimal}
                  onChange={(event) => {
                    setShowMinimal(event.currentTarget.checked);
                    simulation.toggleMinimal();
                    onVisualizationChange(simulation);
                  }}
                  size="md"
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Show Energy"
                  description="Display the total energy of the system"
                />
                <Switch
                  checked={showEnergy}
                  onChange={(event) => {
                    setShowEnergy(event.currentTarget.checked);
                    simulation.toggleEnergy();
                    onVisualizationChange(simulation);
                  }}
                  size="md"
                />
              </Stack>
            </Group>

            {showTrail && (
              <Stack gap="md">
                <LabelWithDesc 
                  label="Trail Length"
                  description="Number of points to show in the trail"
                />
                <Slider
                  value={trailLength}
                  onChange={(value) => {
                    setTrailLength(value);
                    simulation.setTrailLength(value);
                  }}
                  min={100}
                  max={10000}
                  step={100}
                  marks={[
                    { value: 100, label: '100' },
                    { value: 1000, label: '1000' },
                    { value: 5000, label: '5000' },
                    { value: 10000, label: '10000' }
                  ]}
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Initial Conditions and Physical Parameters side by side */}
      <Group grow align="stretch">
        <Paper withBorder p="xl" style={{ flex: 1 }}>
          <Stack gap="xl">
            <Text fw={600} size="lg">Initial Conditions</Text>
            
            <Stack gap="xl">
              <Stack gap="md">
                <LabelWithDesc 
                  label="Initial Angle 1 (θ₁)"
                  description="Initial angle of the first pendulum in radians"
                />
                <NumberInput
                  value={initialConditions.theta1}
                  onChange={(value) => {
                    setInitialConditions(prev => ({ ...prev, theta1: Number(value) }));
                    simulation.setInitialCondition('theta1', Number(value));
                  }}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.1}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Initial Angle 2 (θ₂)"
                  description="Initial angle of the second pendulum in radians"
                />
                <NumberInput
                  value={initialConditions.theta2}
                  onChange={(value) => {
                    setInitialConditions(prev => ({ ...prev, theta2: Number(value) }));
                    simulation.setInitialCondition('theta2', Number(value));
                  }}
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.1}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Initial Angular Velocity 1 (ω₁)"
                  description="Initial angular velocity of the first pendulum in rad/s"
                />
                <NumberInput
                  value={initialConditions.omega1}
                  onChange={(value) => {
                    setInitialConditions(prev => ({ ...prev, omega1: Number(value) }));
                    simulation.setInitialCondition('omega1', Number(value));
                  }}
                  min={-10}
                  max={10}
                  step={0.1}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Initial Angular Velocity 2 (ω₂)"
                  description="Initial angular velocity of the second pendulum in rad/s"
                />
                <NumberInput
                  value={initialConditions.omega2}
                  onChange={(value) => {
                    setInitialConditions(prev => ({ ...prev, omega2: Number(value) }));
                    simulation.setInitialCondition('omega2', Number(value));
                  }}
                  min={-10}
                  max={10}
                  step={0.1}
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper withBorder p="xl" style={{ flex: 1 }}>
          <Stack gap="xl">
            <Text fw={600} size="lg">Physical Parameters</Text>
            
            <Stack gap="xl">
              <Stack gap="md">
                <LabelWithDesc 
                  label="Mass 1 (m₁)"
                  description="Mass of the first pendulum bob in kg"
                />
                <NumberInput
                  value={physicalParameters.m1}
                  onChange={(value) => {
                    setPhysicalParameters(prev => ({ ...prev, m1: Number(value) }));
                    simulation.setPhysicalParameter('m1', Number(value));
                  }}
                  min={0.1}
                  max={10}
                  step={0.1}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Mass 2 (m₂)"
                  description="Mass of the second pendulum bob in kg"
                />
                <NumberInput
                  value={physicalParameters.m2}
                  onChange={(value) => {
                    setPhysicalParameters(prev => ({ ...prev, m2: Number(value) }));
                    simulation.setPhysicalParameter('m2', Number(value));
                  }}
                  min={0.1}
                  max={10}
                  step={0.1}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Length 1 (L₁)"
                  description="Length of the first pendulum arm in meters"
                />
                <NumberInput
                  value={physicalParameters.l1}
                  onChange={(value) => {
                    setPhysicalParameters(prev => ({ ...prev, l1: Number(value) }));
                    simulation.setPhysicalParameter('l1', Number(value));
                  }}
                  min={0.1}
                  max={2}
                  step={0.1}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Length 2 (L₂)"
                  description="Length of the second pendulum arm in meters"
                />
                <NumberInput
                  value={physicalParameters.l2}
                  onChange={(value) => {
                    setPhysicalParameters(prev => ({ ...prev, l2: Number(value) }));
                    simulation.setPhysicalParameter('l2', Number(value));
                  }}
                  min={0.1}
                  max={2}
                  step={0.1}
                />
              </Stack>

              <Stack gap="md">
                <LabelWithDesc 
                  label="Damping"
                  description="Fine-tune energy persistence (0.999 = long-lasting, 1.0 = no damping)"
                />
                <Slider
                  value={damping}
                  onChange={(value) => {
                    setDamping(value);
                    simulation.setPhysicalParameter('damping', value);
                  }}
                  min={0.999}
                  max={1.0}
                  step={0.0001}
                  precision={4}
                  marks={[
                    { value: 0.999, label: '0.999' },
                    { value: 0.9995, label: '0.9995' },
                    { value: 1.0, label: '1.0' }
                  ]}
                  label={(value) => value.toFixed(4)}
                />
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Group>
    </Stack>
  );
} 