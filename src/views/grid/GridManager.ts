import { IGridConfig, IGridOperations, IGridState, IDragOperation, IMergeOperation, IParticleEffect } from '../../interfaces/GridInterfaces';
import { GridService } from '../../services/GridService';
import gridConfig from '../../config/gridConfig.json';
import { Position } from '../../ecs/components/Position';

export class GridManager {
  private gridService: GridService;
  private config: IGridConfig;
  private lastOperationTime: number = 0;
  private operationInProgress: boolean = false;
  private operationTimeout: NodeJS.Timeout | null = null;
  
  constructor(
    gridState: IGridState,
    onMerge: (monster1Id: string, monster2Id: string) => void,
    onMove: (monsterId: string, cellId: string) => void,
    onSelect: (monsterId: string) => void
  ) {
    this.gridService = new GridService(gridState, onMerge, onMove, onSelect);
    this.config = gridConfig as IGridConfig;
    this.initializeGridPositions(gridState);
  }

  private initializeGridPositions(gridState: IGridState): void {
    const cellSize = this.config.grid.cellSize;
    const gridWidth = this.config.grid.columns;
    
    gridState.grid.forEach((cell, index) => {
      if (cell.monsterId && gridState.monsters[cell.monsterId]) {
        const monster = gridState.monsters[cell.monsterId];
        let position = monster.getComponent(Position);
        
        if (!position) {
          position = new Position();
          monster.addComponent(position);
        }
        
        const row = Math.floor(index / gridWidth);
        const col = index % gridWidth;
        
        position.x = col * cellSize + cellSize / 2;
        position.y = row * cellSize + cellSize / 2;
      }
    });
  }
  
  // Rest of the GridManager implementation...
}
