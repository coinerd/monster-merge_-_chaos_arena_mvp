import React from 'react';
import { useGameStateMachine } from '../state/GameStateMachine';

const MainMenu: React.FC = () => {
  const { transitionTo } = useGameStateMachine();

  return (
    <div className="main-menu">
      <h1>Monster Merge - Chaos Arena</h1>
      <button onClick={() => transitionTo('gameplay')}>
        Start Game
      </button>
      <button onClick={() => transitionTo('loading')}>
        Load Game
      </button>
    </div>
  );
};

export default MainMenu;
