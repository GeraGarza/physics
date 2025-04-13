import { Box, Group, SegmentedControl, Slider, Switch, Text, Paper, Button } from '@mantine/core';

export class SimulationControls {
    constructor(simulation) {
        this.simulation = simulation;
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'controls-container';
        this.container.style.margin = '20px auto';
        this.container.style.padding = '0';
        this.container.style.width = '1000px'; // Match simulation width
        
        this.render();
    }

    createMassControl(blockIndex, label, color, bgColor) {
        const control = document.createElement('div');
        control.className = 'mass-control';
        control.style.backgroundColor = bgColor;
        control.style.borderRadius = '8px';
        control.style.padding = '16px';

        const massCategories = [
            { label: 'Tiny', value: 'tiny', mass: '1kg' },
            { label: 'Small', value: 'small', mass: '10kg' },
            { label: 'Medium', value: 'medium', mass: '100kg' },
            { label: 'Large', value: 'large', mass: '1000kg' },
            { label: 'Extra Large', value: 'extraLarge', mass: '10000kg' }
        ];

        const currentCategory = this.simulation.getMassCategory(blockIndex);

        control.innerHTML = `
            <div style="font-weight: 500; font-size: 14px; color: #1A1B1E; margin-bottom: 12px;">${label} Mass</div>
            <div style="display: flex; gap: 8px; justify-content: space-between;">
                ${massCategories.map(cat => `
                    <button class="mass-button" 
                            data-value="${cat.value}"
                            style="
                                padding: 8px;
                                font-size: 13px;
                                border: 1px solid ${color};
                                border-radius: 6px;
                                background: ${currentCategory === cat.value ? color : 'white'};
                                color: ${currentCategory === cat.value ? 'white' : '#1A1B1E'};
                                cursor: pointer;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                flex: 1;
                                min-width: 80px;
                                transition: all 0.2s;
                            "
                    >
                        <span style="font-weight: 500;">${cat.label}</span>
                        <span style="font-size: 11px; opacity: 0.8; margin-top: 2px;">${cat.mass}</span>
                    </button>
                `).join('')}
            </div>
        `;

        const buttons = control.querySelectorAll('.mass-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.simulation.setMassCategory(blockIndex, button.dataset.value);
                buttons.forEach(b => {
                    b.style.background = 'white';
                    b.style.color = '#1A1B1E';
                });
                button.style.background = color;
                button.style.color = 'white';
            });
        });

        return control;
    }

    render() {
        this.container.innerHTML = '';

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'mantine-Paper-root';
        controlsContainer.style.padding = '24px';
        controlsContainer.style.backgroundColor = 'white';
        controlsContainer.style.borderRadius = '8px';
        controlsContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

        const columnsContainer = document.createElement('div');
        columnsContainer.style.display = 'flex';
        columnsContainer.style.gap = '24px';

        // Left column
        const leftColumn = document.createElement('div');
        leftColumn.style.flex = '1';
        leftColumn.style.display = 'flex';
        leftColumn.style.flexDirection = 'column';
        leftColumn.style.gap = '20px';

        // Right column
        const rightColumn = document.createElement('div');
        rightColumn.style.flex = '1';
        rightColumn.style.display = 'flex';
        rightColumn.style.flexDirection = 'column';
        rightColumn.style.gap = '16px';

        // Add simulation controls to left column
        leftColumn.innerHTML = `
            <div style="display: flex; gap: 12px;">
                <button class="mantine-Button-filled" id="startBtn" 
                    style="flex: 1; padding: 10px; font-size: 14px; font-weight: 500; border: none; border-radius: 6px; background: #228be6; color: white; cursor: pointer;">
                    Start
                </button>
                <button class="mantine-Button-filled" id="stopBtn"
                    style="flex: 1; padding: 10px; font-size: 14px; font-weight: 500; border: none; border-radius: 6px; background: #228be6; color: white; cursor: pointer;">
                    Stop
                </button>
                <button class="mantine-Button-filled" id="resetBtn"
                    style="flex: 1; padding: 10px; font-size: 14px; font-weight: 500; border: none; border-radius: 6px; background: #228be6; color: white; cursor: pointer;">
                    Reset
                </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 80px; font-size: 14px; font-weight: 500; color: #1A1B1E;">Speed</div>
                    <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
                        <input type="range" min="0" max="100" value="${this.simulation.speed}" 
                               style="flex: 1;" id="speedSlider">
                        <span style="min-width: 40px; text-align: right; font-size: 13px; color: #1A1B1E;">${this.simulation.speed}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 80px; font-size: 14px; font-weight: 500; color: #1A1B1E;">Time Scale</div>
                    <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
                        <input type="range" min="1" max="50" value="1" 
                               style="flex: 1;" id="timeScaleSlider">
                        <span style="min-width: 40px; text-align: right; font-size: 13px; color: #1A1B1E;">1x</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 80px; font-size: 14px; font-weight: 500; color: #1A1B1E;">Sound</div>
                    <div style="flex: 1;">
                        <label class="mantine-Switch-root">
                            <input type="checkbox" id="soundSwitch" style="transform: scale(1.2);"
                                   ${window.enableSound ? 'checked' : ''}>
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Add mass controls to right column
        const blueBlockControl = this.createMassControl(0, 'Blue Block', 'rgb(160, 233, 255)', 'rgba(160, 233, 255, 0.1)');
        rightColumn.appendChild(blueBlockControl);

        const redBlockControl = this.createMassControl(1, 'Red Block', 'rgb(255, 107, 107)', 'rgba(255, 107, 107, 0.1)');
        redBlockControl.appendChild(document.createElement('div')).style.height = '16px';
        rightColumn.appendChild(redBlockControl);

        columnsContainer.appendChild(leftColumn);
        columnsContainer.appendChild(rightColumn);
        controlsContainer.appendChild(columnsContainer);
        this.container.appendChild(controlsContainer);
        
        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer.parentNode.insertBefore(this.container, canvasContainer.nextSibling);

        // Add event listeners
        leftColumn.querySelector('#startBtn').addEventListener('click', () => this.simulation.start());
        leftColumn.querySelector('#stopBtn').addEventListener('click', () => this.simulation.stop());
        leftColumn.querySelector('#resetBtn').addEventListener('click', () => this.simulation.reset());
        
        const speedSlider = leftColumn.querySelector('#speedSlider');
        const speedValue = speedSlider.nextElementSibling;
        speedSlider.addEventListener('input', (e) => {
            this.simulation.setSpeed(parseInt(e.target.value));
            speedValue.textContent = e.target.value;
        });
        
        const timeScaleSlider = leftColumn.querySelector('#timeScaleSlider');
        const timeScaleValue = timeScaleSlider.nextElementSibling;
        timeScaleSlider.addEventListener('input', (e) => {
            this.simulation.setTimeScale(parseInt(e.target.value));
            timeScaleValue.textContent = e.target.value + 'x';
        });
        
        leftColumn.querySelector('#soundSwitch').addEventListener('change', (e) => {
            window.enableSound = e.target.checked;
        });
    }
} 