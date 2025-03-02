export class Entity {
  private static nextId = 0;
  public id: number;
  private components: Map<string, Component> = new Map();

  constructor() {
    this.id = Entity.nextId++;
  }

  addComponent(component: Component): Entity {
    this.components.set(component.constructor.name, component);
    return this;
  }

  getComponent<T extends Component>(componentClass: new (...args: any[]) => T): T | null {
    return this.components.get(componentClass.name) as T || null;
  }

  removeComponent(componentClass: new (...args: any[]) => Component): Entity {
    this.components.delete(componentClass.name);
    return this;
  }

  hasComponent(componentClass: new (...args: any[]) => Component): boolean {
    return this.components.has(componentClass.name);
  }

  getComponents(): Component[] {
    return Array.from(this.components.values());
  }
}
