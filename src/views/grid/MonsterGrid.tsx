import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import MonsterAvatar from '../MonsterAvatar';
import './MonsterGrid.css';

const MonsterGrid: React.FC = () => {
  const { grid, monsters } = useGameStore();

  return (
    <div className="monster-grid">
      {grid.map((cell) => (
        <div key={cell.id} className="grid-cell">
          {cell.monsterId && monsters[cell.monsterId] && (
            <MonsterAvatar monster={monsters[cell.monsterId]} />
          )}
        </div>
      ))}
    </div>
  );
};

export default MonsterGrid;
