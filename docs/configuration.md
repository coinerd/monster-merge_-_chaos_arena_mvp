# Configuration System

## Overview

Monster Merge: Chaos Arena uses a configuration-driven approach to game balance and settings. The main configuration file is `src/config/battleConfig.json`, which contains settings for various game mechanics.

## Configuration Structure

The configuration is organized into several sections:

### Battle Configuration

Controls battle mechanics, animations, and rewards:

```json
"battle": {
  "maxParallelAttacks": 3,
  "animationDurations": {
    "attack": 800,
    "damage": 1000,
    "turnDelay": 500,
    "battleTurnDelay": 300,
    "battleEndDelay": 1000
  },
  "particleEffects": {
    "count": 20,
    "duration": 1000,
    "minSize": 3,
    "maxSize": 8,
    "minSpeed": 2,
    "maxSpeed": 6
  },
  "rewards": {
    "baseCoins": 50,
    "baseXP": 20,
    "defeatCoinMultiplier": 0.25,
    "defeatXPMultiplier": 0.5
  }
}
```

### Monster Configuration

Defines monster stats, element relationships, and leveling:

```json
"monsters": {
  "tierMultipliers": { /* Stat multipliers for each tier */ },
  "elementMultipliers": { /* Stat modifiers for each element */ },
  "baseStats": {
    "health": 50,
    "attack": 10,
    "defense": 5
  },
  "levelUp": {
    "healthMultiplier": 1.2,
    "attackMultiplier": 1.15,
    "defenseMultiplier": 1.1,
    "experienceMultiplier": 1.5
  },
  "elementEffectiveness": {
    "strong": 1.5,
    "weak": 0.5,
    "normal": 1.0
  },
  "elementRelationships": { /* Element strengths and weaknesses */ },
  "cost": 50
}
```

### Wave Configuration

Controls wave progression and enemy scaling:

```json
"waves": {
  "scaling": {
    "enemyLevelMultiplier": 0.5,
    "enemyStatMultiplier": 0.1,
    "enemyCountDivisor": 2
  },
  "maxWaves": 10
}
```

## Using Configuration

The configuration is imported and used throughout the codebase:

```typescript
import battleConfig from '../config/battleConfig.json';

// Using configuration values
const maxParallelAttacks = battleConfig.battle.maxParallelAttacks;
const monsterCost = battleConfig.monsters.cost;
```

## Benefits of Configuration-Driven Design

1. **Game Balance**: Easily adjust game balance without changing code
2. **Maintainability**: Centralized location for game parameters
3. **Iteration**: Quick iteration on game mechanics
4. **Separation of Concerns**: Game logic is separated from specific values
5. **Extensibility**: Easy to add new configuration options
