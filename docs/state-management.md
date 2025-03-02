# State Management

## Game State

The main game state is managed in the `App` component using React's `useState` hook. The `gameState` object contains:

```typescript
interface GameState {
  grid: GridCell[];              // Monster grid layout
  monsters: Record<string, Monster>; // Collection of all monsters
  coins: number;                 // Player currency
  battleInProgress: boolean;     // Battle status flag
  currentWave: number;           // Current wave number
  maxWaves: number;              // Maximum number of waves
  playerTeam: string[];          // IDs of monsters in battle
  enemyTeam: Monster[];          // Enemy monsters in battle
  battleLog: string[];           // Battle event log
  gridSize: number;              // Size of the monster grid
}
```

## State Persistence

Game state is persisted using localStorage:

- `saveGameState`: Saves the current state to localStorage
- `loadGameState`: Loads saved state from localStorage

This allows players to continue their progress between sessions.

## Battle State

During battles, a separate battle state is managed in the `BattleArena` component:

```typescript
interface BattleState {
  playerTeam: Monster[];         // Player monsters in battle
  enemyTeam: Monster[];          // Enemy monsters in battle
  battleLog: string[];           // Battle event log
  turnCount: number;             // Current turn number
  battleEnded: boolean;          // Battle end flag
  defeatedMonsterIds: string[];  // IDs of defeated player monsters
}
```

## State Updates

State updates follow these patterns:

### Functional Updates

State updates use the functional form of `setState` to ensure they're based on the latest state:

```typescript
setGameState(prevState => ({
  ...prevState,
  // Updated properties
}));
```

### Immutable Updates

All state updates follow immutability principles, creating new objects rather than mutating existing ones:

```typescript
// Creating a new object with updated properties
const updatedMonsters = { ...gameState.monsters };
delete updatedMonsters[monster1Id];
delete updatedMonsters[monster2Id];
updatedMonsters[mergedMonster.id] = mergedMonster;

// Updating an array immutably
const updatedGrid = gameState.grid.map(cell => {
  if (cell.id === cell2.id) {
    return { ...cell, monsterId: mergedMonster.id };
  }
  // ...
  return cell;
});
```

## State Synchronization

The game maintains synchronization between different state objects:

1. The main `gameState` in the App component
2. The `battleState` in the BattleArena component
3. Various UI states in child components

When battles end, the results are propagated back to the main game state through the `handleBattleEnd` callback.
