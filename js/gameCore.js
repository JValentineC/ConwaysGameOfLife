/**
 * @fileoverview Core game logic for Conway's Game of Life
 */

// Dynamic grid sizing based on screen width
export let numRows = 40;
export let numCols = 40;

// Game state
export let state = [];
export let initialState = [];
export let interval = null;
export let tickCount = 0;
export let gameSpeed = 5;
export const baseInterval = 500;

// Tutorial mode variables
export let isInTutorialMode = true;
export let tutorialTicksRequired = 15;

// Placement mode variables
export let isInPlacementMode = false;
export let selectedPattern = null;
export let selectedPatternType = null;

// Fullscreen mode variables
export let isFullscreenMode = false;
export let normalGridSize = { rows: 40, cols: 40 };

// Game rules
export let survivalRules = [2, 3];
export let birthRules = [3];

/**
 * Calculate optimal grid size based on screen dimensions
 */
export function calculateGridSize() {
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
  const availableWidth = gameContainer.clientWidth * 0.9;

  const maxCols = Math.floor(availableWidth / (cellSize + cellGap));

  let minCols, maxColsLimit;

  if (window.innerWidth <= 380) {
    minCols = Math.max(25, Math.min(30, maxCols));
    maxColsLimit = 40;
  } else if (window.innerWidth <= 480) {
    minCols = Math.max(25, Math.min(35, maxCols));
    maxColsLimit = 45;
  } else if (window.innerWidth <= 900) {
    minCols = Math.max(36, Math.min(45, maxCols));
    maxColsLimit = 55;
  } else {
    minCols = Math.max(40, Math.min(50, maxCols));
    maxColsLimit = 70;
  }

  numCols = Math.min(maxColsLimit, Math.max(minCols, maxCols));
  numRows = numCols;

  console.log(
    `Grid size calculated: ${numRows}x${numCols} (available width: ${availableWidth}px, screen width: ${window.innerWidth}px)`
  );
}

/**
 * Calculate fullscreen grid size
 */
function calculateFullscreenGridSize() {
  const cellSize = 8;
  const cellGap = 1;

  const availableWidth = window.innerWidth - 40;
  const availableHeight = window.innerHeight - 120;

  const maxCols = Math.floor(availableWidth / (cellSize + cellGap));
  const maxRows = Math.floor(availableHeight / (cellSize + cellGap));

  numCols = Math.min(Math.max(maxCols, 60), 150);
  numRows = Math.min(Math.max(maxRows, 40), 100);

  console.log(
    `Fullscreen grid size calculated: ${numRows}x${numCols} (available: ${availableWidth}x${availableHeight}px)`
  );
}

/**
 * Generate initial grid state
 * @returns {Array} 2D array representing the grid
 */
export function generateInitialState() {
  const initialState = Array.from({ length: numRows }, () => Array(numCols).fill(0));

  if (numRows > 5 && numCols > 5) {
    initialState[0][0] = 1;
    initialState[0][numCols - 1] = 1;
    initialState[numRows - 1][0] = 1;
    initialState[numRows - 1][numCols - 1] = 1;
  }

  if (numRows > 10 && numCols > 10) {
    const centerRow = Math.floor(numRows / 2);
    const centerCol = Math.floor(numCols / 2);

    for (let i = -2; i <= 2; i++) {
      if (centerRow + i >= 0 && centerRow + i < numRows) {
        initialState[centerRow + i][centerCol] = 1;
      }
      if (centerCol + i >= 0 && centerCol + i < numCols) {
        initialState[centerRow][centerCol + i] = 1;
      }
    }
  }

  if (numRows > 15 && numCols > 15) {
    const gliderRow = 2;
    const gliderCol = 2;
    initialState[gliderRow][gliderCol + 1] = 1;
    initialState[gliderRow + 1][gliderCol + 2] = 1;
    initialState[gliderRow + 2][gliderCol] = 1;
    initialState[gliderRow + 2][gliderCol + 1] = 1;
    initialState[gliderRow + 2][gliderCol + 2] = 1;
  }

  return initialState;
}

/**
 * Initialize the grid
 */
export function initializeGrid() {
  calculateGridSize();
  tutorialTicksRequired = Math.max(15, Math.floor(numRows / 3));
  initialState = generateInitialState();
  state = initialState.map((row) => [...row]);
}

/**
 * Find neighbors of a cell (with toroidal topology)
 * @param {number} i - Row index
 * @param {number} j - Column index
 * @returns {Array} Array of neighbor coordinates
 */
export function findNeighbors(i, j) {
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

  return dirs.map(([di, dj]) => [
    (i + di + numRows) % numRows,
    (j + dj + numCols) % numCols,
  ]);
}

/**
 * Calculate next generation based on current state
 * @param {Array} currentState - Current grid state
 * @returns {Array} Next generation state
 */
export function tick(currentState) {
  const next = Array.from({ length: numRows }, () => Array(numCols).fill(0));

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const neighbors = findNeighbors(i, j);
      const alive = neighbors.reduce((sum, [ni, nj]) => sum + currentState[ni][nj], 0);
      if (currentState[i][j]) {
        next[i][j] = survivalRules.includes(alive) ? 1 : 0;
      } else {
        next[i][j] = birthRules.includes(alive) ? 1 : 0;
      }
    }
  }

  return next;
}

/**
 * Place a pattern at specified position
 * @param {Array} pattern - Pattern array
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @returns {boolean} Success status
 */
export function placePatternAt(pattern, startRow, startCol) {
  if (
    startRow + pattern.length > numRows ||
    startCol + pattern[0].length > numCols
  ) {
    startRow = Math.max(0, Math.min(startRow, numRows - pattern.length));
    startCol = Math.max(0, Math.min(startCol, numCols - pattern[0].length));

    if (
      startRow + pattern.length > numRows ||
      startCol + pattern[0].length > numCols
    ) {
      console.log(
        `Pattern ${selectedPatternType} is too large for grid. Pattern size: ${pattern.length}x${pattern[0].length}, Grid size: ${numRows}x${numCols}`
      );
      return false;
    }
  }

  console.log(
    `Placing ${selectedPatternType} at position (${startRow}, ${startCol})`
  );

  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      if (pattern[i][j] === 1) {
        state[startRow + i][startCol + j] = 1;
      }
    }
  }
  return true;
}

/**
 * Check if pattern fits on current grid
 * @param {Array} pattern - Pattern to check
 * @returns {boolean} Whether pattern fits
 */
export function patternFitsOnGrid(pattern) {
  return pattern.length <= numRows && pattern[0].length <= numCols;
}

/**
 * Update game variables (for module consumers)
 */
export function updateGameVars(updates) {
  if (updates.state !== undefined) state = updates.state;
  if (updates.tickCount !== undefined) tickCount = updates.tickCount;
  if (updates.gameSpeed !== undefined) gameSpeed = updates.gameSpeed;
  if (updates.interval !== undefined) interval = updates.interval;
  if (updates.survivalRules !== undefined) survivalRules = updates.survivalRules;
  if (updates.birthRules !== undefined) birthRules = updates.birthRules;
  if (updates.isInTutorialMode !== undefined) isInTutorialMode = updates.isInTutorialMode;
  if (updates.isInPlacementMode !== undefined) isInPlacementMode = updates.isInPlacementMode;
  if (updates.selectedPattern !== undefined) selectedPattern = updates.selectedPattern;
  if (updates.selectedPatternType !== undefined) selectedPatternType = updates.selectedPatternType;
}
