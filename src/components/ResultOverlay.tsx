import type { GameState } from '../game/gameState';

type ResultOverlayProps = {
  state: GameState;
  onRestart: () => void;
};

export function ResultOverlay({ state, onRestart }: ResultOverlayProps) {
  if (!state.rating) return null;

  const stars = '★★★★★'.slice(0, state.rating.stars).padEnd(5, '☆');

  return (
    <section className="result-overlay" role="dialog" aria-label="Delivery result">
      <p className="eyebrow">{state.rating.faceCake ? 'Face Cake' : 'Delivery Complete'}</p>
      <h1>{stars}</h1>
      <p>Time remaining: {Math.ceil(state.remainingSeconds)}s</p>
      <p>{state.rating.comment}</p>
      <button type="button" onClick={onRestart}>
        Try again
      </button>
    </section>
  );
}
