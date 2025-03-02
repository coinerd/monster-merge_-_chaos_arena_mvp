import { create } from 'zustand';
import { Monster } from '../models/Monster';
import { Battle } from '../models/Battle';
import { BattleService } from '../services/BattleService';
import { v4 as uuidv4 } from 'uuid';

interface AttackAnimation {
  id: string;
  attacker: 'player' | 'enemy';
  attackerIndex: number;
  defenderIndex: number;
  active: boolean;
}

interface DamageEffect {
  id: string;
  target: 'player' | 'enemy';
  targetIndex: number;
  damage: number;
  active: boolean;
  x: number;
  y: number;
}

interface BattleState {
  // Battle data
  battle: Battle | null;
  playerTeam: Monster[];
  enemyTeam: Monster[];
  battleInProgress: boolean;
  battleEnded: boolean;
  turnCount: number;
  battleLog: string[];
  defeatedMonsterIds: string[];
  
  // Animation state
  attackAnimations: AttackAnimation[];
  damageEffects: DamageEffect[];
  
  // Battle control
  initializeBattle: (playerTeam: Monster[], enemyTeam: Monster[]) => boolean;
  processTurn: () => Promise<void>;
  endBattle: (victory: boolean) => void;
  reset: () => void;
  setBattleInProgress: (inProgress: boolean) => void;
  shouldProcessTurn: () => boolean;
  
  // Animation control
  addAttackAnimation: (attacker: 'player' | 'enemy', attackerIndex: number, defenderIndex: number) => string;
  removeAttackAnimation: (id: string) => void;
  addDamageEffect: (target: 'player' | 'enemy', targetIndex: number, damage: number, x: number, y: number) => string;
  removeDamageEffect: (id: string) => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  // Initial state
  battle: null,
  playerTeam: [],
  enemyTeam: [],
  battleInProgress: false,
  battleEnded: false,
  turnCount: 0,
  battleLog: ['Battle ready to start...'],
  defeatedMonsterIds: [],
  attackAnimations: [],
  damageEffects: [],
  
  // Initialize a battle
  initializeBattle: (playerTeam, enemyTeam) => {
    // Validate teams
    if (!Array.isArray(playerTeam) || playerTeam.length === 0) {
      console.error("Cannot initialize battle: Invalid player team", playerTeam);
      set({
        battleLog: ['No player monsters to fight!', 'Defeat by default!'],
        battleEnded: true
      });
      return false;
    }
    
    if (!Array.isArray(enemyTeam) || enemyTeam.length === 0) {
      console.error("Cannot initialize battle: Invalid enemy team", enemyTeam);
      set({
        battleLog: ['No enemy monsters to fight!', 'Victory by default!'],
        battleEnded: true
      });
      return false;
    }
    
    // Create deep copies of teams to avoid reference issues
    const validPlayerTeam = playerTeam.map(monster => {
      if (!monster) return null;
      const clone = monster.clone();
      
      // Ensure health is valid
      if (clone.health <= 0 || clone.health > clone.maxHealth) {
        console.log(`Resetting health for player monster ${clone.name}`);
        return clone.resetHealth();
      }
      return clone;
    }).filter(Boolean) as Monster[];
    
    const validEnemyTeam = enemyTeam.map(monster => {
      if (!monster) return null;
      const clone = monster.clone();
      
      // Ensure health is valid
      if (clone.health <= 0 || clone.health > clone.maxHealth) {
        console.log(`Resetting health for enemy monster ${clone.name}`);
        return clone.resetHealth();
      }
      return clone;
    }).filter(Boolean) as Monster[];
    
    // Validate teams again after filtering
    if (validPlayerTeam.length === 0) {
      console.error("Cannot initialize battle: No valid player monsters after filtering");
      set({
        battleLog: ['No valid player monsters to fight!', 'Defeat by default!'],
        battleEnded: true
      });
      return false;
    }
    
    if (validEnemyTeam.length === 0) {
      console.error("Cannot initialize battle: No valid enemy monsters after filtering");
      set({
        battleLog: ['No valid enemy monsters to fight!', 'Victory by default!'],
        battleEnded: true
      });
      return false;
    }
    
    // Create battle
    const battle = BattleService.createBattle(validPlayerTeam, validEnemyTeam);
    
    // Log the teams for debugging
    console.log("Battle initialized with teams:", {
      playerTeam: validPlayerTeam.map(m => ({ id: m.id, name: m.name })),
      enemyTeam: validEnemyTeam.map(m => ({ id: m.id, name: m.name }))
    });
    
    // Update state
    set({
      battle,
      playerTeam: validPlayerTeam,
      enemyTeam: validEnemyTeam,
      battleInProgress: true,
      battleEnded: false,
      turnCount: 0,
      battleLog: ['Battle started!'],
      defeatedMonsterIds: [],
      attackAnimations: [],
      damageEffects: []
    });
    
    return true;
  },
  
  // Process a battle turn
  processTurn: async () => {
    const { battle, battleEnded, battleInProgress } = get();
    
    if (!battle || battleEnded || !battleInProgress) {
      return;
    }
    
    // Validate teams before processing
    if (!get().playerTeam.length || !get().enemyTeam.length) {
      console.error("Cannot process turn: One or both teams are empty", {
        playerTeam: get().playerTeam.length,
        enemyTeam: get().enemyTeam.length
      });
      
      // End battle based on which team is empty
      if (!get().playerTeam.length) {
        get().endBattle(false);
      } else {
        get().endBattle(true);
      }
      return;
    }
    
    // Process player attacks
    const { attackResults: playerAttackResults, updatedEnemyTeam } = battle.processPlayerTurn();
    
    // Update battle log
    const playerAttackLogs = playerAttackResults.map(
      result => `${result.attackerName} attacks ${result.defenderName} for ${result.damage} damage!`
    );
    
    // Create attack animations
    const playerAttackAnimationIds: string[] = [];
    playerAttackResults.forEach((result, index) => {
      const id = get().addAttackAnimation('player', index, index);
      playerAttackAnimationIds.push(id);
    });
    
    // Create damage effects
    const playerDamageEffectIds: string[] = [];
    playerAttackResults.forEach((result, index) => {
      const id = get().addDamageEffect('enemy', index, result.damage, 0, 0);
      playerDamageEffectIds.push(id);
    });
    
    // Update battle log
    set(state => ({
      battleLog: [...state.battleLog, ...playerAttackLogs]
    }));
    
    // Wait for animations
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Remove animations
    playerAttackAnimationIds.forEach(id => get().removeAttackAnimation(id));
    playerDamageEffectIds.forEach(id => get().removeDamageEffect(id));
    
    // Update enemy team
    set(state => ({
      enemyTeam: updatedEnemyTeam
    }));
    
    // Add defeat messages
    const defeatedEnemyLogs = playerAttackResults
      .filter(result => result.defenderDefeated)
      .map(result => `${result.defenderName} is defeated!`);
    
    if (defeatedEnemyLogs.length > 0) {
      set(state => ({
        battleLog: [...state.battleLog, ...defeatedEnemyLogs]
      }));
    }
    
    // Check if battle is over
    if (updatedEnemyTeam.length === 0) {
      get().endBattle(true);
      return;
    }
    
    // Wait between player and enemy turns
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Process enemy attacks
    const { 
      attackResults: enemyAttackResults, 
      updatedPlayerTeam,
      newDefeatedIds
    } = battle.processEnemyTurn();
    
    // Update battle log
    const enemyAttackLogs = enemyAttackResults.map(
      result => `${result.attackerName} attacks ${result.defenderName} for ${result.damage} damage!`
    );
    
    // Create attack animations
    const enemyAttackAnimationIds: string[] = [];
    enemyAttackResults.forEach((result, index) => {
      const id = get().addAttackAnimation('enemy', index, index);
      enemyAttackAnimationIds.push(id);
    });
    
    // Create damage effects
    const enemyDamageEffectIds: string[] = [];
    enemyAttackResults.forEach((result, index) => {
      const id = get().addDamageEffect('player', index, result.damage, 0, 0);
      enemyDamageEffectIds.push(id);
    });
    
    // Update battle log
    set(state => ({
      battleLog: [...state.battleLog, ...enemyAttackLogs]
    }));
    
    // Wait for animations
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Remove animations
    enemyAttackAnimationIds.forEach(id => get().removeAttackAnimation(id));
    enemyDamageEffectIds.forEach(id => get().removeDamageEffect(id));
    
    // Update player team and turn count
    set(state => ({
      playerTeam: updatedPlayerTeam,
      turnCount: state.turnCount + 1,
      defeatedMonsterIds: [...state.defeatedMonsterIds, ...newDefeatedIds] }));
    
    // Add defeat messages
    const defeatedPlayerLogs = enemyAttackResults
      .filter(result => result.defenderDefeated)
      .map(result => `${result.defenderName} is defeated!`);
    
    if (defeatedPlayerLogs.length > 0) {
      set(state => ({
        battleLog: [...state.battleLog, ...defeatedPlayerLogs]
      }));
    }
    
    // Check if battle is over
    if (updatedPlayerTeam.length === 0) {
      get().endBattle(false);
      return;
    }
  },
  
  // End a battle
  endBattle: (victory) => {
    set(state => ({
      battleEnded: true,
      battleLog: [
        ...state.battleLog,
        victory ? "Victory! All enemies defeated!" : "Defeat! Your team was wiped out!"
      ]
    }));
  },
  
  // Reset battle state
  reset: () => {
    set({
      battle: null,
      playerTeam: [],
      enemyTeam: [],
      battleInProgress: false,
      battleEnded: false,
      turnCount: 0,
      battleLog: ['Battle ready to start...'],
      defeatedMonsterIds: [],
      attackAnimations: [],
      damageEffects: []
    });
  },
  
  // Set battle in progress state
  setBattleInProgress: (inProgress) => {
    set({ battleInProgress: inProgress });
    
    if (!inProgress) {
      get().reset();
    }
  },
  
  // Check if a turn should be processed
  shouldProcessTurn: () => {
    const { battleInProgress, battleEnded, playerTeam, enemyTeam } = get();
    
    return (
      battleInProgress && 
      !battleEnded && 
      playerTeam.length > 0 &&
      enemyTeam.length > 0
    );
  },
  
  // Add attack animation
  addAttackAnimation: (attacker, attackerIndex, defenderIndex) => {
    const id = `${attacker}-attack-${uuidv4()}`;
    
    set(state => ({
      attackAnimations: [
        ...state.attackAnimations,
        {
          id,
          attacker,
          attackerIndex,
          defenderIndex,
          active: true
        }
      ]
    }));
    
    return id;
  },
  
  // Remove attack animation
  removeAttackAnimation: (id) => {
    set(state => ({
      attackAnimations: state.attackAnimations.filter(anim => anim.id !== id)
    }));
  },
  
  // Add damage effect
  addDamageEffect: (target, targetIndex, damage, x, y) => {
    const id = `${target}-damage-${uuidv4()}`;
    
    set(state => ({
      damageEffects: [
        ...state.damageEffects,
        {
          id,
          target,
          targetIndex,
          damage,
          active: true,
          x,
          y
        }
      ]
    }));
    
    return id;
  },
  
  // Remove damage effect
  removeDamageEffect: (id) => {
    set(state => ({
      damageEffects: state.damageEffects.filter(effect => effect.id !== id)
    }));
  }
}));
