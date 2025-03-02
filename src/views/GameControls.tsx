import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplets, Mountain, Wind, Coins, Plus } from 'lucide-react';
import battleConfig from '../config/battleConfig.json';
import { AnimationService } from './animation/AnimationService';

interface GameControlsProps {
  coins: number;
  onStartBattle: () => void;
  onBuyMonster: (element: string) => void;
  onResetGame: () => void;
  battleInProgress: boolean;
  currentWave: number;
  maxWaves: number;
}

/**
 * A component that displays game controls (View)
 */
const GameControls: React.FC<GameControlsProps> = ({
  coins,
  onStartBattle,
  onBuyMonster,
  onResetGame,
  battleInProgress,
  currentWave,
  maxWaves
}) => {
  const monsterCost = battleConfig.monsters.cost;
  const canBuyMonster = coins >= monsterCost;

  // Get button animations from service
  const getButtonHover = AnimationService.getButtonHoverAnimation;
  const getButtonTap = AnimationService.getButtonTapAnimation;

  return (
    <motion.div 
      className="game-controls p-4 bg-gray-800 rounded-lg mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Game Controls</h2>
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Coins className="text-yellow-400 mr-1" size={20} />
          <motion.span 
            className="font-bold"
            key={coins}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
          >
            {coins}
          </motion.span>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <motion.button
          className="btn btn-primary flex items-center"
          onClick={onStartBattle}
          disabled={battleInProgress}
          whileHover={getButtonHover()}
          whileTap={getButtonTap()}
        >
          {battleInProgress ? 'Battle in Progress...' : `Start Wave ${currentWave}/${maxWaves}`}
        </motion.button>

        <motion.button
          className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
          onClick={onResetGame}
          disabled={battleInProgress}
          whileHover={getButtonHover("rgba(239, 68, 68, 0.6)")}
          whileTap={getButtonTap()}
        >
          Reset Game
        </motion.button>
      </div>

      <motion.div 
        className="mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg mb-2">Buy Monsters ({monsterCost} coins)</h3>
        <div className="flex flex-wrap gap-2">
          <motion.button
            className="btn bg-gradient-to-r from-red-600 to-orange-500 text-white flex items-center"
            onClick={() => onBuyMonster('fire')}
            disabled={!canBuyMonster || battleInProgress}
            whileHover={getButtonHover("rgba(239, 68, 68, 0.6)")}
            whileTap={getButtonTap()}
          >
            <Flame size={16} className="mr-1" /> Fire
          </motion.button>
          <motion.button
            className="btn bg-gradient-to-r from-blue-600 to-blue-400 text-white flex items-center"
            onClick={() => onBuyMonster('water')}
            disabled={!canBuyMonster || battleInProgress}
            whileHover={getButtonHover("rgba(59, 130, 246, 0.6)")}
            whileTap={getButtonTap()}
          >
            <Droplets size={16} className="mr-1" /> Water
          </motion.button>
          <motion.button
            className="btn bg-gradient-to-r from-green-700 to-green-500 text-white flex items-center"
            onClick={() => onBuyMonster('earth')}
            disabled={!canBuyMonster || battleInProgress}
            whileHover={getButtonHover("rgba(34, 197, 94, 0.6)")}
            whileTap={getButtonTap()}
          >
            <Mountain size={16} className="mr-1" /> Earth
          </motion.button>
          <motion.button
            className="btn bg-gradient-to-r from-gray-600 to-gray-400 text-white flex items-center"
            onClick={() => onBuyMonster('air')}
            disabled={!canBuyMonster || battleInProgress}
            whileHover={getButtonHover("rgba(156, 163, 175, 0.6)")}
            whileTap={getButtonTap()}
          >
            <Wind size={16} className="mr-1" /> Air
          </motion.button>
        </div>
      </motion.div>

      {!canBuyMonster && !battleInProgress && (
        <motion.p 
          className="text-yellow-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Not enough coins to buy a monster. Win battles to earn more!
        </motion.p>
      )}
    </motion.div>
  );
};

export default GameControls;
