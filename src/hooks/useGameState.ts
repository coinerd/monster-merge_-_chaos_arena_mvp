import { useEffect, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';

export function useGameState() {
  const gameState = useGameStore(state => ({
    grid: state.grid,
    monsters: state.monsters,
    coins: state.gameState?.coins || 0,
    currentWave: state.gameState?.currentWave || 1,
    maxWaves: state.gameState?.maxWaves || 10,
    battleInProgress: state.gameState?.battleInProgress || false,
    playerTeam: state.gameState?.playerTeam || [],
    enemyTeam: state.gameState?.enemyTeam || [],
    battleLog: state.gameState?.battleLog || []
  }));
  
  const error = useGameStore(state => state.error);
  const errorSeverity = useGameStore(state => state.errorSeverity);
  const setError = useGameStore(state => state.setError);
  
  const initializeGame = useGameStore(state => state.initializeGame);
  const loadGame = useGameStore(state => state.loadGame);
  const saveGame = useGameStore(state => state.saveGame);
  const resetGame = useGameStore(state => state.resetGame);
  
  const moveMonster = useGameStore(state => state.moveMonster);
  const mergeMonsters = useGameStore(state => state.mergeMonsters);
  const buyMonster = useGameStore(state => state.buyMonster);
  
  const startBattle = useGameStore(state => state.startBattle);
  const endBattle = useGameStore(state => state.endBattle);
  
  useEffect(() => {
    if (!loadGame()) {
      initializeGame();
    }
  }, [initializeGame, loadGame]);
  
  const dismissError = useCallback(() => {
    setError(null);
  }, [setError]);
  
  const reportError = useCallback((message: string, severity: 'info' | 'warning' | 'error' | 'critical' = 'error', data?: any) => {
    console.log(`[${severity.toUpperCase()}] ${message}`, data);
    setError(message, severity);
  }, [setError]);
  
  const controller = {
    moveMonster,
    mergeMonsters,
    buyMonster,
    startBattle,
    endBattle,
    resetGame
  };
  
  return {
    gameState,
    controller,
    errorMessage: error,
    errorSeverity,
    dismissError,
    reportError
  };
}
