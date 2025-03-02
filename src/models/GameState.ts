import { v4 as uuidv4 } from 'uuid';
import { ElementType, GridCell, GameStateData } from '../types';
import { Monster } from './Monster';
import battleConfig from '../config/battleConfig.json';

/**
 * GameState class representing the overall game state (Model)
 */
export class GameState {
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

  constructor(data: Partial<GameStateData> = {}) {
    // Initialize with default values or provided data
    this.gridSize = data.gridSize || 9;
    this.grid = data.grid || this.initializeGrid();
    this.monsters = data.monsters || this.initializeMonsters();
    this.coins = data.coins !== undefined ? data.coins : 100;
    this.battleInProgress = data.battleInProgress || false;
    this.currentWave = data.currentWave || 1;
    this.maxWaves = data.maxWaves || battleConfig.waves.maxWaves;
    this.playerTeam = data.playerTeam || [];
    this.enemyTeam = data.enemyTeam || [];
    this.battleLog = data.battleLog || [];
  }

  /**
   * Creates a new game state with initial values
   */
  static createNew(): GameState {
    return new GameState();
  }

  /**
   * Creates a game state from saved data
   */
  static fromSavedData(savedData: any): GameState | null {
    if (!savedData) return null;
    
    try {
      // Convert plain monster objects to Monster instances
      const convertedMonsters: Record<string, Monster> = {};
      if (savedData.monsters) {
        Object.entries(savedData.monsters).forEach(([id, monsterData]) => {
          convertedMonsters[id] = Monster.fromObject(monsterData);
        });
      }
      
      // Ensure battle is not in progress when loading saved state
      const safeData = {
        ...savedData,
        monsters: convertedMonsters,
        battleInProgress: false,
        playerTeam: [],
        enemyTeam: []
      };
      
      return new GameState(safeData);
    } catch (error) {
      console.error("Error creating game state from saved data:", error);
      return null;
    }
  }

  /**
   * Initializes an empty grid
   */
  private initializeGrid(): GridCell[] {
    return Array(this.gridSize).fill(null).map(() => ({
      id: uuidv4(),
      monsterId: null,
    }));
  }

  /**
   * Initializes starting monsters
   */
  private initializeMonsters(): Record<string, Monster> {
    const initialMonsters: Record<string, Monster> = {};
    const elements = [ElementType.FIRE, ElementType.WATER, ElementType.EARTH];
    
    for (let i = 0; i < 3; i++) {
      const monster = Monster.create(elements[i]);
      initialMonsters[monster.id] = monster;
      
      // Place monsters on the grid
      if (this.grid[i]) {
        this.grid[i].monsterId = monster.id;
      }
    }
    
    return initialMonsters;
  }

  /**
   * Creates a copy of the current game state
   */
  clone(): GameState {
    // Create deep copies of objects
    const clonedMonsters: Record<string, Monster> = {};
    Object.entries(this.monsters).forEach(([id, monster]) => {
      clonedMonsters[id] = monster.clone();
    });
    
    return new GameState({
      grid: [...this.grid.map(cell => ({ ...cell }))],
      monsters: clonedMonsters,
      coins: this.coins,
      battleInProgress: this.battleInProgress,
      currentWave: this.currentWave,
      maxWaves: this.maxWaves,
      playerTeam: [...this.playerTeam],
      enemyTeam: [...this.enemyTeam.map(monster => monster.clone())],
      battleLog: [...this.battleLog],
      gridSize: this.gridSize
    });
  }

  /**
   * Updates a monster in the state
   */
  updateMonster(monster: Monster): GameState {
    const newState = this.clone();
    newState.monsters[monster.id] = monster;
    return newState;
  }

  /**
   * Adds a monster to the state
   */
  addMonster(monster: Monster): GameState {
    const newState = this.clone();
    newState.monsters[monster.id] = monster;
    return newState;
  }

  /**
   * Removes a monster from the state
   */
  removeMonster(monsterId: string): GameState {
    const newState = this.clone();
    delete newState.monsters[monsterId];
    
    // Also remove from grid
    newState.grid = newState.grid.map(cell => {
      if (cell.monsterId === monsterId) {
        return { ...cell, monsterId: null };
      }
      return cell;
    });
    
    return newState;
  }

  /**
   * Moves a monster to a new cell
   */
  moveMonster(monsterId: string, targetCellId: string): GameState {
    const newState = this.clone();
    
    // Verify monster exists
    if (!newState.monsters[monsterId]) {
      console.error(`Cannot move monster: Monster with ID ${monsterId} not found`);
      return newState;
    }
    
    // Verify target cell exists
    const targetCell = newState.grid.find(cell => cell.id === targetCellId);
    if (!targetCell) {
      console.error(`Cannot move monster: Cell with ID ${targetCellId} not found`);
      return newState;
    }
    
    // Find source cell
    const sourceCell = newState.grid.find(cell => cell.monsterId === monsterId);
    if (!sourceCell) {
      console.error(`Cannot move monster: Source cell for monster ${monsterId} not found`);
      return newState;
    }
    
    // If target cell has a monster, swap them
    if (targetCell.monsterId) {
      // Verify target monster exists
      if (!newState.monsters[targetCell.monsterId]) {
        console.error(`Cannot swap monsters: Target monster ${targetCell.monsterId} not found`);
        return newState;
      }
      
      sourceCell.monsterId = targetCell.monsterId;
      targetCell.monsterId = monsterId;
    } else {
      // Simple move
      sourceCell.monsterId = null;
      targetCell.monsterId = monsterId;
    }
    
    return newState;
  }

  /**
   * Updates the grid
   */
  updateGrid(grid: GridCell[]): GameState {
    const newState = this.clone();
    newState.grid = grid;
    return newState;
  }

  /**
   * Starts a battle
   */
  startBattle(enemyTeam: Monster[]): GameState {
    const newState = this.clone();
    
    // Get player team from grid
    const playerTeamIds = newState.grid
      .filter(cell => cell.monsterId)
      .map(cell => cell.monsterId!)
      .filter(id => !!newState.monsters[id]);
    
    // Validate player team
    if (playerTeamIds.length === 0) {
      console.warn("Cannot start battle: No monsters in player team");
      return newState;
    }
    
    // Reset monster health
    playerTeamIds.forEach(id => {
      const monster = newState.monsters[id];
      newState.monsters[id] = monster.resetHealth();
    });
    
    newState.battleInProgress = true;
    newState.playerTeam = playerTeamIds;
    newState.enemyTeam = enemyTeam;
    newState.battleLog = [];
    
    return newState;
  }

  /**
   * Ends a battle
   */
  endBattle(victory: boolean, survivingMonsterIds: string[], coinsEarned: number, xpEarned: number): GameState {
    const newState = this.clone();
    
    // Validate surviving monster IDs
    const validSurvivingIds = survivingMonsterIds.filter(id => !!newState.monsters[id]);
    
    // Remove defeated monsters
    newState.grid = newState.grid.map(cell => {
      if (cell.monsterId && !validSurvivingIds.includes(cell.monsterId)) {
        return { ...cell, monsterId: null };
      }
      return cell;
    });
    
    // Remove from monsters collection
    Object.keys(newState.monsters).forEach(id => {
      if (!validSurvivingIds.includes(id) && newState.playerTeam.includes(id)) {
         delete newState.monsters[id];
      }
    });
    
    // Add experience to surviving monsters
    validSurvivingIds.forEach(id => {
      if (newState.monsters[id]) {
        newState.monsters[id] = newState.monsters[id].addExperience(xpEarned);
      }
    });
    
    // Update game state
    newState.battleInProgress = false;
    newState.coins += coinsEarned;
    
    // Advance wave if victory
    if (victory) {
      newState.currentWave = Math.min(newState.currentWave + 1, newState.maxWaves);
    }
    
    // Reset battle-related state
    newState.playerTeam = [];
    newState.enemyTeam = [];
    
    return newState;
  }

  /**
   * Buys a new monster
   */
  buyMonster(element: ElementType): GameState {
    const cost = battleConfig.monsters.cost;
    
    // Check if player has enough coins
    if (this.coins < cost) {
      return this;
    }
    
    // Find empty cell
    const emptyCell = this.grid.find(cell => !cell.monsterId);
    if (!emptyCell) {
      return this;
    }
    
    // Create new monster
    const newMonster = Monster.create(element);
    
    // Update state
    const newState = this.clone();
    newState.monsters[newMonster.id] = newMonster;
    newState.coins -= cost;
    
    // Place monster on grid
    newState.grid = newState.grid.map(cell => {
      if (cell.id === emptyCell.id) {
        return { ...cell, monsterId: newMonster.id };
      }
      return cell;
    });
    
    return newState;
  }

  /**
   * Resets the game to initial state
   */
  reset(): GameState {
    return GameState.createNew();
  }

  /**
   * Converts the game state to a plain object for saving
   */
  toJSON(): GameStateData {
    return {
      grid: this.grid,
      monsters: this.monsters,
      coins: this.coins,
      battleInProgress: this.battleInProgress,
      currentWave: this.currentWave,
      maxWaves: this.maxWaves,
      playerTeam: this.playerTeam,
      enemyTeam: this.enemyTeam,
      battleLog: this.battleLog,
      gridSize: this.gridSize
    };
  }
}
