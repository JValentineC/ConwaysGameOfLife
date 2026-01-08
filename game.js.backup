// Dynamic grid sizing based on screen width
let numRows = 40;
let numCols = 40;

// Function to calculate optimal grid size based on screen width
function calculateGridSize() {
  if (isFullscreenMode) {
    calculateFullscreenGridSize();
    return;
  }

  const cellSize = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--cell-size")
  );
  const cellGap = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--cell-gap")
  );
  const gameContainer = document.getElementById("game").parentElement;
  const availableWidth = gameContainer.clientWidth * 0.9; // Use 90% of available width

  // Calculate how many columns can fit
  const maxCols = Math.floor(availableWidth / (cellSize + cellGap));

  // Set reasonable bounds for grid size - adjusted based on screen size
  let minCols, maxColsLimit;

  if (window.innerWidth <= 380) {
    // Very small screens
    minCols = Math.max(25, Math.min(30, maxCols));
    maxColsLimit = 40;
  } else if (window.innerWidth <= 480) {
    // Small screens
    minCols = Math.max(25, Math.min(35, maxCols));
    maxColsLimit = 45;
  } else if (window.innerWidth <= 900) {
    // Medium screens
    minCols = Math.max(36, Math.min(45, maxCols)); // Increased minimum for glider gun
    maxColsLimit = 55; // Increased maximum
  } else {
    // Large screens
    minCols = Math.max(40, Math.min(50, maxCols)); // Increased minimum for glider gun
    maxColsLimit = 70; // Increased maximum
  }

  numCols = Math.min(maxColsLimit, Math.max(minCols, maxCols));
  numRows = numCols; // Keep grid square for simplicity

  console.log(
    `Grid size calculated: ${numRows}x${numCols} (available width: ${availableWidth}px, screen width: ${window.innerWidth}px)`
  );
}

// Function to calculate optimal fullscreen grid size
function calculateFullscreenGridSize() {
  const cellSize = 8; // Smaller cells for fullscreen
  const cellGap = 1;

  // Calculate available space (leaving room for controls)
  const availableWidth = window.innerWidth - 40; // 20px margin on each side
  const availableHeight = window.innerHeight - 120; // Room for controls and margins

  // Calculate maximum columns and rows that fit
  const maxCols = Math.floor(availableWidth / (cellSize + cellGap));
  const maxRows = Math.floor(availableHeight / (cellSize + cellGap));

  // Set reasonable bounds for fullscreen
  numCols = Math.min(Math.max(maxCols, 60), 150); // Between 60-150 columns
  numRows = Math.min(Math.max(maxRows, 40), 100); // Between 40-100 rows

  console.log(
    `Fullscreen grid size calculated: ${numRows}x${numCols} (available: ${availableWidth}x${availableHeight}px)`
  );
}

// Generate initial state based on current grid size
function generateInitialState() {
  // Create a pattern similar to the original but scaled to current grid size
  const state = Array.from({ length: numRows }, () => Array(numCols).fill(0));

  // Add corner markers if grid is large enough
  if (numRows > 5 && numCols > 5) {
    state[0][0] = 1;
    state[0][numCols - 1] = 1;
    state[numRows - 1][0] = 1;
    state[numRows - 1][numCols - 1] = 1;
  }

  // Add a central pattern if grid is large enough
  if (numRows > 10 && numCols > 10) {
    const centerRow = Math.floor(numRows / 2);
    const centerCol = Math.floor(numCols / 2);

    // Create a simple cross pattern in the center
    for (let i = -2; i <= 2; i++) {
      if (centerRow + i >= 0 && centerRow + i < numRows) {
        state[centerRow + i][centerCol] = 1;
      }
      if (centerCol + i >= 0 && centerCol + i < numCols) {
        state[centerRow][centerCol + i] = 1;
      }
    }

    // Add some additional interesting patterns
    if (numRows > 15 && numCols > 15) {
      // Add glider in top-left area
      const gliderRow = 2;
      const gliderCol = 2;
      state[gliderRow][gliderCol + 1] = 1;
      state[gliderRow + 1][gliderCol + 2] = 1;
      state[gliderRow + 2][gliderCol] = 1;
      state[gliderRow + 2][gliderCol + 1] = 1;
      state[gliderRow + 2][gliderCol + 2] = 1;
    }
  }

  return state;
}

let initialState = [];
let state = [];

let interval = null;
let tickCount = 0;
let gameSpeed = 5; // Speed multiplier (1-10)
let baseInterval = 500; // Base interval in milliseconds

// Tutorial mode variables
let isInTutorialMode = true;
let tutorialTicksRequired = 15; // Will be adjusted based on grid size

// Placement mode variables
let isInPlacementMode = false;
let selectedPattern = null;
let selectedPatternType = null;

// Fullscreen mode variables
let isFullscreenMode = false;
let normalGridSize = { rows: 40, cols: 40 };

// Game rules - default Conway's Game of Life
let survivalRules = [2, 3]; // Live cell survives with these neighbor counts
let birthRules = [3]; // Dead cell becomes alive with these neighbor counts

// Save/Load state management
const SAVE_KEY = "gameOfLifeSavedStates";
const MAX_SAVES = 5;

// Statistics tracking
let statistics = {
  population: 0,
  births: 0,
  deaths: 0,
  peakPopulation: 0,
};

// Theme management
let currentTheme = localStorage.getItem("gameOfLifeTheme") || "dark";
let aliveCellColor = localStorage.getItem("aliveCellColor") || "#efe9e9";

// Custom patterns storage
const CUSTOM_PATTERNS_KEY = "gameOfLifeCustomPatterns";
let customPatterns = JSON.parse(
  localStorage.getItem(CUSTOM_PATTERNS_KEY) || "{}"
);

// Pattern filtering
let currentFilter = "all";
let currentSearchTerm = "";

// Famous Game of Life patterns - spaceships, oscillators, and still lifes
const spaceshipPatterns = {
  // === SPACESHIPS ===
  glider: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1],
  ],
  lwss: [
    // Lightweight Spaceship
    [0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  mwss: [
    // Middleweight Spaceship
    [0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0],
  ],
  hwss: [
    // Heavyweight Spaceship (HWSS)
    [0, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0],
  ],

  // === OSCILLATORS ===
  blinker: [
    // Period 2 oscillator
    [1, 1, 1],
  ],
  toad: [
    // Period 2 oscillator
    [0, 1, 1, 1],
    [1, 1, 1, 0],
  ],
  beacon: [
    // Period 2 oscillator
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
  ],
  pulsar: [
    // Period 3 oscillator
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  ],

  // === STILL LIFES ===
  block: [
    // Still life
    [1, 1],
    [1, 1],
  ],
  beehive: [
    // Still life
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  loaf: [
    // Still life
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 0],
  ],
  boat: [
    // Still life
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],

  // === GUNS & GENERATORS ===
  glidergun: [
    // Gosper Glider Gun - generates gliders every 30 generations
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  ],

  // === METHUSELAHS (Long-lived patterns) ===
  acorn: [
    // Takes 5206 generations to stabilize
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1],
  ],
  diehard: [
    // Dies completely after 130 generations
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1],
  ],
  copperhead: [
    // Copperhead spaceship - very stable diagonal movement
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [1, 1, 0, 1, 0, 0, 1, 0, 1, 1],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  ],
  Galaxy: [
    // Galaxy  - oscillator
    [1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1],
  ],

  Weekender: [
    // Weekender  - orthogonal spaceship
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
  ],
  pufferfish: [
    // Pufferfish spaceship - leaves a trail of debris behind
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  ],
};

function findNeighbors(i, j) {
  const dirs = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];

  // Use wrapping boundaries (toroidal topology)
  return dirs.map(([di, dj]) => [
    (i + di + numRows) % numRows,
    (j + dj + numCols) % numCols,
  ]);
}

function placePatternAt(pattern, startRow, startCol) {
  // Check if pattern fits within grid bounds
  if (
    startRow + pattern.length > numRows ||
    startCol + pattern[0].length > numCols
  ) {
    // Try to adjust position to fit the pattern
    startRow = Math.max(0, Math.min(startRow, numRows - pattern.length));
    startCol = Math.max(0, Math.min(startCol, numCols - pattern[0].length));

    // If it still doesn't fit, return false
    if (
      startRow + pattern.length > numRows ||
      startCol + pattern[0].length > numCols
    ) {
      console.log(
        `Pattern ${selectedPatternType} is too large for grid. Pattern size: ${pattern.length}x${pattern[0].length}, Grid size: ${numRows}x${numCols}`
      );
      return false; // Pattern doesn't fit
    }
  }

  console.log(
    `Placing ${selectedPatternType} at position (${startRow}, ${startCol})`
  );

  // Place the pattern on the grid
  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      if (pattern[i][j] === 1) {
        state[startRow + i][startCol + j] = 1;
      }
    }
  }
  return true; // Successfully placed
}

// Check if a pattern fits on the current grid
function patternFitsOnGrid(pattern) {
  return pattern.length <= numRows && pattern[0].length <= numCols;
}

// Update pattern visibility based on current grid size
function updatePatternVisibility() {
  Object.keys(spaceshipPatterns).forEach((patternName) => {
    const pattern = spaceshipPatterns[patternName];
    const display = document.querySelector(`[data-ship="${patternName}"]`);

    if (display) {
      const fits = patternFitsOnGrid(pattern);
      if (fits) {
        display.style.display = "block";
        display.style.opacity = "1";
        display.style.pointerEvents = "auto";
        // Remove any "too large" styling
        display.classList.remove("pattern-too-large");
      } else {
        // Instead of hiding completely, show it but disabled
        display.style.display = "block";
        display.style.opacity = "0.3";
        display.style.pointerEvents = "none";
        display.classList.add("pattern-too-large");

        // Add a visual indicator that it's too large
        let sizeInfo = display.querySelector(".size-info");
        if (!sizeInfo) {
          sizeInfo = document.createElement("div");
          sizeInfo.className = "size-info";
          sizeInfo.style.color = "#ff6b6b";
          sizeInfo.style.fontSize = "0.8em";
          sizeInfo.style.fontWeight = "bold";
          sizeInfo.style.marginTop = "5px";
          display.appendChild(sizeInfo);
        }
        sizeInfo.textContent = `Too large for ${numRows}x${numCols} grid (needs ${pattern.length}x${pattern[0].length})`;
      }
    }
  });

  // Update mobile dropdown if it exists
  const dropdown = document.getElementById("pattern-dropdown");
  if (dropdown) {
    populatePatternDropdown();
  }

  console.log(`Updated pattern visibility for grid size ${numRows}x${numCols}`);
}

function enterPlacementMode(shipType) {
  if (isInTutorialMode) return; // Don't allow during tutorial

  const pattern = spaceshipPatterns[shipType];
  if (!pattern) {
    console.error(`Unknown ship type: ${shipType}`);
    return;
  }

  isInPlacementMode = true;
  selectedPattern = pattern;
  selectedPatternType = shipType;

  // Update cursor to indicate placement mode
  document.getElementById("game").style.cursor = "crosshair";

  // Show pattern dimensions and placement instructions
  const patternSize = `${pattern.length}x${pattern[0].length}`;
  document.getElementById("tick-counter").textContent =
    `Click on the grid to place ${shipType} (${patternSize}). Grid size: ${numRows}x${numCols}. Press Escape to cancel.`;

  console.log(
    `Entering placement mode for ${shipType}. Pattern size: ${patternSize}, Grid size: ${numRows}x${numCols}`
  );
}

function exitPlacementMode() {
  isInPlacementMode = false;
  selectedPattern = null;
  selectedPatternType = null;
  document.getElementById("game").style.cursor = "default";
  updateTickCounter(); // Restore normal tick counter
}

function tick(state) {
  const next = Array.from({ length: numRows }, () => Array(numCols).fill(0));

  // Track statistics before changes
  if (!isInTutorialMode) {
    trackCellChanges(state, next);
  }

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const neighbors = findNeighbors(i, j);
      const alive = neighbors.reduce((sum, [ni, nj]) => sum + state[ni][nj], 0);
      if (state[i][j]) {
        // Live cell survival rules
        next[i][j] = survivalRules.includes(alive) ? 1 : 0;
      } else {
        // Dead cell birth rules
        next[i][j] = birthRules.includes(alive) ? 1 : 0;
      }
    }
  }

  // Update statistics after changes
  if (!isInTutorialMode) {
    trackCellChanges(state, next);
  }

  return next;
}

function draw(state) {
  const game = document.getElementById("game");

  // Update CSS grid columns dynamically
  game.style.gridTemplateColumns = `repeat(${numCols}, var(--cell-size))`;

  game.innerHTML = "";
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cell = document.createElement("div");
      cell.className = "cell" + (state[i][j] ? " alive" : "");

      // Only allow cell interaction if not in tutorial mode
      if (!isInTutorialMode) {
        cell.addEventListener("click", () => {
          if (isInPlacementMode && selectedPattern) {
            // Place the selected pattern at this location
            if (placePatternAt(selectedPattern, i, j)) {
              draw(state); // Redraw to show the new pattern
              exitPlacementMode(); // Exit placement mode after placing
            } else {
              // Show error message if pattern couldn't be placed
              alert(
                `Cannot place ${selectedPatternType} here. Pattern is too large for the remaining grid space. Try clicking closer to the top-left corner.`
              );
            }
          } else {
            // Normal cell toggle behavior
            state[i][j] = state[i][j] ? 0 : 1; // Toggle cell
            draw(state); // Redraw to update UI
          }
        });
      }

      game.appendChild(cell);
    }
  }

  // Update statistics
  if (!isInTutorialMode) {
    updateStatistics();
  }
}

function updateTickCounter() {
  const ticksRemaining = isInTutorialMode
    ? tutorialTicksRequired - tickCount
    : 0;
  const tutorialText = isInTutorialMode
    ? ` (Tutorial: ${ticksRemaining} ticks remaining)`
    : "";
  const counterText = `Tick: ${tickCount}${tutorialText}`;

  // Update both normal and fullscreen tick counters
  const normalCounter = document.getElementById("tick-counter");
  const fullscreenCounter = document.getElementById("fullscreen-tick-counter");

  if (normalCounter) normalCounter.textContent = counterText;
  if (fullscreenCounter) fullscreenCounter.textContent = counterText;
}

function disableControls() {
  // Disable main controls
  const controlIds = [
    "start",
    "stop",
    "reset",
    "apply-rules",
    "survival-rules",
    "birth-rules",
    "speed-slider",
    "save-state",
  ];
  controlIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = true;
  });

  const fullscreenBtn = document.getElementById("toggle-fullscreen");
  if (fullscreenBtn) fullscreenBtn.disabled = true;

  // Disable mobile controls during tutorial
  const mobileControlIds = ["mobile-start", "mobile-stop", "mobile-reset"];
  mobileControlIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = true;
  });

  const mobileFullscreenBtn = document.getElementById("mobile-fullscreen");
  if (mobileFullscreenBtn) mobileFullscreenBtn.disabled = true;

  // Disable spaceship clicking during tutorial
  const shipDisplays = document.querySelectorAll(".ship-display.clickable");
  shipDisplays.forEach((display) => {
    display.style.pointerEvents = "none";
    display.style.opacity = "0.5";
  });

  // Disable mobile pattern selection during tutorial
  const patternDropdown = document.getElementById("pattern-dropdown");
  const viewPatternButton = document.getElementById("view-pattern");
  if (patternDropdown) {
    patternDropdown.disabled = true;
    viewPatternButton.disabled = true;
  }

  // Disable save/load during tutorial
  updateSaveLoadButtons();
}

function enableControls() {
  // Enable main controls
  const controlIds = [
    "start",
    "stop",
    "reset",
    "apply-rules",
    "survival-rules",
    "birth-rules",
    "speed-slider",
    "save-state",
  ];
  controlIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = false;
  });

  const fullscreenBtn = document.getElementById("toggle-fullscreen");
  if (fullscreenBtn) fullscreenBtn.disabled = false;

  // Enable mobile controls
  const mobileControlIds = ["mobile-start", "mobile-stop", "mobile-reset"];
  mobileControlIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = false;
  });

  const mobileFullscreenBtn = document.getElementById("mobile-fullscreen");
  if (mobileFullscreenBtn) mobileFullscreenBtn.disabled = false;

  // Enable spaceship clicking after tutorial
  const shipDisplays = document.querySelectorAll(".ship-display.clickable");
  shipDisplays.forEach((display) => {
    display.style.pointerEvents = "auto";
    display.style.opacity = "1";
  });

  // Enable mobile pattern selection
  const patternDropdown = document.getElementById("pattern-dropdown");
  const viewPatternButton = document.getElementById("view-pattern");
  if (patternDropdown) {
    patternDropdown.disabled = false;
    if (patternDropdown.value) {
      viewPatternButton.disabled = false;
    }
  }

  // Update pattern visibility based on current grid size
  updatePatternVisibility();

  // Enable save/load buttons
  updateSaveLoadButtons();
}

function updateRulesDisplay() {
  const currentRulesList = document.getElementById("current-rules");
  const survivalText =
    survivalRules.length > 0 ? survivalRules.join(", ") : "none";
  const birthText = birthRules.length > 0 ? birthRules.join(", ") : "none";

  currentRulesList.innerHTML = `
    <li>Live cells survive with ${survivalText} neighbors</li>
    <li>Dead cells become alive with ${birthText} neighbors</li>
  `;
}

function applyCustomRules() {
  if (isInTutorialMode) return; // Don't allow during tutorial

  const survivalInput = document.getElementById("survival-rules").value;
  const birthInput = document.getElementById("birth-rules").value;

  try {
    // Parse survival rules
    survivalRules = survivalInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 8);

    // Parse birth rules
    birthRules = birthInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 8);

    updateRulesDisplay();
    document.getElementById("rules_updated_modal").showModal();
  } catch (error) {
    document.getElementById("invalid_rules_modal").showModal();
  }
}

function start() {
  if (interval) return;

  if (isInTutorialMode) {
    tickCount = 0;
  } else {
    // Track game start for authenticated users
    if (typeof authSystem !== "undefined" && authSystem.isAuthenticated()) {
      authSystem.incrementGamesPlayed();
    }
  }

  updateTickCounter();
  let prevState = state.map((row) => [...row]);

  // Calculate interval based on speed
  const intervalTime = baseInterval / gameSpeed;

  interval = setInterval(() => {
    state = tick(state);
    tickCount++;
    updateTickCounter();
    draw(state);

    // Track ticks for authenticated users (outside tutorial)
    if (
      !isInTutorialMode &&
      typeof authSystem !== "undefined" &&
      authSystem.isAuthenticated()
    ) {
      authSystem.addTicks(1);
    }

    // Check if tutorial is complete
    if (isInTutorialMode && tickCount >= tutorialTicksRequired) {
      stop();
      isInTutorialMode = false;

      // Use the existing reset function to clear the board
      // Since isInTutorialMode is now false, reset() will work
      reset();

      enableControls();
      document.getElementById("tutorial_complete_modal").showModal();
      return;
    }

    // Check for stabilization or oscillation (only outside tutorial)
    if (
      !isInTutorialMode &&
      JSON.stringify(state) === JSON.stringify(prevState)
    ) {
      stop();
      document.getElementById("pattern_stable_modal").showModal();
    }
    prevState = state.map((row) => [...row]);
  }, intervalTime);
}

function stop() {
  clearInterval(interval);
  interval = null;
}

function reset() {
  if (isInTutorialMode) return; // Don't allow reset during tutorial

  stop(); // Stop the game if it's running

  // Create a completely empty grid instead of using initializeGrid()
  calculateGridSize(); // Ensure we have the current grid size
  state = Array.from({ length: numRows }, () => Array(numCols).fill(0));
  initialState = state.map((row) => [...row]); // Update initial state to empty as well

  tickCount = 0; // Reset tick counter
  resetStatistics(); // Reset statistics
  updateTickCounter();
  draw(state); // Redraw the grid
}

// Fullscreen mode functions
function toggleFullscreen() {
  if (isFullscreenMode) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

function enterFullscreen() {
  if (isInTutorialMode) return; // Don't allow during tutorial

  // Save current state
  normalGridSize = { rows: numRows, cols: numCols };

  isFullscreenMode = true;

  // Hide non-essential elements
  document.querySelector(".main-layout").style.display = "none";
  document.querySelector(".spaceship-patterns").style.display = "none";
  document.querySelector(".mobile-controls").style.display = "none";
  document.querySelector(".click-instruction").style.display = "none";
  document.querySelector(".title").style.display = "none";

  // Show fullscreen container
  let fullscreenContainer = document.getElementById("fullscreen-container");
  if (!fullscreenContainer) {
    createFullscreenContainer();
    fullscreenContainer = document.getElementById("fullscreen-container");
  }
  fullscreenContainer.style.display = "flex";

  // Recalculate grid for fullscreen
  calculateGridSize();

  // Reset the grid with new size
  state = Array.from({ length: numRows }, () => Array(numCols).fill(0));
  initialState = state.map((row) => [...row]);

  // Move game to fullscreen container
  const gameElement = document.getElementById("game");
  const fullscreenGame = document.getElementById("fullscreen-game");
  fullscreenGame.appendChild(gameElement);

  // Update cell size for fullscreen
  document.documentElement.style.setProperty("--cell-size", "8px");
  document.documentElement.style.setProperty("--cell-gap", "1px");

  draw(state);
  updateTickCounter();

  console.log(`Entered fullscreen mode: ${numRows}x${numCols}`);
}

function exitFullscreen() {
  isFullscreenMode = false;

  // Hide fullscreen container
  document.getElementById("fullscreen-container").style.display = "none";

  // Show normal elements
  document.querySelector(".main-layout").style.display = "flex";
  document.querySelector(".spaceship-patterns").style.display = "grid";
  document.querySelector(".mobile-controls").style.display =
    window.innerWidth <= 768 ? "flex" : "none";
  document.querySelector(".click-instruction").style.display = "block";
  document.querySelector(".title").style.display = "flex";

  // Restore normal grid size
  numRows = normalGridSize.rows;
  numCols = normalGridSize.cols;

  // Move game back to normal container
  const gameElement = document.getElementById("game");
  const normalContainer = document.querySelector(".container");
  normalContainer.insertBefore(gameElement, normalContainer.children[1]);

  // Restore normal cell size
  document.documentElement.style.setProperty("--cell-size", "12px");
  document.documentElement.style.setProperty("--cell-gap", "1px");

  // Reset the grid with normal size
  state = Array.from({ length: numRows }, () => Array(numCols).fill(0));
  initialState = state.map((row) => [...row]);

  draw(state);
  updateTickCounter();

  console.log(`Exited fullscreen mode: ${numRows}x${numCols}`);
}

function createFullscreenContainer() {
  const fullscreenContainer = document.createElement("div");
  fullscreenContainer.id = "fullscreen-container";
  fullscreenContainer.innerHTML = `
    <div id="fullscreen-controls">
      <button id="fullscreen-start">Start</button>
      <button id="fullscreen-stop">Stop</button>
      <button id="fullscreen-reset">Reset</button>
      <button id="exit-fullscreen">Exit Fullscreen</button>
      <span id="fullscreen-tick-counter">Tick: 0</span>
    </div>
    <div id="fullscreen-game"></div>
    <div id="fullscreen-patterns">
      <div class="fullscreen-pattern-category">
        <span class="pattern-category-title">🚀 Spaceships:</span>
        <button class="fullscreen-pattern-btn" data-pattern="glider">Glider</button>
        <button class="fullscreen-pattern-btn" data-pattern="lwss">LWSS</button>
        <button class="fullscreen-pattern-btn" data-pattern="mwss">MWSS</button>
        <button class="fullscreen-pattern-btn" data-pattern="hwss">HWSS</button>
        <button class="fullscreen-pattern-btn" data-pattern="copperhead">Copperhead</button>
        <button class="fullscreen-pattern-btn" data-pattern="Weekender">Weekender</button>
        <button class="fullscreen-pattern-btn" data-pattern="pufferfish">Pufferfish</button>
      </div>
      <div class="fullscreen-pattern-category">
        <span class="pattern-category-title">🔄 Oscillators:</span>
        <button class="fullscreen-pattern-btn" data-pattern="blinker">Blinker</button>
        <button class="fullscreen-pattern-btn" data-pattern="toad">Toad</button>
        <button class="fullscreen-pattern-btn" data-pattern="beacon">Beacon</button>
        <button class="fullscreen-pattern-btn" data-pattern="pulsar">Pulsar</button>
        <button class="fullscreen-pattern-btn" data-pattern="Galaxy">Galaxy</button>
      </div>
      <div class="fullscreen-pattern-category">
        <span class="pattern-category-title">🔸 Still Lifes:</span>
        <button class="fullscreen-pattern-btn" data-pattern="block">Block</button>
        <button class="fullscreen-pattern-btn" data-pattern="beehive">Beehive</button>
        <button class="fullscreen-pattern-btn" data-pattern="loaf">Loaf</button>
        <button class="fullscreen-pattern-btn" data-pattern="boat">Boat</button>
      </div>
      <div class="fullscreen-pattern-category">
        <span class="pattern-category-title">⚡ Generators:</span>
        <button class="fullscreen-pattern-btn" data-pattern="glidergun">Glider Gun</button>
      </div>
      <div class="fullscreen-pattern-category">
        <span class="pattern-category-title">🧬 Methuselahs:</span>
        <button class="fullscreen-pattern-btn" data-pattern="acorn">Acorn</button>
        <button class="fullscreen-pattern-btn" data-pattern="diehard">Diehard</button>
      </div>
    </div>
  `;
  document.body.appendChild(fullscreenContainer);

  // Add event listeners for fullscreen controls
  document.getElementById("fullscreen-start").onclick = start;
  document.getElementById("fullscreen-stop").onclick = stop;
  document.getElementById("fullscreen-reset").onclick = reset;
  document.getElementById("exit-fullscreen").onclick = exitFullscreen;

  // Add event listeners for fullscreen pattern buttons
  const patternButtons = document.querySelectorAll(".fullscreen-pattern-btn");
  patternButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (isInTutorialMode) return;
      const patternName = this.getAttribute("data-pattern");
      enterPlacementMode(patternName);
    });
  });
}

// Initialize or reinitialize the grid
function initializeGrid() {
  calculateGridSize();
  initialState = generateInitialState();
  state = initialState.map((row) => [...row]);

  // Adjust tutorial length based on grid size (more cells = longer tutorial)
  const gridSize = numRows * numCols;
  tutorialTicksRequired = Math.max(10, Math.min(25, Math.floor(gridSize / 15)));

  // Update pattern visibility based on new grid size
  updatePatternVisibility();
}

// Event listeners
document.getElementById("start").onclick = start;
document.getElementById("stop").onclick = stop;
document.getElementById("reset").onclick = reset;
document.getElementById("apply-rules").onclick = applyCustomRules;

// Mobile control event listeners
document.getElementById("mobile-start").onclick = start;
document.getElementById("mobile-stop").onclick = stop;
document.getElementById("mobile-reset").onclick = reset;

// Function to generate pattern displays dynamically
function generatePatternDisplays() {
  Object.keys(spaceshipPatterns).forEach((patternName) => {
    const pattern = spaceshipPatterns[patternName];
    const patternElement = document.querySelector(
      `[data-ship="${patternName}"] .ship-pattern`
    );

    if (patternElement) {
      // Clear existing content
      patternElement.innerHTML = "";

      // Set up CSS grid
      patternElement.style.display = "grid";
      patternElement.style.gridTemplateColumns = `repeat(${pattern[0].length}, 8px)`;
      patternElement.style.gap = "1px";

      // Generate cells
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          const cell = document.createElement("div");
          cell.className = pattern[i][j] ? "cell alive" : "cell";
          patternElement.appendChild(cell);
        }
      }
    }
  });
}

// Add mobile fullscreen listener when DOM loads
document.addEventListener("DOMContentLoaded", function () {
  // Generate all pattern displays dynamically
  generatePatternDisplays();

  const mobileFullscreenBtn = document.getElementById("mobile-fullscreen");
  if (mobileFullscreenBtn) {
    mobileFullscreenBtn.onclick = toggleFullscreen;
  }

  // Add fullscreen button event listener
  const fullscreenBtn = document.getElementById("toggle-fullscreen");
  if (fullscreenBtn) {
    fullscreenBtn.onclick = toggleFullscreen;
  }

  const shipDisplays = document.querySelectorAll(".ship-display.clickable");
  shipDisplays.forEach((display) => {
    display.addEventListener("click", function () {
      if (isInTutorialMode) return; // Don't allow during tutorial

      const shipType = this.getAttribute("data-ship");
      enterPlacementMode(shipType);
    });
  });

  // Mobile pattern dropdown events
  const patternDropdown = document.getElementById("pattern-dropdown");
  const viewPatternButton = document.getElementById("view-pattern");
  const toggleRulesButton = document.getElementById("toggle-rules");
  const modal = document.getElementById("pattern-preview-modal");
  const closeModal = document.querySelector(".pattern-modal-close");
  const placePatternButton = document.getElementById("place-pattern");
  const cancelPatternButton = document.getElementById("cancel-pattern");

  // Pattern dropdown change
  patternDropdown.addEventListener("change", function () {
    const selectedPattern = this.value;
    viewPatternButton.disabled = !selectedPattern || isInTutorialMode;
  });

  // View pattern button
  viewPatternButton.addEventListener("click", function () {
    const selectedPattern = patternDropdown.value;
    if (selectedPattern) {
      showPatternPreview(selectedPattern);
    }
  });

  // Toggle rules button
  toggleRulesButton.addEventListener("click", toggleMobileRules);

  // Modal events
  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
  });

  cancelPatternButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  placePatternButton.addEventListener("click", function () {
    const patternName = this.getAttribute("data-pattern");
    if (patternName && !isInTutorialMode) {
      modal.style.display = "none";
      enterPlacementMode(patternName);
      patternDropdown.value = ""; // Reset dropdown
      viewPatternButton.disabled = true;
    }
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Initial pattern visibility update after DOM is loaded
  updatePatternVisibility();
  populatePatternDropdown();
});
function populatePatternDropdown() {
  const dropdown = document.getElementById("pattern-dropdown");
  dropdown.innerHTML = '<option value="">Select a pattern...</option>';

  Object.keys(spaceshipPatterns).forEach((patternName) => {
    const pattern = spaceshipPatterns[patternName];
    const fits = patternFitsOnGrid(pattern);
    const option = document.createElement("option");
    option.value = patternName;
    option.textContent =
      patternName.charAt(0).toUpperCase() + patternName.slice(1);

    if (!fits) {
      option.textContent += ` (Too large for ${numRows}x${numCols})`;
      option.disabled = true;
    }

    dropdown.appendChild(option);
  });
}

function showPatternPreview(patternName) {
  if (!patternName || !spaceshipPatterns[patternName]) return;

  const pattern = spaceshipPatterns[patternName];
  const modal = document.getElementById("pattern-preview-modal");
  const title = document.getElementById("pattern-modal-title");
  const preview = document.getElementById("pattern-modal-preview");
  const description = document.getElementById("pattern-modal-description");
  const placeButton = document.getElementById("place-pattern");

  title.textContent =
    patternName.charAt(0).toUpperCase() + patternName.slice(1);

  // Create pattern preview
  preview.innerHTML = "";
  const patternGrid = document.createElement("div");
  patternGrid.className = "pattern-preview-grid";
  patternGrid.style.display = "grid";
  patternGrid.style.gridTemplateColumns = `repeat(${pattern[0].length}, 8px)`;
  patternGrid.style.gap = "1px";
  patternGrid.style.background = "#2c0202";
  patternGrid.style.padding = "5px";
  patternGrid.style.borderRadius = "4px";

  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      const cell = document.createElement("div");
      cell.style.width = "8px";
      cell.style.height = "8px";
      cell.style.background = pattern[i][j] ? "#efe9e9" : "#5b0202";
      cell.style.border = "1px solid #2c0202";
      patternGrid.appendChild(cell);
    }
  }

  preview.appendChild(patternGrid);

  // Set description based on pattern
  const descriptions = {
    glider: "The smallest spaceship, moves diagonally every 4 generations.",
    lwss: "Lightweight Spaceship - travels horizontally, period 4.",
    mwss: "Middleweight Spaceship - larger horizontal traveler, period 4.",
    hwss: "Heavyweight Spaceship - heavyweight horizontal traveler, period 4.",
    blinker: "Period 2 oscillator - simplest oscillator.",
    toad: "Period 2 oscillator.",
    beacon: "Period 2 oscillator.",
    pulsar: "Period 3 oscillator, very stable.",
    Galaxy: "Period 8 oscillator with rotating symmetric pattern.",
    block: "Simplest still life pattern.",
    beehive: "Common still life pattern.",
    loaf: "Still life with an asymmetric shape.",
    boat: "Small still life pattern.",
    glidergun: "Produces gliders infinitely (large pattern).",
    acorn: "Takes 5206 generations to stabilize!",
    diehard: "Dies completely after 130 generations.",
    copperhead: "Stable diagonal-moving spaceship.",
    pufferfish: "Orthogonal spaceship that leaves a trail of debris behind.",
    Weekender:
      "Orthogonal spaceship, travels horizontally every 5 generations.",
  };

  description.textContent =
    descriptions[patternName] || "Interesting Game of Life pattern.";

  // Enable/disable place button based on pattern fit
  const fits = patternFitsOnGrid(pattern);
  placeButton.disabled = !fits || isInTutorialMode;
  placeButton.setAttribute("data-pattern", patternName);

  if (!fits) {
    description.textContent += ` This pattern requires at least ${pattern.length}x${pattern[0].length} grid space.`;
  }

  modal.style.display = "block";
}

function toggleMobileRules() {
  const rulesSection = document.querySelector(".game-rules");
  rulesSection.classList.toggle("mobile-expanded");

  const button = document.getElementById("toggle-rules");
  if (rulesSection.classList.contains("mobile-expanded")) {
    button.textContent = "Hide Rules & Settings";
  } else {
    button.textContent = "Rules & Settings";
  }
}

// Speed control functions
function updateSpeed(newSpeed) {
  gameSpeed = parseInt(newSpeed);
  document.getElementById("speed-value").textContent = `${gameSpeed}x`;

  // Update ARIA value
  const slider = document.getElementById("speed-slider");
  if (slider) {
    slider.setAttribute("aria-valuenow", gameSpeed);
  }

  // If game is running, restart with new speed
  if (interval) {
    const wasRunning = true;
    stop();
    if (wasRunning) {
      start();
    }
  }
}

// Save/Load state functions
function saveCurrentState() {
  if (isInTutorialMode) return;

  const savedStates = getSavedStates();
  const timestamp = new Date().toISOString();
  const stateName = `Save ${savedStates.length + 1} - ${new Date().toLocaleString()}`;

  const saveData = {
    id: Date.now(),
    name: stateName,
    timestamp: timestamp,
    state: state,
    rows: numRows,
    cols: numCols,
    tickCount: tickCount,
    survivalRules: survivalRules,
    birthRules: birthRules,
  };

  savedStates.push(saveData);

  // Keep only the last MAX_SAVES
  if (savedStates.length > MAX_SAVES) {
    savedStates.shift();
  }

  localStorage.setItem(SAVE_KEY, JSON.stringify(savedStates));
  updateSaveLoadButtons();
  alert(
    `State saved successfully! (${savedStates.length}/${MAX_SAVES} slots used)`
  );
}

function loadSavedState() {
  if (isInTutorialMode) return;

  const savedStates = getSavedStates();
  if (savedStates.length === 0) {
    alert("No saved states available.");
    return;
  }

  // Show selection dialog
  const stateList = savedStates
    .map((save, index) => `${index + 1}. ${save.name}`)
    .join("\n");

  const selection = prompt(
    `Select a state to load (1-${savedStates.length}):\n\n${stateList}`
  );

  if (selection === null) return; // User cancelled

  const index = parseInt(selection) - 1;
  if (isNaN(index) || index < 0 || index >= savedStates.length) {
    alert("Invalid selection.");
    return;
  }

  const saveData = savedStates[index];

  // Stop game if running
  stop();

  // Restore state
  numRows = saveData.rows;
  numCols = saveData.cols;
  state = saveData.state.map((row) => [...row]);
  tickCount = saveData.tickCount;
  survivalRules = saveData.survivalRules;
  birthRules = saveData.birthRules;

  // Update UI
  document.getElementById("survival-rules").value = survivalRules.join(",");
  document.getElementById("birth-rules").value = birthRules.join(",");
  updateRulesDisplay();
  updateTickCounter();
  draw(state);

  alert(`State loaded: ${saveData.name}`);
}

function getSavedStates() {
  const saved = localStorage.getItem(SAVE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function clearSavedStates() {
  if (isInTutorialMode) return;

  if (
    confirm(
      "Are you sure you want to delete all saved states? This cannot be undone."
    )
  ) {
    localStorage.removeItem(SAVE_KEY);
    updateSaveLoadButtons();
    alert("All saved states cleared.");
  }
}

function updateSaveLoadButtons() {
  const savedStates = getSavedStates();
  const loadButton = document.getElementById("load-state");
  const clearButton = document.getElementById("clear-saved");

  if (loadButton) {
    loadButton.disabled = savedStates.length === 0 || isInTutorialMode;
  }

  if (clearButton) {
    clearButton.disabled = savedStates.length === 0 || isInTutorialMode;
  }
}

// ========== STATISTICS FUNCTIONS ==========
function updateStatistics() {
  const currentPop = state.flat().filter((cell) => cell === 1).length;
  statistics.population = currentPop;

  if (currentPop > statistics.peakPopulation) {
    statistics.peakPopulation = currentPop;
  }

  document.getElementById("stat-population").textContent =
    statistics.population;
  document.getElementById("stat-births").textContent = statistics.births;
  document.getElementById("stat-deaths").textContent = statistics.deaths;
  document.getElementById("stat-peak").textContent = statistics.peakPopulation;
}

function trackCellChanges(oldState, newState) {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (oldState[i][j] === 0 && newState[i][j] === 1) {
        statistics.births++;
      } else if (oldState[i][j] === 1 && newState[i][j] === 0) {
        statistics.deaths++;
      }
    }
  }
}

function resetStatistics() {
  statistics = {
    population: 0,
    births: 0,
    deaths: 0,
    peakPopulation: 0,
  };
  updateStatistics();
}

// ========== THEME FUNCTIONS ==========
function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }
  currentTheme = theme;
  localStorage.setItem("gameOfLifeTheme", theme);
}

function toggleTheme() {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function updateCellColor(color) {
  aliveCellColor = color;
  localStorage.setItem("aliveCellColor", color);
  document.documentElement.style.setProperty("--alive-cell-color", color);
  draw(state); // Redraw with new color
}

// ========== PATTERN SEARCH AND FILTER ==========
const patternCategories = {
  glider: "spaceships",
  lwss: "spaceships",
  mwss: "spaceships",
  hwss: "spaceships",
  copperhead: "spaceships",
  pufferfish: "spaceships",
  Weekender: "spaceships",
  blinker: "oscillators",
  toad: "oscillators",
  beacon: "oscillators",
  pulsar: "oscillators",
  Galaxy: "oscillators",
  block: "stilllifes",
  beehive: "stilllifes",
  loaf: "stilllifes",
  boat: "stilllifes",
  glidergun: "generators",
  acorn: "methuselahs",
  diehard: "methuselahs",
};

function filterPatterns() {
  const searchTerm = currentSearchTerm.toLowerCase();
  const displays = document.querySelectorAll(".ship-display");

  displays.forEach((display) => {
    const patternName = display.getAttribute("data-ship");
    const patternCategory = patternCategories[patternName] || "other";
    const patternTitle =
      display.querySelector("h4")?.textContent.toLowerCase() || "";

    // Check filter match
    const categoryMatch =
      currentFilter === "all" || patternCategory === currentFilter;

    // Check search match
    const searchMatch =
      searchTerm === "" ||
      patternName.toLowerCase().includes(searchTerm) ||
      patternTitle.includes(searchTerm);

    if (categoryMatch && searchMatch) {
      display.classList.remove("hidden-by-filter");
    } else {
      display.classList.add("hidden-by-filter");
    }
  });

  // Update category headers visibility
  updateCategoryHeaders();
}

function updateCategoryHeaders() {
  const categories = [
    "spaceships",
    "oscillators",
    "stilllifes",
    "generators",
    "methuselahs",
  ];

  categories.forEach((category) => {
    const header = document.querySelector(`.${category}-header`);
    if (header) {
      const categoryPatterns = document.querySelectorAll(
        `[data-ship]:not(.hidden-by-filter)`
      );
      const hasVisible = Array.from(categoryPatterns).some(
        (p) => patternCategories[p.getAttribute("data-ship")] === category
      );
      header.style.display =
        hasVisible || currentFilter === "all" ? "block" : "none";
    }
  });
}

// ========== CUSTOM PATTERN EDITOR ==========
let editorState = [];
let editorSize = 8;

function openCustomEditor() {
  const modal = document.getElementById("custom-editor-modal");
  editorSize = parseInt(document.getElementById("editor-grid-size").value);
  initializeEditorGrid();
  modal.showModal();
}

function initializeEditorGrid() {
  editorState = Array.from({ length: editorSize }, () =>
    Array(editorSize).fill(0)
  );
  drawEditorGrid();
}

function drawEditorGrid() {
  const grid = document.getElementById("pattern-editor-grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${editorSize}, 25px)`;

  for (let i = 0; i < editorSize; i++) {
    for (let j = 0; j < editorSize; j++) {
      const cell = document.createElement("div");
      cell.className = "editor-cell" + (editorState[i][j] ? " alive" : "");
      cell.addEventListener("click", () => {
        editorState[i][j] = editorState[i][j] ? 0 : 1;
        cell.classList.toggle("alive");
      });
      grid.appendChild(cell);
    }
  }
}

function clearEditorGrid() {
  editorState = Array.from({ length: editorSize }, () =>
    Array(editorSize).fill(0)
  );
  drawEditorGrid();
}

function saveCustomPattern() {
  const name =
    document.getElementById("pattern-name").value.trim() || "Custom Pattern";

  // Check if pattern is empty
  if (editorState.flat().every((cell) => cell === 0)) {
    alert("Pattern is empty! Draw something first.");
    return;
  }

  // Trim empty rows/cols
  const trimmed = trimPattern(editorState);

  customPatterns[name] = trimmed;
  localStorage.setItem(CUSTOM_PATTERNS_KEY, JSON.stringify(customPatterns));

  alert(`Pattern "${name}" saved successfully!`);
  document.getElementById("custom-editor-modal").close();
}

function placeCustomPattern() {
  const trimmed = trimPattern(editorState);

  if (trimmed.flat().every((cell) => cell === 0)) {
    alert("Pattern is empty!");
    return;
  }

  // Place in center of grid
  const startRow = Math.floor((numRows - trimmed.length) / 2);
  const startCol = Math.floor((numCols - trimmed[0].length) / 2);

  if (placePatternAt(trimmed, startRow, startCol)) {
    draw(state);
    document.getElementById("custom-editor-modal").close();
    alert("Custom pattern placed on grid!");
  } else {
    alert("Pattern too large for current grid!");
  }
}

function trimPattern(pattern) {
  // Find bounds of non-empty cells
  let minRow = pattern.length,
    maxRow = -1;
  let minCol = pattern[0].length,
    maxCol = -1;

  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      if (pattern[i][j]) {
        minRow = Math.min(minRow, i);
        maxRow = Math.max(maxRow, i);
        minCol = Math.min(minCol, j);
        maxCol = Math.max(maxCol, j);
      }
    }
  }

  if (maxRow === -1) return [[]]; // Empty pattern

  // Extract trimmed pattern
  const trimmed = [];
  for (let i = minRow; i <= maxRow; i++) {
    trimmed.push(pattern[i].slice(minCol, maxCol + 1));
  }

  return trimmed;
}

// ========== PATTERN SHARING ==========
function sharePatternURL() {
  const encoded = encodePattern(state);
  const url = `${window.location.origin}${window.location.pathname}?pattern=${encoded}&rules=${survivalRules.join("")}${birthRules.join("")}`;

  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert(
        "Pattern URL copied to clipboard!\\n\\nShare this URL to show your pattern to others."
      );
    })
    .catch(() => {
      prompt("Copy this URL:", url);
    });
}

function encodePattern(grid) {
  // Simple RLE-like encoding
  let rle = "";
  let count = 0;
  let lastCell = grid[0][0];

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (grid[i][j] === lastCell) {
        count++;
      } else {
        rle += count + (lastCell ? "o" : "b");
        count = 1;
        lastCell = grid[i][j];
      }
    }
    if (i < numRows - 1) rle += "$";
  }
  rle += count + (lastCell ? "o" : "b");

  return btoa(rle); // Base64 encode
}

function decodePattern(encoded) {
  try {
    const rle = atob(encoded);
    // Decode RLE back to grid
    // This is a simplified version
    return null; // Would need full implementation
  } catch (e) {
    console.error("Failed to decode pattern:", e);
    return null;
  }
}

// Load pattern from URL on page load
function loadPatternFromURL() {
  const params = new URLSearchParams(window.location.search);
  const patternData = params.get("pattern");

  if (patternData) {
    const decoded = decodePattern(patternData);
    if (decoded) {
      state = decoded;
      draw(state);
    }
  }
}

// ========== EXPORT FUNCTIONS ==========
function openExportModal() {
  document.getElementById("export-modal").showModal();
  document.getElementById("export-output").value = "";
}

function exportAsJSON() {
  const data = {
    pattern: state,
    rows: numRows,
    cols: numCols,
    rules: {
      survival: survivalRules,
      birth: birthRules,
    },
    metadata: {
      exported: new Date().toISOString(),
      tickCount: tickCount,
    },
  };

  document.getElementById("export-output").value = JSON.stringify(
    data,
    null,
    2
  );
}

function exportAsRLE() {
  let rle = `x = ${numCols}, y = ${numRows}, rule = B${birthRules.join("")}/S${survivalRules.join("")}\\n`;

  for (let i = 0; i < numRows; i++) {
    let count = 0;
    let lastCell = 0;

    for (let j = 0; j < numCols; j++) {
      if (state[i][j] === lastCell) {
        count++;
      } else {
        if (count > 0) {
          rle += (count > 1 ? count : "") + (lastCell ? "o" : "b");
        }
        count = 1;
        lastCell = state[i][j];
      }
    }

    if (count > 0) {
      rle += (count > 1 ? count : "") + (lastCell ? "o" : "b");
    }

    if (i < numRows - 1) rle += "$";
  }

  rle += "!";
  document.getElementById("export-output").value = rle;
}

function exportAsPlaintext() {
  let text = "";
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      text += state[i][j] ? "O" : ".";
    }
    text += "\\n";
  }
  document.getElementById("export-output").value = text;
}

function copyExportToClipboard() {
  const output = document.getElementById("export-output");
  output.select();
  navigator.clipboard.writeText(output.value).then(() => {
    alert("Copied to clipboard!");
  });
}

// Initialize - start tutorial automatically
initializeGrid(); // Initialize grid based on screen size
draw(state);
updateTickCounter();
updateRulesDisplay();

// Disable all controls initially and show tutorial message
disableControls();
document.getElementById("welcome_modal").showModal();

// Auto-start the tutorial
setTimeout(() => {
  start();
}, 2000); // Give user time to read the welcome message

// Setup speed control listener
document.getElementById("speed-slider")?.addEventListener("input", (e) => {
  updateSpeed(e.target.value);
});

// Setup save/load listeners
document
  .getElementById("save-state")
  ?.addEventListener("click", saveCurrentState);
document
  .getElementById("load-state")
  ?.addEventListener("click", loadSavedState);
document
  .getElementById("clear-saved")
  ?.addEventListener("click", clearSavedStates);

// Initialize save/load button states
updateSaveLoadButtons();

// ========== NEW FEATURE EVENT LISTENERS ==========

// Theme toggle
document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);

// Color picker
document.getElementById("color-picker-btn")?.addEventListener("click", () => {
  document.getElementById("alive-color-picker").click();
});

document
  .getElementById("alive-color-picker")
  ?.addEventListener("input", (e) => {
    updateCellColor(e.target.value);
  });

// Statistics reset
document
  .getElementById("reset-stats")
  ?.addEventListener("click", resetStatistics);

// Pattern search
document.getElementById("pattern-search")?.addEventListener("input", (e) => {
  currentSearchTerm = e.target.value;
  filterPatterns();
});

// Pattern filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");
    // Update filter
    currentFilter = btn.getAttribute("data-category");
    filterPatterns();
  });
});

// Custom pattern editor
document
  .getElementById("open-custom-editor")
  ?.addEventListener("click", openCustomEditor);

document.getElementById("editor-grid-size")?.addEventListener("change", (e) => {
  editorSize = parseInt(e.target.value);
  initializeEditorGrid();
});

document
  .getElementById("editor-clear")
  ?.addEventListener("click", clearEditorGrid);
document
  .getElementById("editor-save")
  ?.addEventListener("click", saveCustomPattern);
document
  .getElementById("editor-place")
  ?.addEventListener("click", placeCustomPattern);

// Export functions
document
  .getElementById("export-pattern")
  ?.addEventListener("click", openExportModal);
document.getElementById("export-json")?.addEventListener("click", exportAsJSON);
document.getElementById("export-rle")?.addEventListener("click", exportAsRLE);
document
  .getElementById("export-cells")
  ?.addEventListener("click", exportAsPlaintext);
document
  .getElementById("copy-export")
  ?.addEventListener("click", copyExportToClipboard);

// Share URL
document
  .getElementById("share-url")
  ?.addEventListener("click", sharePatternURL);

// Apply theme on load
applyTheme(currentTheme);
document.documentElement.style.setProperty(
  "--alive-cell-color",
  aliveCellColor
);

// Load pattern from URL if present
loadPatternFromURL();

// Initial statistics update
updateStatistics();

// Handle window resize to recalculate grid
window.addEventListener("resize", () => {
  if (!isInTutorialMode && !interval) {
    // Only resize when not running and not in tutorial
    initializeGrid();
    draw(state);
    // Pattern visibility is updated in initializeGrid()
  }
});

// Add escape key to cancel placement mode
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isInPlacementMode) {
    exitPlacementMode();
  }
});
