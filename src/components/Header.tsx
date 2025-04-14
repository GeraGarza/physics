import { Container, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

const links = [
  { link: '/block_collision', label: 'Block Collision' },
  { link: '/example2', label: 'Example 2' },
  { link: '/example3', label: 'Example 3' },
  { link: '/example4', label: 'Example 4' },
];

export function Header() {
  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      style={{
        display: 'block',
        lineHeight: 1,
        padding: '8px 12px',
        borderRadius: 'var(--mantine-radius-sm)',
        textDecoration: 'none',
        color: 'var(--mantine-color-white)',
        fontSize: 'var(--mantine-font-size-sm)',
        fontWeight: 500,
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {link.label}
    </Link>
  ));

  return (
    <header style={{
      height: '56px',
      backgroundColor: 'var(--mantine-color-dark-7)',
      borderBottom: '1px solid var(--mantine-color-dark-4)',
    }}>
      <Container size="md" style={{
        height: '56px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Text size="lg" fw={700} c="white">
          Physics Lab
        </Text>
        <Group gap={5}>
          {items}
        </Group>
      </Container>
    </header>
  );
} 