import React from 'react';
import { useGameStateMachine } from '../state/GameStateMachine';

const PauseMenu: React.FC = () => {
  const { transitionTo, goBack } = useGameStateMachine();

  return (
    <div className="pause-menu">
      <h2>Game Paused</h2>
      <button onClick={goBack}>
        Resume
      </button>
      <button onClick={() => transitionTo('mainMenu')}>
        Main Menu
      </button>
    </div>
  );
};

export default PauseMenu;
