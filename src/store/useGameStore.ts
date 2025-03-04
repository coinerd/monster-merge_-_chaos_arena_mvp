import { create } from 'zustand';
import { Monster } from '../models/Monster';
import { GridManager } from '../views/grid/GridManager';
import { GameState } from '../models/GameState';
import { MergeService } from '../services/MergeService';
import { ElementType, MonsterTier } from '../types';

interface GameStore {
  grid: Array<{ id: string; monsterId: string | null }>;
  monsters: Record<string, Monster>;
  gridManager: GridManager | null;
  gameState: GameState | null;
  error: string | null;
  errorSeverity: 'info' | 'warning' | 'error' | 'critical' | null;
  
  // Game actions
  initializeGame: () => void;
  initializeGrid: () => void;
  loadGame: () => boolean;
  saveGame: () => boolean;
  setError: (message: string | null, severity?: 'info' | 'warning' | 'error' | 'critical') => void;
  resetGame: () => void;
  buyMonster: (type: string, element: string) => boolean;
  
  // Monster actions
  moveMonster: (monsterId: string, cellId: string) => void;
  mergeMonsters: (monster1Id: string, monster2Id: string, targetCellId: string) => void;
  selectMonster: (monsterId: string) => void;
}

const initialGrid = Array.from({ length: 9 }, (_, i) => ({
  id: `cell-${i}`,
  monsterId: i < 3 ? `monster-${i}` : null
}));

// Create initial monsters with correct parameters
const initialMonsters = {
  'monster-0': new Monster({
    id: 'monster-0',
    name: 'Pebble',
    element: 'earth',
    tier: 1
  }),
  'monster-1': new Monster({
    id: 'monster-1',
    name: 'Ember',
    element: 'fire',
    tier: 1
  }),
  'monster-2': new Monster({
    id: 'monster-2',
    name: 'Breeze',
    element: 'air',
    tier: 1
  })
};

export const useGameStore = create<GameStore>((set, get) => ({
  grid: initialGrid,
  monsters: initialMonsters,
  gridManager: null,
  gameState: null,
  error: null,
  errorSeverity: null,
  
  initializeGame: () => {
    set({
      grid: initialGrid,
      monsters: initialMonsters,
      gameState: new GameState({
        grid: initialGrid,
        monsters: initialMonsters,
        coins: 100,
        currentWave: 1,
        maxWaves: 10,
        battleInProgress: false,
        playerTeam: [],
        enemyTeam: [],
        battleLog: []
      })
    });
    get().initializeGrid();
  },
  
  initializeGrid: () => {
    const gridManager = new GridManager(
      { grid: get().grid, monsters: get().monsters },
      (monster1Id, monster2Id, targetCellId) => get().mergeMonsters(monster1Id, monster2Id, targetCellId),
      (monsterId, cellId) => get().moveMonster(monsterId, cellId),
      (monsterId) => get().selectMonster(monsterId)
    );
    set({ gridManager });
  },
  
  buyMonster: (type: string, element: string) => {
    const state = get();
    if (!state.gameState) return false;
    
    // Check if player has enough coins
    const cost = 10; // Base cost for a monster
    if (state.gameState.coins < cost) {
      set({ error: 'Not enough coins', errorSeverity: 'warning' });
      return false;
    }
    
    // Find an empty cell
    const emptyCell = state.grid.find(cell => !cell.monsterId);
    if (!emptyCell) {
      set({ error: 'No space in grid', errorSeverity: 'warning' });
      return false;
    }
    
    // Create new monster
    const monsterId = `monster-${Date.now()}`;
    const newMonster = new Monster({
      id: monsterId,
      element: element as ElementType,
      tier: 1
    });
    
    // Update state
    set(state => ({
      grid: state.grid.map(cell => 
        cell.id === emptyCell.id ? { ...cell, monsterId } : cell
      ),
      monsters: { ...state.monsters, [monsterId]: newMonster },
      gameState: state.gameState ? {
        ...state.gameState,
        coins: state.gameState.coins - cost
      } : null
    }));
    
    return true;
  },
  
  moveMonster: (monsterId: string, cellId: string) => {
    console.log(`Moving monster ${monsterId} to cell ${cellId}`);
    
    // Find source cell
    const sourceCell = get().grid.find(cell => cell.monsterId === monsterId);
    if (!sourceCell) {
      console.error(`Source cell for monster ${monsterId} not found`);
      return;
    }
    
    // Update grid
    set(state => ({
      grid: state.grid.map(cell => {
        if (cell.id === sourceCell.id) {
          // Remove monster from source cell
          return { ...cell, monsterId: null };
        } else if (cell.id === cellId) {
          // Add monster to target cell
          return { ...cell, monsterId };
        }
        return cell;
      })
    }));
  },
  
  mergeMonsters: (monster1Id: string, monster2Id: string, targetCellId: string) => {
    console.log(`Merging monsters ${monster1Id} and ${monster2Id} at cell ${targetCellId}`);
    
    const monster1 = get().monsters[monster1Id];
    const monster2 = get().monsters[monster2Id];
    
    if (!monster1 || !monster2) {
      console.error("Cannot merge: One or both monsters not found");
      set({ error: 'Failed to merge monsters. Try again.', errorSeverity: 'warning' });
      return;
    }
    
    // Use MergeService to create the merged monster
    const mergedMonster = MergeService.merge(monster1, monster2);
    
    if (!mergedMonster) {
      console.error("Merge failed: MergeService returned null");
      set({ error: 'Failed to merge monsters. Try again.', errorSeverity: 'warning' });
      return;
    }
    
    // Find source cells
    const sourceCell1 = get().grid.find(cell => cell.monsterId === monster1Id);
    const sourceCell2 = get().grid.find(cell => cell.monsterId === monster2Id);
    
    if (!sourceCell1 || !sourceCell2) {
      console.error("Cannot merge: Source cells not found");
      set({ error: 'Failed to merge monsters. Try again.', errorSeverity: 'warning' });
      return;
    }
    
    // Update state
    set(state => {
      // Create a new monsters object without the merged monsters
      const { [monster1Id]: _, [monster2Id]: __, ...remainingMonsters } = state.monsters;
      
      // Add the new merged monster
      const updatedMonsters = {
        ...remainingMonsters,
        [mergedMonster.id]: mergedMonster
      };
      
      // Update the grid
      const updatedGrid = state.grid.map(cell => {
        if (cell.id === sourceCell1.id) {
          // Remove monster from first source cell
          return { ...cell, monsterId: null };
        } else if (cell.id === sourceCell2.id) {
          // Place merged monster in second source cell (or target cell if specified)
          const targetCell = targetCellId || sourceCell2.id;
          return cell.id === targetCell ? { ...cell, monsterId: mergedMonster.id } : cell;
        } else if (targetCellId && cell.id === targetCellId) {
          // If target cell is specified and different from source cells
          return { ...cell, monsterId: mergedMonster.id };
        }
        return cell;
      });
      
      return {
        monsters: updatedMonsters,
        grid: updatedGrid,
        error: null,
        errorSeverity: null
      };
    });
  },
  
  selectMonster: (monsterId: string) => {
    console.log(`Selected monster: ${monsterId}`);
    // Implement monster selection logic here
  },
  
  loadGame: () => {
    try {
      const savedData = localStorage.getItem('gameState');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const gameState = GameState.fromSavedData(parsedData);
        if (gameState) {
          set({
            grid: gameState.grid,
            monsters: gameState.monsters,
            gameState
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading game:', error);
      return false;
    }
  },
  
  saveGame: () => {
    try {
      const gameState = get().gameState;
      if (gameState) {
        const serialized = JSON.stringify(gameState.toJSON());
        localStorage.setItem('gameState', serialized);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  },
  
  setError: (message, severity = 'error') => {
    set({ error: message, errorSeverity: severity });
  },
  
  resetGame: () => {
    get().initializeGame();
  }
}));
