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

  const stars = state.rating.stars === 6
    ? '★★★★★★'
    : '★★★★★'.slice(0, state.rating.stars).padEnd(5, '☆');
  const outcome = state.rating.faceCake
    ? 'Face Cake'
    : state.rating.stars === 6
      ? 'Secret Route'
    : state.rating.stars <= 2
      ? 'Complaint Form'
      : 'Customer Review';
  const timeText = state.remainingSeconds >= 0
    ? `剩余 ${Math.ceil(state.remainingSeconds)} 秒`
    : `超时 ${Math.ceil(Math.abs(state.remainingSeconds))} 秒`;

  return (
    <section
      className="result-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Delivery result"
    >
      <article className="result-note">
        <p className="eyebrow">{outcome}</p>
        <h1>{state.rating.title}</h1>
        <p className="stars">{stars}</p>
        <p>{state.rating.comment}</p>
        <p>{timeText}</p>
        <p>蛋糕状态：{state.rating.conditionLabel}</p>
        {state.tickets > 0 ? <p>罚单：{state.tickets} 张</p> : null}
        {state.shortcutsTaken > 0 ? <p>近路：{state.shortcutsTaken} 次</p> : null}
      </article>
      <button ref={restartButtonRef} type="button" onClick={onRestart}>
        Try again
      </button>
    </section>
  );
}
