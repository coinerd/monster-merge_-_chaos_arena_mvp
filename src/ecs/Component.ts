export abstract class Component {
  public entity: Entity | null = null;

  constructor(public readonly name: string) {}

  setEntity(entity: Entity): void {
    this.entity = entity;
  }
}
