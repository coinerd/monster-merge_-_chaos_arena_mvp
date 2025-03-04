import { Monster } from './Monster';

interface AttackResult {
  attackerName: string;
  defenderName: string;
  damage: number;
  defenderDefeated: boolean;
}

export class Battle {
  playerTeam: Monster[];
  enemyTeam: Monster[];
  
  constructor(playerTeam: Monster[], enemyTeam: Monster[]) {
    this.playerTeam = [...playerTeam];
    this.enemyTeam = [...enemyTeam];
  }
  
  /**
   * Process a player turn in battle
   */
  processPlayerTurn(): { 
    attackResults: AttackResult[]; 
    updatedEnemyTeam: Monster[];
  } {
    const attackResults: AttackResult[] = [];
    const updatedEnemyTeam = [...this.enemyTeam];
    
    // Each player monster attacks an enemy
    this.playerTeam.forEach((attacker, index) => {
      // Skip if no enemies left
      if (updatedEnemyTeam.length === 0) return;
      
      // Choose target (for now, just pick the first enemy)
      const defenderIndex = 0;
      const defender = updatedEnemyTeam[defenderIndex];
      
      // Calculate damage
      const damage = this.calculateDamage(attacker, defender);
      
      // Apply damage
      const updatedDefender = { ...defender, health: Math.max(0, defender.health - damage) };
      updatedEnemyTeam[defenderIndex] = updatedDefender;
      
      // Check if defender is defeated
      const defenderDefeated = updatedDefender.health <= 0;
      
      // Record attack result
      attackResults.push({
        attackerName: attacker.name,
        defenderName: defender.name,
        damage,
        defenderDefeated
      });
      
      // Remove defeated enemies
      if (defenderDefeated) {
        updatedEnemyTeam.splice(defenderIndex, 1);
      }
    });
    
    // Update enemy team
    this.enemyTeam = updatedEnemyTeam;
    
    return { attackResults, updatedEnemyTeam };
  }
  
  /**
   * Process an enemy turn in battle
   */
  processEnemyTurn(): { 
    attackResults: AttackResult[]; 
    updatedPlayerTeam: Monster[];
    newDefeatedIds: string[];
  } {
    const attackResults: AttackResult[] = [];
    const updatedPlayerTeam = [...this.playerTeam];
    const newDefeatedIds: string[] = [];
    
    // Each enemy monster attacks a player monster
    this.enemyTeam.forEach((attacker, index) => {
      // Skip if no player monsters left
      if (updatedPlayerTeam.length === 0) return;
      
      // Choose target (for now, just pick the first player monster)
      const defenderIndex = 0;
      const defender = updatedPlayerTeam[defenderIndex];
      
      // Calculate damage
      const damage = this.calculateDamage(attacker, defender);
      
      // Apply damage
      const updatedDefender = { ...defender, health: Math.max(0, defender.health - damage) };
      updatedPlayerTeam[defenderIndex] = updatedDefender;
      
      // Check if defender is defeated
      const defenderDefeated = updatedDefender.health <= 0;
      
      // Record attack result
      attackResults.push({
        attackerName: attacker.name,
        defenderName: defender.name,
        damage,
        defenderDefeated
      });
      
      // Track defeated player monsters
      if (defenderDefeated) {
        newDefeatedIds.push(defender.id);
        updatedPlayerTeam.splice(defenderIndex, 1);
      }
    });
    
    // Update player team
    this.playerTeam = updatedPlayerTeam;
    
    return { attackResults, updatedPlayerTeam, newDefeatedIds };
  }
  
  /**
   * Calculate damage for an attack
   */
  private calculateDamage(attacker: Monster, defender: Monster): number {
    // Base damage is attacker's attack stat
    let damage = attacker.attack;
    
    // Reduce damage based on defender's defense (simple formula)
    damage = Math.max(1, damage - Math.floor(defender.defense / 2));
    
    // Apply element effectiveness (simplified)
    const elementMultiplier = this.getElementEffectiveness(attacker.element, defender.element);
    damage = Math.floor(damage * elementMultiplier);
    
    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    damage = Math.floor(damage * randomFactor);
    
    // Ensure minimum damage
    return Math.max(1, damage);
  }
  
  /**
   * Get element effectiveness multiplier
   */
  private getElementEffectiveness(attackerElement: string, defenderElement: string): number {
    // Element effectiveness chart (simplified)
    const effectivenessChart: Record<string, Record<string, number>> = {
      fire: { earth: 1.5, water: 0.5, air: 1.0 },
      water: { fire: 1.5, earth: 0.5, air: 1.0 },
      earth: { water: 1.5, air: 0.5, fire: 1.0 },
      air: { earth: 1.5, fire: 0.5, water: 1.0 }
    };
    
    // Get effectiveness or default to 1.0
    return effectivenessChart[attackerElement]?.[defenderElement] || 1.0;
  }
}
