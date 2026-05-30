import { describe, expect, it } from 'vitest';
import {
  createCakeState,
  getCakeCondition,
  updateCakePhysics,
  type CakeImpulse
} from './cakePhysics';

describe('cake physics', () => {
  it('starts perfect and upright', () => {
    const cake = createCakeState();

    expect(cake.tiltX).toBe(0);
    expect(cake.tiltZ).toBe(0);
    expect(cake.stability).toBe(100);
    expect(getCakeCondition(cake)).toBe('perfect');
  });

  it('leans under braking and recovers when driving smoothly', () => {
    const braking: CakeImpulse = {
      acceleration: -9,
      steering: 0,
      bump: 0,
      collision: 0,
      speed: 12
    };

    const afterBrake = updateCakePhysics(createCakeState(), braking, 0.2);
    expect(afterBrake.tiltZ).toBeGreaterThan(0.12);

    let recovered = afterBrake;
    for (let i = 0; i < 80; i += 1) {
      recovered = updateCakePhysics(
        recovered,
        { acceleration: 0, steering: 0, bump: 0, collision: 0, speed: 4 },
        1 / 60
      );
    }

    expect(Math.abs(recovered.tiltZ)).toBeLessThan(Math.abs(afterBrake.tiltZ));
  });

  it('returns the same state for zero delta', () => {
    const cake = {
      tiltX: 0.2,
      tiltZ: -0.1,
      wobbleX: 0.4,
      wobbleZ: -0.3,
      stability: 72
    };

    expect(
      updateCakePhysics(
        cake,
        { acceleration: -10, steering: 1, bump: 1, collision: 1, speed: 16 },
        0
      )
    ).toEqual(cake);
  });

  it('returns the same state for negative delta', () => {
    const cake = {
      tiltX: -0.2,
      tiltZ: 0.3,
      wobbleX: -0.4,
      wobbleZ: 0.5,
      stability: 68
    };

    expect(
      updateCakePhysics(
        cake,
        { acceleration: 10, steering: -1, bump: 1, collision: 1, speed: 16 },
        -0.1
      )
    ).toEqual(cake);
  });

  it('takes structural damage from bumps and collisions', () => {
    const damaged = updateCakePhysics(
      createCakeState(),
      { acceleration: 0, steering: 0, bump: 1, collision: 1, speed: 14 },
      0.16
    );

    expect(damaged.stability).toBeLessThan(94);
    expect(getCakeCondition(damaged)).not.toBe('perfect');
  });

  it('slowly repairs structural stability during smooth recovery', () => {
    const damaged = updateCakePhysics(
      createCakeState(),
      { acceleration: 0, steering: 0, bump: 1, collision: 1, speed: 14 },
      0.16
    );

    let recovered = damaged;
    for (let i = 0; i < 60; i += 1) {
      recovered = updateCakePhysics(
        recovered,
        { acceleration: 0, steering: 0, bump: 0, collision: 0, speed: 4 },
        1 / 60
      );
    }

    expect(recovered.stability).toBeGreaterThan(damaged.stability);
    expect(recovered.stability).toBeLessThanOrEqual(100);
  });

  it('does not increase stability from negative bump or collision values', () => {
    const cake = {
      tiltX: 0,
      tiltZ: 0,
      wobbleX: 0,
      wobbleZ: 0,
      stability: 50
    };

    const updated = updateCakePhysics(
      cake,
      { acceleration: 0, steering: 0, bump: -1, collision: -1, speed: 10 },
      0.16
    );

    expect(updated.stability).toBeGreaterThanOrEqual(cake.stability);
    expect(updated.stability).toBeLessThanOrEqual(100);
  });

  it('produces comparable damage over the same elapsed time at different frame rates', () => {
    const impulse: CakeImpulse = {
      acceleration: 0,
      steering: 0.35,
      bump: 0.15,
      collision: 0.05,
      speed: 12
    };

    let lowFrameRate = createCakeState();
    for (let i = 0; i < 10; i += 1) {
      lowFrameRate = updateCakePhysics(lowFrameRate, impulse, 0.1);
    }

    let highFrameRate = createCakeState();
    for (let i = 0; i < 60; i += 1) {
      highFrameRate = updateCakePhysics(highFrameRate, impulse, 1 / 60);
    }

    const lowFrameRateDamage = 100 - lowFrameRate.stability;
    const highFrameRateDamage = 100 - highFrameRate.stability;

    expect(Math.abs(lowFrameRateDamage - highFrameRateDamage)).toBeLessThan(4);
  });

  it('enters face-cake failure after catastrophic instability', () => {
    let cake = createCakeState();
    for (let i = 0; i < 12; i += 1) {
      cake = updateCakePhysics(
        cake,
        { acceleration: -12, steering: 1, bump: 1, collision: 1, speed: 18 },
        0.2
      );
    }

    expect(getCakeCondition(cake)).toBe('faceCake');
  });
});
