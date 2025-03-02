import { System } from '../../ecs/System';
import { Position } from '../../ecs/components/Position';
import { Collidable } from '../../ecs/components/Collidable';

export class CollisionSystem extends System {
  private spatialHash: Map<string, Set<string>> = new Map();
  private readonly cellSize: number = 100;

  update(deltaTime: number): void {
    this.spatialHash.clear();
    
    // Populate spatial hash
    this.entities.forEach(entity => {
      const position = entity.getComponent(Position);
      const collidable = entity.getComponent(Collidable);
      
      if (position && collidable) {
        const cellX = Math.floor(position.x / this.cellSize);
        const cellY = Math.floor(position.y / this.cellSize);
        const cellKey = `${cellX},${cellY}`;
        
        if (!this.spatialHash.has(cellKey)) {
          this.spatialHash.set(cellKey, new Set());
        }
        this.spatialHash.get(cellKey)!.add(entity.id);
      }
    });

    // Check collisions using spatial hashing
    this.entities.forEach(entity => {
      const posA = entity.getComponent(Position);
      const colA = entity.getComponent(Collidable);
      
      if (posA && colA) {
        const cellX = Math.floor(posA.x / this.cellSize);
        const cellY = Math.floor(posA.y / this.cellSize);
        
        // Check adjacent cells
        for (let x = cellX - 1; x <= cellX + 1; x++) {
          for (let y = cellY - 1; y <= cellY + 1; y++) {
            const cellKey = `${x},${y}`;
            const entitiesInCell = this.spatialHash.get(cellKey);
            
            if (entitiesInCell) {
              entitiesInCell.forEach(otherId => {
                if (otherId !== entity.id) {
                  const otherEntity = this.entities.find(e => e.id === otherId);
                  if (otherEntity) {
                    const posB = otherEntity.getComponent(Position);
                    const colB = otherEntity.getComponent(Collidable);
                    
                    if (posB && colB && this.checkCollision(posA, colA, posB, colB)) {
                      // Handle collision
                      console.log('Collision detected between', entity.id, 'and', otherId);
                    }
                  }
                }
              });
            }
          }
        }
      }
    });
  }

  private checkCollision(
    posA: Position, colA: Collidable,
    posB: Position, colB: Collidable
  ): boolean {
    return posA.x < posB.x + colB.width &&
           posA.x + colA.width > posB.x &&
           posA.y < posB.y + colB.height &&
           posA.y + colA.height > posB.y;
  }
}
