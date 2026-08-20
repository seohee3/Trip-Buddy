export type UserProfile = {
  name: string;
  bio: string;
  image: string;
};

export type TravelRecord = {
  id: string;
  /** @deprecated Use fullRegionName and the area/sigungu fields instead. */
  region: string;
  areaCode: string;
  areaName: string;
  sigunguCode: string;
  sigunguName: string;
  fullRegionName: string;
  date: string;
  startDate: string;
  endDate: string;
  title: string;
  content: string;
  images: string[];
  isPublic: boolean;
  createdAt: string;
};

export type FavoritePlace = {
  id: string;
  title: string;
  address?: string;
  image?: string;
};

export type Mascot = {
  id: string;
  regionName: string;
  mascotName: string;
  concept: string;
  image: string;
};
