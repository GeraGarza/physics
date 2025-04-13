class Block {
    constructor(x, size, mass, color) {
        this.initialX = x; // Store initial position
        this.x = x;
        this.baseSize = size; // Keep original size as reference
        this.mass = mass;
        this.color = color;
        this.velocity = 0;
        this.prevX = x;
        this.targetX = x;
        this.y = 0;
        this.size = this.calculateSize(); // Dynamic size based on mass
    }

    // Reset block to initial state
    reset() {
        this.x = this.initialX;
        this.prevX = this.initialX;
        this.targetX = this.initialX;
        this.velocity = 0;
    }

    calculateSize() {
        // Mass ranges for each category (exclusive upper bounds)
        const ranges = [
            { min: 1, max: 2, size: this.baseSize * 0.2 },       // 1 kg (20% of base size)
            { min: 2, max: 6, size: this.baseSize * 0.3 },       // 2-5 kg (30% of base size)
            { min: 6, max: 11, size: this.baseSize * 0.4 },      // 6-10 kg (40% of base size)
            { min: 11, max: 101, size: this.baseSize * 0.6 },    // 11-100 kg (60% of base size)
            { min: 101, max: 1001, size: this.baseSize },        // 101-1000 kg (100% of base size)
            { min: 1001, max: 10001, size: this.baseSize * 1.4 }, // 1001-10000 kg (140% of base size)
            { min: 10001, max: Infinity, size: this.baseSize * 1.8 } // 10001+ kg (180% of base size)
        ];

        for (let range of ranges) {
            if (this.mass >= range.min && this.mass < range.max) {
                return range.size;
            }
        }
        return this.baseSize; // fallback
    }

    update(dt) {
        this.x += this.velocity * dt;
    }

    draw(p5) {
        // Update size based on current mass
        this.size = this.calculateSize();
        
        // Set y position
        this.y = p5.height - this.size;

        // Draw block with crisp edges
        p5.fill(this.color);
        p5.stroke(0);
        p5.strokeWeight(1);
        p5.rect(Math.round(this.x), this.y, this.size, this.size);

        // Draw mass text with contrasting color
        const brightness = (this.color[0] + this.color[1] + this.color[2]) / 3;
        p5.fill(brightness > 127 ? 0 : 255); // Black text on light colors, white text on dark colors
        p5.noStroke();
        p5.textSize(Math.min(16, this.size / 4)); // Scale text size with block size
        p5.textAlign(p5.CENTER, p5.CENTER);
        const massText = this.mass === 1 ? "1 kg" : `${this.mass} kg`;
        p5.text(massText, Math.round(this.x + this.size/2), this.y + this.size/2);
    }

    collideWith(other) {
        const m1 = this.mass;
        const m2 = other.mass;
        const v1 = this.velocity;
        const v2 = other.velocity;

        // Elastic collision equations (conservation of momentum and energy)
        const newV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        const newV2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);

        this.velocity = newV1;
        other.velocity = newV2;

        // Prevent blocks from overlapping
        const overlap = (this.x + this.size) - other.x;
        if (overlap > 0) {
            this.x -= overlap / 2;
            other.x += overlap / 2;
        }
    }

    checkWallCollision() {
        if (this.x <= 0) {
            this.x = 0;
            this.velocity = -this.velocity;
            return true;
        }
        return false;
    }
}

// Make Block available globally
window.Block = Block; 