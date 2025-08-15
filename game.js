// Dynamic grid sizing based on screen width
let numRows = 17;
let numCols = 17;

// Function to calculate optimal grid size based on screen width
function calculateGridSize() {
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

  // Set reasonable bounds for grid size
  const minCols = Math.max(10, Math.min(15, maxCols)); // Minimum 10, preferred around 15
  const maxColsLimit = 25; // Maximum for performance

  numCols = Math.min(maxColsLimit, Math.max(minCols, maxCols));
  numRows = numCols; // Keep grid square for simplicity

  console.log(
    `Grid size calculated: ${numRows}x${numCols} (available width: ${availableWidth}px)`
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

// Tutorial mode variables
let isInTutorialMode = true;
let tutorialTicksRequired = 15; // Will be adjusted based on grid size

// Game rules - default Conway's Game of Life
let survivalRules = [2, 3]; // Live cell survives with these neighbor counts
let birthRules = [3]; // Dead cell becomes alive with these neighbor counts

// Famous Game of Life patterns - spaceships and gliders
const spaceshipPatterns = {
  glider: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1],
  ],
  lwss: [
    // Lightweight Spaceship
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
  ],
  mwss: [
    // Middleweight Spaceship
    [0, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ],
  loafer: [
    // Complete loafer spaceship pattern
    [0, 1, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0],
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
  return dirs.map(([di, dj]) => [
    (i + di + numRows) % numRows,
    (j + dj + numCols) % numCols,
  ]);
}

function tick(state) {
  const next = Array.from({ length: numRows }, () => Array(numCols).fill(0));
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
          state[i][j] = state[i][j] ? 0 : 1; // Toggle cell
          draw(state); // Redraw to update UI
        });
      }

      game.appendChild(cell);
    }
  }
}

function updateTickCounter() {
  const ticksRemaining = isInTutorialMode
    ? tutorialTicksRequired - tickCount
    : 0;
  const tutorialText = isInTutorialMode
    ? ` (Tutorial: ${ticksRemaining} ticks remaining)`
    : "";
  document.getElementById(
    "tick-counter"
  ).textContent = `Tick: ${tickCount}${tutorialText}`;
}

function disableControls() {
  document.getElementById("start").disabled = true;
  document.getElementById("stop").disabled = true;
  document.getElementById("reset").disabled = true;
  document.getElementById("apply-rules").disabled = true;
  document.getElementById("survival-rules").disabled = true;
  document.getElementById("birth-rules").disabled = true;

  // Disable spaceship clicking during tutorial
  const shipDisplays = document.querySelectorAll(".ship-display.clickable");
  shipDisplays.forEach((display) => {
    display.style.pointerEvents = "none";
    display.style.opacity = "0.5";
  });
}

function enableControls() {
  document.getElementById("start").disabled = false;
  document.getElementById("stop").disabled = false;
  document.getElementById("reset").disabled = false;
  document.getElementById("apply-rules").disabled = false;
  document.getElementById("survival-rules").disabled = false;
  document.getElementById("birth-rules").disabled = false;

  // Enable spaceship clicking after tutorial
  const shipDisplays = document.querySelectorAll(".ship-display.clickable");
  shipDisplays.forEach((display) => {
    display.style.pointerEvents = "auto";
    display.style.opacity = "1";
  });
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
  }

  updateTickCounter();
  let prevState = state.map((row) => [...row]);
  interval = setInterval(() => {
    state = tick(state);
    tickCount++;
    updateTickCounter();
    draw(state);

    // Check if tutorial is complete
    if (isInTutorialMode && tickCount >= tutorialTicksRequired) {
      stop();
      isInTutorialMode = false;
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
  }, 500);
}

function stop() {
  clearInterval(interval);
  interval = null;
}

function reset() {
  if (isInTutorialMode) return; // Don't allow reset during tutorial

  stop(); // Stop the game if it's running
  initializeGrid(); // Reinitialize grid with current screen size
  tickCount = 0; // Reset tick counter
  updateTickCounter();
  draw(state); // Redraw the grid
}

// Initialize or reinitialize the grid
function initializeGrid() {
  calculateGridSize();
  initialState = generateInitialState();
  state = initialState.map((row) => [...row]);

  // Adjust tutorial length based on grid size (more cells = longer tutorial)
  const gridSize = numRows * numCols;
  tutorialTicksRequired = Math.max(10, Math.min(25, Math.floor(gridSize / 15)));
}

function addSpecificShip(shipType) {
  if (isInTutorialMode) return; // Don't allow during tutorial

  // Clear the board first - set all cells to dead
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      state[i][j] = 0;
    }
  }

  // Get the specific pattern
  const pattern = spaceshipPatterns[shipType];
  if (!pattern) {
    console.error(`Unknown ship type: ${shipType}`);
    return;
  }

  // Calculate safe placement bounds to ensure ship stays within board
  const maxRow = numRows - pattern.length;
  const maxCol = numCols - pattern[0].length;

  if (maxRow < 0 || maxCol < 0) {
    document.getElementById("grid_too_small_modal").showModal();
    return;
  }

  // Place ship in center or random safe position
  const startRow = Math.max(0, Math.floor((numRows - pattern.length) / 2));
  const startCol = Math.max(0, Math.floor((numCols - pattern[0].length) / 2));

  // Place the pattern on the grid
  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      if (pattern[i][j] === 1) {
        state[startRow + i][startCol + j] = 1;
      }
    }
  }

  draw(state); // Redraw to show the new pattern

  // Update modal message with ship type
  const shipNames = {
    glider: "Glider",
    lwss: "Lightweight Spaceship (LWSS)",
    mwss: "Middleweight Spaceship (MWSS)",
    loafer: "Loafer",
  };

  document.getElementById("ship-added-message").textContent = `Added ${
    shipNames[shipType] || shipType
  } at position (${startRow}, ${startCol}) on ${numRows}x${numCols} grid`;
  document.getElementById("ship_added_modal").showModal();
}

// Event listeners
document.getElementById("start").onclick = start;
document.getElementById("stop").onclick = stop;
document.getElementById("reset").onclick = reset;
document.getElementById("apply-rules").onclick = applyCustomRules;

// Add event listeners for clickable spaceship patterns
document.addEventListener("DOMContentLoaded", function () {
  const shipDisplays = document.querySelectorAll(".ship-display.clickable");
  shipDisplays.forEach((display) => {
    display.addEventListener("click", function () {
      if (isInTutorialMode) return; // Don't allow during tutorial

      const shipType = this.getAttribute("data-ship");
      addSpecificShip(shipType);
    });
  });
});

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

// Handle window resize to recalculate grid
window.addEventListener("resize", () => {
  if (!isInTutorialMode && !interval) {
    // Only resize when not running and not in tutorial
    initializeGrid();
    draw(state);
  }
});
