import { describe, expect, it } from 'vitest';
import { calculateRating } from './rating';

describe('rating', () => {
  it('awards five stars for on-time perfect delivery', () => {
    expect(calculateRating({ remainingSeconds: 12, condition: 'perfect' }).stars).toBe(5);
  });

  it('deducts for slight tilt', () => {
    expect(calculateRating({ remainingSeconds: 10, condition: 'slightTilt' }).stars).toBe(4);
  });

  it('gives three stars for late intact cake', () => {
    expect(calculateRating({ remainingSeconds: -4, condition: 'perfect' }).stars).toBe(3);
  });

  it('uses face-cake result for catastrophic failure', () => {
    const result = calculateRating({ remainingSeconds: 20, condition: 'faceCake' });

    expect(result.stars).toBe(1);
    expect(result.faceCake).toBe(true);
  });
});
