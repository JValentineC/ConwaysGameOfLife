const numRows = 17;
const numCols = 17;
const initialState = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
];
let state = initialState.map((row) => [...row]);

let interval = null;
let tickCount = 0;

// Tutorial mode variables
let isInTutorialMode = true;
let tutorialTicksRequired = 166;

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
    // Diagonal spaceship
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
  document.getElementById("add-ship").disabled = true;
  document.getElementById("apply-rules").disabled = true;
  document.getElementById("survival-rules").disabled = true;
  document.getElementById("birth-rules").disabled = true;
}

function enableControls() {
  document.getElementById("start").disabled = false;
  document.getElementById("stop").disabled = false;
  document.getElementById("reset").disabled = false;
  document.getElementById("add-ship").disabled = false;
  document.getElementById("apply-rules").disabled = false;
  document.getElementById("survival-rules").disabled = false;
  document.getElementById("birth-rules").disabled = false;
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
  state = initialState.map((row) => [...row]); // Reset to initial state
  tickCount = 0; // Reset tick counter
  updateTickCounter();
  draw(state); // Redraw the grid
}

function addRandomShip() {
  if (isInTutorialMode) return; // Don't allow during tutorial

  // Clear the board first - set all cells to dead
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      state[i][j] = 0;
    }
  }

  // Get list of available patterns
  const patternNames = Object.keys(spaceshipPatterns);
  const randomPattern =
    patternNames[Math.floor(Math.random() * patternNames.length)];
  const pattern = spaceshipPatterns[randomPattern];

  // Find a random position that fits the pattern
  const maxRow = numRows - pattern.length;
  const maxCol = numCols - pattern[0].length;

  if (maxRow < 0 || maxCol < 0) {
    document.getElementById("grid_too_small_modal").showModal();
    return;
  }

  const startRow = Math.floor(Math.random() * maxRow);
  const startCol = Math.floor(Math.random() * maxCol);

  // Place the pattern on the grid
  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[i].length; j++) {
      if (pattern[i][j] === 1) {
        state[startRow + i][startCol + j] = 1;
      }
    }
  }

  draw(state); // Redraw to show the new pattern
  document.getElementById(
    "ship-added-message"
  ).textContent = `Added ${randomPattern} at position (${startRow}, ${startCol})`;
  document.getElementById("ship_added_modal").showModal();
}

// Event listeners
document.getElementById("start").onclick = start;
document.getElementById("stop").onclick = stop;
document.getElementById("reset").onclick = reset;
document.getElementById("add-ship").onclick = addRandomShip;
document.getElementById("apply-rules").onclick = applyCustomRules;

// Initialize - start tutorial automatically
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
