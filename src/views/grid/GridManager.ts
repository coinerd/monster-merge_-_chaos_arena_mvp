import { Monster } from '../../models/Monster';

interface GridState {
  grid: Array<{ id: string; monsterId: string | null }>;
  monsters: Record<string, Monster>;
}

export class GridManager {
  private state: GridState;
  private onMerge: (monster1Id: string, monster2Id: string, targetCellId: string) => void;
  private onMove: (monsterId: string, cellId: string) => void;
  private onSelect: (monsterId: string) => void;
  
  constructor(
    initialState: GridState,
    onMerge: (monster1Id: string, monster2Id: string, targetCellId: string) => void,
    onMove: (monsterId: string, cellId: string) => void,
    onSelect: (monsterId: string) => void
  ) {
    this.state = initialState;
    this.onMerge = onMerge;
    this.onMove = onMove;
    this.onSelect = onSelect;
  }
  
  /**
   * Updates the grid state
   */
  updateState(newState: GridState): void {
    this.state = newState;
  }
  
  /**
   * Gets a monster by ID
   */
  getMonster(monsterId: string): Monster | null {
    return this.state.monsters[monsterId] || null;
  }
  
  /**
   * Gets a cell by ID
   */
  getCell(cellId: string): { id: string; monsterId: string | null } | null {
    return this.state.grid.find(cell => cell.id === cellId) || null;
  }
  
  /**
   * Gets the monster in a cell
   */
  getMonsterInCell(cellId: string): Monster | null {
    const cell = this.getCell(cellId);
    if (!cell || !cell.monsterId) return null;
    return this.getMonster(cell.monsterId);
  }
  
  /**
   * Checks if a cell is empty
   */
  isCellEmpty(cellId: string): boolean {
    const cell = this.getCell(cellId);
    return cell ? !cell.monsterId : false;
  }
  
  /**
   * Handles monster movement
   */
  moveMonster(monsterId: string, targetCellId: string): boolean {
    // Check if monster exists
    const monster = this.getMonster(monsterId);
    if (!monster) {
      console.error(`Monster ${monsterId} not found`);
      return false;
    }
    
    // Check if target cell exists
    const targetCell = this.getCell(targetCellId);
    if (!targetCell) {
      console.error(`Target cell ${targetCellId} not found`);
      return false;
    }
    
    // Check if target cell is empty
    if (!this.isCellEmpty(targetCellId)) {
      console.error(`Target cell ${targetCellId} is not empty`);
      return false;
    }
    
    // Move monster
    this.onMove(monsterId, targetCellId);
    return true;
  }
  
  /**
   * Handles monster merging
   */
  mergeMonsters(monster1Id: string, monster2Id: string, targetCellId: string): boolean {
    // Check if monsters exist
    const monster1 = this.getMonster(monster1Id);
    const monster2 = this.getMonster(monster2Id);
    
    if (!monster1 || !monster2) {
      console.error(`One or both monsters not found: ${monster1Id}, ${monster2Id}`);
      return false;
    }
    
    // Check if target cell exists
    if (targetCellId && !this.getCell(targetCellId)) {
      console.error(`Target cell ${targetCellId} not found`);
      return false;
    }
    
    // Merge monsters
    this.onMerge(monster1Id, monster2Id, targetCellId);
    return true;
  }
  
  /**
   * Handles monster selection
   */
  selectMonster(monsterId: string): boolean {
    // Check if monster exists
    const monster = this.getMonster(monsterId);
    if (!monster) {
      console.error(`Monster ${monsterId} not found`);
      return false;
    }
    
    // Select monster
    this.onSelect(monsterId);
    return true;
  }
}
