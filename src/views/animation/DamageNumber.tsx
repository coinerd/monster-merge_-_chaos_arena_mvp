import React from 'react';
import { motion } from 'framer-motion';

interface DamageNumberProps {
  damage: number;
  x: number;
  y: number;
  isCritical?: boolean;
}

/**
 * A component that displays damage numbers with animations (View)
 */
const DamageNumber: React.FC<DamageNumberProps> = ({
  damage,
  x,
  y,
  isCritical = false
}) => {
  const variants = {
    initial: { 
      opacity: 0, 
      y: 0, 
      scale: 0.5 
    },
    animate: { 
      opacity: [0, 1, 1, 0], 
      y: -50, 
      scale: isCritical ? [0.5, 1.5, 1.2, 0.8] : [0.5, 1.2, 1, 0.8],
      transition: { 
        duration: 1, 
        times: [0, 0.2, 0.8, 1],
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={`damage-text ${isCritical ? 'text-yellow-300 font-bold' : 'text-red-500'}`}
      style={{ 
        position: 'absolute',
        left: x,
        top: y,
        fontSize: isCritical ? '28px' : '24px',
        fontWeight: isCritical ? 'bold' : 'normal',
        textShadow: '0 0 3px rgba(0,0,0,0.8)'
      }}
      variants={variants}
      initial="initial"
      animate="animate"
    >
      {damage}
    </motion.div>
  );
};

export default DamageNumber;
