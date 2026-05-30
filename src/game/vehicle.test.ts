import { describe, expect, it } from 'vitest';
import {
  createVehicleState,
  getVehicleAcceleration,
  type VehicleState,
  updateVehicle
} from './vehicle';

describe('vehicle movement', () => {
  it('accelerates forward with throttle', () => {
    const vehicle = updateVehicle(createVehicleState(), { throttle: 1, boost: 0, steer: 0 }, 1);

    expect(vehicle.speed).toBeGreaterThan(0);
    expect(vehicle.position.z).toBeGreaterThan(0);
  });

  it('boosts past normal throttle speed', () => {
    const moving = updateVehicle(createVehicleState(), { throttle: 1, boost: 0, steer: 0 }, 1);
    const boosting = updateVehicle(moving, { throttle: 1, boost: 1, steer: 0 }, 0.5);

    expect(boosting.speed).toBeGreaterThan(moving.speed);
  });

  it('turns more sharply at speed than when stopped', () => {
    const stopped = updateVehicle(createVehicleState(), { throttle: 0, boost: 0, steer: 1 }, 0.5);
    const moving = updateVehicle(
      updateVehicle(createVehicleState(), { throttle: 1, boost: 0, steer: 0 }, 1),
      { throttle: 0, boost: 0, steer: 1 },
      0.5
    );

    expect(Math.abs(moving.heading)).toBeGreaterThan(Math.abs(stopped.heading));
  });

  it('coasting drag stops at zero without sign flip', () => {
    const forward = updateVehicle(
      { ...createVehicleState(), speed: 0.5, previousSpeed: 1 },
      { throttle: 0, boost: 0, steer: 0 },
      1
    );

    expect(forward.speed).toBe(0);
  });

  it('returns unchanged state for nonpositive deltaSeconds', () => {
    const state = updateVehicle(createVehicleState(), { throttle: 1, boost: 0, steer: 0 }, 1);

    expect(updateVehicle(state, { throttle: 1, boost: 1, steer: 1 }, 0)).toBe(state);
    expect(updateVehicle(state, { throttle: 1, boost: 1, steer: 1 }, -1)).toBe(state);
  });

  it('clamps speed at normal and boost limits', () => {
    const fastForward = updateVehicle(
      { ...createVehicleState(), speed: 17.5 },
      { throttle: 1, boost: 0, steer: 0 },
      1
    );
    const boosted = updateVehicle(
      { ...createVehicleState(), speed: 23.5 },
      { throttle: 1, boost: 1, steer: 0 },
      1
    );

    expect(fastForward.speed).toBe(17.2);
    expect(boosted.speed).toBe(24);
  });

  it('clamps input values to bounded movement behavior', () => {
    const vehicle = updateVehicle(createVehicleState(), { throttle: 20, boost: -20, steer: 20 }, 1);

    expect(vehicle.speed).toBe(7.2);
    expect(vehicle.heading).toBe(1.55);
    expect(Number.isFinite(vehicle.position.x)).toBe(true);
    expect(Number.isFinite(vehicle.position.z)).toBe(true);
  });
});

describe('vehicle acceleration', () => {
  it('returns expected speed delta over time', () => {
    const state: VehicleState = {
      position: { x: 0, z: 0 },
      heading: 0,
      speed: 9,
      previousSpeed: 5
    };

    expect(getVehicleAcceleration(state, 2)).toBe(2);
  });

  it('returns zero for nonpositive deltaSeconds', () => {
    const state: VehicleState = {
      position: { x: 0, z: 0 },
      heading: 0,
      speed: 9,
      previousSpeed: 5
    };

    expect(getVehicleAcceleration(state, 0)).toBe(0);
    expect(getVehicleAcceleration(state, -1)).toBe(0);
  });
});
