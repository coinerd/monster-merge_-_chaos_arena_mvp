import React from 'react';
import { Monster } from '../models/Monster';

interface MonsterAvatarProps {
  monster: Monster;
  size?: 'sm' | 'md' | 'lg';
}

const MonsterAvatar: React.FC<MonsterAvatarProps> = ({ monster, size = 'md' }) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 32;
      case 'md': return 64;
      case 'lg': return 96;
      default: return 64;
    }
  };

  // Get the correct image name based on element and tier
  const getImageName = () => {
    const { element, tier } = monster;
    
    switch (element) {
      case 'fire':
        return tier === 1 ? 'ember-monster.svg' : 
               tier === 2 ? 'blaze-monster.svg' : 
               'inferno-monster.svg';
      case 'water':
        return tier === 1 ? 'splash-monster.svg' : 
               tier === 2 ? 'tide-monster.svg' : 
               'tsunami-monster.svg';
      case 'earth':
        return tier === 1 ? 'pebble-monster.svg' : 
               tier === 2 ? 'boulder-monster.svg' : 
               'mountain-monster.svg';
      case 'air':
        return tier === 1 ? 'breeze-monster.svg' : 
               tier === 2 ? 'gust-monster.svg' : 
               'cyclone-monster.svg';
      default:
        return 'ember-monster.svg';
    }
  };

  const imagePath = `/monsters/${getImageName()}`;

  return (
    <img
      src={imagePath}
      alt={monster.name}
      style={{
        width: getSize(),
        height: getSize(),
        objectFit: 'contain'
      }}
    />
  );
};

export default MonsterAvatar;
