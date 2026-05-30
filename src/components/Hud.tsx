import { getCakeCondition } from '../game/cakePhysics';
import type { GameState } from '../game/gameState';

type HudProps = {
  state: GameState;
};

export function Hud({ state }: HudProps) {
  const condition = getCakeCondition(state.cake);
  const tilt = Math.hypot(state.cake.tiltX, state.cake.tiltZ);
  const urgent = state.remainingSeconds < 18 || tilt > 0.72;
  const speedKmh = Math.round(state.vehicle.speed * 3.6);
  const speedNeedle = Math.max(-126, Math.min(126, -126 + speedKmh * 4.2));
  const timeLabel = state.remainingSeconds >= 0
    ? `${Math.ceil(state.remainingSeconds)}s`
    : `超时 ${Math.ceil(Math.abs(state.remainingSeconds))}s`;

  return (
    <>
      <div className={`hud ${urgent ? 'hud-urgent' : ''}`} role="status" aria-label="Delivery status">
        <div>
          <span>Time</span>
          <strong>{timeLabel}</strong>
        </div>
        <div>
          <span>Speed</span>
          <strong aria-label="Speed readout">{speedKmh} km/h</strong>
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
      {state.lastHazardText ? (
        <div className="hazard-flash" role="alert">
          {state.lastHazardText}
        </div>
      ) : null}
      <div className="speedometer" aria-label={`Scooter speedometer ${speedKmh} kilometers per hour`}>
        <span>km/h</span>
        <i style={{ transform: `translateX(-50%) rotate(${speedNeedle}deg)` }} />
        <strong>{speedKmh}</strong>
      </div>
    </>
  );
}
