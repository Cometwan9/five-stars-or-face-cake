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
    expect(afterBrake.tiltZ).toBeGreaterThan(0.15);

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

  it('takes structural damage from bumps and collisions', () => {
    const damaged = updateCakePhysics(
      createCakeState(),
      { acceleration: 0, steering: 0, bump: 1, collision: 1, speed: 14 },
      0.16
    );

    expect(damaged.stability).toBeLessThan(90);
    expect(getCakeCondition(damaged)).not.toBe('perfect');
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
