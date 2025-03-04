import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBattleStore } from '../../store/useBattleStore';
import TeamRoster from './TeamRoster';
import BattleArena from './BattleArena';
import BattleLog from './BattleLog';
import BattleIntro from './BattleIntro';
import { AnimationService } from '../animation/AnimationService';

interface BattleViewProps {
  battleInProgress: boolean;
}

/**
 * A component that displays the battle view (View)
 */
const BattleView: React.FC<BattleViewProps> = ({
  battleInProgress
}) => {
  // Get battle state from store
  const playerTeam = useBattleStore(state => state.playerTeam);
  const enemyTeam = useBattleStore(state => state.enemyTeam);
  const battleLog = useBattleStore(state => state.battleLog);
  const battleEnded = useBattleStore(state => state.battleEnded);
  const turnCount = useBattleStore(state => state.turnCount);
  const attackAnimations = useBattleStore(state => state.attackAnimations);
  const damageEffects = useBattleStore(state => state.damageEffects);
  
  // Get UI variants from animation service
  const uiVariants = AnimationService.getUIVariants();

  // Reset battle state when component unmounts
  useEffect(() => {
    return () => {
      if (battleInProgress) {
        useBattleStore.getState().reset();
      }
    };
  }, [battleInProgress]);

  if (!battleInProgress) {
    return <BattleIntro />;
  }

  return (
    <motion.div 
      className="battle-arena p-4"
      variants={uiVariants}
      initial="hidden"
      animate="visible"
    >
      <BattleArena 
        playerTeam={playerTeam}
        enemyTeam={enemyTeam}
        battleEnded={battleEnded}
        turnCount={turnCount}
        attackAnimations={attackAnimations}
        damageEffects={damageEffects}
      />
      
      <div className="flex justify-between mb-4">
        <TeamRoster 
          team={playerTeam}
          title={`Your Team (${playerTeam.length})`}
          type="player"
        />
        
        <TeamRoster 
          team={enemyTeam}
          title={`Enemy Team (${enemyTeam.length})`}
          type="enemy"
        />
      </div>
      
      <BattleLog battleLog={battleLog} />
    </motion.div>
  );
};

export default BattleView;
