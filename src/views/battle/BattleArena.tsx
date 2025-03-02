import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monster } from '../../models/Monster';
import AnimatedMonster from '../animation/AnimatedMonster';
import DamageNumber from '../animation/DamageNumber';
import { AnimationService } from '../animation/AnimationService';

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

interface BattleArenaProps {
  playerTeam: Monster[];
  enemyTeam: Monster[];
  battleEnded: boolean;
  turnCount: number;
  attackAnimations: AttackAnimation[];
  damageEffects: DamageEffect[];
}

/**
 * A component that displays the battle arena (View)
 */
const BattleArena: React.FC<BattleArenaProps> = ({
  playerTeam,
  enemyTeam,
  battleEnded,
  turnCount,
  attackAnimations,
  damageEffects
}) => {
  // Refs for monster elements
  const playerMonsterRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const enemyMonsterRefs = useRef<Record<number, HTMLDivElement | null>>({});
  
  // Update damage effect positions
  useEffect(() => {
    // Update damage effect positions based on monster positions
    damageEffects.forEach(effect => {
      if (effect.active) {
        const targetRef = effect.target === 'player' 
          ? playerMonsterRefs.current[effect.targetIndex]
          : enemyMonsterRefs.current[effect.targetIndex];
        
        if (targetRef) {
          const rect = targetRef.getBoundingClientRect();
          effect.x = rect.left + rect.width / 2;
          effect.y = rect.top + rect.height / 2;
        }
      }
    });
  }, [damageEffects]);
  
  // Get animation variants from service
  const battleEndVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        damping: 15
      }
    }
  };

  return (
    <div className="battle-view relative mb-8 h-64 bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden">
      {/* Battle scene background */}
      <motion.div 
        className="absolute inset-0 battle-background"
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ 
          duration: 20, 
          ease: "linear", 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
      ></motion.div>
      
      {/* Player monsters */}
      <div className="absolute bottom-8 left-0 w-1/2 flex justify-around">
        {playerTeam.slice(0, 3).map((monster, index) => (
          <div 
            key={`battle-player-${monster.id}-${index}`}
            ref={el => playerMonsterRefs.current[index] = el}
          >
            <AnimatedMonster
              monster={monster}
              size="md"
              isPlayer={true}
              isIdle={true}
              isAttacking={attackAnimations.some(anim => 
                anim.attacker === 'player' && 
                anim.attackerIndex === index && 
                anim.active
              )}
            />
            <div className="absolute -bottom-3 left-0 right-0 health-bar h-2 rounded-full overflow-hidden">
              <motion.div 
                className="health-bar-fill h-full"
                initial={{ width: `${(monster.health / monster.maxHealth) * 100}%` }}
                animate={{ width: `${(monster.health / monster.maxHealth) * 100}%` }}
                transition={{ type: "spring", damping: 15 }}
              ></motion.div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Enemy monsters */}
      <div className="absolute bottom-8 right-0 w-1/2 flex justify-around">
        {enemyTeam.slice(0, 3).map((monster, index) => (
          <div 
            key={`battle-enemy-${monster.id}-${index}`}
            ref={el => enemyMonsterRefs.current[index] = el}
          >
            <AnimatedMonster
              monster={monster}
              size="md"
              isPlayer={false}
              isIdle={true}
              isAttacking={attackAnimations.some(anim => 
                anim.attacker === 'enemy' && 
                anim.attackerIndex === index && 
                anim.active
              )}
            />
            <div className="absolute -bottom-3 left-0 right-0 health-bar h-2 rounded-full overflow-hidden">
              <motion.div 
                className="health-bar-fill h-full"
                initial={{ width: `${(monster.health / monster.maxHealth) * 100}%` }}
                animate={{ width: `${(monster.health / monster.maxHealth) * 100}%` }}
                transition={{ type: "spring", damping: 15 }}
              ></motion.div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Damage numbers */}
      <AnimatePresence>
        {damageEffects.map(effect => (
          <DamageNumber
            key={effect.id}
            damage={effect.damage}
            x={effect.x}
            y={effect.y}
            isCritical={effect.damage > 20}
          />
        ))}
      </AnimatePresence>
      
      {/* Battle status */}
      <div className="absolute top-2 left-0 right-0 text-center">
        <motion.div 
          className="inline-block px-4 py-1 bg-gray-800 bg-opacity-75 rounded-full text-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          {playerTeam.length > 0 && enemyTeam.length > 0 ? (
            <>
              <span className="text-blue-400">Team Battle</span>
              <span className="mx-2">•</span>
              <motion.span 
                className="text-gray-300"
                key={turnCount}
                initial={{ scale: 1.2, color: "#a78bfa" }}
                animate={{ scale: 1, color: "#d1d5db" }}
                transition={{ duration: 0.3 }}
              >
                Turn {turnCount + 1}
              </motion.span>
            </>
          ) : (
            <span>{battleEnded ? 'Battle Ended' : 'Next combatants...'}</span>
          )}
        </motion.div>
      </div>
      
      {/* Victory/Defeat message when battle ends */}
      <AnimatePresence>
        {battleEnded && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`text-center p-6 rounded-lg ${enemyTeam.length === 0 ? 'bg-green-800' : 'bg-red-800'}`}
              variants={battleEndVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2 
                className="text-3xl font-bold mb-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {enemyTeam.length === 0 ? 'Victory!' : 'Defeat!'}
              </motion.h2>
              <motion.p 
                className="text-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {enemyTeam.length === 0 
                  ? 'All enemies defeated!' 
                  : 'Your team was wiped out!'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleArena;
