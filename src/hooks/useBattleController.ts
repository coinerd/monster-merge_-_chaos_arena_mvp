import { useEffect, useCallback, useRef } from 'react';
import { useBattleStore } from '../store/useBattleStore';
import { Monster } from '../models/Monster';

/**
 * Custom hook for controlling battles with improved state management
 */
export function useBattleController(
  onBattleEnd: (victory: boolean, survivingMonsterIds: string[]) => void,
  onDefeatedMonsters: (survivingMonsterIds: string[]) => void
) {
  // Get battle state and actions
  const battle = useBattleStore(state => state.battle);
  const playerTeam = useBattleStore(state => state.playerTeam);
  const enemyTeam = useBattleStore(state => state.enemyTeam);
  const battleInProgress = useBattleStore(state => state.battleInProgress);
  const battleEnded = useBattleStore(state => state.battleEnded);
  const defeatedMonsterIds = useBattleStore(state => state.defeatedMonsterIds);
  const shouldProcessTurn = useBattleStore(state => state.shouldProcessTurn);
  const attackAnimations = useBattleStore(state => state.attackAnimations);
  const damageEffects = useBattleStore(state => state.damageEffects);
  
  // Get battle actions
  const initializeBattle = useBattleStore(state => state.initializeBattle);
  const processTurn = useBattleStore(state => state.processTurn);
  const endBattleAction = useBattleStore(state => state.endBattle);
  const reset = useBattleStore(state => state.reset);
  const setBattleInProgress = useBattleStore(state => state.setBattleInProgress);
  
  // Refs to track battle state
  const battleEndedRef = useRef(false);
  const processingTurnRef = useRef(false);
  const notifiedDefeatedIdsRef = useRef<string[]>([]);
  
  // Handle battle end
  useEffect(() => {
    if (battleEnded && battleInProgress && !battleEndedRef.current) {
      battleEndedRef.current = true;
      
      const victory = enemyTeam.length === 0 && playerTeam.length > 0;
      const survivingMonsterIds = playerTeam.map(monster => monster.id);
      
      // Notify about battle end
      setTimeout(() => {
        onBattleEnd(victory, survivingMonsterIds);
        reset();
        
        // Reset refs
        battleEndedRef.current = false;
        processingTurnRef.current = false;
        notifiedDefeatedIdsRef.current = [];
      }, 1000);
    }
  }, [battleEnded, battleInProgress, playerTeam, enemyTeam, onBattleEnd, reset]);
  
  // Handle defeated monsters
  useEffect(() => {
    if (defeatedMonsterIds.length > 0 && battleInProgress && !battleEnded) {
      // Find new defeated monster IDs
      const newDefeatedIds = defeatedMonsterIds.filter(
        id => !notifiedDefeatedIdsRef.current.includes(id)
      );
      
      if (newDefeatedIds.length > 0) {
        const survivingMonsterIds = playerTeam.map(monster => monster.id);
        
        // Update notified IDs
        notifiedDefeatedIdsRef.current = [...notifiedDefeatedIdsRef.current, ...newDefeatedIds];
        
        // Notify about defeated monsters
        onDefeatedMonsters(survivingMonsterIds);
      }
    }
  }, [defeatedMonsterIds, battleInProgress, battleEnded, playerTeam, onDefeatedMonsters]);
  
  // Process battle turns
  useEffect(() => {
    if (shouldProcessTurn() && !processingTurnRef.current && !battleEndedRef.current) {
      processingTurnRef.current = true;
      
      const timer = setTimeout(async () => {
        await processTurn();
        processingTurnRef.current = false;
      }, 300);
      
      return () => {
        clearTimeout(timer);
        processingTurnRef.current = false;
      };
    }
  }, [battleInProgress, battleEnded, playerTeam, enemyTeam, processTurn, shouldProcessTurn]);
  
  // Initialize battle
  const startBattle = useCallback((playerTeam: Monster[], enemyTeam: Monster[]): boolean => {
    // Reset refs
    battleEndedRef.current = false;
    processingTurnRef.current = false;
    notifiedDefeatedIdsRef.current = [];
    
    if (!Array.isArray(playerTeam) || playerTeam.length === 0) {
      console.error("Cannot start battle: Player team is empty or invalid");
      return false;
    }
    
    if (!Array.isArray(enemyTeam) || enemyTeam.length === 0) {
      console.error("Cannot start battle: Enemy team is empty or invalid");
      return false;
    }
    
    // Validate teams
    const validPlayerTeam = playerTeam.filter(monster => 
      monster && typeof monster.health === 'number' && monster.health > 0
    );
    
    const validEnemyTeam = enemyTeam.filter(monster => 
      monster && typeof monster.health === 'number' && monster.health > 0
    );
    
    if (validPlayerTeam.length === 0) {
      console.error("Cannot start battle: No valid player monsters after validation");
      return false;
    }
    
    if (validEnemyTeam.length === 0) {
      console.error("Cannot start battle: No valid enemy monsters after validation");
      return false;
    }
    
    // Log teams for debugging
    console.log("Starting battle with teams:", {
      playerTeam: validPlayerTeam.map(m => ({ id: m.id, name: m.name })),
      enemyTeam: validEnemyTeam.map(m => ({ id: m.id, name: m.name }))
    });
    
    return initializeBattle(validPlayerTeam, validEnemyTeam);
  }, [initializeBattle]);
  
  // End battle
  const endBattle = useCallback((victory: boolean) => {
    if (!battleEndedRef.current) {
      battleEndedRef.current = true;
      endBattleAction(victory);
    }
  }, [endBattleAction]);
  
  // Reset battle controller
  const resetController = useCallback(() => {
    reset();
    battleEndedRef.current = false;
    processingTurnRef.current = false;
    notifiedDefeatedIdsRef.current = [];
  }, [reset]);
  
  return {
    // State
    battle,
    playerTeam,
    enemyTeam,
    battleInProgress,
    battleEnded,
    attackAnimations,
    damageEffects,
    
    // Actions
    startBattle,
    endBattle,
    reset: resetController,
    setBattleInProgress
  };
}
