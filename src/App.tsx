import { useEffect, useRef, useState } from 'react';
import { GameCanvas, type CameraMode } from './components/GameCanvas';
import { Hud } from './components/Hud';
import { ResultOverlay } from './components/ResultOverlay';
import { completeDelivery, createGameState, updateGameState, type GameState } from './game/gameState';
import type { VehicleInput } from './game/vehicle';

const FRAME_SECONDS = 1 / 60;

export default function App() {
  const [state, setState] = useState<GameState>(() => createGameState());
  const [cameraMode, setCameraMode] = useState<CameraMode>('third');
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
      }
      if (event.key.toLowerCase() === 'r') {
        setState(createGameState());
        return;
      }
      keys.current.add(event.key.toLowerCase());
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    const onBlur = () => {
      keys.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let accumulator = 0;

    const tick = (now: number) => {
      accumulator += Math.min(0.08, (now - previous) / 1000);
      previous = now;

      while (accumulator >= FRAME_SECONDS) {
        setState((current) => updateGameState(current, readInput(keys.current), FRAME_SECONDS));
        accumulator -= FRAME_SECONDS;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="app-shell">
      <GameCanvas
        state={state}
        cameraMode={cameraMode}
        onCustomerInteract={() => setState((current) => completeDelivery(current))}
      />
      <Hud state={state} />
      <button
        className="view-toggle"
        type="button"
        onClick={() => setCameraMode((current) => (current === 'first' ? 'third' : 'first'))}
      >
        {cameraMode === 'first' ? '第三人称' : '第一人称'}
      </button>
      <div className="control-hint">
        {state.phase === 'handoff' ? 'Click customer to deliver · R restart' : 'W/↑ drive · Space boost · A/D dodge · R restart'}
      </div>
      <ResultOverlay state={state} onRestart={() => setState(createGameState())} />
    </main>
  );
}

function readInput(keys: Set<string>): VehicleInput {
  return {
    throttle: keys.has('w') || keys.has('arrowup') ? 1 : 0,
    boost: keys.has(' ') || keys.has('spacebar') ? 1 : 0,
    steer:
      (keys.has('d') || keys.has('arrowright') ? 1 : 0) -
      (keys.has('a') || keys.has('arrowleft') ? 1 : 0)
  };
}
