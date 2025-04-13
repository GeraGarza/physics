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
            gradient={{ from: 'blue', to: 'cyan' }}
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
            to="/collision_sim"
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Try Collision Simulator
          </Button>
          <Button
            component={Link}
            to="/example2"
            size="lg"
            variant="light"
          >
            Explore More Examples
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
                More Coming Soon
              </Text>
              <Text c="dimmed">
                We're working on additional physics simulations to help you understand various concepts.
              </Text>
            </div>
          </Stack>
        </div>
      </Stack>
    </Container>
  );
} 