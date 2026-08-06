import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { FavoritePlace, TravelRecord, UserProfile } from '@/src/types/travel';
import {
  DEFAULT_PROFILE,
  DEFAULT_RECORDS,
  loadTravelData,
  persistFavorites,
  persistProfile,
  persistRecords,
} from '@/src/storage/travelStorage';

type TravelDataContextValue = {
  profile: UserProfile;
  records: TravelRecord[];
  favorites: FavoritePlace[];
  isLoading: boolean;
  storageError: string | null;
  updateProfile: (profile: UserProfile) => Promise<void>;
  addRecord: (record: TravelRecord) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  addFavorite: (favorite: FavoritePlace) => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
};

const TravelDataContext = createContext<TravelDataContextValue | null>(null);

export function TravelDataProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile>({ name: '', bio: '', image: '' });
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadTravelData()
      .then((data) => {
        if (!mounted) return;
        setProfile(data.profile);
        setRecords(data.records);
        setFavorites(data.favorites);
      })
      .catch((error) => {
        console.error('여행 데이터 로딩 오류:', error);
        if (mounted) {
          setProfile(DEFAULT_PROFILE);
          setRecords(DEFAULT_RECORDS);
          setFavorites([]);
          setStorageError('저장된 데이터를 불러오지 못했습니다. 기본 데이터를 표시합니다.');
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<TravelDataContextValue>(
    () => ({
      profile,
      records,
      favorites,
      isLoading,
      storageError,
      updateProfile: async (nextProfile) => {
        try {
          await persistProfile(nextProfile);
          setProfile(nextProfile);
          setStorageError(null);
        } catch (error) {
          console.error('프로필 저장 오류:', error);
          setStorageError('프로필을 저장하지 못했습니다.');
          throw error;
        }
      },
      addRecord: async (record) => {
        const nextRecords = [record, ...records];
        try {
          await persistRecords(nextRecords);
          setRecords(nextRecords);
          setStorageError(null);
        } catch (error) {
          console.error('여행 기록 저장 오류:', error);
          setStorageError('여행 기록을 저장하지 못했습니다.');
          throw error;
        }
      },
      deleteRecord: async (recordId) => {
        const nextRecords = records.filter((record) => record.id !== recordId);
        try {
          await persistRecords(nextRecords);
          setRecords(nextRecords);
          setStorageError(null);
        } catch (error) {
          console.error('여행 기록 삭제 오류:', error);
          setStorageError('여행 기록을 삭제하지 못했습니다.');
          throw error;
        }
      },
      addFavorite: async (favorite) => {
        const nextFavorites = [favorite, ...favorites.filter((item) => item.id !== favorite.id)];
        try {
          await persistFavorites(nextFavorites);
          setFavorites(nextFavorites);
          setStorageError(null);
        } catch (error) {
          console.error('찜한 관광지 저장 오류:', error);
          setStorageError('찜한 관광지를 저장하지 못했습니다.');
          throw error;
        }
      },
      removeFavorite: async (favoriteId) => {
        const nextFavorites = favorites.filter((favorite) => favorite.id !== favoriteId);
        try {
          await persistFavorites(nextFavorites);
          setFavorites(nextFavorites);
          setStorageError(null);
        } catch (error) {
          console.error('찜한 관광지 삭제 오류:', error);
          setStorageError('찜한 관광지를 삭제하지 못했습니다.');
          throw error;
        }
      },
    }),
    [favorites, isLoading, profile, records, storageError],
  );

  return <TravelDataContext.Provider value={value}>{children}</TravelDataContext.Provider>;
}

export function useTravelData() {
  const context = useContext(TravelDataContext);

  if (!context) {
    throw new Error('useTravelData must be used inside TravelDataProvider');
  }

  return context;
}

export { persistFavorites };
