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
};

const MAX_TILT = 1.35;

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
  const speedRisk = Math.min(1.8, Math.abs(impulse.speed) / 10);
  const steeringForce = impulse.steering * speedRisk * 2.4;
  const accelerationForce = -impulse.acceleration * 0.6;
  const shock = impulse.bump * (0.55 + speedRisk * 0.42) + impulse.collision * 1.8;

  const wobbleX = cake.wobbleX + (steeringForce + shock * 0.45) * deltaSeconds;
  const wobbleZ = cake.wobbleZ + (accelerationForce + shock * 0.7) * deltaSeconds;

  const damping = Math.max(0, 1 - 3.2 * deltaSeconds);
  const recovery = Math.max(0, 1 - 1.25 * deltaSeconds);

  const nextTiltX = clamp((cake.tiltX + wobbleX * deltaSeconds) * recovery, -MAX_TILT, MAX_TILT);
  const nextTiltZ = clamp((cake.tiltZ + wobbleZ * deltaSeconds) * recovery, -MAX_TILT, MAX_TILT);

  const tiltMagnitude = Math.hypot(nextTiltX, nextTiltZ);
  const damage =
    shock * 7.5 +
    Math.max(0, tiltMagnitude - 0.72) * 6 +
    Math.max(0, speedRisk - 1.1) * Math.abs(impulse.steering) * 1.8;

  return {
    tiltX: nextTiltX,
    tiltZ: nextTiltZ,
    wobbleX: wobbleX * damping,
    wobbleZ: wobbleZ * damping,
    stability: clamp(cake.stability - damage, 0, 100)
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
