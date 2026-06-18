import { describe, expect, it } from 'vitest';
import { completeDelivery, createGameState, updateGameState } from './gameState';

describe('game state', () => {
  it('counts down while running', () => {
    const state = updateGameState(createGameState(), { throttle: 0, boost: 0, steer: 0 }, 1);

    expect(state.remainingSeconds).toBe(59);
    expect(state.phase).toBe('running');
  });

  it('starts with visible wind data and updates wind while running', () => {
    const initial = createGameState();
    const next = updateGameState(initial, { throttle: 0, boost: 0, steer: 0 }, 1);

    expect(initial.score).toBe(0);
    expect(initial.wind.speed).toBeGreaterThan(0);
    expect(Math.abs(initial.wind.force)).toBeLessThanOrEqual(1);
    expect(next.wind).not.toEqual(initial.wind);
  });

  it('lets wind push the cake sideways during smooth driving', () => {
    let state = createGameState();

    for (let i = 0; i < 90; i += 1) {
      state = updateGameState(state, { throttle: 0, boost: 0, steer: 0 }, 1 / 60);
    }

    expect(Math.abs(state.cake.tiltX)).toBeGreaterThan(0);
  });

  it('shows a rated result when reaching the destination', () => {
    let state = createGameState();
    for (let i = 0; i < 3600 && state.phase === 'running'; i += 1) {
      state = updateGameState(state, { throttle: 1, boost: 0, steer: 0 }, 1 / 60);
    }

    expect(state.phase).toBe('finished');
    expect(state.remainingSeconds).toBeGreaterThan(0);
    expect(state.rating).toBeDefined();
    expect(state.rating?.stars).toBeGreaterThanOrEqual(3);
  });

  it('fails when cake reaches face-cake condition', () => {
    const state = updateGameState(
      {
        ...createGameState(),
        vehicle: {
          position: { x: 0, z: 29 },
          heading: 0,
          speed: 18,
          previousSpeed: 18
        },
        cake: {
          ...createGameState().cake,
          stability: 5
        }
      },
      { throttle: 1, boost: 0, steer: 1 },
      1 / 20
    );

    expect(state.phase).toBe('failed');
    expect(state.rating?.faceCake).toBe(true);
  });

  it('counts down large deltas without applying the whole spike to physics', () => {
    const state = updateGameState(createGameState(), { throttle: 1, boost: 0, steer: 1 }, 2);

    expect(state.remainingSeconds).toBe(58);
    expect(state.vehicle.position.z).toBeLessThan(0.1);
    expect(state.cake.stability).toBeGreaterThan(95);
  });

  it('keeps timed-out orders running until the customer handoff', () => {
    const state = updateGameState(
      {
        ...createGameState(),
        remainingSeconds: 0.01
      },
      { throttle: 0, boost: 0, steer: 0 },
      1 / 60
    );

    expect(state.phase).toBe('running');
    expect(state.remainingSeconds).toBeLessThan(0);
    expect(state.rating).toBeUndefined();
  });

  it('forces a complaint result after ten overtime seconds', () => {
    const state = updateGameState(
      {
        ...createGameState(),
        remainingSeconds: -9.99
      },
      { throttle: 0, boost: 0, steer: 0 },
      1 / 60
    );

    expect(state.phase).toBe('failed');
    expect(state.rating?.stars).toBe(1);
    expect(state.lastHazardText).toContain('超时');
  });

  it('rates overtime handoffs as complaints after delivery', () => {
    let delivered = {
      ...createGameState(),
      vehicle: {
        position: { x: 0, z: 358 },
        heading: 0,
        speed: 10,
        previousSpeed: 10
      },
      remainingSeconds: -3
    };

    delivered = updateGameState(delivered, { throttle: 1, boost: 0, steer: 0 }, 0.2);

    expect(delivered.phase).toBe('finished');
    expect(delivered.rating?.stars).toBe(1);
    expect(delivered.rating?.faceCake).toBe(false);
  });

  it('leaves terminal states unchanged by identity', () => {
    const finished = {
      ...createGameState(),
      phase: 'finished' as const
    };
    const failed = {
      ...createGameState(),
      phase: 'failed' as const
    };

    expect(updateGameState(finished, { throttle: 1, boost: 1, steer: 1 }, 1)).toBe(finished);
    expect(updateGameState(failed, { throttle: 1, boost: 1, steer: 1 }, 1)).toBe(failed);
  });

  it('keeps handoff state still until the customer is clicked', () => {
    const handoff = {
      ...createGameState(),
      phase: 'handoff' as const
    };

    expect(updateGameState(handoff, { throttle: 1, boost: 0, steer: 1 }, 1)).toBe(handoff);
    expect(completeDelivery(handoff).rating).toBeDefined();
  });

  it('clamps raw overlarge vehicle input before vehicle and cake integration', () => {
    const raw = updateGameState(createGameState(), { throttle: 20, boost: -20, steer: 20 }, 0.1);
    const clamped = updateGameState(createGameState(), { throttle: 1, boost: 0, steer: 1 }, 0.1);

    expect(raw.vehicle).toEqual(clamped.vehicle);
    expect(raw.cake).toEqual(clamped.cake);
  });

  it('treats non-finite deltas as zero without poisoning state', () => {
    for (const deltaSeconds of [Number.NaN, Infinity, -Infinity]) {
      const state = updateGameState(createGameState(), { throttle: 1, boost: 0, steer: 1 }, deltaSeconds);

      expect(state.remainingSeconds).toBe(60);
      expect(Number.isFinite(state.vehicle.position.x)).toBe(true);
      expect(Number.isFinite(state.vehicle.position.z)).toBe(true);
      expect(Number.isFinite(state.vehicle.speed)).toBe(true);
      expect(Number.isFinite(state.cake.tiltX)).toBe(true);
      expect(Number.isFinite(state.cake.tiltZ)).toBe(true);
      expect(Number.isFinite(state.cake.stability)).toBe(true);
    }
  });

  it('applies obstacle collision only once while overlapping', () => {
    const overlapping = {
      ...createGameState(),
      vehicle: {
        position: { x: -4.5, z: 102 },
        heading: 0,
        speed: 0,
        previousSpeed: 0
      }
    };

    const first = updateGameState(overlapping, { throttle: 0, boost: 0, steer: 0 }, 0.05);
    const second = updateGameState(first, { throttle: 0, boost: 0, steer: 0 }, 0.05);

    expect(first.cake.stability).toBeLessThan(overlapping.cake.stability);
    expect(second.cake.stability).toBeGreaterThanOrEqual(first.cake.stability);
    expect(second.cake.stability - first.cake.stability).toBeLessThan(0.2);
  });

  it('roadblocks slow the scooter and penalize score', () => {
    const overlapping = {
      ...createGameState(),
      score: 120,
      vehicle: {
        position: { x: -4.5, z: 102 },
        heading: 0,
        speed: 12,
        previousSpeed: 12
      }
    };

    const hit = updateGameState(overlapping, { throttle: 0, boost: 0, steer: 0 }, 0.05);

    expect(hit.vehicle.speed).toBeLessThan(overlapping.vehicle.speed);
    expect(hit.score).toBeLessThan(overlapping.score);
  });

  it('time gates reward time and score only once while overlapping', () => {
    const overlapping = {
      ...createGameState(),
      vehicle: {
        position: { x: 4.8, z: 78 },
        heading: 0,
        speed: 0,
        previousSpeed: 0
      }
    };

    const first = updateGameState(overlapping, { throttle: 0, boost: 0, steer: 0 }, 0.05);
    const second = updateGameState(first, { throttle: 0, boost: 0, steer: 0 }, 0.05);

    expect(first.remainingSeconds).toBeGreaterThan(overlapping.remainingSeconds);
    expect(first.score).toBeGreaterThan(overlapping.score);
    expect(second.score).toBe(first.score);
  });

  it('red lights penalize unsafe crossings once per intersection overlap', () => {
    const crossing = {
      ...createGameState(),
      remainingSeconds: 53,
      score: 200,
      vehicle: {
        position: { x: 0, z: 78 },
        heading: 0,
        speed: 8,
        previousSpeed: 8
      }
    };

    const first = updateGameState(crossing, { throttle: 0, boost: 0, steer: 0 }, 0.05);
    const second = updateGameState(first, { throttle: 0, boost: 0, steer: 0 }, 0.05);

    expect(first.remainingSeconds).toBeLessThan(crossing.remainingSeconds);
    expect(first.score).toBeLessThan(crossing.score);
    expect(second.score).toBeGreaterThanOrEqual(first.score);
  });

  it('records a ticket when running a red light while police are present', () => {
    const crossing = {
      ...createGameState(),
      remainingSeconds: 53,
      score: 500,
      vehicle: {
        position: { x: 0, z: 78 },
        heading: 0,
        speed: 8,
        previousSpeed: 8
      }
    };

    const ticketed = updateGameState(crossing, { throttle: 0, boost: 0, steer: 0 }, 0.05);

    expect(ticketed.tickets).toBeGreaterThanOrEqual(0);
    if (ticketed.tickets > 0) {
      expect(ticketed.lastHazardText).toContain('罚单');
    }
  });

  it('applies obstacle collision again after leaving and re-entering', () => {
    const first = updateGameState(
      {
        ...createGameState(),
        vehicle: {
          position: { x: -4.5, z: 102 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, boost: 0, steer: 0 },
      0.05
    );
    const left = updateGameState(
      {
        ...first,
        vehicle: {
          position: { x: 0, z: 118 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, boost: 0, steer: 0 },
      0.05
    );
    const reentered = updateGameState(
      {
        ...left,
        vehicle: {
          position: { x: -4.5, z: 102 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, boost: 0, steer: 0 },
      0.05
    );

    expect(reentered.cake.stability).toBeLessThan(left.cake.stability);
  });

  it('applies bump impulse again after leaving and re-entering', () => {
    const first = updateGameState(
      {
        ...createGameState(),
        vehicle: {
          position: { x: 0, z: 30 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, boost: 0, steer: 0 },
      0.05
    );
    const left = updateGameState(
      {
        ...first,
        vehicle: {
          position: { x: 0, z: 46 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, boost: 0, steer: 0 },
      0.05
    );
    const reentered = updateGameState(
      {
        ...left,
        vehicle: {
          position: { x: 0, z: 30 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, boost: 0, steer: 0 },
      0.05
    );

    expect(reentered.cake.stability).toBeLessThan(left.cake.stability);
  });

  it('does not consume bump dedupe during zero or non-finite delta overlap', () => {
    for (const deltaSeconds of [0, Number.NaN, Infinity]) {
      const overlapping = {
        ...createGameState(),
        vehicle: {
          position: { x: 0, z: 30 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      };

      const noElapsed = updateGameState(
        overlapping,
        { throttle: 0, boost: 0, steer: 0 },
        deltaSeconds
      );
      const later = updateGameState(noElapsed, { throttle: 0, boost: 0, steer: 0 }, 0.05);

      expect(noElapsed.lastBumpId).toBeUndefined();
      expect(later.cake.stability).toBeLessThan(noElapsed.cake.stability);
    }
  });

  it('does not consume obstacle dedupe during zero or non-finite delta overlap', () => {
    for (const deltaSeconds of [0, Number.NaN, Infinity]) {
      const overlapping = {
        ...createGameState(),
        vehicle: {
          position: { x: -4.5, z: 102 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      };

      const noElapsed = updateGameState(
        overlapping,
        { throttle: 0, boost: 0, steer: 0 },
        deltaSeconds
      );
      const later = updateGameState(noElapsed, { throttle: 0, boost: 0, steer: 0 }, 0.05);

      expect(noElapsed.lastObstacleId).toBeUndefined();
      expect(later.cake.stability).toBeLessThan(noElapsed.cake.stability);
    }
  });
});
