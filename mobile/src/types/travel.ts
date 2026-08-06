export type UserProfile = {
  name: string;
  bio: string;
  image: string;
};

export type TravelRecord = {
  id: string;
  region: string;
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
  region: string;
  shortName: string;
  icon: string;
  name: string;
};
