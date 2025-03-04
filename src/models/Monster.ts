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
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  experience: number;
  
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

  // Monster names by element and tier
  private static readonly MONSTER_NAMES: Record<ElementType, Record<number, string>> = {
    fire: { 1: 'Ember', 2: 'Blaze', 3: 'Inferno', 4: 'Phoenix', 5: 'Supernova' },
    water: { 1: 'Splash', 2: 'Tide', 3: 'Tsunami', 4: 'Maelstrom', 5: 'Abyss' },
    earth: { 1: 'Pebble', 2: 'Boulder', 3: 'Mountain', 4: 'Tectonic', 5: 'Colossus' },
    air: { 1: 'Breeze', 2: 'Gust', 3: 'Cyclone', 4: 'Tempest', 5: 'Hurricane' },
    lightning: { 1: 'Spark', 2: 'Bolt', 3: 'Thunder', 4: 'Storm', 5: 'Thundergod' },
    ice: { 1: 'Frost', 2: 'Icicle', 3: 'Glacier', 4: 'Blizzard', 5: 'Absolute Zero' },
    nature: { 1: 'Sprout', 2: 'Vine', 3: 'Forest', 4: 'Ancient', 5: 'World Tree' },
    shadow: { 1: 'Shade', 2: 'Gloom', 3: 'Umbra', 4: 'Void', 5: 'Oblivion' },
    light: { 1: 'Spark', 2: 'Gleam', 3: 'Radiance', 4: 'Luminous', 5: 'Celestial' },
    metal: { 1: 'Scrap', 2: 'Steel', 3: 'Alloy', 4: 'Titanium', 5: 'Adamantium' }
  };

  constructor(data: Partial<Monster> = {}) {
    super();
    
    // Add ECS components
    this.addComponent(new Position());
    
    // Initialize properties
    this.id = data.id || `monster-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.element = data.element || 'fire';
    this.tier = data.tier || 1;
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    
    // Set name based on element and tier if not provided
    this.name = data.name || this.getMonsterName(this.element, this.tier);
    
    // Calculate stats based on tier and level
    this.health = data.health !== undefined ? data.health : this.calculateStat('health', this.tier, this.level);
    this.maxHealth = data.maxHealth !== undefined ? data.maxHealth : this.health;
    this.attack = data.attack || this.calculateStat('attack', this.tier, this.level);
    this.defense = data.defense || this.calculateStat('defense', this.tier, this.level);
    this.speed = data.speed || this.calculateStat('speed', this.tier, this.level);
    
    // Construct the correct image path based on element and tier
    const imageName = this.getImageNameFromElementAndTier(this.element, this.tier);
    this.addComponent(new Renderable(
      `/monsters/${imageName}`,
      64, 64
    ));
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
  private getImageNameFromElementAndTier(element: ElementType, tier: MonsterTier): string {
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

  /**
   * Gets the monster name based on element and tier
   */
  private getMonsterName(element: ElementType, tier: MonsterTier): string {
    return Monster.MONSTER_NAMES[element]?.[tier] || 'Unknown Monster';
  }

  /**
   * Calculates a stat based on tier and level
   */
  private calculateStat(statType: 'health' | 'attack' | 'defense' | 'speed', tier: MonsterTier, level: number): number {
    const baseStats = {
      health: 50,
      attack: 10,
      defense: 5,
      speed: 1
    };
    
    // Tier multiplier increases with each tier
    const tierMultiplier = 1 + (tier - 1) * 0.5;
    
    // Level multiplier is a smaller increase per level
    const levelMultiplier = 1 + (level - 1) * 0.1;
    
    return Math.floor(baseStats[statType] * tierMultiplier * levelMultiplier);
  }

  /**
   * Adds experience to the monster and levels up if necessary
   */
  addExperience(amount: number): Monster {
    const newExperience = this.experience + amount;
    const expToLevel = this.getExperienceToNextLevel();
    
    if (newExperience >= expToLevel) {
      // Level up
      return new Monster({
        ...this,
        level: this.level + 1,
        experience: newExperience - expToLevel,
        health: this.calculateStat('health', this.tier, this.level + 1),
        attack: this.calculateStat('attack', this.tier, this.level + 1),
        defense: this.calculateStat('defense', this.tier, this.level + 1),
        speed: this.calculateStat('speed', this.tier, this.level + 1)
      });
    } else {
      // Just add experience
      return new Monster({
        ...this,
        experience: newExperience
      });
    }
  }

  /**
   * Gets the experience required for the next level
   */
  getExperienceToNextLevel(): number {
    return 100 * this.level;
  }

  /**
   * Creates a new monster with the specified element and tier
   */
  static create(element: ElementType, tier: MonsterTier): Monster {
    return new Monster({
      element,
      tier
    });
  }

  /**
   * Creates a clone of this monster
   */
  clone(): Monster {
    return new Monster({
      ...this,
      id: this.id // Keep the same ID for the clone
    });
  }

  /**
   * Resets the monster's health to its maximum
   */
  resetHealth(): Monster {
    const maxHealth = this.calculateStat('health', this.tier, this.level);
    return new Monster({
      ...this,
      health: maxHealth,
      maxHealth: maxHealth
    });
  }
}
