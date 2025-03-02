import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monster } from '../models/Monster';
import MonsterAvatar from './MonsterAvatar';
import { AnimationService } from './animation/AnimationService';

interface MonsterDetailsProps {
  monster: Monster | null;
  onClose: () => void;
}

/**
 * A component that displays detailed information about a monster (View)
 */
const MonsterDetails: React.FC<MonsterDetailsProps> = ({ monster, onClose }) => {
  if (!monster) return null;

  // Get button animations from service
  const getButtonHover = AnimationService.getButtonHoverAnimation;
  const getButtonTap = AnimationService.getButtonTapAnimation;

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'text-red-500';
      case 'water': return 'text-blue-500';
      case 'earth': return 'text-green-500';
      case 'air': return 'text-gray-300';
      default: return '';
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <motion.h2 
              className="text-2xl font-bold"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {monster.name}
            </motion.h2>
            <motion.button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕
            </motion.button>
          </div>
          
          <motion.div 
            className="mb-4 flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <MonsterAvatar monster={monster} size="lg" />
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 gap-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <p className="text-gray-400">Element</p>
              <p className={`text-lg font-semibold ${getElementColor(monster.element)}`}>
                {monster.element.charAt(0).toUpperCase() + monster.element.slice(1)}
              </p>
            </motion.div>
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
              <p className="text-gray-400">Level</p>
              <p className="text-lg font-semibold">{monster.level}</p>
            </motion.div>
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <p className="text-gray-400">Health</p>
              <p className="text-lg font-semibold">{monster.health}/{monster.maxHealth}</p>
            </motion.div>
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
              <p className="text-gray-400">Attack</p>
              <p className="text-lg font-semibold">{monster.attack}</p>
            </motion.div>
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <p className="text-gray-400">Defense</p>
              <p className="text-lg font-semibold">{monster.defense}</p>
            </motion.div>
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
              <p className="text-gray-400">Experience</p>
              <p className="text-lg font-semibold">{monster.experience}/{monster.experienceToNextLevel}</p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mb-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-purple-500 h-full" 
                initial={{ width: 0 }}
                animate={{ width: `${(monster.experience / monster.experienceToNextLevel) * 100}%` }}
                transition={{ delay: 0.7, duration: 0.5 }}
              ></motion.div>
            </div>
            <motion.p 
              className="text-xs text-center mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {monster.experience}/{monster.experienceToNextLevel} XP to next level
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button 
              onClick={onClose}
              className="btn btn-primary"
              whileHover={getButtonHover()}
              whileTap={getButtonTap()}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MonsterDetails;
