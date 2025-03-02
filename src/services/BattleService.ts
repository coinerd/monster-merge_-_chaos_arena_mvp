import { Monster } from '../models/Monster';
import { Battle } from '../models/Battle';
import { ElementType, MonsterTier } from '../types';
import battleConfig from '../config/battleConfig.json';

/**
 * Service responsible for battle-related operations
 */
export class BattleService {
  /**
   * Logs debug information if in development mode
   * @param message Debug message
   * @param data Data to log
   */
  static debug(message: string, data: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Battle Debug] ${message}`, data);
    }
  }

  /**
   * Creates a new battle instance
   * @param playerTeam Player team monsters
   * @param enemyTeam Enemy team monsters
   * @returns A new Battle instance
   */
  static createBattle(playerTeam: Monster[], enemyTeam: Monster[]): Battle {
    this.debug('Creating new battle', { 
      playerTeam: playerTeam.map(m => ({ id: m.id, name: m.name })),
      enemyTeam: enemyTeam.map(m => ({ id: m.id, name: m.name }))
    });
    
    // Validate teams
    if (!Array.isArray(playerTeam) || playerTeam.length === 0) {
      console.error("Cannot create battle: Player team is empty or invalid");
      return new Battle([], enemyTeam);
    }
    
    if (!Array.isArray(enemyTeam) || enemyTeam.length === 0) {
      console.error("Cannot create battle: Enemy team is empty or invalid");
      return new Battle(playerTeam, []);
    }
    
    // Create deep copies of teams to avoid reference issues
    const clonedPlayerTeam = playerTeam.map(monster => {
      if (!monster) return null;
      const clone = monster.clone();
      
      // Ensure health is valid
      if (clone.health <= 0 || clone.health > clone.maxHealth) {
        console.log(`Resetting health for player monster ${clone.name}`);
        return clone.resetHealth();
      }
      return clone;
    }).filter(Boolean) as Monster[];
    
    const clonedEnemyTeam = enemyTeam.map(monster => {
      if (!monster) return null;
      const clone = monster.clone();
      
      // Ensure health is valid
      if (clone.health <= 0 || clone.health > clone.maxHealth) {
        console.log(`Resetting health for enemy monster ${clone.name}`);
        return clone.resetHealth();
      }
      return clone;
    }).filter(Boolean) as Monster[];
    
    // Filter out any invalid monsters
    const validPlayerTeam = clonedPlayerTeam.filter(monster => !!monster);
    const validEnemyTeam = clonedEnemyTeam.filter(monster => !!monster);
    
    // Log the final teams
    this.debug('Final battle teams', {
      playerTeam: validPlayerTeam.map(m => ({ id: m.id, name: m.name, health: m.health })),
      enemyTeam: validEnemyTeam.map(m => ({ id: m.id, name: m.name, health: m.health }))
    });
    
    return new Battle(validPlayerTeam, validEnemyTeam);
  }

  /**
   * Generates an enemy team based on wave number
   * @param wave Current wave number
   * @returns Array of enemy monsters
   */
  static generateEnemyTeam(wave: number): Monster[] {
    this.debug('Generating enemy team for wave', { wave });
    
    const waveConfig = battleConfig.waves.scaling;
    
    // Ensure we always generate at least one enemy
    // Calculate enemy count based on wave number
    const enemyCount = Math.max(1, Math.min(3, Math.ceil(wave / waveConfig.enemyCountDivisor)));
    this.debug('Calculated enemy count', { enemyCount });
    
    const enemyTeam: Monster[] = [];
    
    // Define element types to ensure we have valid elements
    const elementTypes = [
      ElementType.FIRE,
      ElementType.WATER,
      ElementType.EARTH,
      ElementType.AIR
    ];
    
    for (let i = 0; i < enemyCount; i++) {
      try {
        // Get random element from our predefined list
        const elementIndex = Math.floor(Math.random() * elementTypes.length);
        const element = elementTypes[elementIndex];
        
        // Calculate tier based on wave number
        // Higher waves should have higher tier monsters
        const tier = Math.min(
          MonsterTier.TIER_5, 
          Math.ceil(wave / 3)
        ) as MonsterTier;
        
        // Create base monster
        const enemy = new Monster({
          name: this.getMonsterNameForElementAndTier(element, tier),
          element: element,
          tier: tier,
          level: Math.max(1, Math.floor(wave * waveConfig.enemyLevelMultiplier))
        });
        
        // Calculate base stats
        const baseStats = battleConfig.monsters.baseStats;
        const tierKey = `tier${tier}` as keyof typeof battleConfig.monsters.tierMultipliers;
        const tierMultiplier = battleConfig.monsters.tierMultipliers[tierKey];
        const elementMultiplier = battleConfig.monsters.elementMultipliers[element];
        
        // Calculate stats
        const health = Math.round(baseStats.health * tierMultiplier.health * elementMultiplier.health);
        const attack = Math.round(baseStats.attack * tierMultiplier.attack * elementMultiplier.attack);
        const defense = Math.round(baseStats.defense * tierMultiplier.defense * elementMultiplier.defense);
        
        // Scale stats with level
        const levelMultiplier = 1 + (waveConfig.enemyStatMultiplier * enemy.level);
        enemy.maxHealth = Math.floor(health * levelMultiplier);
        enemy.health = enemy.maxHealth;
        enemy.attack = Math.floor(attack * levelMultiplier);
        enemy.defense = Math.floor(defense * levelMultiplier);
        
        this.debug('Created enemy monster', { 
          name: enemy.name,
          element: enemy.element,
          tier: enemy.tier,
          level: enemy.level,
          health: enemy.health,
          attack: enemy.attack,
          defense: enemy.defense
        });
        
        enemyTeam.push(enemy);
      } catch (error) {
        console.error("Error creating enemy monster:", error);
        // Continue to next monster
      }
    }
    
    // Validate that we have at least one enemy
    if (enemyTeam.length === 0) {
      // Fallback: add a basic enemy if somehow we ended up with none
      this.debug('No enemies generated, adding fallback enemy');
      try {
        // Create a guaranteed valid monster
        const fallbackEnemy = new Monster({
          name: 'Ember',
          element: ElementType.FIRE,
          tier: MonsterTier.TIER_1,
          health: 50,
          maxHealth: 50,
          attack: 10,
          defense: 5,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100
        });
        
        enemyTeam.push(fallbackEnemy);
        console.log("Added fallback enemy monster:", fallbackEnemy);
      } catch (error) {
        console.error("Error creating fallback enemy:", error);
      }
    }
    
    this.debug('Final enemy team', { 
      count: enemyTeam.length,
      enemies: enemyTeam.map(e => ({
        name: e.name,
        element: e.element,
        tier: e.tier,
        level: e.level,
        health: e.health
      }))
    });
    
    return enemyTeam;
  }

  /**
   * Gets a random element type
   * @returns Random ElementType
   */
  static getRandomElement(): ElementType {
    const elements = [ElementType.FIRE, ElementType.WATER, ElementType.EARTH, ElementType.AIR];
    return elements[Math.floor(Math.random() * elements.length)];
  }
  
  /**
   * Gets the monster name for a given element and tier
   */
  static getMonsterNameForElementAndTier(element: ElementType, tier: MonsterTier): string {
    const elementNames = {
      [ElementType.FIRE]: ['Ember', 'Blaze', 'Inferno', 'Phoenix', 'Magma'],
      [ElementType.WATER]: ['Splash', 'Tide', 'Tsunami', 'Hydra', 'Kraken'],
      [ElementType.EARTH]: ['Pebble', 'Boulder', 'Mountain', 'Golem', 'Titan'],
      [ElementType.AIR]: ['Breeze', 'Gust', 'Cyclone', 'Tempest', 'Hurricane'],
    };
    
    return elementNames[element][tier - 1];
  }
  
  /**
   * Validates a monster's health
   * @param monster The monster to validate
   * @returns The monster with valid health
   */
  static validateMonsterHealth(monster: Monster): Monster {
    if (!monster) return monster;
    
    // Create a copy to avoid modifying the original
    const validatedMonster = monster.clone();
    
    // Check if health is valid
    if (validatedMonster.health <= 0 || validatedMonster.health > validatedMonster.maxHealth) {
      console.log(`Fixing invalid health for monster ${validatedMonster.name}`);
      return validatedMonster.resetHealth();
    }
    
    return validatedMonster;
  }
  
  /**
   * Validates a team of monsters
   * @param team The team to validate
   * @returns The validated team
   */
  static validateTeam(team: Monster[]): Monster[] {
    if (!Array.isArray(team)) {
      console.error("Invalid team provided to validateTeam", team);
      return [];
    }
    
    // Filter out null/undefined monsters and validate health
    return team
      .filter(monster => !!monster)
      .map(monster => this.validateMonsterHealth(monster));
  }
}
