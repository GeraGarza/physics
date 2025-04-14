import { Container, Title, Text, Button, Stack, Group } from '@mantine/core';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title
            order={1}
            size="h1"
            fw={800}
            variant="gradient"
          >
            Welcome to Physics Lab
          </Title>
          <Text size="xl" mt="md" c="dimmed">
            Interactive physics simulations to help you understand complex concepts
          </Text>
        </div>

        <Group>
          <Button
            component={Link}
            to="/block_collision"
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Try Collision Simulator
          </Button>
          <Button
            component={Link}
            to="/double_pendulum"
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Try Double Pendulum
          </Button>
          <Button
            component={Link}
            to="/newtons_cradle"
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Try Newton's Cradle
          </Button>
        </Group>

        <div>
          <Title order={2} size="h2" fw={700} mb="md">
            Available Simulations
          </Title>
          <Stack gap="md">
            <div>
              <Text size="lg" fw={600}>
                Collision Simulator
              </Text>
              <Text c="dimmed">
                Explore elastic collisions between objects of different masses and visualize conservation of momentum and energy.
              </Text>
            </div>
            <div>
              <Text size="lg" fw={600}>
                Double Pendulum Chaos
              </Text>
              <Text c="dimmed">
                Witness the fascinating chaotic behavior of a double pendulum system. Adjust initial conditions and physical parameters to explore how small changes can lead to dramatically different outcomes.
              </Text>
            </div>
            <div>
              <Text size="lg" fw={600}>
                Newton's Cradle
              </Text>
              <Text c="dimmed">
                Experience the classic demonstration of conservation of momentum and energy. Adjust parameters like friction, restitution, and number of balls to see how they affect the system's behavior.
              </Text>
            </div>
          </Stack>
        </div>
      </Stack>
    </Container>
  );
} 