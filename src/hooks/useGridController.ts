import { useCallback, useRef } from 'react';
import { useGridStore } from '../store/useGridStore';
import { useGameStore } from '../store/useGameStore';
import { GridCell } from '../types';
import { Monster } from '../models/Monster';
import { MergeService } from '../services/MergeService';

/**
 * Custom hook for controlling the monster grid with improved state management
 */
export function useGridController(
  onMerge: (monster1Id: string, monster2Id: string, targetCellId: string) => void,
  onAddMonster: (monsterId: string, cellId: string) => void,
  onSelectMonster: (monsterId: string) => void
) {
  // Get grid state from store
  const {
    draggedMonsterId,
    draggedFromCellId,
    isDragging,
    gridHighlight,
    mergingMonsters,
    hiddenMonsterIds,
    particleEffect,
    invalidDropFeedback,
    setDraggedMonster,
    setIsDragging,
    setGridHighlight,
    startMergeOperation,
    completeMergeOperation,
    hideMonsters,
    createParticleEffect,
    showInvalidDropFeedback,
    canMergeMonsters,
    reset: resetGridState
  } = useGridStore();
  
  // Get game state
  const monsters = useGameStore(state => state.monsters);
  
  // Refs for DOM elements
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const gridRef = useRef<HTMLDivElement | null>(null);
  const dragImageRef = useRef<HTMLDivElement | null>(null);
  
  // Ref to track grid boundaries
  const gridBoundsRef = useRef<DOMRect | null>(null);
  
  // Ref to track highlighted cells
  const highlightedCellsRef = useRef<string[]>([]);
  
  // Ref to track the merge operation in progress
  const mergeInProgressRef = useRef<boolean>(false);
  
  /**
   * Updates grid bounds
   */
  const updateGridBounds = useCallback(() => {
    if (gridRef.current) {
      gridBoundsRef.current = gridRef.current.getBoundingClientRect();
    }
  }, []);
  
  /**
   * Handles the start of a drag operation
   */
  const handleDragStart = useCallback((e: React.DragEvent, cellId: string) => {
    // Update grid bounds at the start of drag
    updateGridBounds();
    
    setIsDragging(true);
    setGridHighlight(true);
    
    const cell = findCellById(cellId);
    if (cell && cell.monsterId) {
      // Verify monster exists in the monsters object
      if (monsters[cell.monsterId]) {
        setDraggedMonster(cell.monsterId, cellId);
        
        // Set drag image
        const monster = monsters[cell.monsterId];
        if (monster) {
          // Create a container for the drag image
          const dragPreview = document.createElement('div');
          dragPreview.className = 'monster-drag-preview';
          dragPreview.style.position = 'absolute';
          dragPreview.style.top = '-1000px';
          dragPreview.style.width = '80px';
          dragPreview.style.height = '80px';
          dragPreview.style.borderRadius = '8px';
          dragPreview.style.overflow = 'hidden';
          
          // Clone the actual monster element
          const monsterElement = e.currentTarget.cloneNode(true) as HTMLElement;
          monsterElement.style.width = '100%';
          monsterElement.style.height = '100%';
          monsterElement.style.transform = 'none';
          
          dragPreview.appendChild(monsterElement);
          document.body.appendChild(dragPreview);
          
          // Set the drag image
          e.dataTransfer.setData('text/plain', cell.monsterId);
          e.dataTransfer.setDragImage(dragPreview, 40, 40);
          
          // Store the reference to remove it later
          dragImageRef.current = dragPreview;
        }
        
        console.log(`Drag started: monster ${cell.monsterId} from cell ${cellId}`);
      } else {
        console.error(`Monster with ID ${cell.monsterId} not found in monsters object`);
      }
    }
  }, [monsters, setDraggedMonster, setIsDragging, setGridHighlight, updateGridBounds]);
  
  /**
   * Finds a cell by its ID
   */
  const findCellById = useCallback((cellId: string): GridCell | undefined => {
    const grid = useGameStore.getState().grid;
    return grid.find(cell => cell.id === cellId);
  }, []);
  
  /**
   * Checks if a point is within the grid boundaries
   */
  const isPointInGrid = useCallback((point: { x: number, y: number }): boolean => {
    if (!gridBoundsRef.current) return false;
    
    const { left, right, top, bottom } = gridBoundsRef.current;
    return (
      point.x >= left &&
      point.x <= right &&
      point.y >= top &&
      point.y <= bottom
    );
  }, []);
  
  /**
   * Finds which cell the monster was dropped on
   */
  const findTargetCell = useCallback((point: { x: number, y: number }): string | null => {
    // Convert entries to array for easier debugging
    const cellEntries = Object.entries(cellRefs.current);
    
    for (const [id, ref] of cellEntries) {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          point.x >= rect.left &&
          point.x <= rect.right &&
          point.y >= rect.top &&
          point.y <= rect.bottom
        ) {
          return id;
        }
      }
    }
    
    return null;
  }, []);
  
  /**
   * Highlights a cell during drag over
   */
  const highlightCell = useCallback((cellId: string) => {
    const cellElement = cellRefs.current[cellId];
    if (cellElement && !highlightedCellsRef.current.includes(cellId)) {
      cellElement.classList.add('drag-over');
      highlightedCellsRef.current.push(cellId);
    }
  }, []);
  
  /**
   * Clears all cell highlights
   */
  const clearCellHighlights = useCallback(() => {
    highlightedCellsRef.current.forEach(cellId => {
      const cellElement = cellRefs.current[cellId];
      if (cellElement) {
        cellElement.classList.remove('drag-over');
      }
    });
    highlightedCellsRef.current = [];
  }, []);
  
  /**
   * Handles the end of a drag operation
   */
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Clean up drag image
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }
    
    // Clear any highlighted cells
    clearCellHighlights();
    
    // Set a timeout to reset isDragging to prevent click events from firing immediately
    setTimeout(() => {
      setIsDragging(false);
      setGridHighlight(false);
    }, 100);
    
    if (!draggedMonsterId || !draggedFromCellId) {
      console.log("Drag ended but no dragged monster or source cell");
      return;
    }
    
    // Verify monster still exists in the monsters object
    if (!monsters[draggedMonsterId]) {
      console.error(`Monster with ID ${draggedMonsterId} no longer exists in monsters object`);
      setDraggedMonster(null, null);
      return;
    }
    
    // Get drop coordinates
    const dropPoint = {
      x: e.clientX,
      y: e.clientY
    };
    
    // Check if the drop point is within the grid bounds
    if (!isPointInGrid(dropPoint)) {
      console.log("Drop point is outside the grid, returning monster to original position");
      setDraggedMonster(null, null);
      return;
    }
    
    // Find the target cell based on drop coordinates
    const targetCellId = findTargetCell(dropPoint);
    console.log("Target cell found:", targetCellId);
    
    if (!targetCellId) {
      console.log("No target cell found at drop point, returning monster to original position");
      setDraggedMonster(null, null);
      return;
    }
    
    // If dropped on the same cell, do nothing
    if (targetCellId === draggedFromCellId) {
      console.log("Dropped on same cell, no action needed");
      setDraggedMonster(null, null);
      return;
    }
    
    const targetCell = findCellById(targetCellId);
    if (!targetCell) {
      console.log("Target cell not found in grid, returning monster to original position");
      setDraggedMonster(null, null);
      return;
    }
    
    console.log(`Drop target: cell ${targetCellId}, has monster: ${!!targetCell.monsterId}`);
    
    // If target cell is empty, move the monster
    if (!targetCell.monsterId) {
      console.log(`Moving monster ${draggedMonsterId} to empty cell ${targetCellId}`);
      onAddMonster(draggedMonsterId, targetCellId);
    } 
    // If target cell has a monster, try to merge or show invalid drop feedback
    else if (targetCell.monsterId !== draggedMonsterId) {
      // Verify target monster exists
      if (!monsters[targetCell.monsterId]) {
        console.error(`Target monster with ID ${targetCell.monsterId} not found in monsters object`);
        setDraggedMonster(null, null);
        return;
      }
      
      const monster1 = monsters[draggedMonsterId];
      const monster2 = monsters[targetCell.monsterId];
      
      // Use MergeService directly to check if monsters can be merged
      const canMerge = MergeService.canMerge(monster1, monster2);
      
      console.log("Can merge:", canMerge, { 
        monster1: monsters[draggedMonsterId],
        monster2: monsters[targetCell.monsterId]
      });
      
      if (canMerge && !mergeInProgressRef.current) {
        console.log(`Merging monsters ${draggedMonsterId} and ${targetCell.monsterId}`);
        // Start merge animation
        startMergeOperation(draggedMonsterId, targetCell.monsterId, targetCellId);
        
        // Call onMerge with the target cell ID
        onMerge(draggedMonsterId, targetCell.monsterId, targetCellId);
      } else {
        console.log(`Cannot merge incompatible monsters ${draggedMonsterId} and ${targetCell.monsterId}`);
        // Show invalid drop feedback
        showInvalidDropFeedback(targetCellId);
      }
    }
    
    setDraggedMonster(null, null);
  }, [
    draggedMonsterId, 
    draggedFromCellId, 
    monsters, 
    clearCellHighlights, 
    isPointInGrid, 
    findTargetCell, 
    findCellById, 
    setDraggedMonster, 
    setIsDragging, 
    setGridHighlight, 
    startMergeOperation, 
    showInvalidDropFeedback, 
    onAddMonster,
    onMerge
  ]);
  
  /**
   * Handles drag over a cell
   */
  const handleDragOver = useCallback((e: React.DragEvent, cellId: string) => {
    e.preventDefault(); // Necessary to allow dropping
    
    if (isDragging && draggedMonsterId) {
      // Only highlight cells that would be valid drop targets
      const targetCell = findCellById(cellId);
      
      if (targetCell) {
        // If cell is empty, it's always valid
        if (!targetCell.monsterId) {
          highlightCell(cellId);
        } 
        // If cell has a monster, check if it can be merged with the dragged monster
        else if (targetCell.monsterId !== draggedMonsterId) {
          const monster1 = monsters[draggedMonsterId];
          const monster2 = monsters[targetCell.monsterId];
          
          if (monster1 && monster2) {
            const canMerge = MergeService.canMerge(monster1, monster2);
            if (canMerge) {
              highlightCell(cellId);
            }
          }
        }
      }
    }
  }, [isDragging, draggedMonsterId, findCellById, highlightCell, monsters]);
  
  /**
   * Handles drag enter event
   */
  const handleDragEnter = useCallback((e: React.DragEvent, cellId: string) => {
    e.preventDefault();
    if (isDragging && draggedMonsterId) {
      const targetCell = findCellById(cellId);
      
      if (targetCell) {
        // If cell is empty, it's always valid
        if (!targetCell.monsterId) {
          highlightCell(cellId);
        } 
        // If cell has a monster, check if it can be merged with the dragged monster
        else if (targetCell.monsterId !== draggedMonsterId) {
          const monster1 = monsters[draggedMonsterId];
          const monster2 = monsters[targetCell.monsterId];
          
          if (monster1 && monster2) {
            const canMerge = MergeService.canMerge(monster1, monster2);
            if (canMerge) {
              highlightCell(cellId);
            }
          }
        }
      }
    }
  }, [isDragging, draggedMonsterId, findCellById, highlightCell, monsters]);
  
  /**
   * Handles drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent, cellId: string) => {
    e.preventDefault();
    const cellElement = cellRefs.current[cellId];
    if (cellElement) {
      cellElement.classList.remove('drag-over');
      highlightedCellsRef.current = highlightedCellsRef.current.filter(id => id !== cellId);
    }
  }, []);
  
  /**
   * Creates particle effect for merging
   */
  const createMergeEffectForCell = useCallback((monster1: Monster, monster2: Monster, targetCellId: string) => {
    const targetCell = cellRefs.current[targetCellId];
    if (!targetCell || !gridRef.current) {
      console.log("Cannot create merge effect: missing refs");
      return;
    }
    
    const cellRect = targetCell.getBoundingClientRect();
    const gridRect = gridRef.current.getBoundingClientRect();
    
    // Calculate position relative to the grid
    const x = cellRect.left + cellRect.width / 2 - gridRect.left;
    const y = cellRect.top + cellRect.height / 2 - gridRect.top;
    
    // Get element colors for particles
    const color1 = monster1.getElementColor();
    const color2 = monster2.getElementColor();
    
    // Trigger particle effect
    createParticleEffect(x, y, [color1, color2]);
  }, [createParticleEffect]);
  
  /**
   * Handles clicking on a monster
   */
  const handleMonsterClick = useCallback((monsterId: string) => {
    // Only trigger click if not dragging
    if (!isDragging) {
      onSelectMonster(monsterId);
    }
  }, [isDragging, onSelectMonster]);
  
  /**
   * Processes merge operation
   */
  const processMergeOperation = useCallback(() => {
    if (mergingMonsters && !mergeInProgressRef.current) {
      console.log("Processing merge operation:", mergingMonsters);
      mergeInProgressRef.current = true;
      
      // Verify both monsters exist before proceeding
      const monster1 = monsters[mergingMonsters.monster1Id];
      const monster2 = monsters[mergingMonsters.monster2Id];
      
      if (!monster1 || !monster2) {
        console.error("Cannot merge: One or both monsters not found in current monsters state", {
          monster1Id: mergingMonsters.monster1Id,
          monster2Id: mergingMonsters.monster2Id,
          monster1Exists: !!monster1,
          monster2Exists: !!monster2,
          availableMonsterIds: Object.keys(monsters)
        });
        
        // Reset merging state
        completeMergeOperation();
        mergeInProgressRef.current = false;
        return;
      }
      
      // Create particle effect at merge location
      createMergeEffectForCell(monster1, monster2, mergingMonsters.targetCellId);
      
      // Hide the monsters being merged
      hideMonsters([mergingMonsters.monster1Id, mergingMonsters.monster2Id]);
      
      // Keep particle effect active for a bit longer
      const animationDuration = 800;
      const timer = setTimeout(() => {
        completeMergeOperation();
        mergeInProgressRef.current = false;
      }, animationDuration);
      
      return () => {
        clearTimeout(timer);
        mergeInProgressRef.current = false;
      };
    }
  }, [
    mergingMonsters, 
    monsters, 
    completeMergeOperation, 
    createMergeEffectForCell, 
    hideMonsters
  ]);
  
  /**
   * Checks if a monster should be hidden (during merge animation)
   */
  const shouldHideMonster = useCallback((monsterId: string): boolean => {
    return hiddenMonsterIds.includes(monsterId);
  }, [hiddenMonsterIds]);
  
  /**
   * Gets the animation class for a cell
   */
  const getCellAnimationClass = useCallback((cellId: string): string => {
    if (invalidDropFeedback.active && invalidDropFeedback.cellId === cellId) {
      return 'invalid-drop-animation';
    }
    return '';
  }, [invalidDropFeedback]);
  
  /**
   * Resets the grid controller
   */
  const reset = useCallback(() => {
    resetGridState();
    mergeInProgressRef.current = false;
    highlightedCellsRef.current = [];
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }
  }, [resetGridState]);
  
  return {
    // State
    draggedMonsterId,
    draggedFromCellId,
    isDragging,
    gridHighlight,
    mergingMonsters,
    particleEffect,
    
    // Refs
    cellRefs,
    gridRef,
    
    // Event handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleMonsterClick,
    
    // Utility functions
    processMergeOperation,
    shouldHideMonster,
    getCellAnimationClass,
    updateGridBounds,
    reset
  };
}
