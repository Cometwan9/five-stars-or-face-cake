import { getCakeCondition } from '../game/cakePhysics';
import type { GameState } from '../game/gameState';

type DisasterLayerProps = {
  state: GameState;
};

const FAIRIES = [
  { className: 'route', label: '路线种种' },
  { className: 'cream', label: '奶油种种' },
  { className: 'wind', label: '风速种种' }
];

export function DisasterLayer({ state }: DisasterLayerProps) {
  const condition = getCakeCondition(state.cake);
  const tilt = Math.hypot(state.cake.tiltX, state.cake.tiltZ);
  const scooterLean = Math.max(-10, Math.min(10, state.vehicle.speed * 0.35 * state.wind.direction));
  const cakeTiltX = Math.max(-18, Math.min(18, state.cake.tiltX * 18));
  const cakeTiltZ = Math.max(-16, Math.min(16, state.cake.tiltZ * 16));

  return (
    <div className="disaster-layer" aria-hidden="true">
      <div className="world-perspective">
        <div className="road-ribbon">
          <div className="lane-line lane-line-a" />
          <div className="lane-line lane-line-b" />
          <div className="speed-bump visual-bump-a" />
          <div className="speed-bump visual-bump-b" />
          <div className="pothole" />
          <div className="construction-barrier">
            <i />
            <i />
            <i />
          </div>
          <div className="traffic-cones">
            <i />
            <i />
            <i />
          </div>
        </div>

        {FAIRIES.map((fairy, index) => (
          <div key={fairy.className} className={`fairy fairy-${fairy.className}`}>
            <i />
            <span>{fairy.label}</span>
            <b>{index === 2 ? `${state.wind.speed}` : '?'}</b>
          </div>
        ))}

        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="wind-streak"
            style={{
              ['--wind-x' as string]: `${state.wind.direction * (12 + index * 4)}px`,
              ['--wind-y' as string]: `${90 + index * 58}px`,
              ['--wind-tilt' as string]: `${state.wind.direction * -14}deg`
            }}
          />
        ))}
      </div>

      <div className="scooter-cockpit" style={{ transform: `translateX(-50%) rotate(${scooterLean}deg)` }}>
        <div className="scooter-bar" />
        <div className="scooter-grip scooter-grip-left" />
        <div className="scooter-grip scooter-grip-right" />
        <div className="scooter-front">
          <span />
        </div>
        <div className="scooter-wheel scooter-wheel-left" />
        <div className="scooter-wheel scooter-wheel-right" />
        <div className="tray" />
        <div
          className={`visual-cake cake-${condition}`}
          style={{
            transform: `translateX(-50%) rotateX(${cakeTiltZ}deg) rotateZ(${-cakeTiltX}deg)`,
            ['--cake-stress' as string]: `${Math.min(1, tilt)}`
          }}
        >
          <div className="cake-body" />
          <div className="cake-cream" />
          <i className="berry berry-a" />
          <i className="berry berry-b" />
          <i className="crumb crumb-a" />
          <i className="crumb crumb-b" />
        </div>
      </div>
    </div>
  );
}
