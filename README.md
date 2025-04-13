# Physics Collision Simulator

A beautiful, interactive physics simulation demonstrating elastic collisions between blocks of different masses. This simulator helps visualize the conservation of momentum and energy in one-dimensional collisions.

## Screenshots & Demo

### Main Interface
![Main Interface](screenshots/main.png)
*The main simulation interface showing the blocks and control panel*

### Mass Interactions
![Mass Interactions](screenshots/interaction.png)
*Demonstration of blocks with different masses colliding*

## Features

- **Interactive Blocks**: Two blocks with adjustable masses (from 1kg to 10000kg)
- **Real-time Physics**: Accurate simulation of elastic collisions
- **Conservation Laws**: Demonstrates conservation of momentum and energy
- **Adjustable Parameters**:
  - Speed control (0-100)
  - Time scale (0x-1000x)
  - Sound effects toggle
- **Mass Categories**:
  - Tiny (1kg)
  - Small (10kg)
  - Medium (100kg)
  - Large (1000kg)
  - Extra Large (10000kg)

## Controls

### Simulation Controls
- **Start**: Begin the simulation
- **Stop**: Pause the simulation
- **Reset**: Reset blocks to their initial positions
- **Speed**: Adjust the initial velocity of the moving block
- **Time Scale**: Control simulation speed with fine-grained control:
  - 0x: Pause
  - 1x: Normal speed
  - 5x: 5 times faster
  - 10x: 10 times faster
  - 100x: 100 times faster
  - 1000x: 1000 times faster
- **Sound**: Toggle collision sound effects

### Mass Controls
- **Blue Block**: Stationary block (initially 1kg)
- **Red Block**: Moving block (initially 100kg)
- Click mass category buttons to change each block's mass

## Physics Explanation

The simulation demonstrates elastic collisions where both momentum and kinetic energy are conserved. When blocks collide:

1. **Momentum Conservation**: \( m_1v_1 + m_2v_2 = m_1v_1' + m_2v_2' \)
2. **Energy Conservation**: \( \frac{1}{2}m_1v_1^2 + \frac{1}{2}m_2v_2^2 = \frac{1}{2}m_1v_1'^2 + \frac{1}{2}m_2v_2'^2 \)

Where:
- \( m_1, m_2 \) are the masses of the blocks
- \( v_1, v_2 \) are the initial velocities
- \( v_1', v_2' \) are the final velocities

## Interesting Scenarios

1. **Equal Masses**: Complete transfer of momentum
2. **Heavy vs Light**: Light block bounces back with increased velocity
3. **Multiple Collisions**: Watch patterns emerge with different mass ratios
4. **High-Speed Observation**: Use 1000x time scale to observe rapid collision patterns

## Technical Details

Built using:
- TypeScript with ESM modules
- React for UI components
- Mantine UI for modern desktop interface
- p5.js for physics simulation and rendering
- Tone.js for sound effects

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open in your browser and start experimenting!

## Development

The project uses:
- TypeScript for type safety
- React with functional components
- Mantine UI components
- p5.js for physics simulation
- Electron for desktop application

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to use and modify! 