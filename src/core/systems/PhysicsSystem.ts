import { System } from '../../ecs/System';
import { Position } from '../../ecs/components/Position';
import { Velocity } from '../../ecs/components/Velocity';
import { Collidable } from '../../ecs/components/Collidable';

export class PhysicsSystem extends System {
  private gravity = 9.8;

  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      const position = entity.getComponent(Position);
      const velocity = entity.getComponent(Velocity);
      const collidable = entity.getComponent(Collidable);

      if (position && velocity) {
        // Apply gravity
        velocity.y += this.gravity * deltaTime;

        // Update position
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        // Handle collisions
        if (collidable && position.y + collidable.height >= 500) {
          position.y = 500 - collidable.height;
          velocity.y = 0;
        }
      }
    });
  }
}
