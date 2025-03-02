import { System } from '../System';
import { Position } from '../components/Position';
import { Renderable } from '../components/Renderable';

export class RenderingSystem extends System {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    super();
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
  }

  update(deltaTime: number): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.entities.forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);

      if (position && renderable) {
        // Draw the entity
        const img = new Image();
        img.src = renderable.texture;
        this.ctx.drawImage(
          img,
          position.x,
          position.y,
          renderable.width,
          renderable.height
        );
      }
    });
  }
}
