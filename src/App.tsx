import { MantineProvider, AppShell } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import { HeaderSimple } from './components/HeaderSimple';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <MantineProvider defaultColorScheme="dark">
        <AppShell
          header={{ height: 60 }}
          padding="md"
        >
          <AppShell.Header>
            <HeaderSimple />
          </AppShell.Header>

          <AppShell.Main>
            <AppRoutes />
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </BrowserRouter>
  );
} 