/**
 * @fileoverview Main entry point for Conway's Game of Life
 * Coordinates all modules and handles user interactions
 */

// Import all modules
import * as GameCore from './gameCore.js';
import * as Patterns from './patterns.js';
import * as Statistics from './statistics.js';
import * as Theme from './theme.js';
import * as ExportImport from './exportImport.js';
import * as PatternEditor from './patternEditor.js';
import * as PatternFilter from './patternFilter.js';
import * as Renderer from './renderer.js';

// Combine all patterns
let allPatterns = {};
let customPatterns = [];

/**
 * Initialize the game
 */
function initializeGrid() {
  GameCore.calculateGridSize();
  GameCore.updateGameVars({
    tutorialTicksRequired: Math.max(15, Math.floor(GameCore.numRows / 3))
  });
  
  GameCore.initializeGrid();
  Renderer.draw(GameCore.state);
  updatePatternVisibility();
  
  if (GameCore.isInTutorialMode) {
    Renderer.showTutorialMessage();
  }
}

/**
 * Update which patterns are visible based on grid size
 */
function updatePatternVisibility() {
  // Merge all patterns
  allPatterns = { ...Patterns.spaceshipPatterns };
  
  customPatterns.forEach((pattern, index) => {
    allPatterns[`custom_${index}`] = pattern;
  });
  
  PatternFilter.renderPatterns(allPatterns, handlePatternSelect);
}

/**
 * Handle pattern selection
 */
function handlePatternSelect(key, pattern) {
  if (GameCore.isInTutorialMode) return;
  
  GameCore.updateGameVars({
    isInPlacementMode: true,
    selectedPattern: pattern.grid,
    selectedPatternType: pattern.name || key
  });
  
  document.getElementById("game").style.cursor = "crosshair";
  updateTickCounter();
}

/**
 * Exit placement mode
 */
function exitPlacementMode() {
  GameCore.updateGameVars({
    isInPlacementMode: false,
    selectedPattern: null,
    selectedPatternType: null
  });
  document.getElementById("game").style.cursor = "default";
  updateTickCounter();
}

/**
 * Update tick counter display
 */
function updateTickCounter() {
  const ticksRemaining = GameCore.isInTutorialMode
    ? GameCore.tutorialTicksRequired - GameCore.tickCount
    : 0;
  const tutorialText = GameCore.isInTutorialMode
    ? ` (Tutorial: ${ticksRemaining} ticks remaining)`
    : "";
  
  if (GameCore.isInPlacementMode) {
    document.getElementById("tick-counter").textContent =
      `Click to place ${GameCore.selectedPatternType}. Press Escape to cancel.`;
  } else {
    document.getElementById("tick-counter").textContent = `Tick: ${GameCore.tickCount}${tutorialText}`;
  }
}

/**
 * Start the game simulation
 */
function start() {
  if (GameCore.interval) return;
  
  const actualInterval = GameCore.baseInterval / GameCore.gameSpeed;
  
  GameCore.updateGameVars({
    interval: setInterval(() => {
      const oldState = GameCore.state.map(row => [...row]);
      GameCore.updateGameVars({ state: GameCore.tick(GameCore.state) });
      Renderer.draw(GameCore.state);
      
      GameCore.updateGameVars({ tickCount: GameCore.tickCount + 1 });
      updateTickCounter();
      
      if (!GameCore.isInTutorialMode) {
        Statistics.updateStats(oldState, GameCore.state);
        Statistics.updateStatsDisplay();
      }
      
      if (GameCore.isInTutorialMode && GameCore.tickCount >= GameCore.tutorialTicksRequired) {
        endTutorial();
      }
    }, actualInterval)
  });
}

/**
 * Stop the game simulation
 */
function stop() {
  if (GameCore.interval) {
    clearInterval(GameCore.interval);
    GameCore.updateGameVars({ interval: null });
  }
}

/**
 * Reset the game
 */
function reset() {
  stop();
  GameCore.updateGameVars({ 
    tickCount: 0,
    isInTutorialMode: false,
    state: GameCore.initialState.map(row => [...row])
  });
  Renderer.draw(GameCore.state);
  Renderer.hideTutorialMessage();
  updateTickCounter();
  Statistics.resetStats();
  Statistics.updateStatsDisplay();
}

/**
 * Clear the grid
 */
function clear() {
  stop();
  GameCore.updateGameVars({
    tickCount: 0,
    isInTutorialMode: false,
    state: Array.from({ length: GameCore.numRows }, () => Array(GameCore.numCols).fill(0))
  });
  Renderer.draw(GameCore.state);
  Renderer.hideTutorialMessage();
  updateTickCounter();
  Statistics.resetStats();
  Statistics.updateStatsDisplay();
}

/**
 * Randomize the grid
 */
function randomize() {
  stop();
  GameCore.updateGameVars({
    tickCount: 0,
    isInTutorialMode: false,
    state: Array.from({ length: GameCore.numRows }, () =>
      Array.from({ length: GameCore.numCols }, () => (Math.random() > 0.7 ? 1 : 0))
    )
  });
  Renderer.draw(GameCore.state);
  Renderer.hideTutorialMessage();
  updateTickCounter();
}

/**
 * End tutorial mode
 */
function endTutorial() {
  stop();
  GameCore.updateGameVars({ isInTutorialMode: false });
  Renderer.hideTutorialMessage();
  updateTickCounter();
  alert("Tutorial complete! You can now control the game.");
}

/**
 * Update game speed
 */
function updateSpeed(newSpeed) {
  GameCore.updateGameVars({ gameSpeed: parseInt(newSpeed) });
  
  if (GameCore.interval) {
    stop();
    start();
  }
  
  const speedDisplay = document.getElementById("speed-display");
  if (speedDisplay) speedDisplay.textContent = `${newSpeed}x`;
}

/**
 * Handle cell clicks
 */
function handleCellClick(i, j) {
  if (GameCore.isInTutorialMode) return;
  
  if (GameCore.isInPlacementMode && GameCore.selectedPattern) {
    if (GameCore.placePatternAt(GameCore.selectedPattern, i, j)) {
      Renderer.draw(GameCore.state);
      exitPlacementMode();
    } else {
      alert(`Cannot place pattern here. Try clicking closer to the top-left.`);
    }
  } else {
    const newState = GameCore.state.map(row => [...row]);
    newState[i][j] = newState[i][j] ? 0 : 1;
    GameCore.updateGameVars({ state: newState });
    Renderer.draw(GameCore.state);
  }
}

/**
 * Setup game controls
 */
function setupControls() {
  document.getElementById("start")?.addEventListener("click", start);
  document.getElementById("stop")?.addEventListener("click", stop);
  document.getElementById("reset")?.addEventListener("click", reset);
  document.getElementById("clear")?.addEventListener("click", clear);
  document.getElementById("randomize")?.addEventListener("click", randomize);
  
  document.getElementById("speed-control")?.addEventListener("input", (e) => {
    updateSpeed(e.target.value);
  });
  
  // Save/Load buttons
  for (let i = 1; i <= 5; i++) {
    document.querySelector(`[data-save="${i}"]`)?.addEventListener("click", () => {
      ExportImport.saveGameState(i, GameCore.state);
    });
    
    document.querySelector(`[data-load="${i}"]`)?.addEventListener("click", () => {
      const loadedState = ExportImport.loadGameState(i);
      if (loadedState) {
        GameCore.updateGameVars({ state: loadedState });
        Renderer.draw(GameCore.state);
      }
    });
  }
  
  // Share URL
  document.getElementById("share-url")?.addEventListener("click", () => {
    const encoded = ExportImport.encodeStateToURL(GameCore.state);
    const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("URL copied to clipboard!");
    });
  });
  
  // Escape key to cancel placement
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && GameCore.isInPlacementMode) {
      exitPlacementMode();
    }
  });
}

/**
 * Load pattern from URL if present
 */
function loadPatternFromURL() {
  const params = new URLSearchParams(window.location.search);
  const encodedState = params.get("state");
  
  if (encodedState) {
    const decoded = ExportImport.decodeStateFromURL(encodedState);
    if (decoded) {
      GameCore.updateGameVars({
        state: decoded,
        isInTutorialMode: false
      });
      Renderer.draw(GameCore.state);
      Renderer.hideTutorialMessage();
    }
  }
}

/**
 * Handle custom pattern save
 */
function handlePatternSave(patternName) {
  const pattern = PatternEditor.getEditorPattern();
  customPatterns.push({
    name: patternName,
    grid: pattern,
    category: "custom"
  });
  Patterns.saveCustomPatterns(customPatterns);
  updatePatternVisibility();
  alert(`Pattern "${patternName}" saved!`);
}

/**
 * Handle custom pattern placement
 */
function handlePatternPlace(pattern) {
  GameCore.updateGameVars({
    isInPlacementMode: true,
    selectedPattern: pattern,
    selectedPatternType: "Custom Pattern"
  });
  document.getElementById("game").style.cursor = "crosshair";
}

/**
 * Initialize the application
 */
function initialize() {
  // Load custom patterns
  customPatterns = Patterns.loadCustomPatterns();
  
  // Initialize game
  initializeGrid();
  
  // Setup theme
  Theme.initializeTheme();
  Theme.setupThemeListeners();
  
  // Setup pattern filtering
  PatternFilter.setupFilterListeners(allPatterns, handlePatternSelect);
  
  // Setup pattern editor
  PatternEditor.setupEditorListeners(handlePatternSave, handlePatternPlace);
  
  // Setup export/import
  ExportImport.setupExportListeners(
    () => GameCore.state,
    () => Statistics.stats
  );
  
  // Setup game controls
  setupControls();
  
  // Load pattern from URL
  loadPatternFromURL();
  
  // Initial statistics
  Statistics.updateStatsDisplay();
  
  // Handle window resize
  window.addEventListener("resize", () => {
    if (!GameCore.isInTutorialMode && !GameCore.interval) {
      initializeGrid();
    }
  });
  
  // Setup cell click handler
  document.getElementById("game")?.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (cell) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      handleCellClick(row, col);
    }
  });
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
