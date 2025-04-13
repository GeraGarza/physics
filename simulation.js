import { Block } from './block.js';

export class Simulation {
    constructor() {
        this.blocks = [];
        this.collisionCount = 0;
        this.isRunning = false;
        this.speed = 50; // Default speed (0-100)
        this.timeScale = 1; // Default time scale (1-10)
        this.velocityScale = this.calculateVelocityScale();
        this.synth = new Tone.Synth().toDestination();
        this.massCategories = {
            tiny: 1,
            small: 10,
            medium: 100,
            large: 1000,
            extraLarge: 10000
        };
        // Store current masses
        this.currentMasses = [this.massCategories.tiny, this.massCategories.medium];
        // Base velocity for scaling - increased significantly
        this.baseVelocity = -20;
    }

    init(digits) {
        this.collisionCount = 0;
        
        // Create blocks with exact specifications - using same base size
        const baseSize = 200; // Base size for all blocks
        this.blocks = [
            new Block(100, baseSize, this.currentMasses[0], [160, 233, 255]), // Light blue block (stationary)
            new Block(500, baseSize, this.currentMasses[1], [255, 107, 107]) // Coral red block (moving)
        ];

        // Initialize blocks with zero velocity
        this.blocks[0].velocity = 0;
        this.blocks[1].velocity = 0;
    }

    calculateTotalMomentum() {
        return this.blocks.reduce((sum, block) => sum + block.mass * block.velocity, 0);
    }

    calculateTotalEnergy() {
        return this.blocks.reduce((sum, block) => sum + 0.5 * block.mass * block.velocity * block.velocity, 0);
    }

    adjustVelocitiesForConservation() {
        // We'll maintain the ratio of velocities but scale them to conserve momentum and energy
        const m1 = this.blocks[0].mass;
        const m2 = this.blocks[1].mass;
        const v1 = this.blocks[0].velocity;
        const v2 = this.blocks[1].velocity;

        // Calculate current momentum and energy
        const currentP = this.calculateTotalMomentum();
        const currentE = this.calculateTotalEnergy();

        // If momentum and energy are both close to initial values, no adjustment needed
        if (Math.abs(currentP - this.initialMomentum) < 0.001 && 
            Math.abs(currentE - this.initialEnergy) < 0.001) {
            return;
        }

        // Scale velocities to maintain momentum and energy conservation
        const scaleFactor = Math.sqrt(this.initialEnergy / currentE);
        this.blocks.forEach(block => {
            block.velocity *= scaleFactor;
        });
    }

    update(dt) {
        if (!this.isRunning) return;

        const scaledDt = dt * this.timeScale;

        // Update positions
        this.blocks.forEach(block => block.update(scaledDt));

        // Check collisions with the black wall (at x=20)
        if (this.blocks[0].x <= 20) {
            this.blocks[0].x = 20; // Prevent going through wall
            this.blocks[0].velocity = Math.abs(this.blocks[0].velocity); // Bounce back
            this.collisionCount++;
            this.playCollisionSound(0.5);
        }

        // Check block-block collision
        const blockA = this.blocks[0];
        const blockB = this.blocks[1];
        if (blockA.x + blockA.size >= blockB.x) {
            blockA.collideWith(blockB);
            this.collisionCount++;
            this.playCollisionSound(1.0);
        }
    }

    draw(p5) {
        // Clear background completely (no transparency)
        p5.background(255);

        // Draw wall (dark gray)
        p5.fill(50);
        p5.noStroke();
        p5.rect(0, 0, 20, p5.height);

        // Draw ground (thin black line)
        p5.stroke(0);
        p5.strokeWeight(1);
        p5.line(0, p5.height, p5.width, p5.height);

        // Draw blocks with crisp edges
        p5.strokeWeight(1);
        p5.stroke(0);
        this.blocks.forEach(block => block.draw(p5));

        // Draw mass controls when simulation is stopped
        if (!this.isRunning) {
            this.blocks.forEach((block, index) => {
                const controlY = block.y + block.size + 30; // Increased spacing
                const controlWidth = 150; // Increased width
                const controlX = block.x + block.size/2 - controlWidth/2;

                // Draw mass control background
                p5.fill(240);
                p5.rect(controlX, controlY, controlWidth, 50, 5); // Increased height

                // Draw mass control text
                p5.fill(0);
                p5.textSize(14); // Increased text size
                p5.textAlign(p5.CENTER, p5.CENTER);
                p5.text(`Mass: ${block.mass}`, controlX + controlWidth/2, controlY + 15);

                // Draw step size indicator
                p5.textSize(12);
                p5.text(`Step: ${this.massCategories[this.getMassCategory(index)]}`, 
                        controlX + controlWidth/2, controlY + 35);

                // Draw mass control buttons
                p5.fill(200);
                p5.rect(controlX, controlY, 40, 50, 5, 0, 0, 5); // Increased button size
                p5.rect(controlX + controlWidth - 40, controlY, 40, 50, 0, 5, 5, 0);
                
                p5.fill(0);
                p5.textSize(20); // Increased button text size
                p5.text("-", controlX + 20, controlY + 25);
                p5.text("+", controlX + controlWidth - 20, controlY + 25);
            });
        }

        // Draw collision count
        p5.textAlign(p5.LEFT, p5.TOP);
        p5.textSize(32);
        p5.textStyle(p5.BOLD);
        p5.text(`Collisions: ${this.collisionCount}`, 30, 50);
    }

    playCollisionSound(volume) {
        if (window.enableSound) {
            this.synth.triggerAttackRelease("C4", "8n", Tone.now(), volume);
        }
    }

    reset() {
        this.isRunning = false;
        this.collisionCount = 0;
        this.init(window.digits);
        this.blocks.forEach(block => {
            block.reset();
            block.velocity = 0; // Ensure velocity is explicitly set to 0
        });
        // Reset initial energy and momentum
        this.initialMomentum = 0;
        this.initialEnergy = 0;
    }

    start() {
        this.isRunning = true;
        // Set initial velocities when starting
        this.blocks[0].velocity = 0; // First block stationary
        this.blocks[1].velocity = this.baseVelocity * this.velocityScale; // Second block moving left
        // Store initial energy and momentum when simulation starts
        this.initialMomentum = this.calculateTotalMomentum();
        this.initialEnergy = this.calculateTotalEnergy();
    }

    stop() {
        this.isRunning = false;
    }

    setSpeed(newSpeed) {
        this.speed = Math.max(0, Math.min(100, newSpeed));
        this.velocityScale = this.calculateVelocityScale();
        
        // Only adjust velocities if simulation is running
        if (this.isRunning && this.blocks.length > 0) {
            // Scale velocity while preserving direction
            const direction = Math.sign(this.blocks[1].velocity);
            this.blocks[1].velocity = direction * Math.abs(this.baseVelocity * this.velocityScale);
        }
    }

    setTimeScale(newTimeScale) {
        this.timeScale = Math.max(1, Math.min(10, newTimeScale));
    }

    calculateVelocityScale() {
        // Convert speed (0-100) to velocity scale (0.1-10.0) for much faster movement
        return 0.1 + (this.speed / 100) * 9.9;
    }

    handleClick(x, y) {
        if (this.isRunning) return;

        this.blocks.forEach((block, index) => {
            const controlY = block.y + block.size + 30;
            const controlWidth = 150;
            const controlX = block.x + block.size/2 - controlWidth/2;

            // Check if click is within mass control area
            if (y >= controlY && y <= controlY + 50) {
                if (x >= controlX + controlWidth/2 - 20 && x <= controlX + controlWidth/2 + 20 && y >= controlY + 30) {
                    // Change mass category
                    this.setMassCategory(index, this.getNextMassCategory(this.getMassCategory(index)));
                }
            }
        });
    }

    setMassCategory(blockIndex, category) {
        if (blockIndex >= 0 && blockIndex < this.blocks.length) {
            const newMass = this.massCategories[category];
            this.blocks[blockIndex].mass = newMass;
            this.currentMasses[blockIndex] = newMass;
            
            // If this is the moving block and it's stationary, give it initial velocity
            if (blockIndex === 1 && this.blocks[blockIndex].velocity === 0) {
                const massRatio = Math.sqrt(this.massCategories.tiny / newMass);
                this.blocks[blockIndex].velocity = this.baseVelocity * massRatio * this.velocityScale;
            }
        }
    }

    getMassCategory(blockIndex) {
        if (blockIndex >= 0 && blockIndex < this.blocks.length) {
            const mass = this.blocks[blockIndex].mass;
            for (const [category, value] of Object.entries(this.massCategories)) {
                if (mass === value) return category;
            }
        }
        return 'medium';
    }

    getNextMassCategory(currentCategory) {
        const categories = Object.keys(this.massCategories);
        const currentIndex = categories.indexOf(currentCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        return categories[nextIndex];
    }

    getMass(blockIndex) {
        if (blockIndex >= 0 && blockIndex < this.blocks.length) {
            return this.blocks[blockIndex].mass;
        }
        return null;
    }
} 