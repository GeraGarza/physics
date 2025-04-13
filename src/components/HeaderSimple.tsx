import { Container, Group, Text } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

const HEADER_LINKS = [
  { link: '/collision_sim', label: 'Collisions Sim' },
  { link: '/example2', label: 'Example 2' },
  { link: '/example3', label: 'Example 3' },
  { link: '/example4', label: 'Example 4' },
] as const;

export function HeaderSimple() {
  const location = useLocation();

  return (
    <Container h="100%" size="lg">
      <Group h="100%" justify="space-between">
        <Link
          to="/"
          style={{
            textDecoration: 'none',
          }}
        >
          <Text
            size="lg"
            fw={700}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Physics Lab
          </Text>
        </Link>

        <Group gap={5} visibleFrom="xs">
          {HEADER_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.link}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                textDecoration: 'none',
                color: location.pathname === link.link ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-white)',
                fontWeight: location.pathname === link.link ? 600 : 400,
                backgroundColor: location.pathname === link.link ? 'var(--mantine-color-dark-6)' : 'transparent',
                transition: 'all 150ms ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </Group>
      </Group>
    </Container>
  );
} 