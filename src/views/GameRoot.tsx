import React, { useEffect, useRef } from 'react';
import { useGameStateMachine } from '../state/GameStateMachine';
import MainMenu from './MainMenu';
import GameplayView from './GameplayView';
import PauseMenu from './PauseMenu';
import ResultsScreen from './ResultsScreen';
import LoadingScreen from './LoadingScreen';
import { GameEngine } from '../core/GameEngine';

const GameRoot: React.FC = () => {
  const { currentState } = useGameStateMachine();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialize game engine
      gameEngineRef.current = new GameEngine(canvasRef.current);
      gameEngineRef.current.start();
    }

    return () => {
      // Cleanup game engine
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, []);

  const renderCurrentState = () => {
    switch (currentState) {
      case 'loading':
        return <LoadingScreen />;
      case 'mainMenu':
        return <MainMenu />;
      case 'gameplay':
        return <GameplayView />;
      case 'paused':
        return <PauseMenu />;
      case 'results':
        return <ResultsScreen />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <div className="game-root">
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
      {renderCurrentState()}
    </div>
  );
};

export default GameRoot;
