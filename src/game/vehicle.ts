export type VehicleState = {
  position: { x: number; z: number };
  heading: number;
  speed: number;
  previousSpeed: number;
};

export type VehicleInput = {
  throttle: number;
  brake: number;
  steer: number;
};

const MAX_SPEED = 18;
const ACCELERATION = 8.5;
const BRAKING = 14;
const DRAG = 1.8;
const TURN_RATE = 1.55;

export function createVehicleState(): VehicleState {
  return {
    position: { x: 0, z: 0 },
    heading: 0,
    speed: 0,
    previousSpeed: 0
  };
}

export function updateVehicle(
  state: VehicleState,
  input: VehicleInput,
  deltaSeconds: number
): VehicleState {
  if (deltaSeconds <= 0) return state;

  const throttle = clamp(input.throttle, 0, 1);
  const brake = clamp(input.brake, 0, 1);
  const steer = clamp(input.steer, -1, 1);

  const acceleration = throttle * ACCELERATION - brake * BRAKING - Math.sign(state.speed) * DRAG;
  const nextSpeed = state.speed + acceleration * deltaSeconds;
  const speed =
    throttle === 0 && brake === 0 && Math.sign(nextSpeed) !== Math.sign(state.speed)
      ? 0
      : clamp(nextSpeed, -3, MAX_SPEED);
  const speedTurnFactor = Math.min(1, Math.abs(speed) / 7);
  const heading = state.heading + steer * TURN_RATE * speedTurnFactor * deltaSeconds;

  return {
    position: {
      x: state.position.x + Math.sin(heading) * speed * deltaSeconds,
      z: state.position.z + Math.cos(heading) * speed * deltaSeconds
    },
    heading,
    speed,
    previousSpeed: state.speed
  };
}

export function getVehicleAcceleration(state: VehicleState, deltaSeconds: number): number {
  if (deltaSeconds <= 0) return 0;
  return (state.speed - state.previousSpeed) / deltaSeconds;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
