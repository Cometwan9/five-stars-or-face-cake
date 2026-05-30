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
  const outcome = state.rating.faceCake
    ? 'Face Cake'
    : state.rating.stars <= 2
      ? 'Complaint Form'
      : 'Customer Review';
  const noteTitle = state.rating.faceCake
    ? '配送失败'
    : state.rating.stars >= 4
      ? '五星好评'
      : '收到差评';
  const customerLine = state.rating.faceCake
    ? '顾客：“这不是蛋糕，这是攻击。”'
    : state.rating.stars >= 4
      ? '顾客：“辛苦了，蛋糕还活着，五星。”'
      : '顾客：“平台会听到我的声音。”';

  return (
    <section
      className="result-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Delivery result"
    >
      <article className="result-note">
        <p className="eyebrow">{outcome}</p>
        <h1>{noteTitle}</h1>
        <p className="stars">{stars}</p>
        <p>{customerLine}</p>
        <p>Time remaining: {Math.ceil(state.remainingSeconds)}s</p>
        <p>{state.rating.comment}</p>
      </article>
      <button ref={restartButtonRef} type="button" onClick={onRestart}>
        Try again
      </button>
    </section>
  );
}
