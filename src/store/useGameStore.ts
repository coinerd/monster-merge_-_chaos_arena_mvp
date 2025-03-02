import create from 'zustand';
import { Monster } from '../models/Monster';
import { GridManager } from '../views/grid/GridManager';
import { GameState } from '../models/GameState';

interface GameStore {
  grid: Array<{ id: string; monsterId: string | null }>;
  monsters: Record<string, Monster>;
  gridManager: GridManager | null;
  gameState: GameState | null;
  error: string | null;
  errorSeverity: 'info' | 'warning' | 'error' | 'critical' | null;
  initializeGame: () => void;
  initializeGrid: () => void;
  loadGame: () => boolean;
  saveGame: () => boolean;
  setError: (message: string | null, severity?: 'info' | 'warning' | 'error' | 'critical') => void;
  resetGame: () => void;
  buyMonster: (type: string, element: string) => boolean;
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
      () => {},
      () => {},
      () => {}
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
      name: type,
      element: element as any, // Type assertion for now
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
