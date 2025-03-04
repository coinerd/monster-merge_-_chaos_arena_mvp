import { Monster } from '../models/Monster';
import { Battle } from '../models/Battle';
import { ElementType, MonsterTier } from '../types';

/**
 * Service responsible for battle-related operations
 */
export class BattleService {
  /**
   * Creates a new battle with the given teams
   */
  static createBattle(playerTeam: Monster[], enemyTeam: Monster[]): Battle {
    console.log("Creating battle with teams:", {
      playerTeam: playerTeam.map(m => ({ id: m.id, name: m.name, health: m.health })),
      enemyTeam: enemyTeam.map(m => ({ id: m.id, name: m.name, health: m.health }))
    });
    
    // Ensure all monsters have valid health
    const validPlayerTeam = playerTeam.map(monster => {
      if (monster.health <= 0) {
        console.log(`Resetting health for player monster ${monster.name}`);
        return monster.resetHealth();
      }
      return monster;
    });
    
    const validEnemyTeam = enemyTeam.map(monster => {
      if (monster.health <= 0) {
        console.log(`Resetting health for enemy monster ${monster.name}`);
        return monster.resetHealth();
      }
      return monster;
    });
    
    return new Battle(validPlayerTeam, validEnemyTeam);
  }
  
  /**
   * Generates a random enemy team based on player team strength
   */
  static generateEnemyTeam(playerTeam: Monster[], wave: number): Monster[] {
    // Calculate average player team tier and level
    const avgTier = playerTeam.reduce((sum, m) => sum + m.tier, 0) / playerTeam.length;
    const avgLevel = playerTeam.reduce((sum, m) => sum + m.level, 0) / playerTeam.length;
    
    // Determine enemy team size (1-3 monsters)
    const teamSize = Math.min(3, Math.max(1, Math.floor(playerTeam.length * 0.8)));
    
    // Generate enemy team
    const enemyTeam: Monster[] = [];
    
    for (let i = 0; i < teamSize; i++) {
      // Determine enemy tier and level based on wave and player team
      const enemyTier = Math.min(5, Math.max(1, Math.floor(avgTier + (wave * 0.2)))) as MonsterTier;
      const enemyLevel = Math.max(1, Math.floor(avgLevel + (wave * 0.5)));
      
      // Choose random element
      const elements: ElementType[] = ['fire', 'water', 'earth', 'air'];
      const element = elements[Math.floor(Math.random() * elements.length)];
      
      // Create enemy monster
      const enemy = Monster.create(element, enemyTier);
      
      // Level up enemy if needed
      let leveledEnemy = enemy;
      for (let j = 1; j < enemyLevel; j++) {
        leveledEnemy = leveledEnemy.addExperience(leveledEnemy.getExperienceToNextLevel());
      }
      
      enemyTeam.push(leveledEnemy);
    }
    
    return enemyTeam;
  }
  
  /**
   * Calculates rewards for winning a battle
   */
  static calculateBattleRewards(enemyTeam: Monster[], wave: number): {
    coins: number;
    experience: number;
  } {
    // Base rewards
    const baseCoins = 10;
    const baseExperience = 20;
    
    // Calculate total enemy power
    const totalEnemyPower = enemyTeam.reduce((sum, enemy) => {
      return sum + (enemy.tier * enemy.level);
    }, 0);
    
    // Calculate rewards based on enemy power and wave
    const coins = Math.floor(baseCoins * totalEnemyPower * (1 + wave * 0.1));
    const experience = Math.floor(baseExperience * totalEnemyPower * (1 + wave * 0.05));
    
    return { coins, experience };
  }
}
