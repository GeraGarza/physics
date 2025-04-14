import { Routes, Route } from 'react-router-dom';
import { DoublePendulumSimulator } from './pages/DoublePendulumSimulator';
import { Home } from './pages/Home';
import { BlockCollisionSimulator } from './pages/BlockCollisionSimulator';
import { NewtonsCradleSimulator } from './pages/NewtonsCradleSimulator';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/block_collision" element={<BlockCollisionSimulator />} />
      <Route path="/double_pendulum" element={<DoublePendulumSimulator />} />
      <Route path="/newtons_cradle" element={<NewtonsCradleSimulator />} />
    </Routes>
  );
} 