import { Container, Group, Text } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';

const HEADER_LINKS = [
  { link: '/block_collision', label: 'Block Collision' },
  { link: '/double_pendulum', label: 'Double Pendulum' },
  { link: '/newtons_cradle', label: "Newton's Cradle" },
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

        <Group gap={5}>
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
                display: 'block',
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