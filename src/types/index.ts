export enum ElementType {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air'
}

export enum MonsterTier {
  TIER_1 = 1,
  TIER_2 = 2,
  TIER_3 = 3,
  TIER_4 = 4,
  TIER_5 = 5
}

// Import Monster class for type usage
import { Monster } from '../models/Monster';

export interface GridCell {
  id: string;
  monsterId: string | null;
}

export interface GameStateData {
  grid: GridCell[];
  monsters: Record<string, Monster>;
  coins: number;
  battleInProgress: boolean;
  currentWave: number;
  maxWaves: number;
  playerTeam: string[];
  enemyTeam: Monster[];
  battleLog: string[];
  gridSize: number;
}

interface BattleResult {
  victory: boolean;
  coinsEarned: number;
  experienceEarned: number;
}
