import type { CakeCondition } from './cakePhysics';

export type RatingInput = {
  remainingSeconds: number;
  condition: CakeCondition;
};

export type RatingResult = {
  stars: 1 | 2 | 3 | 4 | 5;
  faceCake: boolean;
  comment: string;
};

export function calculateRating(input: RatingInput): RatingResult {
  if (input.condition === 'faceCake') {
    return {
      stars: 1,
      faceCake: true,
      comment: 'I ordered birthday cake, not facial frosting therapy.'
    };
  }

  if (input.remainingSeconds < 0) {
    return {
      stars: 1,
      faceCake: false,
      comment: 'Order timed out. Complaint form printed before the door opened.'
    };
  }

  if (input.condition === 'collapsed') {
    return {
      stars: input.remainingSeconds >= 0 ? 2 : 1,
      faceCake: false,
      comment: 'This cake has experienced a major geological event.'
    };
  }

  if (input.condition === 'severeTilt') {
    return {
      stars: 3,
      faceCake: false,
      comment: 'It arrived doing yoga. I respect the effort.'
    };
  }

  if (input.condition === 'slightTilt') {
    return {
      stars: 4,
      faceCake: false,
      comment: 'A little sideways, but emotionally sincere.'
    };
  }

  return {
    stars: 5,
    faceCake: false,
    comment: 'Perfect. I am moved. The cake is moved less.'
  };
}
