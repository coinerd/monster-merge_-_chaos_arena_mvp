import { Entity } from '../ecs/Entity';
import { Position } from '../ecs/components/Position';
import { Renderable } from '../ecs/components/Renderable';
import { ElementType, MonsterTier } from '../types';
import battleConfig from '../config/battleConfig.json';

export class Monster extends Entity {
  id: string;
  name: string;
  element: ElementType;
  tier: MonsterTier;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  
  // Element color mapping
  private static readonly ELEMENT_COLORS: Record<ElementType, string> = {
    fire: '#ff4444',
    water: '#4488ff',
    earth: '#8b4513',
    air: '#87ceeb',
    lightning: '#ffd700',
    ice: '#add8e6',
    nature: '#228b22',
    shadow: '#4b0082',
    light: '#ffffff',
    metal: '#808080'
  };

  constructor(data: Partial<Monster> = {}) {
    super();
    
    // Add ECS components
    this.addComponent(new Position());
    
    // Construct the correct image path based on element and tier
    const imageName = this.getImageNameFromElementAndTier(data.element, data.tier);
    this.addComponent(new Renderable(
      `/monsters/${imageName}`,
      64, 64
    ));
    
    // Initialize properties
    this.id = data.id || '';
    this.name = data.name || '';
    this.element = data.element || 'fire';
    this.tier = data.tier || 1;
    this.health = data.health || 100;
    this.attack = data.attack || 10;
    this.defense = data.defense || 5;
    this.speed = data.speed || 1;
  }

  /**
   * Gets the color associated with the monster's element
   */
  getElementColor(): string {
    return Monster.ELEMENT_COLORS[this.element] || '#ffffff';
  }

  /**
   * Gets the correct image filename based on element and tier
   */
  private getImageNameFromElementAndTier(element?: ElementType, tier?: MonsterTier): string {
    if (!element) element = 'fire';
    if (!tier) tier = 1;
    
    // Map element and tier to the correct filename based on the README.md in public/monsters
    switch (element) {
      case 'fire':
        return tier === 1 ? 'ember-monster.svg' : 
               tier === 2 ? 'blaze-monster.svg' : 
               'inferno-monster.svg';
      case 'water':
        return tier === 1 ? 'splash-monster.svg' : 
               tier === 2 ? 'tide-monster.svg' : 
               'tsunami-monster.svg';
      case 'earth':
        return tier === 1 ? 'pebble-monster.svg' : 
               tier === 2 ? 'boulder-monster.svg' : 
               'mountain-monster.svg';
      case 'air':
        return tier === 1 ? 'breeze-monster.svg' : 
               tier === 2 ? 'gust-monster.svg' : 
               'cyclone-monster.svg';
      default:
        // Default to a known image if element doesn't match
        return 'ember-monster.svg';
    }
  }
}
