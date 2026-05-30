import { getCakeCondition } from '../game/cakePhysics';
import type { GameState } from '../game/gameState';

type HudProps = {
  state: GameState;
};

export function Hud({ state }: HudProps) {
  const condition = getCakeCondition(state.cake);
  const tilt = Math.hypot(state.cake.tiltX, state.cake.tiltZ);
  const urgent = state.remainingSeconds < 18 || tilt > 0.72;

  return (
    <div className={`hud ${urgent ? 'hud-urgent' : ''}`} role="status" aria-label="Delivery status">
      <div>
        <span>Time</span>
        <strong>{Math.ceil(state.remainingSeconds)}s</strong>
      </div>
      <div>
        <span>Speed</span>
        <strong aria-label="Speed readout">{Math.round(state.vehicle.speed * 3.6)} km/h</strong>
      </div>
      <div>
        <span>Cake</span>
        <strong>{condition}</strong>
      </div>
      <div>
        <span>Wind</span>
        <strong aria-label="Wind readout">
          {state.wind.direction > 0 ? 'R' : 'L'} {state.wind.speed} km/h
        </strong>
      </div>
      <div>
        <span>Score</span>
        <strong aria-label="Score readout">{Math.round(state.score)}</strong>
      </div>
      <div className="tilt-meter" aria-label={`Cake tilt ${Math.round(tilt * 100)} percent`}>
        <i style={{ width: `${Math.min(100, tilt * 100)}%` }} />
      </div>
    </div>
  );
}
