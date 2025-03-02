import React, { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useBattleController } from './hooks/useBattleController';
import { Monster } from './models/Monster';
import MonsterGrid from './views/grid/MonsterGrid';
import BattleView from './views/battle/BattleView';
import MonsterDetails from './views/MonsterDetails';
import GameControls from './views/GameControls';
import GameGuide from './views/GameGuide';
import MusicPlayer from './views/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Main App component that coordinates the game (View)
 */
function App() {
  // Use the game state hook
  const { 
    gameState, 
    controller, 
    errorMessage, 
    errorSeverity, 
    dismissError, 
    reportError 
  } = useGameState();
  
  // Local UI state
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [battleResult, setBattleResult] = useState<{ victory: boolean; visible: boolean } | null>(null);
  
  // Use battle controller
  const battleController = useBattleController(handleBattleEnd, handleDefeatedMonsters);
  
  /**
   * Handles monster merging
   */
  const handleMerge = (monster1Id: string, monster2Id: string) => {
    try {
      // Verify both monsters exist before attempting to merge
      if (!gameState.monsters[monster1Id] || !gameState.monsters[monster2Id]) {
        reportError(`Cannot merge: One or both monsters not found. Try again.`, "warning");
        return;
      }
      
      if (!controller.mergeMonsters(monster1Id, monster2Id)) {
        reportError("Failed to merge monsters. Try again.", "warning");
      }
    } catch (error) {
      reportError("An error occurred while merging monsters.", "error", error);
    }
  };
  
  /**
   * Handles monster movement
   */
  const handleAddMonster = (monsterId: string, cellId: string) => {
    try {
      // Verify monster exists before attempting to move
      if (!gameState.monsters[monsterId]) {
        reportError(`Cannot move: Monster not found. Try again.`, "warning");
        return;
      }
      
      if (!controller.moveMonster(monsterId, cellId)) {
        reportError("Failed to move monster. Try again.", "warning");
      }
    } catch (error) {
      reportError("An error occurred while moving the monster.", "error", error);
    }
  };
  
  /**
   * Handles monster selection
   */
  const handleSelectMonster = (monsterId: string) => {
    const monster = gameState.monsters[monsterId];
    if (monster) {
      setSelectedMonster(monster);
    } else {
      reportError("Cannot select monster: Monster not found.", "info");
    }
  };
  
  /**
   * Handles closing monster details
   */
  const handleCloseMonsterDetails = () => {
    setSelectedMonster(null);
  };
  
  /**
   * Handles starting a battle
   */
  const handleStartBattle = () => {
    try {
      // Check if there are any monsters on the grid
      const monstersOnGrid = gameState.grid.some(cell => cell.monsterId !== null);
      if (!monstersOnGrid) {
        reportError("You need at least one monster on the grid to start a battle!", "warning");
        return;
      }
      
      // Start battle in game controller
      if (controller.startBattle()) {
        // Get player team from grid
        const playerTeam = gameState.grid
          .filter(cell => cell.monsterId)
          .map(cell => {
            const monsterId = cell.monsterId;
            if (!monsterId) return null;
            return gameState.monsters[monsterId];
          })
          .filter(Boolean) as Monster[];
        
        if (playerTeam.length === 0) {
          reportError("Your team doesn't have any monsters. Place monsters on the grid first.", "warning");
          
          // Reset battle state if player team is empty
          if (gameState.battleInProgress) {
            controller.endBattle(false, []);
          }
          return;
        }
        
        // Verify enemy team exists and is not empty
        const enemyTeam = gameState.enemyTeam;
        
        if (!enemyTeam || enemyTeam.length === 0) {
          reportError("Failed to generate enemy team. Please try again.", "error");
          
          // Reset battle state if enemy team is empty
          if (gameState.battleInProgress) {
            controller.endBattle(false, playerTeam.map(m => m.id));
          }
          return;
        }
        
        // Initialize battle in battle controller
        if (!battleController.startBattle(playerTeam, enemyTeam)) {
          reportError("Failed to initialize battle. Please try again.", "error");
          
          // Reset battle state if initialization failed
          controller.endBattle(false, playerTeam.map(m => m.id));
        }
      } else {
        reportError("Failed to start battle. Please try again.", "warning");
      }
    } catch (error) {
      reportError("An error occurred while starting the battle.", "error", error);
      
      // Reset battle state if an error occurred
      if (gameState.battleInProgress) {
        const playerTeamIds = gameState.playerTeam;
        controller.endBattle(false, playerTeamIds);
      }
    }
  };
  
  /**
   * Handles battle end
   */
  function handleBattleEnd(victory: boolean, survivingMonsterIds: string[]) {
    try {
      // Validate surviving monster IDs
      const validSurvivingIds = survivingMonsterIds.filter(id => 
        gameState.monsters[id] !== undefined
      );
      
      // End battle in game controller
      controller.endBattle(victory, validSurvivingIds);
      
      // Show battle result
      setBattleResult({ victory, visible: true });
      setTimeout(() => {
        setBattleResult(prev => prev ? { ...prev, visible: false } : null);
      }, 3000);
    } catch (error) {
      reportError("An error occurred while ending the battle.", "error", error);
    }
  }
  
  /**
   * Handles defeated monsters during battle
   */
  function handleDefeatedMonsters(survivingMonsterIds: string[]) {
    try {
      // Validate surviving monster IDs
      const validSurvivingIds = survivingMonsterIds.filter(id => 
        gameState.monsters[id] !== undefined
      );
      
      // Update grid in game controller to remove defeated monsters
      if (gameState.battleInProgress) {
        controller.endBattle(false, validSurvivingIds);
      }
    } catch (error) {
      reportError("An error occurred while updating defeated monsters.", "error", error);
    }
  }
  
  /**
   * Handles buying a monster
   */
  const handleBuyMonster = (elementStr: string) => {
    try {
      if (!controller.buyMonster(elementStr)) {
        reportError("Failed to buy monster. Make sure you have enough coins and grid space.", "warning");
      }
    } catch (error) {
      reportError("An error occurred while buying a monster.", "error", error);
    }
  };
  
  /**
   * Handles resetting the game
   */
  const handleResetGame = () => {
    if (window.confirm("Are you sure you want to reset the game? All progress will be lost.")) {
      try {
        // First, ensure battle controller is reset
        battleController.reset();
        
        // Then reset the game state
        controller.resetGame();
        
        // Clear any UI state
        setBattleResult(null);
        setSelectedMonster(null);
      } catch (error) {
        reportError("An error occurred while resetting the game.", "error", error);
      }
    }
  };

  return (
    <div className="game-container p-4">
      <header className="text-center mb-6">
        <h1 className="game-title">Monster Merge: Chaos Arena</h1>
        <p className="text-lg">Merge monsters, build your team, and battle in the arena!</p>
      </header>
      
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
              errorSeverity === 'critical' ? 'bg-red-700' : 
              errorSeverity === 'error' ? 'bg-red-600' :
              errorSeverity === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
            } text-white`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            onClick={dismissError}
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl mb-4">Monster Grid</h2>
            <MonsterGrid
              grid={gameState.grid}
              monsters={gameState.monsters}
              onMerge={handleMerge}
              onAddMonster={handleAddMonster}
              onSelectMonster={handleSelectMonster}
            />
            <p className="text-sm text-gray-400 mt-2">
              Drag similar monsters together to merge them into more powerful beasts!
            </p>
          </div>
          
          <GameControls
            coins={gameState.coins}
            onStartBattle={handleStartBattle}
            onBuyMonster={handleBuyMonster}
            onResetGame={handleResetGame}
            battleInProgress={gameState.battleInProgress}
            currentWave={gameState.currentWave}
            maxWaves={gameState.maxWaves}
          />
          
          <div className="mt-4 text-center">
            <GameGuide />
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <BattleView
            battleInProgress={gameState.battleInProgress}
          />
          
          <AnimatePresence>
            {battleResult && battleResult.visible && (
              <motion.div 
                className={`text-center p-4 rounded-lg mt-4 ${
                  battleResult.victory ? 'bg-green-800' : 'bg-red-800'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <h2 className="text-2xl mb-2">
                  {battleResult.victory ? 'Victory!' : 'Defeat!'}
                </h2>
                <p>
                  {battleResult.victory 
                    ? `You've defeated wave ${gameState.currentWave - 1}! Prepare for the next challenge.` 
                    : 'Your monsters were defeated. Try merging to create stronger beasts!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <AnimatePresence>
        {selectedMonster && (
          <MonsterDetails
            monster={selectedMonster}
            onClose={handleCloseMonsterDetails}
          />
        )}
      </AnimatePresence>
       <MusicPlayer defaultEnabled={true} />
    </div>
  );
}

export default App;
