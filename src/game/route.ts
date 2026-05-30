export type RouteFeature = Readonly<{
  id: string;
  kind:
    | 'speedBump'
    | 'pothole'
    | 'roadblock'
    | 'oilSlick'
    | 'windTunnel'
    | 'timeGate'
    | 'destination';
  position: Readonly<{ x: number; z: number }>;
  radius: number;
  effect: Readonly<{
    bump: number;
    collision: number;
    time: number;
    score: number;
    wind: number;
    traction: number;
    speedMultiplier: number;
  }>;
}>;

export const ROUTE_LENGTH = 185;

export const ROUTE_FEATURES: readonly RouteFeature[] = [
  createFeature('speed-bump-1', 'speedBump', { x: 0, z: 28 }, 4.5, {
    bump: 0.75,
    time: -0.25,
    score: 15,
    speedMultiplier: 0.92
  }),
  createFeature('oil-slick-1', 'oilSlick', { x: -3.4, z: 52 }, 4.2, {
    bump: 0.12,
    time: -0.35,
    score: -25,
    traction: 1.65,
    speedMultiplier: 0.98
  }),
  createFeature('time-gate-1', 'timeGate', { x: 4.8, z: 70 }, 3.5, {
    time: 4,
    score: 160,
    speedMultiplier: 1.03
  }),
  createFeature('roadblock-1', 'roadblock', { x: -4.5, z: 88 }, 3.2, {
    collision: 0.85,
    time: -1.25,
    score: -100,
    speedMultiplier: 0.48
  }),
  createFeature('wind-tunnel-1', 'windTunnel', { x: 0, z: 108 }, 5.2, {
    bump: 0.18,
    time: -0.2,
    score: 30,
    wind: 0.85,
    traction: 1.18,
    speedMultiplier: 1.04
  }),
  createFeature('pothole-1', 'pothole', { x: 5, z: 128 }, 3.8, {
    bump: 1.25,
    time: -0.65,
    score: -55,
    speedMultiplier: 0.72
  }),
  createFeature('time-gate-2', 'timeGate', { x: -4.8, z: 146 }, 3.5, {
    time: 3,
    score: 120,
    speedMultiplier: 1.02
  }),
  createFeature('roadblock-2', 'roadblock', { x: 3.8, z: 162 }, 3.2, {
    collision: 0.78,
    time: -1,
    score: -90,
    speedMultiplier: 0.52
  }),
  createFeature('customer-door', 'destination', { x: 0, z: ROUTE_LENGTH }, 9, {
    score: 500
  })
] as const;

export function getRouteFeatureHit(
  position: { x: number; z: number },
  kind?: RouteFeature['kind']
): RouteFeature | undefined {
  return ROUTE_FEATURES.find((feature) => {
    if (kind && feature.kind !== kind) return false;
    const distance = Math.hypot(position.x - feature.position.x, position.z - feature.position.z);
    return distance <= feature.radius;
  });
}

export function getRouteFeatureHits(position: { x: number; z: number }): readonly RouteFeature[] {
  return ROUTE_FEATURES.filter((feature) => {
    const distance = Math.hypot(position.x - feature.position.x, position.z - feature.position.z);
    return distance <= feature.radius;
  });
}

function createFeature(
  id: RouteFeature['id'],
  kind: RouteFeature['kind'],
  position: RouteFeature['position'],
  radius: RouteFeature['radius'],
  effect: Partial<RouteFeature['effect']>
): RouteFeature {
  return {
    id,
    kind,
    position,
    radius,
    effect: {
      bump: effect.bump ?? 0,
      collision: effect.collision ?? 0,
      time: effect.time ?? 0,
      score: effect.score ?? 0,
      wind: effect.wind ?? 0,
      traction: effect.traction ?? 1,
      speedMultiplier: effect.speedMultiplier ?? 1
    }
  };
}
