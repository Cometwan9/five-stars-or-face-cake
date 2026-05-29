import { useMemo } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { createGameState } from './game/gameState';

export default function App() {
  const state = useMemo(() => createGameState(), []);

  return (
    <main className="app-shell">
      <GameCanvas state={state} />
    </main>
  );
}
