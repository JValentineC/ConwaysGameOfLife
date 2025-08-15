const numRows = 17;
const numCols = 17;
let state = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

let interval = null;
let tickCount = 0;

// Game rules - default Conway's Game of Life
let survivalRules = [2, 3]; // Live cell survives with these neighbor counts
let birthRules = [3]; // Dead cell becomes alive with these neighbor counts

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
      cell.addEventListener("click", () => {
        state[i][j] = state[i][j] ? 0 : 1; // Toggle cell
        draw(state); // Redraw to update UI
      });
      game.appendChild(cell);
    }
  }
}

function updateTickCounter() {
  document.getElementById("tick-counter").textContent = `Tick: ${tickCount}`;
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
    alert("Rules updated successfully!");
  } catch (error) {
    alert("Invalid rule format. Please use comma-separated numbers (0-8).");
  }
}

function start() {
  if (interval) return;
  tickCount = 0;
  updateTickCounter();
  let prevState = state.map((row) => [...row]);
  interval = setInterval(() => {
    state = tick(state);
    tickCount++;
    updateTickCounter();
    draw(state);
    // Check for stabilization or oscillation
    if (JSON.stringify(state) === JSON.stringify(prevState)) {
      stop();
      alert("Pattern has stabilized or is oscillating.");
    }
    prevState = state.map((row) => [...row]);
  }, 500);
}

function stop() {
  clearInterval(interval);
  interval = null;
}

// Event listeners
document.getElementById("start").onclick = start;
document.getElementById("stop").onclick = stop;
document.getElementById("apply-rules").onclick = applyCustomRules;

// Initialize
draw(state);
updateTickCounter();
updateRulesDisplay();
