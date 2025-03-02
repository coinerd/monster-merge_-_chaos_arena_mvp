import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AnimationService } from '../animation/AnimationService';

interface BattleLogProps {
  battleLog: string[];
}

/**
 * A component that displays the battle log (View)
 */
const BattleLog: React.FC<BattleLogProps> = ({ battleLog }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new log entries are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLog]);
  
  // Get UI variants from service
  const uiVariants = AnimationService.getUIVariants();
  
  return (
    <motion.div 
      ref={logContainerRef}
      className="battle-log bg-gray-800 p-3 rounded-lg h-32 overflow-y-auto"
      variants={uiVariants}
      initial="hidden"
      animate="visible"
    >
      {battleLog.map((log, index) => (
        <motion.div 
          key={`log-${index}`} 
          className="text-sm mb-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {log}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BattleLog;
