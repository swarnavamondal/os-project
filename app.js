// Application Data
const deadlockData = {
  scenarios: [
    {
      name: "Two Process Deadlock",
      description: "Classic example with two processes and two resources",
      processes: ["P1", "P2"],
      resources: ["Printer", "Scanner"],
      scenario: "P1 holds Printer, wants Scanner. P2 holds Scanner, wants Printer."
    },
    {
      name: "Dining Philosophers",
      description: "Five philosophers with five forks",
      philosophers: ["Phil1", "Phil2", "Phil3", "Phil4", "Phil5"],
      forks: ["Fork1", "Fork2", "Fork3", "Fork4", "Fork5"]
    }
  ],
  bankerExample: {
    processes: 5,
    resources: 3,
    allocation: [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]],
    max: [[7,5,3], [3,2,2], [9,0,2], [2,2,2], [4,3,3]],
    available: [3,3,2],
    resourceNames: ["CPU", "Memory", "Disk"]
  }
};

// Main Application Controller
class DeadlockApp {
  constructor() {
    this.currentTab = 'overview';
    this.scenarioVisualizer = null;
    this.ragVisualizer = null;
    this.bankerSimulator = null;
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupScenarios();
    this.setupRAG();
    this.setupBanker();
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Clear any existing visualizers to prevent artifacts
        this.clearVisualizers();
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active panel
        panels.forEach(p => p.classList.add('hidden'));
        document.getElementById(targetTab).classList.remove('hidden');
        
        this.currentTab = targetTab;
        this.onTabChange(targetTab);
      });
    });
  }

  clearVisualizers() {
    // Clear scenario canvas
    const scenarioCanvas = document.getElementById('scenario-canvas');
    if (scenarioCanvas) {
      const ctx = scenarioCanvas.getContext('2d');
      ctx.clearRect(0, 0, scenarioCanvas.width, scenarioCanvas.height);
    }
    
    // Clear RAG canvas
    const ragCanvas = document.getElementById('rag-canvas');
    if (ragCanvas) {
      const ctx = ragCanvas.getContext('2d');
      ctx.clearRect(0, 0, ragCanvas.width, ragCanvas.height);
    }
    
    // Stop any ongoing animations
    if (this.scenarioVisualizer) {
      this.scenarioVisualizer.pause();
    }
  }

  onTabChange(tab) {
    switch(tab) {
      case 'scenarios':
        if (!this.scenarioVisualizer) {
          this.scenarioVisualizer = new ScenarioVisualizer();
        } else {
          this.scenarioVisualizer.draw();
        }
        break;
      case 'rag':
        if (!this.ragVisualizer) {
          this.ragVisualizer = new RAGVisualizer();
        } else {
          this.ragVisualizer.draw();
        }
        break;
      case 'banker':
        if (!this.bankerSimulator) {
          this.bankerSimulator = new BankerSimulator();
        }
        break;
    }
  }

  setupScenarios() {
    const scenarioSelect = document.getElementById('scenario-select');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');

    playBtn.addEventListener('click', () => {
      if (this.scenarioVisualizer) {
        this.scenarioVisualizer.play();
      }
    });

    pauseBtn.addEventListener('click', () => {
      if (this.scenarioVisualizer) {
        this.scenarioVisualizer.pause();
      }
    });

    resetBtn.addEventListener('click', () => {
      if (this.scenarioVisualizer) {
        this.scenarioVisualizer.reset();
      }
    });

    scenarioSelect.addEventListener('change', (e) => {
      if (this.scenarioVisualizer) {
        this.scenarioVisualizer.changeScenario(e.target.value);
      }
    });
  }

  setupRAG() {
    const addProcessBtn = document.getElementById('add-process-btn');
    const addResourceBtn = document.getElementById('add-resource-btn');
    const clearBtn = document.getElementById('clear-rag-btn');

    addProcessBtn.addEventListener('click', () => {
      if (this.ragVisualizer) {
        this.ragVisualizer.addProcess();
      }
    });

    addResourceBtn.addEventListener('click', () => {
      if (this.ragVisualizer) {
        this.ragVisualizer.addResource();
      }
    });

    clearBtn.addEventListener('click', () => {
      if (this.ragVisualizer) {
        this.ragVisualizer.clear();
      }
    });
  }

  setupBanker() {
    const generateBtn = document.getElementById('generate-matrices-btn');
    const runBtn = document.getElementById('run-banker-btn');

    generateBtn.addEventListener('click', () => {
      if (this.bankerSimulator) {
        this.bankerSimulator.generateMatrices();
      }
    });

    runBtn.addEventListener('click', () => {
      if (this.bankerSimulator) {
        this.bankerSimulator.runAlgorithm();
      }
    });
  }
}

// Scenario Visualizer
class ScenarioVisualizer {
  constructor() {
    this.canvas = document.getElementById('scenario-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentScenario = 'two-process';
    this.isPlaying = false;
    this.animationStep = 0;
    this.animationId = null;
    this.init();
  }

  init() {
    this.changeScenario(this.currentScenario);
  }

  changeScenario(scenario) {
    this.currentScenario = scenario;
    this.reset();
    this.updateScenarioInfo();
    this.draw();
  }

  updateScenarioInfo() {
    const title = document.getElementById('scenario-title');
    const description = document.getElementById('scenario-description');
    const steps = document.getElementById('scenario-steps');

    if (this.currentScenario === 'two-process') {
      title.textContent = 'Two Process Deadlock';
      description.textContent = 'Classic example with two processes and two resources';
      steps.innerHTML = this.getTwoProcessSteps();
    } else {
      title.textContent = 'Dining Philosophers';
      description.textContent = 'Five philosophers with five forks';
      steps.innerHTML = this.getDiningPhilosophersSteps();
    }
  }

  getTwoProcessSteps() {
    return `
      <div class="step-item" id="step-0">Initial state: P1 and P2 need resources</div>
      <div class="step-item" id="step-1">P1 acquires Printer, P2 acquires Scanner</div>
      <div class="step-item" id="step-2">P1 requests Scanner (held by P2)</div>
      <div class="step-item" id="step-3">P2 requests Printer (held by P1)</div>
      <div class="step-item deadlock" id="step-4">DEADLOCK: Circular wait detected!</div>
    `;
  }

  getDiningPhilosophersSteps() {
    return `
      <div class="step-item" id="step-0">Philosophers sit around table with forks</div>
      <div class="step-item" id="step-1">Each philosopher picks up left fork</div>
      <div class="step-item" id="step-2">All philosophers wait for right fork</div>
      <div class="step-item deadlock" id="step-3">DEADLOCK: All forks are held, all philosophers wait</div>
    `;
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.animate();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  reset() {
    this.pause();
    this.animationStep = 0;
    this.updateStepHighlight();
    this.draw();
  }

  animate() {
    if (!this.isPlaying) return;

    if (this.animationStep < this.getMaxSteps()) {
      setTimeout(() => {
        this.animationStep++;
        this.updateStepHighlight();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
      }, 2000);
    } else {
      this.isPlaying = false;
    }
  }

  getMaxSteps() {
    return this.currentScenario === 'two-process' ? 5 : 4;
  }

  updateStepHighlight() {
    const steps = document.querySelectorAll('.step-item');
    steps.forEach((step, index) => {
      step.classList.remove('active');
      if (index === this.animationStep) {
        step.classList.add('active');
      }
    });
  }

  draw() {
    // Always clear the entire canvas first
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.currentScenario === 'two-process') {
      this.drawTwoProcessScenario();
    } else {
      this.drawDiningPhilosophers();
    }
  }

  drawTwoProcessScenario() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw processes
    this.drawProcess(centerX - 150, centerY - 50, 'P1', this.animationStep >= 1);
    this.drawProcess(centerX + 150, centerY - 50, 'P2', this.animationStep >= 1);

    // Draw resources
    this.drawResource(centerX - 150, centerY + 50, 'Printer', this.animationStep >= 1 ? 'P1' : null);
    this.drawResource(centerX + 150, centerY + 50, 'Scanner', this.animationStep >= 1 ? 'P2' : null);

    // Draw allocation edges (solid)
    if (this.animationStep >= 1) {
      this.drawEdge(centerX - 150, centerY - 30, centerX - 150, centerY + 30, 'solid', '#10B981');
      this.drawEdge(centerX + 150, centerY - 30, centerX + 150, centerY + 30, 'solid', '#10B981');
    }

    // Draw request edges (dashed)
    if (this.animationStep >= 2) {
      this.drawEdge(centerX - 130, centerY - 50, centerX + 130, centerY + 50, 'dashed', '#EF4444');
    }
    if (this.animationStep >= 3) {
      this.drawEdge(centerX + 130, centerY - 50, centerX - 130, centerY + 50, 'dashed', '#EF4444');
    }

    // Show deadlock indicator
    if (this.animationStep >= 4) {
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      this.ctx.fillRect(50, 50, width - 100, height - 100);
      
      this.ctx.fillStyle = '#EF4444';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('DEADLOCK!', centerX, 50);
    }
  }

  drawDiningPhilosophers() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120;

    // Draw table (circle)
    this.ctx.strokeStyle = '#6B7280';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius - 20, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw philosophers and forks
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const philX = centerX + Math.cos(angle) * radius;
      const philY = centerY + Math.sin(angle) * radius;
      
      // Draw philosopher
      const hasLeftFork = this.animationStep >= 1;
      this.drawPhilosopher(philX, philY, `P${i + 1}`, hasLeftFork);

      // Draw fork position
      const forkAngle = angle + (2 * Math.PI) / 10;
      const forkX = centerX + Math.cos(forkAngle) * (radius - 40);
      const forkY = centerY + Math.sin(forkAngle) * (radius - 40);
      
      const forkOwner = hasLeftFork ? `P${i + 1}` : null;
      this.drawFork(forkX, forkY, `F${i + 1}`, forkOwner);
    }

    // Show deadlock indicator
    if (this.animationStep >= 3) {
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      this.ctx.fillRect(50, 50, width - 100, height - 100);
      
      this.ctx.fillStyle = '#EF4444';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('DEADLOCK!', centerX, 50);
    }
  }

  drawProcess(x, y, label, active) {
    this.ctx.fillStyle = active ? '#3B82F6' : '#93C5FD';
    this.ctx.strokeStyle = '#1E40AF';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x, y + 5);
  }

  drawResource(x, y, label, owner) {
    this.ctx.fillStyle = owner ? '#10B981' : '#6EE7B7';
    this.ctx.strokeStyle = '#059669';
    this.ctx.lineWidth = 2;
    
    this.ctx.fillRect(x - 25, y - 15, 50, 30);
    this.ctx.strokeRect(x - 25, y - 15, 50, 30);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x, y + 4);
    
    if (owner) {
      this.ctx.fillStyle = '#059669';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`(${owner})`, x, y + 40);
    }
  }

  drawPhilosopher(x, y, label, thinking) {
    this.ctx.fillStyle = thinking ? '#F59E0B' : '#FDE68A';
    this.ctx.strokeStyle = '#D97706';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x, y + 3);
  }

  drawFork(x, y, label, owner) {
    this.ctx.fillStyle = owner ? '#EF4444' : '#94A3B8';
    this.ctx.strokeStyle = '#64748B';
    this.ctx.lineWidth = 1;
    
    this.ctx.fillRect(x - 8, y - 3, 16, 6);
    this.ctx.strokeRect(x - 8, y - 3, 16, 6);
    
    this.ctx.fillStyle = '#374151';
    this.ctx.font = '8px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x, y + 2);
  }

  drawEdge(x1, y1, x2, y2, style, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    
    if (style === 'dashed') {
      this.ctx.setLineDash([5, 5]);
    } else {
      this.ctx.setLineDash([]);
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    
    // Draw arrow
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowX = x2 - 10 * Math.cos(angle);
    const arrowY = y2 - 10 * Math.sin(angle);
    
    this.ctx.beginPath();
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(arrowX - 5 * Math.cos(angle - Math.PI/6), arrowY - 5 * Math.sin(angle - Math.PI/6));
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(arrowX - 5 * Math.cos(angle + Math.PI/6), arrowY - 5 * Math.sin(angle + Math.PI/6));
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }
}

// RAG Visualizer
class RAGVisualizer {
  constructor() {
    this.canvas = document.getElementById('rag-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.processes = [];
    this.resources = [];
    this.edges = [];
    this.selectedNode = null;
    this.processCount = 0;
    this.resourceCount = 0;
    
    this.setupEventListeners();
    this.draw();
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
  }

  addProcess() {
    const x = 100 + Math.random() * (this.canvas.width - 200);
    const y = 100 + Math.random() * (this.canvas.height - 200);
    this.processes.push({
      id: `P${++this.processCount}`,
      x, y,
      type: 'process'
    });
    this.draw();
  }

  addResource() {
    const x = 100 + Math.random() * (this.canvas.width - 200);
    const y = 100 + Math.random() * (this.canvas.height - 200);
    this.resources.push({
      id: `R${++this.resourceCount}`,
      x, y,
      type: 'resource'
    });
    this.draw();
  }

  clear() {
    this.processes = [];
    this.resources = [];
    this.edges = [];
    this.selectedNode = null;
    this.processCount = 0;
    this.resourceCount = 0;
    this.updateCycleStatus(false);
    this.draw();
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = this.getNodeAt(x, y);
    
    if (this.selectedNode && clickedNode && this.selectedNode !== clickedNode) {
      // Create edge between selected node and clicked node
      this.addEdge(this.selectedNode, clickedNode);
      this.selectedNode = null;
    } else if (clickedNode) {
      this.selectedNode = this.selectedNode === clickedNode ? null : clickedNode;
    } else {
      this.selectedNode = null;
    }
    
    this.draw();
    this.detectCycles();
  }

  getNodeAt(x, y) {
    const allNodes = [...this.processes, ...this.resources];
    return allNodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 25;
    });
  }

  addEdge(from, to) {
    const existingEdge = this.edges.find(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    
    if (!existingEdge) {
      this.edges.push({ from, to });
    }
  }

  detectCycles() {
    const hasCycle = this.hasCircularWait();
    this.updateCycleStatus(hasCycle);
  }

  hasCircularWait() {
    const adjList = new Map();
    const allNodes = [...this.processes, ...this.resources];
    
    // Initialize adjacency list
    allNodes.forEach(node => adjList.set(node.id, []));
    
    // Build adjacency list from edges
    this.edges.forEach(edge => {
      adjList.get(edge.from.id).push(edge.to.id);
    });
    
    // DFS to detect cycle
    const visited = new Set();
    const recStack = new Set();
    
    const dfs = (node) => {
      visited.add(node);
      recStack.add(node);
      
      for (const neighbor of adjList.get(node) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
      
      recStack.delete(node);
      return false;
    };
    
    for (const node of allNodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }
    
    return false;
  }

  updateCycleStatus(hasCycle) {
    const statusElement = document.getElementById('cycle-status');
    if (hasCycle) {
      statusElement.textContent = 'Cycle Detected - DEADLOCK!';
      statusElement.className = 'status status--error';
    } else {
      statusElement.textContent = 'No Cycle Detected';
      statusElement.className = 'status status--success';
    }
  }

  draw() {
    // Always clear the entire canvas first
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw edges
    this.edges.forEach(edge => {
      this.drawEdge(edge.from, edge.to);
    });
    
    // Draw processes
    this.processes.forEach(process => {
      this.drawProcessNode(process, this.selectedNode === process);
    });
    
    // Draw resources
    this.resources.forEach(resource => {
      this.drawResourceNode(resource, this.selectedNode === resource);
    });
  }

  drawProcessNode(node, selected) {
    this.ctx.fillStyle = selected ? '#1E40AF' : '#3B82F6';
    this.ctx.strokeStyle = '#1E40AF';
    this.ctx.lineWidth = selected ? 3 : 2;
    
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(node.id, node.x, node.y + 5);
  }

  drawResourceNode(node, selected) {
    this.ctx.fillStyle = selected ? '#059669' : '#10B981';
    this.ctx.strokeStyle = '#059669';
    this.ctx.lineWidth = selected ? 3 : 2;
    
    this.ctx.fillRect(node.x - 25, node.y - 25, 50, 50);
    this.ctx.strokeRect(node.x - 25, node.y - 25, 50, 50);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(node.id, node.x, node.y + 5);
  }

  drawEdge(from, to) {
    this.ctx.strokeStyle = '#6B7280';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
    
    // Draw arrow
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowX = to.x - 25 * Math.cos(angle);
    const arrowY = to.y - 25 * Math.sin(angle);
    
    this.ctx.beginPath();
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI/6), arrowY - 10 * Math.sin(angle - Math.PI/6));
    this.ctx.moveTo(arrowX, arrowY);
    this.ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI/6), arrowY - 10 * Math.sin(angle + Math.PI/6));
    this.ctx.stroke();
  }
}

// Banker's Algorithm Simulator
class BankerSimulator {
  constructor() {
    this.processes = 5;
    this.resources = 3;
    this.allocation = [];
    this.max = [];
    this.available = [];
    this.generateMatrices();
  }

  generateMatrices() {
    const processInput = document.getElementById('num-processes');
    const resourceInput = document.getElementById('num-resources');
    
    this.processes = parseInt(processInput.value);
    this.resources = parseInt(resourceInput.value);
    
    // Use example data or generate new
    if (this.processes === 5 && this.resources === 3) {
      this.allocation = deadlockData.bankerExample.allocation;
      this.max = deadlockData.bankerExample.max;
      this.available = deadlockData.bankerExample.available.slice();
    } else {
      this.generateRandomMatrices();
    }
    
    this.displayMatrices();
  }

  generateRandomMatrices() {
    // Initialize matrices
    this.allocation = Array(this.processes).fill().map(() => 
      Array(this.resources).fill(0).map(() => Math.floor(Math.random() * 3))
    );
    
    this.max = Array(this.processes).fill().map((_, i) => 
      Array(this.resources).fill(0).map((_, j) => 
        this.allocation[i][j] + Math.floor(Math.random() * 4)
      )
    );
    
    this.available = Array(this.resources).fill(0).map(() => 
      Math.floor(Math.random() * 5) + 1
    );
  }

  displayMatrices() {
    this.displayAllocationMatrix();
    this.displayMaxMatrix();
    this.displayAvailableResources();
  }

  displayAllocationMatrix() {
    const container = document.getElementById('allocation-matrix');
    let html = '<table class="matrix-table"><tr><th>Process</th>';
    
    for (let j = 0; j < this.resources; j++) {
      html += `<th>R${j}</th>`;
    }
    html += '</tr>';
    
    for (let i = 0; i < this.processes; i++) {
      html += `<tr><th>P${i}</th>`;
      for (let j = 0; j < this.resources; j++) {
        html += `<td><input type="number" value="${this.allocation[i][j]}" 
                  onchange="app.bankerSimulator.updateAllocation(${i}, ${j}, this.value)" 
                  min="0" max="10"></td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    container.innerHTML = html;
  }

  displayMaxMatrix() {
    const container = document.getElementById('max-matrix');
    let html = '<table class="matrix-table"><tr><th>Process</th>';
    
    for (let j = 0; j < this.resources; j++) {
      html += `<th>R${j}</th>`;
    }
    html += '</tr>';
    
    for (let i = 0; i < this.processes; i++) {
      html += `<tr><th>P${i}</th>`;
      for (let j = 0; j < this.resources; j++) {
        html += `<td><input type="number" value="${this.max[i][j]}" 
                  onchange="app.bankerSimulator.updateMax(${i}, ${j}, this.value)" 
                  min="0" max="15"></td>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    container.innerHTML = html;
  }

  displayAvailableResources() {
    const container = document.getElementById('available-resources');
    let html = '<div class="available-input">';
    
    for (let j = 0; j < this.resources; j++) {
      html += `<div>
        <label>R${j}:</label>
        <input type="number" value="${this.available[j]}" 
               onchange="app.bankerSimulator.updateAvailable(${j}, this.value)" 
               min="0" max="20">
      </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  updateAllocation(i, j, value) {
    this.allocation[i][j] = parseInt(value) || 0;
  }

  updateMax(i, j, value) {
    this.max[i][j] = parseInt(value) || 0;
  }

  updateAvailable(j, value) {
    this.available[j] = parseInt(value) || 0;
  }

  runAlgorithm() {
    const result = this.bankerAlgorithm();
    this.displayResults(result);
  }

  bankerAlgorithm() {
    const need = this.calculateNeedMatrix();
    const work = [...this.available];
    const finish = Array(this.processes).fill(false);
    const safeSequence = [];
    const steps = [];
    
    steps.push(`Initial state: Available = [${work.join(', ')}]`);
    
    let found = true;
    while (found && safeSequence.length < this.processes) {
      found = false;
      
      for (let i = 0; i < this.processes; i++) {
        if (!finish[i] && this.canAllocate(need[i], work)) {
          // Process i can finish
          steps.push(`Process P${i} can complete. Need: [${need[i].join(', ')}], Available: [${work.join(', ')}]`);
          
          for (let j = 0; j < this.resources; j++) {
            work[j] += this.allocation[i][j];
          }
          
          finish[i] = true;
          safeSequence.push(`P${i}`);
          found = true;
          
          steps.push(`P${i} releases resources. New Available: [${work.join(', ')}]`);
          break;
        }
      }
    }
    
    const isSafe = safeSequence.length === this.processes;
    
    return {
      isSafe,
      safeSequence,
      steps,
      need
    };
  }

  calculateNeedMatrix() {
    const need = Array(this.processes).fill().map(() => Array(this.resources));
    
    for (let i = 0; i < this.processes; i++) {
      for (let j = 0; j < this.resources; j++) {
        need[i][j] = this.max[i][j] - this.allocation[i][j];
      }
    }
    
    return need;
  }

  canAllocate(need, available) {
    for (let j = 0; j < this.resources; j++) {
      if (need[j] > available[j]) {
        return false;
      }
    }
    return true;
  }

  displayResults(result) {
    const safetyResult = document.getElementById('safety-result');
    const safeSequence = document.getElementById('safe-sequence');
    const steps = document.getElementById('banker-steps');
    
    if (result.isSafe) {
      safetyResult.innerHTML = '<div class="safety-status safe">System is in SAFE state</div>';
      safeSequence.innerHTML = `
        <h5>Safe Sequence:</h5>
        <div class="sequence-list">
          ${result.safeSequence.map(p => `<span class="sequence-item">${p}</span>`).join('')}
        </div>
      `;
    } else {
      safetyResult.innerHTML = '<div class="safety-status unsafe">System is in UNSAFE state</div>';
      safeSequence.innerHTML = '<div class="status status--error">No safe sequence exists</div>';
    }
    
    steps.innerHTML = result.steps.map(step => 
      `<div class="step-detail">${step}</div>`
    ).join('');
  }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new DeadlockApp();
});