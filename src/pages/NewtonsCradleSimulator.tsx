import { Container, Stack } from '@mantine/core';
import { NewtonsCradleSimulation } from '../components/NewtonsCradleSimulation';
import { NewtonsCradleControls } from '../components/NewtonsCradleControls';

export function NewtonsCradleSimulator() {
  return (
    <Container size="xl">
      <Stack align="center" gap="xl">
        <NewtonsCradleSimulation />
        <NewtonsCradleControls />
      </Stack>
    </Container>
  );
} 