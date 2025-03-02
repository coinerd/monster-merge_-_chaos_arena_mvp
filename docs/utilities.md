# Utility Functions

## Game Utilities (`src/utils/gameUtils.ts`)

### Monster Generation

- `generateMonster`: Creates a new monster with specified element and tier
- `getTierMultiplier`: Gets stat multipliers for a specific monster tier

### Monster Manipulation

- `mergeMonsters`: Combines two monsters to create a higher-tier monster
- `levelUpMonster`: Increases a monster's level and stats based on experience

### Battle Mechanics

- `calculateDamage`: Calculates damage based on attacker and defender stats
- `getElementColor`: Gets the color associated with an element
- `getRandomElement`: Generates a random element
- `generateEnemyTeam`: Creates a team of enemy monsters based on wave number

### Game State Management

- `initializeGameState`: Creates the initial game state
- `saveGameState`: Saves game state to localStorage
- `loadGameState`: Loads game state from localStorage

## Battle Utilities (`src/utils/battleUtils.ts`)

### Battle State Management

- `initializeBattleState`: Creates the initial battle state
- `createInitialBattleState`: Helper for creating battle state with deep copies
- `isBattleOver`: Checks if a battle has ended
- `isVictory`: Determines if the player has won the battle

### Battle Processing

- `calculateAttack`: Calculates the result of a single attack
- `processPlayerAttacks`: Processes all player attacks in a turn
- `processEnemyAttacks`: Processes all enemy attacks in a turn
- `calculateBattleRewards`: Calculates coins and XP earned from a battle

### Visual Effects

- `createParticleExplosion`: Creates particle effects for attacks
- `generateAttackAnimations`: Generates animation data for attacks
- `generateDamageEffects`: Generates damage number effects
- `getMonsterElementColor`: Gets the color for a monster's element

## Type Definitions (`src/types/index.ts`)

The game uses TypeScript for type safety. Key types include:

- `ElementType`: Enum for monster elements (Fire, Water, Earth, Air)
- `MonsterTier`: Enum for monster tiers (1-5)
- `Monster`: Interface for monster properties
- `GridCell`: Interface for grid cell properties
- `GameState`: Interface for overall game state
- `BattleResult`: Interface for battle outcome

These utilities provide a clean separation between game logic and UI components, making the code more maintainable and testable.
