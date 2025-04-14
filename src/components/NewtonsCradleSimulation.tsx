import { useEffect, useRef, useState } from 'react';
import { Paper } from '@mantine/core';
import Matter from 'matter-js';
import { useNewtonsCradleStore } from '../stores/newtonsCradleStore';

const { Engine, Render, World, Bodies, Composite, Constraint, Body } = Matter;

export function NewtonsCradleSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ballsRef = useRef<Matter.Body[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  // Store velocities when pausing
  const savedStateRef = useRef<{
    velocities: { x: number; y: number; angularVelocity: number }[];
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    numBalls,
    ballRadius,
    stringLength,
    friction,
    restitution,
    isPaused,
    resetCounter,
  } = useNewtonsCradleStore();

  // Function to create and setup the pendulum
  const setupPendulum = () => {
    console.log('Setting up pendulum');
    if (!engineRef.current) return;

    // Clear existing bodies
    World.clear(engineRef.current.world, false);
    ballsRef.current = [];

    // Create balls and strings
    const balls: Matter.Body[] = [];
    const strings: Matter.Constraint[] = [];
    const width = 800;
    const height = 600;
    const startX = width / 2 - ((numBalls - 1) * ballRadius * 2.1) / 2;
    const topY = height * 0.2;

    for (let i = 0; i < numBalls; i++) {
      const x = startX + i * ballRadius * 2.1;

      const ball = Bodies.circle(x, topY + stringLength, ballRadius, {
        restitution,
        friction: friction * 0.5,
        density: 0.001,
        frictionAir: 0.0001,
        render: {
          fillStyle: '#4C6EF5',
          strokeStyle: '#364FC7',
          lineWidth: 2
        }
      });

      const string = Constraint.create({
        pointA: { x, y: topY },
        bodyB: ball,
        length: stringLength,
        stiffness: 1,
        damping: 0.01,
        render: {
          strokeStyle: '#868E96',
          lineWidth: 2
        }
      });

      balls.push(ball);
      strings.push(string);
    }

    ballsRef.current = balls;
    Composite.add(engineRef.current.world, [...balls, ...strings]);

    // Pull the first ball out
    if (balls.length > 0) {
      const firstBall = balls[0];
      const angle = -Math.PI / 4;
      const offsetX = Math.sin(angle) * stringLength;
      const offsetY = (1 - Math.cos(angle)) * stringLength;
      
      Body.setPosition(firstBall, {
        x: firstBall.position.x + offsetX,
        y: firstBall.position.y + offsetY
      });
      
      Body.setVelocity(firstBall, { x: 0, y: 0 });
    }
    console.log('Pendulum setup complete');
  };

  // Initialize the simulation
  useEffect(() => {
    console.log('Initializing simulation');
    if (!canvasRef.current || !containerRef.current || isInitialized) return;

    const engine = Engine.create({
      gravity: { x: 0, y: 9.81 * 0.01 },
      constraintIterations: 20,
      positionIterations: 10,
      velocityIterations: 8
    });
    engineRef.current = engine;

    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#25262B',
        pixelRatio: window.devicePixelRatio || 1
      },
    });
    renderRef.current = render;

    // Add collision event handling
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        if (ballsRef.current.includes(pair.bodyA) && ballsRef.current.includes(pair.bodyB)) {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;
          const velAx = bodyA.velocity.x;
          const velBx = bodyB.velocity.x;
          
          Body.setVelocity(bodyA, { x: velBx * restitution, y: bodyA.velocity.y });
          Body.setVelocity(bodyB, { x: velAx * restitution, y: bodyB.velocity.y });
        }
      });
    });

    // Setup initial pendulum
    setupPendulum();

    const animate = () => {
      if (!engineRef.current || !renderRef.current) return;
      
      if (!isPaused) {
        Engine.update(engineRef.current, 1000 / 60); // Fixed time step
        Render.world(renderRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation if not paused
    if (!isPaused) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    setIsInitialized(true);
    console.log('Simulation initialized');

    return () => {
      console.log('Cleaning up simulation');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderRef.current) {
        Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current.textures = {};
      }
      if (engineRef.current) {
        World.clear(engineRef.current.world, false);
        Engine.clear(engineRef.current);
      }
    };
  }, []);

  // Handle parameter changes
  useEffect(() => {
    console.log('Parameters changed, updating simulation');
    if (!engineRef.current || !isInitialized) return;
    setupPendulum();
  }, [numBalls, ballRadius, stringLength, friction, restitution]);

  // Handle reset
  useEffect(() => {
    console.log('Reset triggered:', resetCounter);
    if (!engineRef.current || !isInitialized) return;
    setupPendulum();
  }, [resetCounter]);

  // Handle pause state changes
  useEffect(() => {
    console.log('Pause state changed:', isPaused);
    if (!engineRef.current || !isInitialized || !renderRef.current) return;
    
    if (isPaused) {
      // Stop the animation loop completely
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    } else {
      // Restart the animation loop
      const animate = () => {
        if (!engineRef.current || !renderRef.current) return;
        
        if (!isPaused) {
          Engine.update(engineRef.current, 1000 / 60); // Fixed time step
          Render.world(renderRef.current);
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isPaused]);

  return (
    <Paper 
      ref={containerRef}
      shadow="sm" 
      p="md" 
      withBorder 
      style={{ 
        width: '800px',
        height: '600px',
        backgroundColor: '#25262B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      <canvas ref={canvasRef} />
    </Paper>
  );
} 