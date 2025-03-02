import React from 'react';
import { motion } from 'framer-motion';

/**
 * A component that displays the battle intro (View)
 */
const BattleIntro: React.FC = () => {
  return (
    <motion.div 
      className="battle-arena flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.h2 
          className="text-2xl mb-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          Battle Arena
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Drag monsters to the grid and merge them to create powerful beasts!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Then start a battle to test your monsters against enemies.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default BattleIntro;
