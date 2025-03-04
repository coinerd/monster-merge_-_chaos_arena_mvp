import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useGameStore } from '../../store/useGameStore';
import MonsterAvatar from '../MonsterAvatar';
import ParticleEffect from '../animation/ParticleEffect';
import './MonsterGrid.css';

interface GridCellProps {
  id: string;
  monsterId: string | null;
  onDrop: (monsterId: string, cellId: string) => void;
}

/**
 * A draggable monster component
 */
const DraggableMonster: React.FC<{ monsterId: string }> = ({ monsterId }) => {
  const monster = useGameStore(state => state.monsters[monsterId]);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MONSTER',
    item: { id: monsterId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));
  
  if (!monster) return null;
  
  return (
    <div
      ref={drag}
      className={`monster-avatar ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <MonsterAvatar 
        monster={monster}
        size="md"
      />
    </div>
  );
};

/**
 * A grid cell component that can accept dropped monsters
 */
const GridCell: React.FC<GridCellProps> = ({ id, monsterId, onDrop }) => {
  const [isOver, setIsOver] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  const [{ isOverCurrent }, drop] = useDrop(() => ({
    accept: 'MONSTER',
    drop: (item: { id: string }) => {
      onDrop(item.id, id);
      return { cellId: id };
    },
    collect: (monitor) => ({
      isOverCurrent: !!monitor.isOver({ shallow: true })
    })
  }));
  
  // Update isOver state when isOverCurrent changes
  useEffect(() => {
    setIsOver(isOverCurrent);
  }, [isOverCurrent]);
  
  // Show particles when a monster is dropped
  useEffect(() => {
    if (monsterId && !isOver) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [monsterId, isOver]);
  
  return (
    <div
      ref={drop}
      className={`grid-cell ${isOver ? 'cell-highlight' : ''}`}
      data-cell-id={id}
    >
      {monsterId && <DraggableMonster monsterId={monsterId} />}
      {showParticles && <ParticleEffect isActive={true} />}
    </div>
  );
};

/**
 * The main monster grid component
 */
const MonsterGrid: React.FC = () => {
  const grid = useGameStore(state => state.grid);
  const monsters = useGameStore(state => state.monsters);
  const moveMonster = useGameStore(state => state.moveMonster);
  const mergeMonsters = useGameStore(state => state.mergeMonsters);
  
  // Handle monster drop on a cell
  const handleDrop = (monsterId: string, cellId: string) => {
    console.log(`Dropping monster ${monsterId} on cell ${cellId}`);
    
    // Get the target cell
    const targetCell = grid.find(cell => cell.id === cellId);
    if (!targetCell) return;
    
    // If target cell has a monster, try to merge
    if (targetCell.monsterId) {
      console.log(`Target cell has monster ${targetCell.monsterId}, attempting merge`);
      mergeMonsters(monsterId, targetCell.monsterId, cellId);
    } else {
      // Otherwise, move the monster
      console.log(`Moving monster ${monsterId} to empty cell ${cellId}`);
      moveMonster(monsterId, cellId);
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="monster-grid">
        {grid.map(cell => (
          <GridCell
            key={cell.id}
            id={cell.id}
            monsterId={cell.monsterId}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default MonsterGrid;
