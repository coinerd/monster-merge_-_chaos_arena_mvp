import { create } from 'zustand';

type GameState = 
  | 'init'
  | 'loading'
  | 'mainMenu'
  | 'gameplay'
  | 'paused'
  | 'battle'
  | 'gameOver'
  | 'results';

interface GameStateMachine {
  currentState: GameState;
  previousState: GameState | null;
  transitionTo: (newState: GameState) => void;
  goBack: () => void;
}

const useGameStateMachine = create<GameStateMachine>((set) => ({
  currentState: 'init',
  previousState: null,
  
  transitionTo: (newState) => set((state) => ({
    previousState: state.currentState,
    currentState: newState
  })),
  
  goBack: () => set((state) => ({
    currentState: state.previousState || 'init',
    previousState: null
  }))
}));

// State transition rules
const stateTransitions: Record<GameState, GameState[]> = {
  init: ['loading'],
  loading: ['mainMenu'],
  mainMenu: ['gameplay', 'loading'],
  gameplay: ['paused', 'battle', 'gameOver'],
  paused: ['gameplay', 'mainMenu'],
  battle: ['gameplay', 'gameOver'],
  gameOver: ['results', 'mainMenu'],
  results: ['mainMenu']
};

export { useGameStateMachine, stateTransitions };
