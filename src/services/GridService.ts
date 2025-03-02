import { IGridOperations, IGridState, IDragOperation, IMergeOperation } from '../interfaces/GridInterfaces';
import { MergeService } from './MergeService';
import { GridCell } from '../types';
import { Monster } from '../models/Monster';

/**
 * Service responsible for grid operations
 */
export class GridService implements IGridOperations {
  private gridState: IGridState;
  private onMergeCallback: (monster1Id: string, monster2Id: string) => void;
  private onMoveCallback: (monsterId: string, cellId: string) => void;
  private onSelectCallback: (monsterId: string) => void;
  
  constructor(
    gridState: IGridState,
    onMerge: (monster1Id: string, monster2Id: string) => void,
    onMove: (monsterId: string, cellId: string) => void,
    onSelect: (monsterId: string) => void
  ) {
    this.gridState = gridState;
    this.onMergeCallback = onMerge;
    this.onMoveCallback = onMove;
    this.onSelectCallback = onSelect;
  }
  
  /**
   * Updates the grid state
   */
  updateState(newState: IGridState): void {
    this.gridState = newState;
  }
  
  /**
   * Moves a monster to a target cell
   */
  moveMonster(monsterId: string, targetCellId: string): boolean {
    console.log("GridService.moveMonster:", { monsterId, targetCellId });
    
    // Validate monster exists
    if (!this.gridState.monsters[monsterId]) {
      console.error(`Monster with ID ${monsterId} not found`);
      return false;
    }
    
    // Validate target cell exists
    const targetCell = this.gridState.grid.find(cell => cell.id === targetCellId);
    if (!targetCell) {
      console.error(`Target cell with ID ${targetCellId} not found`);
      return false;
    }
    
    // Find source cell
    const sourceCell = this.gridState.grid.find(cell => cell.monsterId === monsterId);
    if (!sourceCell) {
      console.error(`Source cell for monster ${monsterId} not found`);
      return false;
    }
    
    // If target cell has a monster, validate the move
    if (targetCell.monsterId) {
      // If target monster is the same as source monster, don't do anything
      if (targetCell.monsterId === monsterId) {
        return true;
      }
      
      // Check if monsters can be merged
      if (!this.canMergeMonsters(monsterId, targetCell.monsterId)) {
        console.warn("Cannot move monster: Target cell contains an incompatible monster");
        return false;
      }
    }
    
    // Execute the move
    try {
      this.onMoveCallback(monsterId, targetCellId);
      return true;
    } catch (error) {
      console.error("Error executing monster move:", error);
      return false;
    }
  }
  
  /**
   * Merges two monsters
   */
  mergeMonsters(monster1Id: string, monster2Id: string, targetCellId: string): boolean {
    console.log("GridService.mergeMonsters:", { monster1Id, monster2Id, targetCellId });
    
    // Validate monsters exist
    const monster1 = this.gridState.monsters[monster1Id];
    const monster2 = this.gridState.monsters[monster2Id];
    
    if (!monster1 || !monster2) {
      console.error("Cannot merge: One or both monsters not found", { 
        monster1Exists: !!monster1, 
        monster2Exists: !!monster2 
      });
      return false;
    }
    
    // Check if monsters can be merged
    if (!this.canMergeMonsters(monster1Id, monster2Id)) {
      console.error("Cannot merge: Monsters are not compatible");
      return false;
    }
    
    // Execute the merge
    try {
      this.onMergeCallback(monster1Id, monster2Id);
      return true;
    } catch (error) {
      console.error("Error executing monster merge:", error);
      return false;
    }
  }
  
  /**
   * Checks if two monsters can be merged
   */
  canMergeMonsters(monster1Id: string, monster2Id: string): boolean {
    const monster1 = this.gridState.monsters[monster1Id];
    const monster2 = this.gridState.monsters[monster2Id];
    
    if (!monster1 || !monster2) {
      return false;
    }
    
    return MergeService.canMerge(monster1, monster2);
  }
  
  /**
   * Validates if a monster can be moved to a target cell
   */
  validateMove(monsterId: string, targetCellId: string): boolean {
    // Validate monster exists
    if (!this.gridState.monsters[monsterId]) {
      return false;
    }
    
    // Validate target cell exists
    const targetCell = this.findCellById(targetCellId);
    if (!targetCell) {
      return false;
    }
    
    // If target cell has a monster, check if they can be merged
    if (targetCell.monsterId) {
      // If it's the same monster, it's valid
      if (targetCell.monsterId === monsterId) {
        return true;
      }
      
      // Check if monsters can be merged
      return this.canMergeMonsters(monsterId, targetCell.monsterId);
    }
    
    // Empty cell is always valid
    return true;
  }
  
  /**
   * Selects a monster
   */
  selectMonster(monsterId: string): void {
    if (this.gridState.monsters[monsterId]) {
      this.onSelectCallback(monsterId);
    }
  }
  
  /**
   * Finds a cell by its ID
   */
  findCellById(cellId: string): GridCell | undefined {
    return this.gridState.grid.find(cell => cell.id === cellId);
  }
  
  /**
   * Finds a monster by its ID
   */
  findMonsterById(monsterId: string): Monster | undefined {
    return this.gridState.monsters[monsterId];
  }
  
  /**
   * Finds the cell containing a monster
   */
  findCellByMonsterId(monsterId: string): GridCell | undefined {
    return this.gridState.grid.find(cell => cell.monsterId === monsterId);
  }
  
  /**
   * Validates a drag operation
   */
  validateDragOperation(operation: IDragOperation): boolean {
    // Check if monster exists
    if (!this.findMonsterById(operation.monsterId)) {
      return false;
    }
    
    // Check if source cell exists and contains the monster
    const sourceCell = this.findCellById(operation.sourceCellId);
    if (!sourceCell || sourceCell.monsterId !== operation.monsterId) {
      return false;
    }
    
    // If target cell is specified, check if it exists
    if (operation.targetCellId && !this.findCellById(operation.targetCellId)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates a merge operation
   */
  validateMergeOperation(operation: IMergeOperation): boolean {
    // Check if both monsters exist
    const monster1 = this.findMonsterById(operation.monster1Id);
    const monster2 = this.findMonsterById(operation.monster2Id);
    
    if (!monster1 || !monster2) {
      return false;
    }
    
    // Check if target cell exists
    const targetCell = this.findCellById(operation.targetCellId);
    if (!targetCell) {
      return false;
    }
    
    // Check if target cell contains one of the monsters
    if (targetCell.monsterId !== operation.monster1Id && 
        targetCell.monsterId !== operation.monster2Id) {
      return false;
    }
    
    // Check if monsters can be merged
    return this.canMergeMonsters(operation.monster1Id, operation.monster2Id);
  }
}
