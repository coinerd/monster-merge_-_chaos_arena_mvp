import { GameLoop } from './systems/GameLoop';
import { RenderingSystem } from './systems/RenderingSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { InputSystem } from './systems/InputSystem';
import { AudioSystem } from './systems/AudioSystem';

export class GameEngine {
  private gameLoop: GameLoop;
  private renderingSystem: RenderingSystem;
  private physicsSystem: PhysicsSystem;
  private collisionSystem: CollisionSystem;
  private inputSystem: InputSystem;
  private audioSystem: AudioSystem;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize systems
    this.renderingSystem = new RenderingSystem(canvas);
    this.physicsSystem = new PhysicsSystem();
    this.collisionSystem = new CollisionSystem();
    this.inputSystem = new InputSystem(canvas);
    this.audioSystem = new AudioSystem();
    
    // Initialize game loop
    this.gameLoop = new GameLoop(
      (delta) => this.update(delta),
      () => this.render()
    );
  }

  start(): void {
    // Initialize all systems
    this.renderingSystem.initialize();
    this.physicsSystem.initialize();
    this.collisionSystem.initialize();
    this.inputSystem.initialize();
    this.audioSystem.initialize();
    
    // Start game loop
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }

  private update(delta: number): void {
    this.inputSystem.update(delta);
    this.physicsSystem.update(delta);
    this.collisionSystem.update(delta);
  }

  private render(): void {
    this.renderingSystem.update(0);
  }
}
