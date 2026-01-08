/**
 * @fileoverview Export and import functionality for Conway's Game of Life
 */

/**
 * Export current state as JSON
 * @param {Array} currentState - Current grid state
 * @param {Object} stats - Current statistics
 * @returns {string} JSON string
 */
export function exportAsJSON(currentState, stats) {
  const exportData = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    grid: {
      rows: currentState.length,
      cols: currentState[0].length,
      state: currentState,
    },
    statistics: stats,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export current state as RLE (Run Length Encoded)
 * @param {Array} currentState - Current grid state
 * @returns {string} RLE string
 */
export function exportAsRLE(currentState) {
  let rle = `#N Game of Life Export\n#C Exported from Conway's Game of Life\n`;
  rle += `x = ${currentState[0].length}, y = ${currentState.length}, rule = B3/S23\n`;

  for (let i = 0; i < currentState.length; i++) {
    let count = 0;
    let lastCell = currentState[i][0];

    for (let j = 0; j < currentState[i].length; j++) {
      if (currentState[i][j] === lastCell) {
        count++;
      } else {
        if (count > 1) rle += count;
        rle += lastCell === 1 ? "o" : "b";
        lastCell = currentState[i][j];
        count = 1;
      }
    }

    if (count > 1) rle += count;
    rle += lastCell === 1 ? "o" : "b";

    if (i < currentState.length - 1) {
      rle += "$";
    }
  }

  rle += "!";
  return rle;
}

/**
 * Export current state as plain text
 * @param {Array} currentState - Current grid state
 * @returns {string} Plain text representation
 */
export function exportAsPlaintext(currentState) {
  return currentState
    .map((row) => row.map((cell) => (cell ? "O" : ".")).join(""))
    .join("\n");
}

/**
 * Download exported data
 * @param {string} data - Data to download
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Save current game state to slot
 * @param {number} slot - Slot number (1-5)
 * @param {Array} currentState - Current grid state
 */
export function saveGameState(slot, currentState) {
  const saveData = {
    state: currentState,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(`gameState_${slot}`, JSON.stringify(saveData));

  const button = document.querySelector(`[data-save="${slot}"]`);
  if (button) {
    button.classList.add("btn-success");
    button.textContent = `Slot ${slot} ✓`;
    setTimeout(() => {
      button.classList.remove("btn-success");
      button.textContent = `Save ${slot}`;
    }, 2000);
  }
}

/**
 * Load game state from slot
 * @param {number} slot - Slot number (1-5)
 * @returns {Array|null} Loaded state or null
 */
export function loadGameState(slot) {
  const saveData = localStorage.getItem(`gameState_${slot}`);
  if (!saveData) {
    alert(`No save found in slot ${slot}`);
    return null;
  }

  const { state: loadedState } = JSON.parse(saveData);
  return loadedState;
}

/**
 * Encode state to URL parameter
 * @param {Array} currentState - Current grid state
 * @returns {string} Base64 encoded state
 */
export function encodeStateToURL(currentState) {
  const stateStr = JSON.stringify(currentState);
  return btoa(stateStr);
}

/**
 * Decode state from URL parameter
 * @param {string} encodedState - Base64 encoded state
 * @returns {Array|null} Decoded state or null
 */
export function decodeStateFromURL(encodedState) {
  try {
    const stateStr = atob(encodedState);
    return JSON.parse(stateStr);
  } catch (error) {
    console.error("Failed to decode state from URL:", error);
    return null;
  }
}

/**
 * Setup export modal event listeners
 * @param {Function} getCurrentState - Function to get current state
 * @param {Function} getStats - Function to get current stats
 */
export function setupExportListeners(getCurrentState, getStats) {
  const exportBtn = document.getElementById("export-btn");
  const exportModal = document.getElementById("export-modal");
  const closeExportModal = document.getElementById("close-export-modal");
  const exportJsonBtn = document.getElementById("export-json");
  const exportRleBtn = document.getElementById("export-rle");
  const exportPlaintextBtn = document.getElementById("export-plaintext");

  if (exportBtn && exportModal) {
    exportBtn.addEventListener("click", () => {
      exportModal.classList.add("modal-open");
    });
  }

  if (closeExportModal && exportModal) {
    closeExportModal.addEventListener("click", () => {
      exportModal.classList.remove("modal-open");
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
      const jsonData = exportAsJSON(getCurrentState(), getStats());
      downloadFile(jsonData, "game-of-life.json", "application/json");
      if (exportModal) exportModal.classList.remove("modal-open");
    });
  }

  if (exportRleBtn) {
    exportRleBtn.addEventListener("click", () => {
      const rleData = exportAsRLE(getCurrentState());
      downloadFile(rleData, "game-of-life.rle", "text/plain");
      if (exportModal) exportModal.classList.remove("modal-open");
    });
  }

  if (exportPlaintextBtn) {
    exportPlaintextBtn.addEventListener("click", () => {
      const textData = exportAsPlaintext(getCurrentState());
      downloadFile(textData, "game-of-life.txt", "text/plain");
      if (exportModal) exportModal.classList.remove("modal-open");
    });
  }
}
