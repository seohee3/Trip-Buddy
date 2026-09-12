import type { TravelAxis, TravelPole, TravelTypeCode } from '@/src/travel-type/model';

export type Mate = {
  id: string;
  name: string;
  age: number;
  region: string;
  match: number;
  image: string;
  sub: string;
  isActive: boolean;
  updatedAt: string | null;
  travelTypeCode?: TravelTypeCode;
  travelTags?: string[];
  axisPreferences?: Partial<Record<TravelAxis, TravelPole>>;
};
