import { Routes, Route } from 'react-router-dom';
import { CollisionsSimulator } from './pages/CollisionsSimulator';
import { Home } from './pages/Home';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collision_sim" element={<CollisionsSimulator />} />
    </Routes>
  );
} 