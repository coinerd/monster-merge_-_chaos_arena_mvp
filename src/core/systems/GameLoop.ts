export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly timestep: number = 1000 / 60;
  private isRunning: boolean = false;

  constructor(
    private updateFn: (delta: number) => void,
    private renderFn: () => void
  ) {}

  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.run();
  }

  stop(): void {
    this.isRunning = false;
  }

  private run(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    // Update game state
    this.accumulator += delta;
    while (this.accumulator >= this.timestep) {
      this.updateFn(this.timestep);
      this.accumulator -= this.timestep;
    }

    // Render game state
    this.renderFn();

    requestAnimationFrame(() => this.run());
  }
}
