import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import MonsterGrid from './grid/MonsterGrid';

const GameplayView: React.FC = () => {
  const initializeGrid = useGameStore(state => state.initializeGrid);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  return (
    <div className="gameplay-view">
      <MonsterGrid />
    </div>
  );
};

export default GameplayView;
