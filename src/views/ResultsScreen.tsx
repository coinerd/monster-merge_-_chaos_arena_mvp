import React from 'react';
import { useGameStateMachine } from '../state/GameStateMachine';

const ResultsScreen: React.FC = () => {
  const { transitionTo } = useGameStateMachine();

  return (
    <div className="results-screen">
      <h2>Game Results</h2>
      <button onClick={() => transitionTo('mainMenu')}>
        Main Menu
      </button>
    </div>
  );
};

export default ResultsScreen;
