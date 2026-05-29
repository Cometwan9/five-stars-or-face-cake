import { useEffect, useRef } from 'react';
import type { GameState } from '../game/gameState';

type ResultOverlayProps = {
  state: GameState;
  onRestart: () => void;
};

export function ResultOverlay({ state, onRestart }: ResultOverlayProps) {
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.rating) restartButtonRef.current?.focus();
  }, [state.rating]);

  if (!state.rating) return null;

  const stars = '★★★★★'.slice(0, state.rating.stars).padEnd(5, '☆');

  return (
    <section
      className="result-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Delivery result"
    >
      <p className="eyebrow">{state.rating.faceCake ? 'Face Cake' : 'Delivery Complete'}</p>
      <h1>{stars}</h1>
      <p>Time remaining: {Math.ceil(state.remainingSeconds)}s</p>
      <p>{state.rating.comment}</p>
      <button ref={restartButtonRef} type="button" onClick={onRestart}>
        Try again
      </button>
    </section>
  );
}
