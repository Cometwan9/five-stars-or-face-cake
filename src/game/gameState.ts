import {
  createCakeState,
  getCakeCondition,
  updateCakePhysics,
  type CakeState
} from './cakePhysics';
import { calculateRating, type RatingResult } from './rating';
import { getRouteFeatureHit } from './route';
import {
  createVehicleState,
  getVehicleAcceleration,
  updateVehicle,
  type VehicleInput,
  type VehicleState
} from './vehicle';

export type GamePhase = 'running' | 'finished' | 'failed';

export type GameState = {
  phase: GamePhase;
  remainingSeconds: number;
  vehicle: VehicleState;
  cake: CakeState;
  lastBumpId?: string;
  lastObstacleId?: string;
  rating?: RatingResult;
};

const MAX_SIMULATION_DELTA_SECONDS = 0.1;

export function createGameState(): GameState {
  return {
    phase: 'running',
    remainingSeconds: 75,
    vehicle: createVehicleState(),
    cake: createCakeState()
  };
}

export function updateGameState(
  state: GameState,
  input: VehicleInput,
  deltaSeconds: number
): GameState {
  if (state.phase !== 'running') return state;

  const inputSafe = sanitizeInput(input);
  const elapsedSeconds = Number.isFinite(deltaSeconds) && deltaSeconds > 0 ? deltaSeconds : 0;
  const simulationDelta = Math.min(elapsedSeconds, MAX_SIMULATION_DELTA_SECONDS);
  if (simulationDelta === 0) return state;

  const vehicle = updateVehicle(state.vehicle, inputSafe, simulationDelta);
  const bump = getRouteFeatureHit(vehicle.position, 'bump');
  const obstacle = getRouteFeatureHit(vehicle.position, 'obstacle');
  const destination = getRouteFeatureHit(vehicle.position, 'destination');
  const bumpImpulse = bump && bump.id !== state.lastBumpId ? 1 : 0;
  const collisionImpulse = obstacle && obstacle.id !== state.lastObstacleId ? 0.65 : 0;

  const cake = updateCakePhysics(
    state.cake,
    {
      acceleration: getVehicleAcceleration(vehicle, simulationDelta),
      steering: inputSafe.steer,
      bump: bumpImpulse,
      collision: collisionImpulse,
      speed: vehicle.speed
    },
    simulationDelta
  );

  const remainingSeconds = state.remainingSeconds - elapsedSeconds;
  const condition = getCakeCondition(cake);

  if (condition === 'faceCake') {
    return {
      ...state,
      phase: 'failed',
      remainingSeconds,
      vehicle,
      cake,
      lastBumpId: bump?.id,
      lastObstacleId: obstacle?.id,
      rating: calculateRating({ remainingSeconds, condition })
    };
  }

  if (destination) {
    return {
      ...state,
      phase: 'finished',
      remainingSeconds,
      vehicle,
      cake,
      lastBumpId: bump?.id,
      lastObstacleId: obstacle?.id,
      rating: calculateRating({ remainingSeconds, condition })
    };
  }

  return {
    ...state,
    remainingSeconds,
    vehicle,
    cake,
    lastBumpId: bump?.id,
    lastObstacleId: obstacle?.id
  };
}

function sanitizeInput(input: VehicleInput): VehicleInput {
  return {
    throttle: finiteClamp(input.throttle, 0, 1),
    brake: finiteClamp(input.brake, 0, 1),
    steer: finiteClamp(input.steer, -1, 1)
  };
}

function finiteClamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(min, value));
}
