import type { CakeCondition } from './cakePhysics';

export type RatingInput = {
  remainingSeconds: number;
  condition: CakeCondition;
  shortcutsTaken?: number;
  tickets?: number;
};

export type RatingResult = {
  stars: 1 | 2 | 3 | 4 | 5 | 6;
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
      comment: input.remainingSeconds <= -10
        ? '顾客：“你已经超时十秒了，平台自动投诉。”'
        : '顾客：“超时了，蛋糕再完整也救不了这个订单。”'
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

  if ((input.shortcutsTaken ?? 0) > 0 && (input.tickets ?? 0) === 0 && input.remainingSeconds >= 12) {
    return {
      stars: 6,
      faceCake: false,
      title: '隐藏结局：六星好评',
      conditionLabel: '完美 + 抄近路',
      comment: '顾客：“你怎么比我下单还早到？六星，别问系统怎么算。”'
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
