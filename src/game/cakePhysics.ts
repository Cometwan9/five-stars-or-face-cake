export type CakeCondition =
  | 'perfect'
  | 'slightTilt'
  | 'severeTilt'
  | 'collapsed'
  | 'faceCake';

export type CakeState = {
  tiltX: number;
  tiltZ: number;
  wobbleX: number;
  wobbleZ: number;
  stability: number;
};

export type CakeImpulse = {
  acceleration: number;
  steering: number;
  bump: number;
  collision: number;
  speed: number;
  wind?: number;
  traction?: number;
};

const MAX_TILT = 1.35;
const DAMAGE_REFERENCE_SECONDS = 0.16;

export function createCakeState(): CakeState {
  return {
    tiltX: 0,
    tiltZ: 0,
    wobbleX: 0,
    wobbleZ: 0,
    stability: 100
  };
}

export function updateCakePhysics(
  cake: CakeState,
  impulse: CakeImpulse,
  deltaSeconds: number
): CakeState {
  if (deltaSeconds <= 0) return cake;

  const bump = Math.max(0, impulse.bump);
  const collision = Math.max(0, impulse.collision);
  const speedRisk = Math.min(1.8, Math.abs(impulse.speed) / 10);
  const traction = finiteClamp(impulse.traction ?? 1, 0.65, 2.2);
  const steeringForce = impulse.steering * speedRisk * 2.05 * traction;
  const windForce = finiteClamp(impulse.wind ?? 0, -1, 1) * (0.42 + speedRisk * 0.14);
  const accelerationForce = -impulse.acceleration * 0.5;
  const shock = bump * (0.36 + speedRisk * 0.28) + collision * 1.45;

  const wobbleX = cake.wobbleX + (steeringForce + windForce + shock * 0.45) * deltaSeconds;
  const wobbleZ = cake.wobbleZ + (accelerationForce + shock * 0.7) * deltaSeconds;

  const damping = Math.max(0, 1 - 3.2 * deltaSeconds);
  const calmness =
    Math.abs(impulse.steering) < 0.08 &&
    Math.abs(impulse.acceleration) < 1.5 &&
    shock < 0.05 &&
    speedRisk < 0.85
      ? 1
      : 0;
  const recovery = Math.max(0, 1 - (1.25 + calmness * 1.55) * deltaSeconds);

  const nextTiltX = clamp((cake.tiltX + wobbleX * deltaSeconds) * recovery, -MAX_TILT, MAX_TILT);
  const nextTiltZ = clamp((cake.tiltZ + wobbleZ * deltaSeconds) * recovery, -MAX_TILT, MAX_TILT);

  const tiltMagnitude = Math.hypot(nextTiltX, nextTiltZ);
  const damage =
    (shock * 6.2 +
      Math.max(0, tiltMagnitude - 0.72) * 6 +
      Math.max(0, speedRisk - 1.1) * Math.abs(impulse.steering) * 1.8) *
    (deltaSeconds / DAMAGE_REFERENCE_SECONDS);

  return {
    tiltX: nextTiltX,
    tiltZ: nextTiltZ,
    wobbleX: wobbleX * damping,
    wobbleZ: wobbleZ * damping,
    stability: clamp(cake.stability - damage + calmness * 2.6 * deltaSeconds, 0, 100)
  };
}

export function getCakeCondition(cake: CakeState): CakeCondition {
  const tiltMagnitude = Math.hypot(cake.tiltX, cake.tiltZ);

  if (cake.stability <= 10 || tiltMagnitude >= 1.2) return 'faceCake';
  if (cake.stability <= 35 || tiltMagnitude >= 0.92) return 'collapsed';
  if (cake.stability <= 62 || tiltMagnitude >= 0.62) return 'severeTilt';
  if (cake.stability <= 84 || tiltMagnitude >= 0.28) return 'slightTilt';
  return 'perfect';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function finiteClamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return clamp(value, min, max);
}
