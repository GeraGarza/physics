import { useEffect, useRef, useState } from 'react';
import { Paper, Switch, Stack, Text } from '@mantine/core';
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
  const isDraggingRef = useRef<boolean>(false);
  const draggedBallRef = useRef<Matter.Body | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const prevPositionRef = useRef<{ x: number; y: number } | null>(null); // Store previous position for velocity calculation
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const [enableSound, setEnableSound] = useState(false);
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

  // Function to play collision sound
  const playCollisionSound = (velocity: number) => {
    if (!enableSound || !soundRef.current) return;
    
    // Adjust volume based on collision velocity
    const volume = Math.min(velocity / 5, 1);
    soundRef.current.volume = volume;
    
    // Reset and play the sound
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  };

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

    // Remove the initial ball position offset and velocity setup
    console.log('Pendulum setup complete');
  };

  // Initialize the simulation
  useEffect(() => {
    console.log('Initializing simulation');
    if (!canvasRef.current || !containerRef.current || isInitialized) return;

    // Create and preload sound
    soundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2579/2579-preview.mp3');
    soundRef.current.load();

    const engine = Engine.create({
      gravity: { x: 0, y: 1 },
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

    // Add mouse event listeners
    const handleMouseDown = (event: MouseEvent) => {
      if (!canvasRef.current || !engineRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const ball = ballsRef.current.find(ball => {
        const dx = ball.position.x - mouseX;
        const dy = ball.position.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < ballRadius * 1.5;
      });
      
      if (ball) {
        isDraggingRef.current = true;
        draggedBallRef.current = ball;
        startPositionRef.current = { x: mouseX, y: mouseY };
        mousePositionRef.current = { x: mouseX, y: mouseY };
        
        // Temporarily disable the string constraint
        const string = engineRef.current.world.constraints.find(constraint => 
          constraint.bodyB === ball
        );
        if (string) {
          string.stiffness = 0.0001;
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current || !isDraggingRef.current || !draggedBallRef.current || !engineRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      mousePositionRef.current = { x: mouseX, y: mouseY };
      
      // Calculate the angle from the string's anchor point to the mouse position
      const string = engineRef.current!.world.constraints.find(constraint => 
        constraint.bodyB === draggedBallRef.current
      );
      
      if (string) {
        const anchorX = string.pointA.x;
        const anchorY = string.pointA.y;
        const dx = mouseX - anchorX;
        const dy = mouseY - anchorY;
        // Calculate the target position on the arc defined by stringLength
        const angle = Math.atan2(dy, dx);
        const targetX = anchorX + Math.cos(angle) * stringLength;
        const targetY = anchorY + Math.sin(angle) * stringLength;

        // Store previous position before updating
        prevPositionRef.current = { ...draggedBallRef.current.position };

        // Set ball position to the point on the arc
        Body.setPosition(draggedBallRef.current, { x: targetX, y: targetY });
        // Keep velocity zero during pure drag to prevent fighting the constraint
        Body.setVelocity(draggedBallRef.current, { x: 0, y: 0 });
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!engineRef.current || !isDraggingRef.current || !draggedBallRef.current) return;
      
      // Calculate release velocity based on last movement
      let releaseVelocity = { x: 0, y: 0 };
      if (prevPositionRef.current) {
        const currentPos = draggedBallRef.current.position;
        const prevPos = prevPositionRef.current;
        // Estimate time delta (can be refined if needed)
        const deltaTime = (performance.now() - lastTimeRef.current) / 1000 || 1/60;
        // Scale velocity for a more noticeable swing
        const velocityScale = 3;
        releaseVelocity = {
            x: (currentPos.x - prevPos.x) / deltaTime * velocityScale,
            y: (currentPos.y - prevPos.y) / deltaTime * velocityScale
        };
      }
      
      // Apply the calculated velocity
      Body.setVelocity(draggedBallRef.current, releaseVelocity);
      
      // Restore the string constraint stiffness
      const string = engineRef.current.world.constraints.find(constraint => 
        constraint.bodyB === draggedBallRef.current
      );
      if (string) {
        string.stiffness = 1;
      }
      
      isDraggingRef.current = false;
      draggedBallRef.current = null;
      startPositionRef.current = null;
      mousePositionRef.current = null;
      prevPositionRef.current = null; // Reset previous position ref
    };

    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mouseup', handleMouseUp);

    // Add collision event handling
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        if (ballsRef.current.includes(pair.bodyA) && ballsRef.current.includes(pair.bodyB)) {
          const bodyA = pair.bodyA;
          const bodyB = pair.bodyB;
          const velAx = bodyA.velocity.x;
          const velBx = bodyB.velocity.x;
          
          // Calculate collision velocity for sound
          const collisionVelocity = Math.abs(velAx - velBx) * 0.1;
          if (collisionVelocity > 0.1) {
            playCollisionSound(collisionVelocity);
          }
          
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
        const currentTime = performance.now();
        const delta = currentTime - lastTimeRef.current;
        
        Engine.update(engineRef.current, delta); // Use delta time for update
        lastTimeRef.current = currentTime; // Update last time

        Render.world(renderRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation if not paused
    if (!isPaused) {
      // Initialize lastTimeRef when starting animation
      lastTimeRef.current = performance.now();
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
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('mouseup', handleMouseUp);
      }
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
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
          const currentTime = performance.now();
          const delta = currentTime - lastTimeRef.current;
          
          Engine.update(engineRef.current, delta); // Use delta time for update
          lastTimeRef.current = currentTime; // Update last time

          Render.world(renderRef.current);
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Initialize lastTimeRef when starting animation
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isPaused]);

  return (
    <Stack gap="md">
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
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="lg">Sound Effects</Text>
          <Switch
            label="Play collision sounds"
            checked={enableSound}
            onChange={(event) => setEnableSound(event.currentTarget.checked)}
          />
        </Stack>
      </Paper>
    </Stack>
  );
} 