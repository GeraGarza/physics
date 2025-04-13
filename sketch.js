import { Simulation } from './simulation.js';
import { SimulationControls } from './controls.js';

let simulation;
let controls;
let lastTime = 0;
let fixedTimeStep = 1/60; // 60 FPS

window.setup = function() {
    console.log('Setting up simulation...');
    const canvas = createCanvas(1000, 400);
    canvas.parent('canvas-container');
    frameRate(60);

    // Initialize simulation
    simulation = new Simulation();
    window.digits = 1;
    window.enableSound = false;
    simulation.init(window.digits);

    // Initialize controls
    controls = new SimulationControls(simulation);
}

window.draw = function() {
    // Calculate delta time
    const currentTime = millis();
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Clear with slight transparency for motion blur effect
    background(255, 20);

    // Update and draw simulation
    if (simulation) {
        // Only update physics if simulation is running
        if (simulation.isRunning) {
            // Use fixed timestep for physics
            const physicsSteps = Math.ceil(dt / fixedTimeStep);
            for (let i = 0; i < physicsSteps; i++) {
                simulation.update(fixedTimeStep);
            }
        }
        simulation.draw(this);
    }
}

window.mousePressed = function() {
    if (simulation) {
        simulation.handleClick(mouseX, mouseY);
    }
} 