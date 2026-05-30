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

export const ROUTE_LENGTH = 360;

export const ROUTE_FEATURES: readonly RouteFeature[] = [
  createFeature('speed-bump-1', 'speedBump', { x: 0, z: 30 }, 4.5, {
    bump: 0.95,
    time: -0.35,
    score: 15,
    speedMultiplier: 0.78
  }),
  createFeature('oil-slick-1', 'oilSlick', { x: -3.4, z: 54 }, 4.2, {
    bump: 0.06,
    time: -0.35,
    score: -25,
    traction: 1.45,
    speedMultiplier: 0.98
  }),
  createFeature('time-gate-1', 'timeGate', { x: 4.8, z: 78 }, 3.5, {
    time: 2,
    score: 120,
    speedMultiplier: 1.03
  }),
  createFeature('roadblock-1', 'roadblock', { x: -4.5, z: 102 }, 3.2, {
    bump: 0.45,
    collision: 1.65,
    time: -2.25,
    score: -220,
    speedMultiplier: 0.3
  }),
  createFeature('wind-tunnel-1', 'windTunnel', { x: 0, z: 126 }, 5.2, {
    bump: 0.08,
    time: -0.2,
    score: 30,
    wind: 0.65,
    traction: 1.1,
    speedMultiplier: 1.04
  }),
  createFeature('pothole-1', 'pothole', { x: 5, z: 156 }, 3.8, {
    bump: 1.8,
    time: -1.15,
    score: -120,
    speedMultiplier: 0.62
  }),
  createFeature('speed-bump-2', 'speedBump', { x: -2.8, z: 188 }, 4.2, {
    bump: 0.9,
    time: -0.35,
    score: 15,
    speedMultiplier: 0.78
  }),
  createFeature('time-gate-2', 'timeGate', { x: -4.8, z: 216 }, 3.5, {
    time: 2,
    score: 110,
    speedMultiplier: 1.02
  }),
  createFeature('roadblock-2', 'roadblock', { x: 3.8, z: 244 }, 3.2, {
    bump: 0.4,
    collision: 1.55,
    time: -2,
    score: -200,
    speedMultiplier: 0.34
  }),
  createFeature('oil-slick-2', 'oilSlick', { x: 3.2, z: 274 }, 4.2, {
    bump: 0.06,
    time: -0.3,
    score: -25,
    traction: 1.45,
    speedMultiplier: 0.98
  }),
  createFeature('wind-tunnel-2', 'windTunnel', { x: -1.8, z: 304 }, 5.2, {
    bump: 0.08,
    time: -0.2,
    score: 35,
    wind: -0.62,
    traction: 1.1,
    speedMultiplier: 1.04
  }),
  createFeature('pothole-2', 'pothole', { x: -4.8, z: 328 }, 3.8, {
    bump: 1.65,
    time: -1,
    score: -110,
    speedMultiplier: 0.66
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
