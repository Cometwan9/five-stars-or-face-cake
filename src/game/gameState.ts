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

  const elapsedSeconds = Math.max(deltaSeconds, 0);
  const simulationDelta = Math.min(elapsedSeconds, MAX_SIMULATION_DELTA_SECONDS);
  const vehicle = updateVehicle(state.vehicle, input, simulationDelta);
  const bump = getRouteFeatureHit(vehicle.position, 'bump');
  const obstacle = getRouteFeatureHit(vehicle.position, 'obstacle');
  const destination = getRouteFeatureHit(vehicle.position, 'destination');
  const bumpImpulse = bump && bump.id !== state.lastBumpId ? 1 : 0;
  const collisionImpulse = obstacle ? 0.65 : 0;

  const cake = updateCakePhysics(
    state.cake,
    {
      acceleration: getVehicleAcceleration(vehicle, simulationDelta),
      steering: input.steer,
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
      rating: calculateRating({ remainingSeconds, condition })
    };
  }

  return {
    ...state,
    remainingSeconds,
    vehicle,
    cake,
    lastBumpId: bump?.id
  };
}
