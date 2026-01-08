/**
 * @fileoverview Statistics tracking for Conway's Game of Life
 */

export let stats = {
  population: 0,
  births: 0,
  deaths: 0,
  peakPopulation: 0,
};

/**
 * Calculate current population
 * @param {Array} currentState - Current grid state
 * @returns {number} Total alive cells
 */
export function calculatePopulation(currentState) {
  return currentState.reduce(
    (total, row) => total + row.reduce((sum, cell) => sum + cell, 0),
    0
  );
}

/**
 * Update statistics based on state changes
 * @param {Array} oldState - Previous state
 * @param {Array} newState - New state
 */
export function updateStats(oldState, newState) {
  const oldPop = calculatePopulation(oldState);
  const newPop = calculatePopulation(newState);

  stats.population = newPop;

  if (newPop > stats.peakPopulation) {
    stats.peakPopulation = newPop;
  }

  // Count births and deaths
  let births = 0;
  let deaths = 0;

  for (let i = 0; i < oldState.length; i++) {
    for (let j = 0; j < oldState[i].length; j++) {
      if (oldState[i][j] === 0 && newState[i][j] === 1) {
        births++;
      } else if (oldState[i][j] === 1 && newState[i][j] === 0) {
        deaths++;
      }
    }
  }

  stats.births += births;
  stats.deaths += deaths;
}

/**
 * Reset statistics to initial state
 */
export function resetStats() {
  stats.population = 0;
  stats.births = 0;
  stats.deaths = 0;
  stats.peakPopulation = 0;
}

/**
 * Update statistics display in the DOM
 */
export function updateStatsDisplay() {
  const populationEl = document.getElementById("stat-population");
  const birthsEl = document.getElementById("stat-births");
  const deathsEl = document.getElementById("stat-deaths");
  const peakEl = document.getElementById("stat-peak");

  if (populationEl) populationEl.textContent = stats.population;
  if (birthsEl) birthsEl.textContent = stats.births;
  if (deathsEl) deathsEl.textContent = stats.deaths;
  if (peakEl) peakEl.textContent = stats.peakPopulation;
}
