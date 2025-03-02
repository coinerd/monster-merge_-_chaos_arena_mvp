import { System } from '../../ecs/System';
import { InputComponent } from '../components/InputComponent';

export class InputSystem extends System {
  private keysPressed = new Set<string>();

  constructor() {
    super();
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.keysPressed.add(event.key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key);
  }

  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      const input = entity.getComponent(InputComponent);
      if (input) {
        input.keysPressed = new Set(this.keysPressed);
      }
    });
  }
}
