# ES6 Module Architecture

This directory contains the modular ES6 implementation of Conway's Game of Life.

## Module Structure

### Core Modules

- **main.js** - Main entry point, coordinates all modules and handles initialization
- **gameCore.js** - Core game logic (grid management, tick function, state updates)
- **renderer.js** - Rendering logic for displaying the grid
- **patterns.js** - Pattern definitions (spaceships, oscillators, still lifes, etc.)
- **statistics.js** - Population tracking, births, deaths, peak statistics
- **theme.js** - Theme management (dark/light mode, color customization)
- **exportImport.js** - Export/import functionality (JSON, RLE, plaintext, save/load)
- **patternEditor.js** - Custom pattern editor logic
- **patternFilter.js** - Pattern search and category filtering

## Architecture Benefits

1. **Modularity** - Each module has a single, well-defined responsibility
2. **Maintainability** - Easier to locate and update specific functionality
3. **Testability** - Modules can be tested independently
4. **Reusability** - Functions can be imported and reused across modules
5. **Performance** - Modern browsers optimize ES6 module loading
6. **No Build Required** - Uses native browser ES6 module support

## Module Dependencies

```
main.js
├── gameCore.js (core game logic)
├── renderer.js (drawing)
├── patterns.js (pattern data)
├── statistics.js (stats tracking)
├── theme.js (theming)
├── exportImport.js (save/load/export)
├── patternEditor.js (custom editor)
└── patternFilter.js (search/filter)
```

## How to Use

The modules are automatically loaded via the `<script type="module">` tag in index.html:

```html
<script type="module" src="js/main.js"></script>
```

All module imports use relative paths with the `.js` extension:

```javascript
import * as GameCore from './gameCore.js';
import * as Patterns from './patterns.js';
```

## Browser Compatibility

ES6 modules are supported in all modern browsers:
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## Original Implementation

The original monolithic implementation (1907 lines) is backed up as `game.js.backup` in the root directory.

## Migration Notes

The refactoring maintains 100% feature parity with the original implementation while improving:
- Code organization (8 focused modules vs 1 large file)
- Developer experience (easier to navigate and understand)
- Future extensibility (simpler to add new features)
