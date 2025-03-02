import { Monster } from './Monster';
import { ElementType } from '../types';
import battleConfig from '../config/battleConfig.json';

interface AttackResult {
  attackerName: string;
  defenderName: string;
  damage: number;
  defenderDefeated: boolean;
  newDefenderHealth: number;
}

/**
 * Battle class representing a battle between teams (Model)
 */
export class Battle {
  playerTeam: Monster[];
  enemyTeam: Monster[];
  battleLog: string[];
  turnCount: number;
  battleEnded: boolean;
  defeatedMonsterIds: string[];

  constructor(playerTeam: Monster[] = [], enemyTeam: Monster[] = []) {
    this.playerTeam = this.validateAndCloneTeam(playerTeam);
    this.enemyTeam = this.validateAndCloneTeam(enemyTeam);
    this.battleLog = ['Battle started!'];
    this.turnCount = 0;
    this.battleEnded = false;
    this.defeatedMonsterIds = [];
    
    // Add validation log messages
    if (this.playerTeam.length === 0) {
      this.battleLog.push('Warning: Player team is empty!');
    }
    
    if (this.enemyTeam.length === 0) {
      this.battleLog.push('Warning: Enemy team is empty!');
    }
  }

  /**
   * Validates and creates deep copies of monster teams
   */
  private validateAndCloneTeam(team: Monster[]): Monster[] {
    if (!Array.isArray(team)) {
      console.error("Invalid team provided to Battle constructor", team);
      return [];
    }
    
    return team.map(monster => {
      // Ensure we have a valid Monster instance
      if (!monster) {
        console.error("Null or undefined monster in team");
        return null;
      }
      
      // Create a deep copy to avoid reference issues
      const validMonster = Monster.fromObject(monster);
      
      // Reset health to max if it's invalid
      if (typeof validMonster.health !== 'number' || 
          isNaN(validMonster.health) || 
          validMonster.health <= 0 || 
          validMonster.health > validMonster.maxHealth) {
        console.warn(`Fixing invalid health for monster ${validMonster.name}`, {
          before: validMonster.health,
          maxHealth: validMonster.maxHealth
        });
        return validMonster.resetHealth();
      }
      
      return validMonster;
    }).filter(monster => !!monster); // Filter out any null/undefined monsters
  }

  /**
   * Checks if the battle is over
   */
  isOver(): boolean {
    return this.playerTeam.length === 0 || this.enemyTeam.length === 0;
  }

  /**
   * Checks if the battle ended in victory for the player
   */
  isVictory(): boolean {
    return this.enemyTeam.length === 0 && this.playerTeam.length > 0;
  }

  /**
   * Calculates damage based on attacker and defender stats
   */
  calculateDamage(attacker: Monster, defender: Monster): number {
    // Validate input to prevent NaN
    if (!attacker || !defender) {
      console.error("Invalid monsters in calculateDamage", { attacker, defender });
      return 1; // Return minimum damage as fallback
    }
    
    const baseDamage = Math.max(1, attacker.attack - defender.defense / 2);
    
    // Element effectiveness from config
    const elementConfig = battleConfig.monsters.elementRelationships[attacker.element];
    const effectiveness = battleConfig.monsters.elementEffectiveness;
    
    let elementMultiplier = effectiveness.normal;
    
    // Check if attacker is strong against defender
    if (elementConfig.strong.includes(defender.element)) {
      elementMultiplier = effectiveness.strong;
    }
    // Check if attacker is weak against defender
    else if (elementConfig.weak.includes(defender.element)) {
      elementMultiplier = effectiveness.weak;
    }
    
    const finalDamage = Math.floor(baseDamage * elementMultiplier);
    return Math.max(1, finalDamage); // Always do at least 1 damage
  }

  /**
   * Processes a single attack between two monsters
   */
  processAttack(attacker: Monster, defender: Monster): AttackResult {
    // Validate monsters
    if (!attacker || !defender) {
      console.error("Invalid monsters in processAttack", { 
        attackerExists: !!attacker, 
        defenderExists: !!defender 
      });
      
      // Return a default result to prevent crashes
      return {
        attackerName: attacker ? attacker.name : "Unknown",
        defenderName: defender ? defender.name : "Unknown",
        damage: 0,
        defenderDefeated: false,
        newDefenderHealth: defender ? defender.health : 0
      };
    }
    
    const damage = this.calculateDamage(attacker, defender);
    const updatedDefender = defender.takeDamage(damage);
    const defenderDefeated = updatedDefender.isDefeated();
    
    return {
      attackerName: attacker.name,
      defenderName: defender.name,
      damage,
      defenderDefeated,
      newDefenderHealth: updatedDefender.health
    };
  }

  /**
   * Processes attacks from player team
   */
  processPlayerTurn(): { 
    attackResults: AttackResult[],
    updatedEnemyTeam: Monster[]
  } {
    // Validate teams before processing
    if (!this.playerTeam.length || !this.enemyTeam.length) {
      console.warn("Cannot process player turn: Empty team detected", {
        playerTeamLength: this.playerTeam.length,
        enemyTeamLength: this.enemyTeam.length
      });
      return { attackResults: [], updatedEnemyTeam: this.enemyTeam };
    }
    
    const maxParallelAttacks = Math.min(
      battleConfig.battle.maxParallelAttacks,
      this.playerTeam.length,
      this.enemyTeam.length
    );
    
    const attackResults: AttackResult[] = [];
    const updatedEnemyTeam = [...this.enemyTeam];
    
    for (let i = 0; i < maxParallelAttacks; i++) {
      const attacker = this.playerTeam[i];
      const defender = updatedEnemyTeam[i];
      
      if (!attacker || !defender) continue;
      
      const result = this.processAttack(attacker, defender);
      attackResults.push(result);
      
      // Update defender health
      updatedEnemyTeam[i] = defender.takeDamage(result.damage);
    }
    
    // Remove defeated enemies
    const filteredEnemyTeam = updatedEnemyTeam.filter(monster => !monster.isDefeated());
    
    return {
      attackResults,
      updatedEnemyTeam: filteredEnemyTeam
    };
  }

  /**
   * Processes attacks from enemy team
   */
  processEnemyTurn(): {
    attackResults: AttackResult[],
    updatedPlayerTeam: Monster[],
    newDefeatedIds: string[]
  } {
    // Validate teams before processing
    if (!this.playerTeam.length || !this.enemyTeam.length) {
      console.warn("Cannot process enemy turn: Empty team detected", {
        playerTeamLength: this.playerTeam.length,
        enemyTeamLength: this.enemyTeam.length
      });
      return { 
        attackResults: [], 
        updatedPlayerTeam: this.playerTeam,
        newDefeatedIds: []
      };
    }
    
    const maxParallelAttacks = Math.min(
      battleConfig.battle.maxParallelAttacks,
      this.enemyTeam.length,
      this.playerTeam.length
    );
    
    const attackResults: AttackResult[] = [];
    const updatedPlayerTeam = [...this.playerTeam];
    const newDefeatedIds: string[] = [];
    
    for (let i = 0; i < maxParallelAttacks; i++) {
      const attacker = this.enemyTeam[i];
      const defender = updatedPlayerTeam[i];
      
      if (!attacker || !defender) continue;
      
      const result = this.processAttack(attacker, defender);
      attackResults.push(result);
      
      // Update defender health
      updatedPlayerTeam[i] = defender.takeDamage(result.damage);
      
      // Track defeated monster IDs
      if (result.defenderDefeated) {
        newDefeatedIds.push(defender.id);
      }
    }
    
    // Remove defeated player monsters
    const filteredPlayerTeam = updatedPlayerTeam.filter(monster => !monster.isDefeated());
    
    return {
      attackResults,
      updatedPlayerTeam: filteredPlayerTeam,
      newDefeatedIds
    };
  }

  /**
   * Processes a complete battle turn (player and enemy)
   */
  processTurn(): Battle {
    if (this.isOver() || this.battleEnded) {
      return this;
    }

    const newBattle = new Battle(this.playerTeam, this.enemyTeam);
    newBattle.battleLog = [...this.battleLog];
    newBattle.turnCount = this.turnCount + 1;
    newBattle.defeatedMonsterIds = [...this.defeatedMonsterIds];

    // Process player attacks
    const { attackResults: playerAttackResults, updatedEnemyTeam } = this.processPlayerTurn();
    
    // Update battle log with player attack results
    const playerAttackLogs = playerAttackResults.map(
      result => `${result.attackerName} attacks ${result.defenderName} for ${result.damage} damage!`
    );
    
    newBattle.battleLog = [...newBattle.battleLog, ...playerAttackLogs];
    
    // Add defeat messages for enemies
    playerAttackResults.forEach(result => {
      if (result.defenderDefeated) {
        newBattle.battleLog.push(`${result.defenderName} is defeated!`);
      }
    });
    
    // Update enemy team
    newBattle.enemyTeam = updatedEnemyTeam;
    
    // If all enemies are defeated, end the battle
    if (updatedEnemyTeam.length === 0) {
      newBattle.battleEnded = true;
      newBattle.battleLog.push("Victory! All enemies defeated!");
      return newBattle;
    }
    
    // Process enemy attacks
    const { 
      attackResults: enemyAttackResults, 
      updatedPlayerTeam,
      newDefeatedIds
    } = this.processEnemyTurn();
    
    // Update battle log with enemy attack results
    const enemyAttackLogs = enemyAttackResults.map(
      result => `${result.attackerName} attacks ${result.defenderName} for ${result.damage} damage!`
    );
    
    newBattle.battleLog = [...newBattle.battleLog, ...enemyAttackLogs];
    
    // Add defeat messages for player monsters
    enemyAttackResults.forEach(result => {
      if (result.defenderDefeated) {
        newBattle.battleLog.push(`${result.defenderName} is defeated!`);
      }
    });
    
    // Update player team and defeated monster IDs
    newBattle.playerTeam = updatedPlayerTeam;
    newBattle.defeatedMonsterIds = [...newBattle.defeatedMonsterIds, ...newDefeatedIds];
    
    // Check if battle is over
    if (updatedPlayerTeam.length === 0) {
      newBattle.battleEnded = true;
      newBattle.battleLog.push("Defeat! Your team was wiped out!");
    }
    
    return newBattle;
  }

  /**
   * Calculates rewards based on battle outcome
   */
  calculateRewards(victory: boolean, waveNumber: number): { coinsEarned: number, xpEarned: number } {
    const { baseCoins, baseXP, defeatCoinMultiplier, defeatXPMultiplier } = battleConfig.battle.rewards;
    
    const coinsEarned = victory 
      ? baseCoins * waveNumber 
      : Math.floor(baseCoins * waveNumber * defeatCoinMultiplier);
    
    const xpEarned = victory 
      ? baseXP * waveNumber 
      : Math.floor(baseXP * waveNumber * defeatXPMultiplier);
    
    return { coinsEarned, xpEarned };
  }
}
