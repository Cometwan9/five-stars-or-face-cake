import type { CakeCondition } from './cakePhysics';

export type RatingInput = {
  remainingSeconds: number;
  condition: CakeCondition;
};

export type RatingResult = {
  stars: 1 | 2 | 3 | 4 | 5;
  faceCake: boolean;
  title: string;
  conditionLabel: string;
  comment: string;
};

export function calculateRating(input: RatingInput): RatingResult {
  if (input.condition === 'faceCake') {
    return {
      stars: 1,
      faceCake: true,
      title: '配送失败',
      conditionLabel: '飞出盒子 / 糊脸',
      comment: '顾客：“我点的是生日蛋糕，不是奶油糊脸服务。”'
    };
  }

  if (input.remainingSeconds < 0) {
    return {
      stars: 1,
      faceCake: false,
      title: '收到差评',
      conditionLabel: '超时送达',
      comment: '顾客：“超时了，蛋糕再完整也救不了这个订单。”'
    };
  }

  if (input.condition === 'collapsed') {
    return {
      stars: input.remainingSeconds >= 0 ? 2 : 1,
      faceCake: false,
      title: '收到差评',
      conditionLabel: '结构性坍塌',
      comment: '顾客：“这蛋糕像经历过一次小型地质灾害。”'
    };
  }

  if (input.condition === 'severeTilt') {
    return {
      stars: 3,
      faceCake: false,
      title: '勉强收货',
      conditionLabel: '严重倾斜',
      comment: '顾客：“它歪得很有个性，但我今天过生日，算了。”'
    };
  }

  if (input.condition === 'slightTilt') {
    return {
      stars: 4,
      faceCake: false,
      title: '四星好评',
      conditionLabel: '轻微倾斜',
      comment: '顾客：“有点歪，但还活着，给你四星。”'
    };
  }

  return {
    stars: 5,
    faceCake: false,
    title: '五星好评',
    conditionLabel: '完美',
    comment: '顾客：“准时、完整、蜡烛还站着，五星。”'
  };
}
