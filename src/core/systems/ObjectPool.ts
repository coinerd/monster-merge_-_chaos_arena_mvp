export class ObjectPool<T> {
  private pool: T[];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
    this.pool = [];
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.expand(initialSize);
  }

  acquire(): T {
    if (this.pool.length === 0) {
      this.expand(Math.ceil(this.pool.length * 0.5));
    }
    return this.pool.pop()!;
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  private expand(count: number): void {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.createFn());
    }
  }
}
