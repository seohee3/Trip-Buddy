import AsyncStorage from '@react-native-async-storage/async-storage';

export type FavoritePlace = {
  id: string;
  title: string;
  areaName: string;
  sigunguName: string;
  address: string;
  category: string;
  image: string;
  rating: string;
  distance: string;
};

const FAVORITE_PLACES_KEY = 'TRIP_BUDDY_FAVORITE_PLACES';

export async function getFavoritePlaces(): Promise<FavoritePlace[]> {
  const saved = await AsyncStorage.getItem(FAVORITE_PLACES_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export async function isFavoritePlace(placeId: string): Promise<boolean> {
  const places = await getFavoritePlaces();

  return places.some((place) => place.id === placeId);
}

export async function addFavoritePlace(place: FavoritePlace) {
  const places = await getFavoritePlaces();
  const alreadyExists = places.some((savedPlace) => savedPlace.id === place.id);

  if (alreadyExists) {
    return places;
  }

  const nextPlaces = [place, ...places];

  await AsyncStorage.setItem(FAVORITE_PLACES_KEY, JSON.stringify(nextPlaces));

  return nextPlaces;
}

export async function removeFavoritePlace(placeId: string) {
  const places = await getFavoritePlaces();
  const nextPlaces = places.filter((place) => place.id !== placeId);

  await AsyncStorage.setItem(FAVORITE_PLACES_KEY, JSON.stringify(nextPlaces));

  return nextPlaces;
}