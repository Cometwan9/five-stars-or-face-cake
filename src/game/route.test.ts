import { describe, expect, it } from 'vitest';
import { getRouteFeatureHit, ROUTE_FEATURES } from './route';

describe('route feature hit detection', () => {
  it('returns a feature hit inside and at its radius', () => {
    const bump = ROUTE_FEATURES[0];

    expect(getRouteFeatureHit(bump.position, 'speedBump')).toBe(bump);
    expect(
      getRouteFeatureHit({ x: bump.position.x + bump.radius, z: bump.position.z }, 'speedBump')
    ).toBe(bump);
  });

  it('returns undefined outside the feature radius', () => {
    const bump = ROUTE_FEATURES[0];

    expect(
      getRouteFeatureHit({ x: bump.position.x + bump.radius + 0.01, z: bump.position.z }, 'speedBump')
    ).toBeUndefined();
  });

  it('filters out hits with the wrong feature kind', () => {
    const obstacle = ROUTE_FEATURES.find((feature) => feature.kind === 'roadblock');

    expect(obstacle).toBeDefined();
    expect(getRouteFeatureHit(obstacle!.position, 'speedBump')).toBeUndefined();
  });

  it('exposes different route effects for different hazards', () => {
    const roadblock = ROUTE_FEATURES.find((feature) => feature.kind === 'roadblock');
    const timeGate = ROUTE_FEATURES.find((feature) => feature.kind === 'timeGate');
    const oil = ROUTE_FEATURES.find((feature) => feature.kind === 'oilSlick');

    expect(roadblock?.effect.collision).toBeGreaterThan(0);
    expect(timeGate?.effect.time).toBeGreaterThan(0);
    expect(oil?.effect.traction).toBeGreaterThan(1);
  });
});
