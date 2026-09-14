import AsyncStorage from '@react-native-async-storage/async-storage';
import { userStorageKey } from './travelStorage';

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

export async function getFavoritePlaces(uid: string): Promise<FavoritePlace[]> {
  const saved = await AsyncStorage.getItem(userStorageKey(FAVORITE_PLACES_KEY, uid));

  if (!saved) {
    return [];
  }

  try {
    const places: unknown = JSON.parse(saved);
    return Array.isArray(places) ? places : [];
  } catch {
    return [];
  }
}

export async function isFavoritePlace(uid: string, placeId: string): Promise<boolean> {
  const places = await getFavoritePlaces(uid);

  return places.some((place) => place.id === placeId);
}

export async function addFavoritePlace(uid: string, place: FavoritePlace) {
  const places = await getFavoritePlaces(uid);
  const alreadyExists = places.some((savedPlace) => savedPlace.id === place.id);

  if (alreadyExists) {
    return places;
  }

  const nextPlaces = [place, ...places];

  await AsyncStorage.setItem(userStorageKey(FAVORITE_PLACES_KEY, uid), JSON.stringify(nextPlaces));

  return nextPlaces;
}

export async function removeFavoritePlace(uid: string, placeId: string) {
  const places = await getFavoritePlaces(uid);
  const nextPlaces = places.filter((place) => place.id !== placeId);

  await AsyncStorage.setItem(userStorageKey(FAVORITE_PLACES_KEY, uid), JSON.stringify(nextPlaces));

  return nextPlaces;
}