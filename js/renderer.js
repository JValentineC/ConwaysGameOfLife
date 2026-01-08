/**
 * @fileoverview Rendering logic for Conway's Game of Life
 */

/**
 * Draw the grid to the canvas
 * @param {Array} currentState - Current grid state
 * @param {boolean} isPlacementMode - Whether in placement mode
 * @param {Array|null} selectedPattern - Selected pattern
 */
export function draw(currentState, isPlacementMode = false, selectedPattern = null) {
  const game = document.getElementById("game");
  if (!game) return;

  game.innerHTML = "";

  const numRows = currentState.length;
  const numCols = currentState[0].length;

  game.style.gridTemplateColumns = `repeat(${numCols}, var(--cell-size))`;
  game.style.gridTemplateRows = `repeat(${numRows}, var(--cell-size))`;

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const cell = document.createElement("div");
      cell.className = currentState[i][j] ? "cell alive" : "cell";
      cell.dataset.row = i;
      cell.dataset.col = j;

      if (isPlacementMode) {
        cell.style.cursor = "pointer";
      }

      game.appendChild(cell);
    }
  }
}

/**
 * Show tutorial message
 */
export function showTutorialMessage() {
  const message = document.getElementById("tutorial-message");
  if (message) {
    message.style.display = "block";
  }
}

/**
 * Hide tutorial message
 */
export function hideTutorialMessage() {
  const message = document.getElementById("tutorial-message");
  if (message) {
    message.style.display = "none";
  }
}
