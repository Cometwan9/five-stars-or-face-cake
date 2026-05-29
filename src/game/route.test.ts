import { describe, expect, it } from 'vitest';
import { getRouteFeatureHit, ROUTE_FEATURES } from './route';

describe('route feature hit detection', () => {
  it('returns a feature hit inside and at its radius', () => {
    const bump = ROUTE_FEATURES[0];

    expect(getRouteFeatureHit(bump.position, 'bump')).toBe(bump);
    expect(
      getRouteFeatureHit({ x: bump.position.x + bump.radius, z: bump.position.z }, 'bump')
    ).toBe(bump);
  });

  it('returns undefined outside the feature radius', () => {
    const bump = ROUTE_FEATURES[0];

    expect(
      getRouteFeatureHit({ x: bump.position.x + bump.radius + 0.01, z: bump.position.z }, 'bump')
    ).toBeUndefined();
  });

  it('filters out hits with the wrong feature kind', () => {
    const obstacle = ROUTE_FEATURES[1];

    expect(getRouteFeatureHit(obstacle.position, 'bump')).toBeUndefined();
  });
});
