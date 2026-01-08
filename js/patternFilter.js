/**
 * @fileoverview Pattern search and filtering for Conway's Game of Life
 */

let currentSearchQuery = "";
let currentCategoryFilter = "all";

/**
 * Render pattern buttons in the UI
 * @param {Object} allPatterns - All available patterns
 * @param {Function} onPatternSelect - Callback when pattern is selected
 */
export function renderPatterns(allPatterns, onPatternSelect) {
  const container = document.getElementById("patterns");
  if (!container) return;

  container.innerHTML = "";

  const filteredPatterns = filterPatterns(allPatterns);

  if (Object.keys(filteredPatterns).length === 0) {
    container.innerHTML =
      '<p class="text-center text-gray-500">No patterns found</p>';
    return;
  }

  for (const [key, pattern] of Object.entries(filteredPatterns)) {
    const btn = document.createElement("button");
    btn.className = "btn btn-secondary btn-sm";
    btn.textContent = pattern.name || key;
    btn.onclick = () => onPatternSelect(key, pattern);
    container.appendChild(btn);
  }
}

/**
 * Filter patterns based on search and category
 * @param {Object} allPatterns - All available patterns
 * @returns {Object} Filtered patterns
 */
function filterPatterns(allPatterns) {
  let filtered = { ...allPatterns };

  // Filter by category
  if (currentCategoryFilter !== "all") {
    filtered = Object.fromEntries(
      Object.entries(filtered).filter(([key, pattern]) => {
        const category = pattern.category || "other";
        return category === currentCategoryFilter;
      })
    );
  }

  // Filter by search query
  if (currentSearchQuery) {
    const query = currentSearchQuery.toLowerCase();
    filtered = Object.fromEntries(
      Object.entries(filtered).filter(([key, pattern]) => {
        const name = (pattern.name || key).toLowerCase();
        return name.includes(query);
      })
    );
  }

  return filtered;
}

/**
 * Update search query
 * @param {string} query - Search query
 * @param {Object} allPatterns - All available patterns
 * @param {Function} onPatternSelect - Callback when pattern is selected
 */
export function updateSearch(query, allPatterns, onPatternSelect) {
  currentSearchQuery = query;
  renderPatterns(allPatterns, onPatternSelect);
}

/**
 * Update category filter
 * @param {string} category - Category to filter by
 * @param {Object} allPatterns - All available patterns
 * @param {Function} onPatternSelect - Callback when pattern is selected
 */
export function updateCategoryFilter(category, allPatterns, onPatternSelect) {
  currentCategoryFilter = category;

  // Update button states
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.category === category) {
      btn.classList.add("btn-active");
    } else {
      btn.classList.remove("btn-active");
    }
  });

  renderPatterns(allPatterns, onPatternSelect);
}

/**
 * Reset filters
 */
export function resetFilters() {
  currentSearchQuery = "";
  currentCategoryFilter = "all";

  const searchInput = document.getElementById("pattern-search");
  if (searchInput) searchInput.value = "";

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.category === "all") {
      btn.classList.add("btn-active");
    } else {
      btn.classList.remove("btn-active");
    }
  });
}

/**
 * Setup pattern filter event listeners
 * @param {Object} allPatterns - All available patterns
 * @param {Function} onPatternSelect - Callback when pattern is selected
 */
export function setupFilterListeners(allPatterns, onPatternSelect) {
  const searchInput = document.getElementById("pattern-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      updateSearch(e.target.value, allPatterns, onPatternSelect);
    });
  }

  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      updateCategoryFilter(category, allPatterns, onPatternSelect);
    });
  });
}
