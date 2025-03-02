import React from 'react';
import { motion } from 'framer-motion';
import { Monster } from '../../models/Monster';
import MonsterAvatar from '../MonsterAvatar';
import { AnimationService } from '../animation/AnimationService';

interface TeamRosterProps {
  team: Monster[];
  title: string;
  type: 'player' | 'enemy';
}

/**
 * A component that displays a team roster with monsters (View)
 */
const TeamRoster: React.FC<TeamRosterProps> = ({ team, title, type }) => {
  // Get UI variants from service
  const uiVariants = AnimationService.getUIVariants();

  return (
    <div className="w-5/12">
      <motion.h3 
        className="text-xl mb-2"
        initial={{ opacity: 0, x: type === 'player' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h3>
      <div className="max-h-60 overflow-y-auto pr-2 roster-container">
        {team.length > 0 ? (
          team.map((monster, index) => (
            <motion.div 
              key={`${type}-${monster.id}-${index}`} 
              className="mb-2 bg-gray-700 bg-opacity-50 p-2 rounded-lg"
              variants={uiVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MonsterAvatar monster={monster} size="sm" />
                  <div className="ml-2">
                    <div className="font-semibold">{monster.name}</div>
                    <div className="text-xs">Lvl {monster.level} • {monster.element.charAt(0).toUpperCase() + monster.element.slice(1)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{monster.health}/{monster.maxHealth} HP</div>
                  <div className="text-xs">ATK: {monster.attack} • DEF: {monster.defense}</div>
                </div>
              </div>
              <div className="health-bar mt-1 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="health-bar-fill h-full"
                  initial={{ width: `${(monster.health / monster.maxHealth) * 100}%` }}
                  animate={{ width: `${(monster.health / monster.maxHealth) * 100}%` }}
                  transition={{ type: "spring", damping: 15 }}
                ></motion.div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="text-gray-400 italic p-4 text-center bg-gray-700 bg-opacity-30 rounded-lg"
            variants={uiVariants}
            initial="hidden"
            animate="visible"
          >
            No monsters remaining
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeamRoster;
