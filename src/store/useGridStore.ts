import { create } from 'zustand';
import { Monster } from '../models/Monster';
import { GridCell } from '../types';
import { MergeService } from '../services/MergeService';
import gridConfig from '../config/gridConfig.json';

interface ParticleEffect {
  x: number;
  y: number;
  colors: string[];
  isActive: boolean;
}

interface MergeOperation {
  monster1Id: string;
  monster2Id: string;
  targetCellId: string;
}

interface InvalidDropFeedback {
  active: boolean;
  cellId: string | null;
}

interface GridState {
  // Grid state
  draggedMonsterId: string | null;
  draggedFromCellId: string | null;
  isDragging: boolean;
  gridHighlight: boolean;
  
  // Animation state
  mergingMonsters: MergeOperation | null;
  hiddenMonsterIds: string[];
  particleEffect: ParticleEffect;
  invalidDropFeedback: InvalidDropFeedback;
  
  // Grid operations
  setDraggedMonster: (monsterId: string | null, cellId: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setGridHighlight: (highlight: boolean) => void;
  startMergeOperation: (monster1Id: string, monster2Id: string, targetCellId: string) => void;
  completeMergeOperation: () => void;
  hideMonsters: (monsterIds: string[]) => void;
  showAllMonsters: () => void;
  createParticleEffect: (x: number, y: number, colors: string[]) => void;
  clearParticleEffect: () => void;
  showInvalidDropFeedback: (cellId: string) => void;
  clearInvalidDropFeedback: () => void;
  
  // Validation
  canMergeMonsters: (monster1Id: string, monster2Id: string, monsters: Record<string, Monster>) => boolean;
  reset: () => void;
}

export const useGridStore = create<GridState>((set, get) => ({
  // Initial state
  draggedMonsterId: null,
  draggedFromCellId: null,
  isDragging: false,
  gridHighlight: false,
  
  mergingMonsters: null,
  hiddenMonsterIds: [],
  particleEffect: {
    x: 0,
    y: 0,
    colors: [],
    isActive: false
  },
  invalidDropFeedback: {
    active: false,
    cellId: null
  },
  
  // Set dragged monster
  setDraggedMonster: (monsterId, cellId) => {
    set({
      draggedMonsterId: monsterId,
      draggedFromCellId: cellId
    });
  },
  
  // Set dragging state
  setIsDragging: (isDragging) => {
    set({ isDragging });
  },
  
  // Set grid highlight
  setGridHighlight: (gridHighlight) => {
    set({ gridHighlight });
  },
  
  // Start merge operation
  startMergeOperation: (monster1Id, monster2Id, targetCellId) => {
    set({
      mergingMonsters: {
        monster1Id,
        monster2Id,
        targetCellId
      }
    });
  },
  
  // Complete merge operation
  completeMergeOperation: () => {
    set({
      mergingMonsters: null,
      hiddenMonsterIds: []
    });
    
    // Clear particle effect after a delay
    setTimeout(() => {
      set(state => ({
        particleEffect: {
          ...state.particleEffect,
          isActive: false
        }
      }));
    }, 200);
  },
  
  // Hide monsters (during merge animation)
  hideMonsters: (monsterIds) => {
    set({ hiddenMonsterIds: monsterIds });
  },
  
  // Show all monsters
  showAllMonsters: () => {
    set({ hiddenMonsterIds: [] });
  },
  
  // Create particle effect
  createParticleEffect: (x, y, colors) => {
    set({
      particleEffect: {
        x,
        y,
        colors,
        isActive: true
      }
    });
  },
  
  // Clear particle effect
  clearParticleEffect: () => {
    set(state => ({
      particleEffect: {
        ...state.particleEffect,
        isActive: false
      }
    }));
  },
  
  // Show invalid drop feedback
  showInvalidDropFeedback: (cellId) => {
    set({
      invalidDropFeedback: {
        active: true,
        cellId
      }
    });
    
    // Clear feedback after animation duration
    setTimeout(() => {
      set({
        invalidDropFeedback: {
          active: false,
          cellId: null
        }
      });
    }, 500);
  },
  
  // Clear invalid drop feedback
  clearInvalidDropFeedback: () => {
    set({
      invalidDropFeedback: {
        active: false,
        cellId: null
      }
    });
  },
  
  // Check if monsters can be merged
  canMergeMonsters: (monster1Id, monster2Id, monsters) => {
    const monster1 = monsters[monster1Id];
    const monster2 = monsters[monster2Id];
    
    if (!monster1 || !monster2) {
      return false;
    }
    
    return MergeService.canMerge(monster1, monster2);
  },
  
  // Reset grid state
  reset: () => {
    set({
      draggedMonsterId: null,
      draggedFromCellId: null,
      isDragging: false,
      gridHighlight: false,
      mergingMonsters: null,
      hiddenMonsterIds: [],
      particleEffect: {
        x: 0,
        y: 0,
        colors: [],
        isActive: false
      },
      invalidDropFeedback: {
        active: false,
        cellId: null
      }
    });
  }
}));
