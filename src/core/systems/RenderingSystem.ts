import { System } from '../../ecs/System';
import { Position } from '../../ecs/components/Position';
import { Renderable } from '../../ecs/components/Renderable';

export class RenderingSystem extends System {
  private mainCanvas: HTMLCanvasElement;
  private backgroundCanvas: HTMLCanvasElement;
  private gameplayCanvas: HTMLCanvasElement;
  private uiCanvas: HTMLCanvasElement;
  
  private bgCtx: CanvasRenderingContext2D;
  private gpCtx: CanvasRenderingContext2D;
  private uiCtx: CanvasRenderingContext2D;

  constructor(mainCanvas: HTMLCanvasElement) {
    super();
    this.mainCanvas = mainCanvas;
    
    // Create off-screen canvases
    this.backgroundCanvas = document.createElement('canvas');
    this.gameplayCanvas = document.createElement('canvas');
    this.uiCanvas = document.createElement('canvas');
    
    // Set canvas dimensions
    [this.backgroundCanvas, this.gameplayCanvas, this.uiCanvas].forEach(canvas => {
      canvas.width = mainCanvas.width;
      canvas.height = mainCanvas.height;
    });

    // Get contexts
    this.bgCtx = this.backgroundCanvas.getContext('2d')!;
    this.gpCtx = this.gameplayCanvas.getContext('2d')!;
    this.uiCtx = this.uiCanvas.getContext('2d')!;
  }

  update(deltaTime: number): void {
    const mainCtx = this.mainCanvas.getContext('2d')!;
    
    // Clear all canvases
    this.bgCtx.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
    this.gpCtx.clearRect(0, 0, this.gameplayCanvas.width, this.gameplayCanvas.height);
    this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);

    // Render background layer
    this.renderBackgroundLayer();
    
    // Render gameplay layer
    this.renderGameplayLayer();
    
    // Render UI layer
    this.renderUILayer();

    // Composite all layers onto main canvas
    mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    mainCtx.drawImage(this.backgroundCanvas, 0, 0);
    mainCtx.drawImage(this.gameplayCanvas, 0, 0);
    mainCtx.drawImage(this.uiCanvas, 0, 0);
  }

  private renderBackgroundLayer() {
    // Render static background elements
    this.bgCtx.fillStyle = '#1a1a1a';
    this.bgCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
  }

  private renderGameplayLayer() {
    // Render game entities
    this.entities.forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);

      if (position && renderable) {
        const img = new Image();
        img.src = renderable.texture;
        this.gpCtx.drawImage(
          img,
          position.x,
          position.y,
          renderable.width,
          renderable.height
        );
      }
    });
  }

  private renderUILayer() {
    // Render UI elements (score, health, etc.)
    this.uiCtx.fillStyle = 'white';
    this.uiCtx.font = '24px Arial';
    this.uiCtx.fillText('Score: 0', 20, 40);
  }
}
