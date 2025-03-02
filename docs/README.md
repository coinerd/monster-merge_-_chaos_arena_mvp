# Monster Merge: Chaos Arena Documentation

This documentation provides a comprehensive overview of the Monster Merge: Chaos Arena game, including its architecture, components, game mechanics, and code structure.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Game Mechanics](#game-mechanics)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [Configuration](#configuration)
- [Utilities](#utilities)
- [Assets](#assets)

## Overview

Monster Merge: Chaos Arena is a strategic monster merging and battling game built with React, TypeScript, and Vite. Players collect monsters of different elements, merge them to create more powerful creatures, and battle against waves of enemy monsters in the arena.

The game features:
- Monster merging system
- Element-based combat
- Turn-based battles
- Experience and leveling system
- Wave-based progression

## Architecture

The game follows a component-based architecture using React and TypeScript. The main components are:

1. **App.tsx**: The main application component that manages the overall game state
2. **MonsterGrid**: Handles the grid where monsters are placed and merged
3. **BattleArena**: Manages the battle system and animations
4. **GameControls**: Provides UI controls for game actions
5. **MonsterDetails**: Displays detailed information about selected monsters

The game state is managed using React's useState and useEffect hooks, with localStorage for persistence.
