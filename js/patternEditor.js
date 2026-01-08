/**
 * @fileoverview Custom pattern editor for Conway's Game of Life
 */

let editorGrid = [];
let editorSize = 10;

/**
 * Initialize the custom pattern editor
 */
export function initializeEditor() {
  editorSize = 10;
  editorGrid = Array.from({ length: editorSize }, () =>
    Array(editorSize).fill(0)
  );
  renderEditorGrid();
}

/**
 * Render the editor grid
 */
function renderEditorGrid() {
  const container = document.getElementById("editor-grid");
  if (!container) return;

  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${editorSize}, 20px)`;
  container.style.gridTemplateRows = `repeat(${editorSize}, 20px)`;

  for (let i = 0; i < editorSize; i++) {
    for (let j = 0; j < editorSize; j++) {
      const cell = document.createElement("div");
      cell.className = "editor-cell";
      cell.dataset.row = i;
      cell.dataset.col = j;

      if (editorGrid[i][j] === 1) {
        cell.classList.add("alive");
      }

      cell.addEventListener("click", () => toggleEditorCell(i, j));
      container.appendChild(cell);
    }
  }
}

/**
 * Toggle a cell in the editor
 * @param {number} row - Row index
 * @param {number} col - Column index
 */
function toggleEditorCell(row, col) {
  editorGrid[row][col] = editorGrid[row][col] === 0 ? 1 : 0;
  renderEditorGrid();
}

/**
 * Update editor grid size
 * @param {number} newSize - New grid size
 */
export function updateEditorSize(newSize) {
  editorSize = parseInt(newSize);
  const oldGrid = editorGrid;
  editorGrid = Array.from({ length: editorSize }, () =>
    Array(editorSize).fill(0)
  );

  // Copy old grid data if possible
  for (let i = 0; i < Math.min(oldGrid.length, editorSize); i++) {
    for (let j = 0; j < Math.min(oldGrid[0].length, editorSize); j++) {
      editorGrid[i][j] = oldGrid[i][j];
    }
  }

  renderEditorGrid();
}

/**
 * Clear the editor grid
 */
export function clearEditor() {
  editorGrid = Array.from({ length: editorSize }, () =>
    Array(editorSize).fill(0)
  );
  renderEditorGrid();
}

/**
 * Get the current editor pattern
 * @returns {Array} Current pattern
 */
export function getEditorPattern() {
  return editorGrid.map((row) => [...row]);
}

/**
 * Save custom pattern
 * @param {string} name - Pattern name
 * @param {Array} customPatterns - Current custom patterns array
 * @returns {Array} Updated custom patterns array
 */
export function saveCustomPattern(name, customPatterns) {
  if (!name) {
    alert("Please enter a pattern name");
    return customPatterns;
  }

  const pattern = getEditorPattern();

  // Check if pattern is empty
  const hasAliveCells = pattern.some((row) => row.some((cell) => cell === 1));
  if (!hasAliveCells) {
    alert("Pattern is empty. Please draw something first.");
    return customPatterns;
  }

  const newPattern = {
    name: name,
    grid: pattern,
    category: "custom",
  };

  const updatedPatterns = [...customPatterns, newPattern];
  return updatedPatterns;
}

/**
 * Setup pattern editor event listeners
 * @param {Function} onSavePattern - Callback when pattern is saved
 * @param {Function} onPlacePattern - Callback when pattern is placed
 */
export function setupEditorListeners(onSavePattern, onPlacePattern) {
  const editorBtn = document.getElementById("custom-editor-btn");
  const editorModal = document.getElementById("custom-editor-modal");
  const closeEditorModal = document.getElementById("close-editor-modal");
  const editorSizeInput = document.getElementById("editor-size");
  const clearEditorBtn = document.getElementById("clear-editor");
  const savePatternBtn = document.getElementById("save-pattern");
  const placePatternBtn = document.getElementById("place-pattern");

  if (editorBtn && editorModal) {
    editorBtn.addEventListener("click", () => {
      initializeEditor();
      editorModal.classList.add("modal-open");
    });
  }

  if (closeEditorModal && editorModal) {
    closeEditorModal.addEventListener("click", () => {
      editorModal.classList.remove("modal-open");
    });
  }

  if (editorSizeInput) {
    editorSizeInput.addEventListener("change", (e) => {
      updateEditorSize(e.target.value);
    });
  }

  if (clearEditorBtn) {
    clearEditorBtn.addEventListener("click", clearEditor);
  }

  if (savePatternBtn) {
    savePatternBtn.addEventListener("click", () => {
      const patternName = document.getElementById("pattern-name")?.value;
      if (patternName) {
        onSavePattern(patternName);
        if (editorModal) editorModal.classList.remove("modal-open");
      }
    });
  }

  if (placePatternBtn) {
    placePatternBtn.addEventListener("click", () => {
      onPlacePattern(getEditorPattern());
      if (editorModal) editorModal.classList.remove("modal-open");
    });
  }
}
