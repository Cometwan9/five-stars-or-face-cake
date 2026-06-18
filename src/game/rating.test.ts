import { describe, expect, it } from 'vitest';
import { calculateRating } from './rating';

describe('rating', () => {
  it('awards five stars for on-time perfect delivery', () => {
    expect(calculateRating({ remainingSeconds: 12, condition: 'perfect' }).stars).toBe(5);
  });

  it('awards six stars for fast perfect shortcut delivery without tickets', () => {
    const result = calculateRating({
      remainingSeconds: 18,
      condition: 'perfect',
      shortcutsTaken: 1,
      tickets: 0
    });

    expect(result.stars).toBe(6);
    expect(result.title).toContain('六星');
  });

  it('deducts for slight tilt', () => {
    expect(calculateRating({ remainingSeconds: 10, condition: 'slightTilt' }).stars).toBe(4);
  });

  it('fails timed-out orders with a complaint even if the cake is intact', () => {
    const result = calculateRating({ remainingSeconds: -4, condition: 'perfect' });

    expect(result.stars).toBe(1);
    expect(result.faceCake).toBe(false);
  });

  it('uses face-cake result for catastrophic failure', () => {
    const result = calculateRating({ remainingSeconds: 20, condition: 'faceCake' });

    expect(result.stars).toBe(1);
    expect(result.faceCake).toBe(true);
  });
});
