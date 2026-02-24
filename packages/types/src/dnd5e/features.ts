export type FeatureSourceType =
  | 'class'
  | 'subclass'
  | 'race'
  | 'background'
  | 'feat';

export type RestType = 'short' | 'long';

export interface FeatureUses {
  current: number;
  maximum: number;
  resetOn: RestType;
}

export interface Feature {
  id: string;
  name: string;
  source: string;
  sourceType: FeatureSourceType;
  description: string;
  uses?: FeatureUses;
}
