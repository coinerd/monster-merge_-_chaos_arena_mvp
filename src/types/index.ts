// Monster element types
export enum ElementType {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air',
  LIGHTNING = 'lightning',
  ICE = 'ice',
  NATURE = 'nature',
  SHADOW = 'shadow',
  LIGHT = 'light',
  METAL = 'metal'
}

// Monster tiers
export enum MonsterTier {
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
  TIER_4 = 4,
  TIER_5 = 5
}

// Grid cell interface
export interface GridCell {
  id: string;
  monsterId: string | null;
}

// Game state
export enum GameStateType {
  MAIN_MENU = 'MAIN_MENU',
  GAMEPLAY = 'GAMEPLAY',
  BATTLE = 'BATTLE',
  PAUSE = 'PAUSE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

// Battle state
export enum BattleStateType {
  PREPARATION = 'PREPARATION',
  INTRO = 'INTRO',
  PLAYER_TURN = 'PLAYER_TURN',
  ENEMY_TURN = 'ENEMY_TURN',
  TURN_TRANSITION = 'TURN_TRANSITION',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

// Battle action
export interface BattleAction {
  type: 'ATTACK' | 'DEFEND' | 'SPECIAL' | 'ITEM';
  sourceId: string;
  targetId?: string;
  value?: number;
  element?: ElementType;
}

// Battle log entry
export interface BattleLogEntry {
  turn: number;
  action: BattleAction;
  result: {
    damage?: number;
    healing?: number;
    status?: string;
    message: string;
  };
  timestamp: number;
}
