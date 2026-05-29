export type RouteFeature = {
  id: string;
  kind: 'bump' | 'obstacle' | 'destination';
  position: { x: number; z: number };
  radius: number;
};

export const ROUTE_LENGTH = 185;

export const ROUTE_FEATURES: RouteFeature[] = [
  { id: 'speed-bump-1', kind: 'bump', position: { x: 0, z: 42 }, radius: 4.5 },
  { id: 'roadblock-1', kind: 'obstacle', position: { x: -4.5, z: 86 }, radius: 3.2 },
  { id: 'pothole-1', kind: 'bump', position: { x: 5, z: 124 }, radius: 3.8 },
  { id: 'customer-door', kind: 'destination', position: { x: 0, z: ROUTE_LENGTH }, radius: 9 }
];

export function getRouteFeatureHit(
  position: { x: number; z: number },
  kind: RouteFeature['kind']
): RouteFeature | undefined {
  return ROUTE_FEATURES.find((feature) => {
    if (feature.kind !== kind) return false;
    const distance = Math.hypot(position.x - feature.position.x, position.z - feature.position.z);
    return distance <= feature.radius;
  });
}
