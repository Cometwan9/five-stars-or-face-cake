import { describe, expect, it } from 'vitest';
import { createVehicleState, updateVehicle } from './vehicle';

describe('vehicle movement', () => {
  it('accelerates forward with throttle', () => {
    const vehicle = updateVehicle(createVehicleState(), { throttle: 1, brake: 0, steer: 0 }, 1);

    expect(vehicle.speed).toBeGreaterThan(0);
    expect(vehicle.position.z).toBeGreaterThan(0);
  });

  it('brakes from forward motion', () => {
    const moving = updateVehicle(createVehicleState(), { throttle: 1, brake: 0, steer: 0 }, 1);
    const braking = updateVehicle(moving, { throttle: 0, brake: 1, steer: 0 }, 0.5);

    expect(braking.speed).toBeLessThan(moving.speed);
  });

  it('turns more sharply at speed than when stopped', () => {
    const stopped = updateVehicle(createVehicleState(), { throttle: 0, brake: 0, steer: 1 }, 0.5);
    const moving = updateVehicle(
      updateVehicle(createVehicleState(), { throttle: 1, brake: 0, steer: 0 }, 1),
      { throttle: 0, brake: 0, steer: 1 },
      0.5
    );

    expect(Math.abs(moving.heading)).toBeGreaterThan(Math.abs(stopped.heading));
  });
});
