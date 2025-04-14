import { Paper, Stack, Group, Button, Slider, Text } from '@mantine/core';
import { useNewtonsCradleStore } from '../stores/newtonsCradleStore';

export function NewtonsCradleControls() {
  const {
    numBalls,
    ballRadius,
    stringLength,
    friction,
    restitution,
    isPaused,
    setNumBalls,
    setBallRadius,
    setStringLength,
    setFriction,
    setRestitution,
    togglePause,
    reset,
  } = useNewtonsCradleStore();

  const handlePauseClick = () => {
    console.log('Pause button clicked');
    togglePause();
  };

  const handleResetClick = () => {
    console.log('Reset button clicked');
    reset();
  };

  return (
    <Paper shadow="sm" p="md" withBorder style={{ width: '800px' }}>
      <Stack gap="md">
        <Group grow>
          <Button 
            variant="light"
            color="blue"
            onClick={handlePauseClick}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button 
            variant="light"
            color="blue"
            onClick={handleResetClick}
          >
            Reset
          </Button>
        </Group>

        <Group grow>
          <Button
            variant="light"
            color="blue"
            onClick={() => setNumBalls(Math.min(numBalls + 1, 7))}
            disabled={numBalls >= 7}
          >
            Add Ball
          </Button>
          <Button
            variant="light"
            color="blue"
            onClick={() => setNumBalls(Math.max(numBalls - 1, 3))}
            disabled={numBalls <= 3}
          >
            Remove Ball
          </Button>
        </Group>

        <Stack gap="xs">
          <div>
            <Text size="sm" fw={500} mb={4}>Ball Radius: {ballRadius}</Text>
            <Slider
              value={ballRadius}
              onChange={setBallRadius}
              min={10}
              max={30}
              step={1}
              color="blue"
              size="md"
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>String Length: {stringLength}</Text>
            <Slider
              value={stringLength}
              onChange={setStringLength}
              min={100}
              max={300}
              step={10}
              color="blue"
              size="md"
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>Friction: {friction.toFixed(2)}</Text>
            <Slider
              value={friction}
              onChange={setFriction}
              min={0}
              max={0.5}
              step={0.01}
              color="blue"
              size="md"
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>Restitution (Bounciness): {restitution.toFixed(2)}</Text>
            <Slider
              value={restitution}
              onChange={setRestitution}
              min={0.1}
              max={1}
              step={0.1}
              color="blue"
              size="md"
            />
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
} 