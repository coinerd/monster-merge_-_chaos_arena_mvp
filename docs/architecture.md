# Game Architecture

## High-Level Architecture

Monster Merge: Chaos Arena follows a component-based architecture using React and TypeScript. The application is structured to separate concerns between game logic, UI components, and state management.

```
src/
├── components/       # UI components
│   ├── battle/       # Battle-related components
│   └── ...           # Other UI components
├── config/           # Game configuration
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and game logic
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Key Components

### App Component

The `App` component (`src/App.tsx`) serves as the main container for the game. It:
- Manages the overall game state
- Handles monster merging logic
- Controls battle flow
- Manages player resources (coins, monsters)
- Coordinates between different game components

### Component Hierarchy

```
App
├── MonsterGrid
├── GameControls
├── BattleArena
│   ├── BattleView
│   ├── TeamRoster
│   └── BattleLog
└── MonsterDetails
```

## State Management

The game uses React's built-in state management with `useState` and `useEffect` hooks. The main state is stored in the `gameState` object in the App component, which includes:

- Grid layout and monster positions
- Monster collection and stats
- Player resources (coins)
- Battle state
- Wave progression

State persistence is achieved through localStorage, allowing players to save their progress between sessions.

## Data Flow

1. User interactions (like dragging monsters or clicking buttons) trigger event handlers in the components
2. These handlers call functions in the App component that update the game state
3. State changes trigger re-renders of the affected components
4. Some state changes also trigger side effects (like saving to localStorage)

## Code Organization

- **Components**: UI elements and their behavior
- **Types**: TypeScript interfaces and type definitions
- **Utils**: Game logic and helper functions
- **Config**: Game balance and configuration settings
