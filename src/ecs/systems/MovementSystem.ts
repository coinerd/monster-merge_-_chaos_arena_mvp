import { System } from '../System';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';

export class MovementSystem extends System {
  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      const position = entity.getComponent(Position);
      const velocity = entity.getComponent(Velocity);

      if (position && velocity) {
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;
      }
    });
  }
}
