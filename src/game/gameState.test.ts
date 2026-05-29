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
});
