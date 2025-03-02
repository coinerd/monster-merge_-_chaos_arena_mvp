# Component Structure

## Main Components

### App (`src/App.tsx`)

The main application component that:
- Manages the overall game state
- Handles monster merging logic
- Controls battle flow
- Manages player resources (coins, monsters)

Key functions:
- `handleMerge`: Merges two monsters
- `handleAddMonster`: Moves monsters on the grid
- `handleStartBattle`: Initiates a battle
- `handleBattleEnd`: Processes battle results
- `handleBuyMonster`: Purchases new monsters

### MonsterGrid (`src/components/MonsterGrid.tsx`)

Displays the grid where monsters are placed and manages drag-and-drop interactions.

Key features:
- Drag-and-drop monster movement
- Visual feedback for merging
- Monster selection

### BattleArena (`src/components/battle/BattleArena.tsx`)

Manages the battle system, animations, and battle state.

Key features:
- Turn-based combat system
- Battle animations
- Battle log
- Team displays

### GameControls (`src/components/GameControls.tsx`)

Provides UI controls for game actions.

Key features:
- Start battle button
- Buy monster buttons
- Reset game button
- Resource display

### MonsterDetails (`src/components/MonsterDetails.tsx`)

Displays detailed information about selected monsters.

Key features:
- Monster stats display
- Experience progress bar
- Element information

## Battle Components

### BattleView (`src/components/battle/BattleView.tsx`)

Renders the visual representation of the battle.

Key features:
- Monster positioning
- Attack animations
- Health bars
- Battle status

### TeamRoster (`src/components/battle/TeamRoster.tsx`)

Displays the list of monsters in each team.

Key features:
- Monster list with stats
- Health bars
- Team summary

### BattleLog (`src/components/battle/BattleLog.tsx`)

Shows a log of battle events.

Key features:
- Scrollable log
- Auto-scroll to latest events

### BattleIntro (`src/components/battle/BattleIntro.tsx`)

Displays the battle arena introduction when no battle is in progress.

## Utility Components

### MonsterAvatar (`src/components/MonsterAvatar.tsx`)

Renders a visual representation of a monster.

Key features:
- SVG image loading
- Fallback display for missing images
- Size variants
