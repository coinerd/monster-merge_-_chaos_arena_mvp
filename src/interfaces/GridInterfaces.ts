import { Monster } from '../models/Monster';
import { GridCell } from '../types';

/**
 * Interface for grid operations
 */
export interface IGridOperations {
  moveMonster(monsterId: string, targetCellId: string): boolean;
  mergeMonsters(monster1Id: string, monster2Id: string, targetCellId: string): boolean;
  canMergeMonsters(monster1Id: string, monster2Id: string): boolean;
  validateMove(monsterId: string, targetCellId: string): boolean;
  selectMonster(monsterId: string): void;
}

/**
 * Interface for grid state
 */
export interface IGridState {
  grid: GridCell[];
  monsters: Record<string, Monster>;
}

/**
 * Interface for drag operation data
 */
export interface IDragOperation {
  monsterId: string;
  sourceCellId: string;
  targetCellId: string | null;
}

/**
 * Interface for merge operation data
 */
export interface IMergeOperation {
  monster1Id: string;
  monster2Id: string;
  targetCellId: string;
}

/**
 * Interface for particle effect data
 */
export interface IParticleEffect {
  x: number;
  y: number;
  colors: string[];
  isActive: boolean;
}

/**
 * Interface for grid configuration
 */
export interface IGridConfig {
  grid: {
    defaultSize: number;
    columns: number;
    cellSize: number;
    cellGap: number;
    dragThrottleMs: number;
    operationTimeoutMs: number;
    animationDurationMs: number;
    mergeAnimationDelayMs: number;
    swapAnimationDelayMs: number;
  };
  dragAndDrop: {
    dragElastic: number;
    dragScale: number;
    dragConstraints: boolean;
    highlightDragTarget: boolean;
  };
  animations: {
    mergeParticleCount: number;
    mergeParticleDuration: number;
    mergeFlashDuration: number;
  };
  appearance: {
    cellBackgroundColor: string;
    cellHoverColor: string;
    cellHighlightColor: string;
    gridBorderColor: string;
    gridActiveBorderColor: string;
  };
}
