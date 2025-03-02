import { System } from '../System';
import { Position } from '../components/Position';
import { Collidable } from '../components/Collidable';

export class CollisionSystem extends System {
  update(deltaTime: number): void {
    // Simple AABB collision detection
    for (let i = 0; i < this.entities.length; i++) {
      const entityA = this.entities[i];
      const posA = entityA.getComponent(Position);
      const colA = entityA.getComponent(Collidable);

      if (!posA || !colA) continue;

      for (let j = i + 1; j < this.entities.length; j++) {
        const entityB = this.entities[j];
        const posB = entityB.getComponent(Position);
        const colB = entityB.getComponent(Collidable);

        if (!posB || !colB) continue;

        if (posA.x < posB.x + colB.width &&
            posA.x + colA.width > posB.x &&
            posA.y < posB.y + colB.height &&
            posA.y + colA.height > posB.y) {
          // Handle collision
          console.log('Collision detected between', entityA.id, 'and', entityB.id);
        }
      }
    }
  }
}
