import { describe, expect, it } from 'vitest';
import { createGameState, updateGameState } from './gameState';

describe('game state', () => {
  it('counts down while running', () => {
    const state = updateGameState(createGameState(), { throttle: 0, brake: 0, steer: 0 }, 1);

    expect(state.remainingSeconds).toBe(74);
    expect(state.phase).toBe('running');
  });

  it('finishes when reaching the destination', () => {
    let state = createGameState();
    for (let i = 0; i < 900 && state.phase === 'running'; i += 1) {
      state = updateGameState(state, { throttle: 1, brake: 0, steer: 0 }, 1 / 60);
    }

    expect(state.phase).toBe('finished');
    expect(state.rating).toBeDefined();
  });

  it('fails when cake reaches face-cake condition', () => {
    const state = updateGameState(
      {
        ...createGameState(),
        vehicle: {
          position: { x: 0, z: 41 },
          heading: 0,
          speed: 18,
          previousSpeed: 18
        },
        cake: {
          ...createGameState().cake,
          stability: 11
        }
      },
      { throttle: 1, brake: 0, steer: 1 },
      1 / 20
    );

    expect(state.phase).toBe('failed');
    expect(state.rating?.faceCake).toBe(true);
  });

  it('counts down large deltas without applying the whole spike to physics', () => {
    const state = updateGameState(createGameState(), { throttle: 1, brake: 0, steer: 1 }, 2);

    expect(state.remainingSeconds).toBe(73);
    expect(state.vehicle.position.z).toBeLessThan(0.1);
    expect(state.cake.stability).toBeGreaterThan(95);
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

    expect(updateGameState(finished, { throttle: 1, brake: 1, steer: 1 }, 1)).toBe(finished);
    expect(updateGameState(failed, { throttle: 1, brake: 1, steer: 1 }, 1)).toBe(failed);
  });

  it('clamps raw overlarge vehicle input before vehicle and cake integration', () => {
    const raw = updateGameState(createGameState(), { throttle: 20, brake: -20, steer: 20 }, 0.1);
    const clamped = updateGameState(createGameState(), { throttle: 1, brake: 0, steer: 1 }, 0.1);

    expect(raw.vehicle).toEqual(clamped.vehicle);
    expect(raw.cake).toEqual(clamped.cake);
  });

  it('treats non-finite deltas as zero without poisoning state', () => {
    for (const deltaSeconds of [Number.NaN, Infinity, -Infinity]) {
      const state = updateGameState(createGameState(), { throttle: 1, brake: 0, steer: 1 }, deltaSeconds);

      expect(state.remainingSeconds).toBe(75);
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
        position: { x: -4.5, z: 86 },
        heading: 0,
        speed: 0,
        previousSpeed: 0
      }
    };

    const first = updateGameState(overlapping, { throttle: 0, brake: 0, steer: 0 }, 0.05);
    const second = updateGameState(first, { throttle: 0, brake: 0, steer: 0 }, 0.05);

    expect(first.cake.stability).toBeLessThan(overlapping.cake.stability);
    expect(second.cake.stability).toBe(first.cake.stability);
  });

  it('applies obstacle collision again after leaving and re-entering', () => {
    const first = updateGameState(
      {
        ...createGameState(),
        vehicle: {
          position: { x: -4.5, z: 86 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, brake: 0, steer: 0 },
      0.05
    );
    const left = updateGameState(
      {
        ...first,
        vehicle: {
          position: { x: 0, z: 100 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, brake: 0, steer: 0 },
      0.05
    );
    const reentered = updateGameState(
      {
        ...left,
        vehicle: {
          position: { x: -4.5, z: 86 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, brake: 0, steer: 0 },
      0.05
    );

    expect(reentered.cake.stability).toBeLessThan(left.cake.stability);
  });

  it('applies bump impulse again after leaving and re-entering', () => {
    const first = updateGameState(
      {
        ...createGameState(),
        vehicle: {
          position: { x: 0, z: 42 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, brake: 0, steer: 0 },
      0.05
    );
    const left = updateGameState(
      {
        ...first,
        vehicle: {
          position: { x: 0, z: 55 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, brake: 0, steer: 0 },
      0.05
    );
    const reentered = updateGameState(
      {
        ...left,
        vehicle: {
          position: { x: 0, z: 42 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      },
      { throttle: 0, brake: 0, steer: 0 },
      0.05
    );

    expect(reentered.cake.stability).toBeLessThan(left.cake.stability);
  });

  it('does not consume bump dedupe during zero or non-finite delta overlap', () => {
    for (const deltaSeconds of [0, Number.NaN, Infinity]) {
      const overlapping = {
        ...createGameState(),
        vehicle: {
          position: { x: 0, z: 42 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      };

      const noElapsed = updateGameState(
        overlapping,
        { throttle: 0, brake: 0, steer: 0 },
        deltaSeconds
      );
      const later = updateGameState(noElapsed, { throttle: 0, brake: 0, steer: 0 }, 0.05);

      expect(noElapsed.lastBumpId).toBeUndefined();
      expect(later.cake.stability).toBeLessThan(noElapsed.cake.stability);
    }
  });

  it('does not consume obstacle dedupe during zero or non-finite delta overlap', () => {
    for (const deltaSeconds of [0, Number.NaN, Infinity]) {
      const overlapping = {
        ...createGameState(),
        vehicle: {
          position: { x: -4.5, z: 86 },
          heading: 0,
          speed: 0,
          previousSpeed: 0
        }
      };

      const noElapsed = updateGameState(
        overlapping,
        { throttle: 0, brake: 0, steer: 0 },
        deltaSeconds
      );
      const later = updateGameState(noElapsed, { throttle: 0, brake: 0, steer: 0 }, 0.05);

      expect(noElapsed.lastObstacleId).toBeUndefined();
      expect(later.cake.stability).toBeLessThan(noElapsed.cake.stability);
    }
  });
});
