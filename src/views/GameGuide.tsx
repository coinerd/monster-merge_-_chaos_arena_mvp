import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { AnimationService } from './animation/AnimationService';

/**
 * A component that displays a game guide with instructions (View)
 */
const GameGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Get button animations from service
  const getButtonHover = AnimationService.getButtonHoverAnimation;
  const getButtonTap = AnimationService.getButtonTapAnimation;

  // Animation variants for guide sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + i * 0.1
      }
    })
  };

  return (
    <>
      <motion.button 
        onClick={() => setIsOpen(true)}
        className="btn bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
        whileHover={getButtonHover("rgba(79, 70, 229, 0.6)")}
        whileTap={getButtonTap()}
      >
        <HelpCircle size={16} className="mr-1" /> Game Guide
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
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
                  Game Guide
                </motion.h2>
                <motion.button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <motion.div
                  custom={0}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-xl mb-2 text-indigo-400">Merging Monsters</h3>
                  <p>Drag similar monsters together to create more powerful beasts. You can only merge monsters that:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Are the same element (Fire, Water, Earth, Air)</li>
                    <li>Are the same tier (Tier 1-5)</li>
                  </ul>
                  <p className="mt-2">The resulting monster will be one tier higher and have significantly improved stats!</p>
                </motion.div>
                
                <motion.div
                  custom={1}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-xl mb-2 text-indigo-400">Elements</h3>
                  <p>The game features an elemental rock-paper-scissors system:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li><span className="text-red-400">Fire</span> beats <span className="text-gray-400">Air</span>, weak against <span className="text-blue-400">Water</span></li>
                    <li><span className="text-blue-400">Water</span> beats <span className="text-red-400">Fire</span>, weak against <span className="text-green-400">Earth</span></li>
                    <li><span className="text-green-400">Earth</span> beats <span className="text-blue-400">Water</span>, weak against <span className="text-gray-400">Air</span></li>
                    <li><span className="text-gray-400">Air</span> beats <span className="text-green-400">Earth</span>, weak against <span className="text-red-400">Fire</span></li>
                  </ul>
                  <p className="mt-2">When a monster attacks an element it's strong against, it deals 50% more damage. When attacking an element it's weak against, it deals 50% less damage.</p>
                </motion.div>
                
                <motion.div
                  custom={2}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-xl mb-2 text-indigo-400">Battles</h3>
                  <p>Battles are turn-based with the following flow:</p>
                  <ol className="list-decimal pl-5 mt-2">
                    <li>Player monsters and enemy monsters take turns attacking</li>
                    <li>Damage is calculated based on attacker's attack stat, defender's defense stat, and elemental relationships</li>
                    <li>Monsters are defeated when their health reaches zero</li>
                    <li>Battle ends when all monsters on one side are defeated</li>
                    <li>Surviving player monsters gain experience</li>
                    <li>Player earns coins based on the battle outcome</li>
                  </ol>
                </motion.div>
                
                <motion.div
                  custom={3}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-xl mb-2 text-indigo-400">Leveling</h3>
                  <p>Monsters gain experience from battles:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Experience required for level up increases with each level</li>
                    <li>Leveling up improves monster stats</li>
                    <li>Higher-level monsters are more effective in battle</li>
                  </ul>
                </motion.div>
                
                <motion.div
                  custom={4}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-xl mb-2 text-indigo-400">Tips & Tricks</h3>
                  <ul className="list-disc pl-5">
                    <li>Focus on merging monsters to create higher-tier creatures</li>
                    <li>Consider elemental advantages when building your team</li>
                    <li>Position your strongest monsters at the top of the grid</li>
                    <li>Save coins to buy monsters that complement your team</li>
                    <li>Try to have a balanced team with different elements</li>
                  </ul>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button 
                  onClick={() => setIsOpen(false)}
                  className="btn btn-primary"
                  whileHover={getButtonHover()}
                  whileTap={getButtonTap()}
                >
                  Close Guide
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameGuide;
