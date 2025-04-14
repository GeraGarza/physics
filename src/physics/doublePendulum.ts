import p5 from 'p5';
import { 
    DoublePendulum as IDoublePendulum, 
    DoublePendulumState,
    DoublePendulumControls,
    DoublePendulumPhysics 
} from '../types/doublePendulum';

export class DoublePendulum implements IDoublePendulum {
    // State
    public isRunning = false;
    public timeScale = 1;
    public initialConditions = {
        theta1: Math.PI * 0.8,
        theta2: -Math.PI * 0.5,
        omega1: 2.0,
        omega2: -1.0
    };
    public physicalParameters = {
        m1: 1,
        m2: 1,
        l1: 100,
        l2: 100,
        g: 9.81,
        damping: 1.0
    };
    public trailLength = 1000;
    public showTrail = true;
    public showPhaseSpace = false;
    public showEnergy = false;
    public showMinimal = false;
    public energyHistory: Array<{ kineticEnergy: number; potentialEnergy: number }> = [];

    // Private state
    private trail: Array<{ x2: number; y2: number }> = [];
    private currentState = {
        theta1: Math.PI * 0.8,
        theta2: -Math.PI * 0.5,
        omega1: 2.0,
        omega2: -1.0,
        energy: 0
    };

    // Controls
    public stop = () => {
        this.isRunning = false;
        // Update energy one last time when stopping
        const { kineticEnergy, potentialEnergy } = this.calculateEnergy();
        this.currentState.energy = kineticEnergy + potentialEnergy;
        if (this.energyHistory.length === 0) {
            this.energyHistory.push({ kineticEnergy, potentialEnergy });
        }
    };

    public start = () => {
        // Make sure we start with initial conditions
        if (!this.isRunning) {
            this.currentState = { ...this.initialConditions, energy: 0 };
        }
        this.isRunning = true;
        // Initialize energy history if empty
        if (this.energyHistory.length === 0) {
            const { kineticEnergy, potentialEnergy } = this.calculateEnergy();
            this.currentState.energy = kineticEnergy + potentialEnergy;
            this.energyHistory.push({ kineticEnergy, potentialEnergy });
        }
    };

    public reset = () => {
        this.currentState = { ...this.initialConditions, energy: 0 };
        this.trail = [];
        this.energyHistory = [];
        this.stop();
        
        // Always initialize with current energy point
        const { kineticEnergy, potentialEnergy } = this.calculateEnergy();
        this.currentState.energy = kineticEnergy + potentialEnergy;
        this.energyHistory.push({ kineticEnergy, potentialEnergy });
    };

    public setTimeScale = (value: number) => {
        this.timeScale = value;
    };

    public setInitialCondition = (param: keyof DoublePendulumState['initialConditions'], value: number) => {
        this.initialConditions[param] = value;
        this.reset();
    };

    public setPhysicalParameter = (param: keyof DoublePendulumState['physicalParameters'], value: number) => {
        this.physicalParameters[param] = value;
        // Only reset for parameters that require it (lengths, masses)
        if (param === 'l1' || param === 'l2' || param === 'm1' || param === 'm2') {
            this.reset();
        }
        // For parameters like damping and gravity, just update the value without resetting
    };

    public toggleTrail = () => {
        this.showTrail = !this.showTrail;
        // Clear trail when toggling off to prevent stale data
        if (!this.showTrail) {
            this.trail = [];
        }
    };

    public togglePhaseSpace = () => {
        this.showPhaseSpace = !this.showPhaseSpace;
    };

    public toggleEnergy = () => {
        this.showEnergy = !this.showEnergy;
        if (this.showEnergy && this.energyHistory.length === 0) {
            // Initialize energy history with current state
            const { kineticEnergy, potentialEnergy } = this.calculateEnergy();
            this.energyHistory.push({ kineticEnergy, potentialEnergy });
        }
    };

    public toggleMinimal = () => {
        this.showMinimal = !this.showMinimal;
    };

    public setTrailLength = (value: number) => {
        this.trailLength = value;
        if (this.trail.length > value) {
            this.trail = this.trail.slice(-value);
        }
        if (this.energyHistory.length > value) {
            this.energyHistory = this.energyHistory.slice(-value);
        }
    };

    // Physics
    public init = () => {
        this.reset();
    };

    public update = (dt: number) => {
        if (!this.isRunning) return;

        const { m1, m2, l1, l2, g, damping } = this.physicalParameters;
        const { theta1, theta2, omega1, omega2 } = this.currentState;

        // Calculate forces using the double pendulum equations
        const num1 = -g * (2 * m1 + m2) * Math.sin(theta1);
        const num2 = -m2 * g * Math.sin(theta1 - 2 * theta2);
        const num3 = -2 * Math.sin(theta1 - theta2) * m2;
        const num4 = omega2 * omega2 * l2 + omega1 * omega1 * l1 * Math.cos(theta1 - theta2);
        const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
        const theta1_acc = (num1 + num2 + num3 * num4) / den;

        const num5 = 2 * Math.sin(theta1 - theta2);
        const num6 = omega1 * omega1 * l1 * (m1 + m2);
        const num7 = g * (m1 + m2) * Math.cos(theta1);
        const num8 = omega2 * omega2 * l2 * m2 * Math.cos(theta1 - theta2);
        const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
        const theta2_acc = (num5 * (num6 + num7 + num8)) / den2;

        // Update velocities and positions
        this.currentState.omega1 += theta1_acc * dt;
        this.currentState.omega2 += theta2_acc * dt;
        this.currentState.theta1 += this.currentState.omega1 * dt;
        this.currentState.theta2 += this.currentState.omega2 * dt;

        // Apply damping
        this.currentState.omega1 *= damping;
        this.currentState.omega2 *= damping;

        // Update trail points
        if (this.showTrail) {
            const x2 = l2 * Math.sin(this.currentState.theta2) + l1 * Math.sin(this.currentState.theta1);
            const y2 = l2 * Math.cos(this.currentState.theta2) + l1 * Math.cos(this.currentState.theta1);
            this.trail.push({ x2, y2 });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
        }

        // Always calculate and update energy history if energy display is enabled
        if (this.showEnergy) {
            const { kineticEnergy, potentialEnergy } = this.calculateEnergy();
            this.currentState.energy = kineticEnergy + potentialEnergy;
            this.energyHistory.push({ kineticEnergy, potentialEnergy });
            if (this.energyHistory.length > this.trailLength) {
                this.energyHistory.shift();
            }
        }
    };

    public draw = (p: p5, color?: p5.Color) => {
        const { l1, l2 } = this.physicalParameters;
        const { theta1, theta2 } = this.currentState;

        // Draw trail
        if (this.showTrail && this.trail.length > 0) {
            p.stroke(color || p.color(100, 100, 255, 150));
            p.strokeWeight(2.5);
            p.noFill();
            
            // Draw a subtle glow under the main trail
            (p.drawingContext as CanvasRenderingContext2D).shadowBlur = 5;
            (p.drawingContext as CanvasRenderingContext2D).shadowColor = color ? color.toString() : 'rgba(100, 100, 255, 0.5)';
            
            p.beginShape();
            for (const point of this.trail) {
                p.vertex(point.x2, point.y2);
            }
            p.endShape();
            
            // Reset shadow for other elements
            (p.drawingContext as CanvasRenderingContext2D).shadowBlur = 0;
        }

        if (!this.showMinimal) {
            // Draw pendulum arms
            p.stroke(0);
            p.strokeWeight(2);
            // First arm
            p.line(0, 0, l1 * Math.sin(theta1), l1 * Math.cos(theta1));
            // Second arm
            p.line(
                l1 * Math.sin(theta1),
                l1 * Math.cos(theta1),
                l1 * Math.sin(theta1) + l2 * Math.sin(theta2),
                l1 * Math.cos(theta1) + l2 * Math.cos(theta2)
            );

            // Draw first bob only in full view
            p.noStroke();
            p.fill(color || p.color(0, 0, 255));
            p.circle(l1 * Math.sin(theta1), l1 * Math.cos(theta1), 20);
        }

        // Always draw the second (outer) bob
        p.noStroke();
        p.fill(color || p.color(255, 0, 0));
        p.circle(
            l1 * Math.sin(theta1) + l2 * Math.sin(theta2),
            l1 * Math.cos(theta1) + l2 * Math.cos(theta2),
            20
        );
    };

    public getCurrentState = () => {
        const { kineticEnergy, potentialEnergy } = this.calculateEnergy();
        return {
            ...this.currentState,
            energy: {
                kinetic: kineticEnergy,
                potential: potentialEnergy,
                total: kineticEnergy + potentialEnergy
            }
        };
    };

    private calculateEnergy = () => {
        const { m1, m2, l1, l2, g } = this.physicalParameters;
        const { theta1, theta2, omega1, omega2 } = this.currentState;

        // Calculate velocities of the masses
        const v1x = l1 * omega1 * Math.cos(theta1);
        const v1y = l1 * omega1 * Math.sin(theta1);
        const v2x = l1 * omega1 * Math.cos(theta1) + l2 * omega2 * Math.cos(theta2);
        const v2y = l1 * omega1 * Math.sin(theta1) + l2 * omega2 * Math.sin(theta2);

        // Calculate kinetic energy using full velocity vectors
        const kineticEnergy = 0.5 * m1 * (v1x * v1x + v1y * v1y) + 
                             0.5 * m2 * (v2x * v2x + v2y * v2y);

        // Calculate heights for potential energy (relative to pivot point)
        const h1 = -l1 * Math.cos(theta1);
        const h2 = -l1 * Math.cos(theta1) - l2 * Math.cos(theta2);
        const potentialEnergy = m1 * g * h1 + m2 * g * h2;

        return { kineticEnergy, potentialEnergy };
    };
}

export type { IDoublePendulum, DoublePendulumState, DoublePendulumControls, DoublePendulumPhysics }; 