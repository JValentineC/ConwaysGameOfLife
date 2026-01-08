/**
 * @fileoverview Theme management for Conway's Game of Life
 */

/**
 * Initialize theme from localStorage
 */
export function initializeTheme() {
  const savedTheme = localStorage.getItem("gameTheme");
  const savedColor = localStorage.getItem("aliveCellColor");

  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) themeToggle.checked = true;
  }

  if (savedColor) {
    document.documentElement.style.setProperty(
      "--alive-cell-color",
      savedColor
    );
    const colorPicker = document.getElementById("color-picker");
    if (colorPicker) colorPicker.value = savedColor;
  }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme() {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("gameTheme", isLight ? "light" : "dark");
}

/**
 * Update cell color
 * @param {string} color - Hex color value
 */
export function updateCellColor(color) {
  document.documentElement.style.setProperty("--alive-cell-color", color);
  localStorage.setItem("aliveCellColor", color);
}

/**
 * Setup theme event listeners
 */
export function setupThemeListeners() {
  const themeToggle = document.getElementById("theme-toggle");
  const colorPicker = document.getElementById("color-picker");

  if (themeToggle) {
    themeToggle.addEventListener("change", toggleTheme);
  }

  if (colorPicker) {
    colorPicker.addEventListener("input", (e) =>
      updateCellColor(e.target.value)
    );
  }
}
