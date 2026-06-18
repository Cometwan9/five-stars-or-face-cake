import {
  createCakeState,
  getCakeCondition,
  updateCakePhysics,
  type CakeState
} from './cakePhysics';
import { calculateRating, type RatingResult } from './rating';
import { getRouteFeatureHit, getRouteFeatureHits, type RouteFeature } from './route';
import {
  createVehicleState,
  getVehicleAcceleration,
  updateVehicle,
  type VehicleInput,
  type VehicleState
} from './vehicle';

export type GamePhase = 'running' | 'handoff' | 'finished' | 'failed';

export type GameState = {
  phase: GamePhase;
  remainingSeconds: number;
  score: number;
  shortcutsTaken: number;
  tickets: number;
  vehicle: VehicleState;
  cake: CakeState;
  wind: WindState;
  trafficSignal: TrafficSignalState;
  lastFeatureIds: readonly string[];
  lastSignalId?: string;
  lastBumpId?: string;
  lastObstacleId?: string;
  lastHazardText?: string;
  rating?: RatingResult;
};

const MAX_SIMULATION_DELTA_SECONDS = 0.1;
const ORDER_SECONDS = 60;
const MAX_OVERTIME_SECONDS = 10;
const TRAFFIC_SIGNALS = [
  { id: 'signal-78', z: 78 },
  { id: 'signal-216', z: 216 },
  { id: 'signal-304', z: 304 }
] as const;

export type WindState = {
  speed: number;
  direction: -1 | 1;
  force: number;
};

export type TrafficSignalState = {
  id: string;
  z: number;
  isRed: boolean;
  secondsRemaining: number;
  policePresent: boolean;
};

export function createGameState(): GameState {
  return {
    phase: 'running',
    remainingSeconds: ORDER_SECONDS,
    score: 0,
    shortcutsTaken: 0,
    tickets: 0,
    vehicle: createVehicleState(),
    cake: createCakeState(),
    wind: createWindState(0),
    trafficSignal: createTrafficSignalState(0, 0),
    lastFeatureIds: []
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

  const elapsedRunSeconds = ORDER_SECONDS - state.remainingSeconds + elapsedSeconds;
  const wind = createWindState(elapsedRunSeconds);
  const trafficSignal = createTrafficSignalState(elapsedRunSeconds, state.vehicle.position.z);
  const baseVehicle = updateVehicle(state.vehicle, inputSafe, simulationDelta);
  const features = getRouteFeatureHits(baseVehicle.position);
  const newlyHitFeatures = features.filter((feature) => !state.lastFeatureIds.includes(feature.id));
  const effects = combineEffects(features, newlyHitFeatures);
  const signalViolation = getSignalViolation(baseVehicle.position, elapsedRunSeconds, state.lastSignalId);
  const blockingRoadblock = features.find((feature) => feature.kind === 'roadblock');
  const vehicle = applyRoadblockStickiness(
    applyRouteSpeedEffect(baseVehicle, blockingRoadblock ? Math.min(effects.speedMultiplier, 0.18) : effects.speedMultiplier),
    state.vehicle,
    inputSafe,
    blockingRoadblock
  );
  const bump = features.find((feature) => feature.kind === 'speedBump' || feature.kind === 'pothole');
  const obstacle = features.find((feature) => feature.kind === 'roadblock');
  const destination = getRouteFeatureHit(vehicle.position, 'destination');

  const cake = updateCakePhysics(
    state.cake,
    {
      acceleration: getVehicleAcceleration(vehicle, simulationDelta),
      steering: inputSafe.steer * effects.traction,
      bump: effects.bump + signalViolation.bump,
      collision: effects.collision + signalViolation.collision,
      speed: vehicle.speed,
      wind: finiteClamp(wind.force + effects.wind, -1, 1),
      traction: effects.traction
    },
    simulationDelta
  );

  const remainingSeconds = state.remainingSeconds - elapsedSeconds + effects.time + signalViolation.time;
  const shortcutsTaken = state.shortcutsTaken + newlyHitFeatures.filter((feature) => feature.kind === 'timeGate').length;
  const tickets = state.tickets + (signalViolation.ticket ? 1 : 0);
  const score = Math.max(
    0,
    state.score + effects.score + signalViolation.score + Math.max(0, vehicle.speed) * simulationDelta * 0.8
  );
  const condition = getCakeCondition(cake);
  const lastFeatureIds = features.map((feature) => feature.id);
  const lastHazardText = getHazardText(newlyHitFeatures[0], signalViolation);

  if (condition === 'faceCake') {
    return {
      ...state,
      phase: 'failed',
      remainingSeconds,
      score,
      shortcutsTaken,
      tickets,
      vehicle,
      cake,
      wind,
      trafficSignal,
      lastFeatureIds,
      lastSignalId: signalViolation.id,
      lastBumpId: bump?.id,
      lastObstacleId: obstacle?.id,
      lastHazardText,
      rating: calculateRating({ remainingSeconds, condition, shortcutsTaken, tickets })
    };
  }

  if (remainingSeconds <= -MAX_OVERTIME_SECONDS) {
    return {
      ...state,
      phase: 'failed',
      remainingSeconds,
      score,
      shortcutsTaken,
      tickets,
      vehicle,
      cake,
      wind,
      trafficSignal,
      lastFeatureIds,
      lastSignalId: signalViolation.id,
      lastBumpId: bump?.id,
      lastObstacleId: obstacle?.id,
      lastHazardText: '超时超过 10 秒：平台自动生成投诉单',
      rating: calculateRating({ remainingSeconds, condition, shortcutsTaken, tickets })
    };
  }

  if (destination) {
    const rating = calculateRating({ remainingSeconds, condition, shortcutsTaken, tickets });

    return {
      ...state,
      phase: rating.faceCake ? 'failed' : 'finished',
      remainingSeconds,
      score,
      shortcutsTaken,
      tickets,
      vehicle,
      cake,
      wind,
      trafficSignal,
      lastFeatureIds,
      lastSignalId: signalViolation.id,
      lastBumpId: bump?.id,
      lastObstacleId: obstacle?.id,
      lastHazardText,
      rating
    };
  }

  return {
    ...state,
    remainingSeconds,
    score,
    shortcutsTaken,
    tickets,
    vehicle,
    cake,
    wind,
    trafficSignal,
    lastFeatureIds,
    lastSignalId: signalViolation.id,
    lastBumpId: bump?.id,
    lastObstacleId: obstacle?.id,
    lastHazardText
  };
}

type SignalViolation = {
  id?: string;
  bump: number;
  collision: number;
  time: number;
  score: number;
  ticket: boolean;
};

function getSignalViolation(
  position: VehicleState['position'],
  elapsedRunSeconds: number,
  lastSignalId?: string
): SignalViolation {
  const signal = TRAFFIC_SIGNALS.find((candidate) => Math.abs(position.z - candidate.z) <= 3.2 && Math.abs(position.x) <= 7);

  if (!signal) return { bump: 0, collision: 0, time: 0, score: 0, ticket: false };

  const status = getSignalTiming(signal, elapsedRunSeconds);
  const isRedForForwardTraffic = status.isRed;
  if (!isRedForForwardTraffic || lastSignalId === signal.id) {
    return { id: signal.id, bump: 0, collision: 0, time: 0, score: 0, ticket: false };
  }

  return {
    id: signal.id,
    bump: status.policePresent ? 0.8 : 0.42,
    collision: status.policePresent ? 0.55 : 0.28,
    time: status.policePresent ? -3.2 : -1.2,
    score: status.policePresent ? -360 : -120,
    ticket: status.policePresent
  };
}

export function completeDelivery(state: GameState): GameState {
  if (state.phase !== 'handoff') return state;

  const condition = getCakeCondition(state.cake);
  const rating = calculateRating({
    remainingSeconds: state.remainingSeconds,
    condition,
    shortcutsTaken: state.shortcutsTaken,
    tickets: state.tickets
  });

  return {
    ...state,
    phase: rating.faceCake ? 'failed' : 'finished',
    rating
  };
}

type CombinedRouteEffects = {
  bump: number;
  collision: number;
  time: number;
  score: number;
  wind: number;
  traction: number;
  speedMultiplier: number;
};

function combineEffects(
  activeFeatures: readonly RouteFeature[],
  newlyHitFeatures: readonly RouteFeature[]
): CombinedRouteEffects {
  return {
    bump: newlyHitFeatures.reduce((total, feature) => total + feature.effect.bump, 0),
    collision: newlyHitFeatures.reduce((total, feature) => total + feature.effect.collision, 0),
    time: newlyHitFeatures.reduce((total, feature) => total + feature.effect.time, 0),
    score: newlyHitFeatures.reduce((total, feature) => total + feature.effect.score, 0),
    wind: activeFeatures.reduce((total, feature) => total + feature.effect.wind, 0),
    traction: activeFeatures.reduce((total, feature) => Math.max(total, feature.effect.traction), 1),
    speedMultiplier: newlyHitFeatures.reduce(
      (multiplier, feature) => multiplier * feature.effect.speedMultiplier,
      1
    )
  };
}

function applyRouteSpeedEffect(vehicle: VehicleState, speedMultiplier: number): VehicleState {
  if (Math.abs(speedMultiplier - 1) < 0.001) return vehicle;

  return {
    ...vehicle,
    speed: vehicle.speed * finiteClamp(speedMultiplier, 0.2, 1.4)
  };
}

function applyRoadblockStickiness(
  vehicle: VehicleState,
  previousVehicle: VehicleState,
  input: VehicleInput,
  roadblock?: RouteFeature
): VehicleState {
  if (!roadblock) return vehicle;

  const rammingThrough = input.boost > 0 && vehicle.speed > 8;
  if (rammingThrough) {
    return {
      ...vehicle,
      speed: Math.max(vehicle.speed * 0.54, 5.5),
      previousSpeed: previousVehicle.speed
    };
  }

  return {
    ...vehicle,
    speed: Math.min(vehicle.speed, Math.max(2.8, previousVehicle.speed * 0.32)),
    previousSpeed: previousVehicle.speed
  };
}

function getHazardText(feature: RouteFeature | undefined, signalViolation: SignalViolation): string | undefined {
  if (signalViolation.ticket) return '闯红灯被警察看到：罚单 + 蛋糕剧烈晃动';
  if (signalViolation.collision > 0) return '趁警察不在闯红灯：省时间，但蛋糕晃了一下';
  if (!feature) return undefined;

  switch (feature.kind) {
    case 'speedBump':
      return '减速带：车身弹跳，蛋糕受到冲击';
    case 'pothole':
      return '坑洞：蛋糕稳定度大幅下降';
    case 'roadblock':
      return '路障：撞击减速，蛋糕受损';
    case 'oilSlick':
      return '奶油地面：转向变滑，蛋糕更容易倾斜';
    case 'windTunnel':
      return '强风路段：侧风推歪蛋糕';
    case 'timeGate':
      return '时间裂缝：追回一点配送时间';
    default:
      return undefined;
  }
}

function createTrafficSignalState(elapsedRunSeconds: number, vehicleZ: number): TrafficSignalState {
  const signal = TRAFFIC_SIGNALS.find((candidate) => candidate.z >= vehicleZ - 5) ?? TRAFFIC_SIGNALS[TRAFFIC_SIGNALS.length - 1];
  const timing = getSignalTiming(signal, elapsedRunSeconds);

  return {
    id: signal.id,
    z: signal.z,
    ...timing
  };
}

function getSignalTiming(
  signal: (typeof TRAFFIC_SIGNALS)[number],
  elapsedRunSeconds: number
): Omit<TrafficSignalState, 'id' | 'z'> {
  const cycle = 12;
  const phase = (elapsedRunSeconds + signal.z * 0.037) % cycle;
  const isRed = phase >= 4;
  const secondsRemaining = Math.ceil(isRed ? cycle - phase : 4 - phase);
  const policePresent = isRed && Math.floor((elapsedRunSeconds + signal.z * 0.11) / 5) % 3 !== 1;

  return {
    isRed,
    secondsRemaining,
    policePresent
  };
}

function createWindState(elapsedRunSeconds: number): WindState {
  const wave = Math.sin(elapsedRunSeconds * 0.42) + Math.sin(elapsedRunSeconds * 0.13 + 1.7) * 0.55;
  const direction: -1 | 1 = wave >= 0 ? 1 : -1;
  const speed = 10 + Math.round(Math.abs(wave) * 18);

  return {
    speed,
    direction,
    force: direction * Math.min(1, speed / 28)
  };
}

function sanitizeInput(input: VehicleInput): VehicleInput {
  return {
    throttle: finiteClamp(input.throttle, 0, 1),
    boost: finiteClamp(input.boost, 0, 1),
    steer: finiteClamp(input.steer, -1, 1)
  };
}

function finiteClamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(min, value));
}
