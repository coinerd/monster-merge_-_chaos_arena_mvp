import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Monster } from '../../models/Monster';
import MonsterAvatar from '../MonsterAvatar';

interface AnimatedMonsterProps {
  monster: Monster;
  size?: 'sm' | 'md' | 'lg';
  isAttacking?: boolean;
  isPlayer?: boolean;
  isMerging?: boolean;
  isIdle?: boolean;
  className?: string;
}

/**
 * A component that renders a monster with animations (View)
 */
const AnimatedMonster: React.FC<AnimatedMonsterProps> = ({
  monster,
  size = 'md',
  isAttacking = false,
  isPlayer = true,
  isMerging = false,
  isIdle = true,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Attack animation variants
  const attackVariants = {
    idle: { x: 0 },
    attacking: {
      x: isPlayer 
        ? [0, 10, 50, 10, 0]  // Player attack animation
        : [0, -10, -50, -10, 0], // Enemy attack animation
      transition: { 
        duration: 0.5, 
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1]
      }
    }
  };

  // Merge animation variants
  const mergeVariants = {
    idle: { 
      scale: 1,
      rotate: 0,
      filter: "brightness(1)"
    },
    merging: {
      scale: [1, 1.2, 0.8, 1.3, 1],
      rotate: [0, 10, -10, 5, 0],
      filter: [
        "brightness(1)", 
        "brightness(1.5)", 
        "brightness(2)", 
        "brightness(1.5)", 
        "brightness(1)"
      ],
      transition: { 
        duration: 0.8, 
        times: [0, 0.2, 0.4, 0.6, 1],
        ease: "easeInOut"
      }
    }
  };
  
  // Determine which animation to use
  const animationState = isAttacking ? "attacking" : "idle";
  const mergeState = isMerging ? "merging" : "idle";
  
  // Get idle animation if needed
  const getIdleAnimation = () => {
    if (!isIdle || isAttacking || isMerging || prefersReducedMotion) {
      return {};
    }
    
    switch (monster.element) {
      case 'fire':
        return {
          y: [0, -2, 0, -2, 0],
          rotate: [0, 1, 0, 1, 0],
          transition: { 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }
        };
      case 'water':
        return {
          y: [0, -1, 0, -1, 0],
          scale: [1, 1.02, 1, 1.02, 1],
          transition: { 
            repeat: Infinity, 
            duration: 3, 
            ease: "easeInOut" 
          }
        };
      case 'earth':
        return {
          rotate: [0, 0.5, 0, 0.5, 0],
          transition: { 
            repeat: Infinity, 
            duration: 4, 
            ease: "easeInOut" 
          }
        };
      case 'air':
        return {
          y: [0, -2, 0, -2, 0],
          x: [0, 1, 0, -1, 0],
          transition: { 
            repeat: Infinity, 
            duration: 2.5, 
            ease: "easeInOut" 
          }
        };
      default:
        return {
          scale: [1, 1.03, 1],
          transition: { 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut" 
          }
        };
    }
  };

  return (
    <motion.div
      className={`monster-container ${className}`}
      variants={attackVariants}
      animate={animationState}
      initial="idle"
    >
      <motion.div
        variants={mergeVariants}
        animate={mergeState}
        initial="idle"
        animate={getIdleAnimation()}
      >
        <MonsterAvatar monster={monster} size={size} />
      </motion.div>
    </motion.div>
  );
};

export default AnimatedMonster;
