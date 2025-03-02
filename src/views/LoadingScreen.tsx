import React from 'react';
import { useGameStateMachine } from '../state/GameStateMachine';
import { useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const { transitionTo } = useGameStateMachine();

  useEffect(() => {
    const timer = setTimeout(() => {
      transitionTo('mainMenu');
    }, 2000);

    return () => clearTimeout(timer);
  }, [transitionTo]);

  return (
    <div className="loading-screen">
      <h2>Loading...</h2>
    </div>
  );
};

export default LoadingScreen;
