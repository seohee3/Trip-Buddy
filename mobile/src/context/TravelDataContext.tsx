import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { logFirebaseError } from '@/src/firebase/errors';
import {
  hydrateProfileFromFirestore,
  saveProfileToFirestore,
} from '@/src/firebase/profileRepository';
import type { FavoritePlace, TravelRecord, UserProfile } from '@/src/types/travel';
import {
  createDefaultUserProfile,
  loadTravelData,
  persistFavorites,
  persistProfile,
  persistRecords,
  migrateTravelRecord,
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ name: '', bio: '', image: '' });
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const profileRevisionRef = useRef(0);
  const profileHydrationPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    let mounted = true;
    profileRevisionRef.current += 1;
    profileHydrationPromiseRef.current = null;

    setProfile({ name: '', bio: '', image: '' });
    setRecords([]);
    setFavorites([]);
    setStorageError(null);

    if (!user) {
      setIsLoading(false);
      return () => {
        mounted = false;
      };
    }

    setIsLoading(true);
    const profileFallback = createDefaultUserProfile(user.displayName, user.email);

    const loadLocalDataThenHydrateProfile = async () => {
      let localProfile = profileFallback;

      try {
        const data = await loadTravelData(user.uid, profileFallback);
        localProfile = data.profile;

        if (mounted) {
          setProfile(data.profile);
          setRecords(data.records);
          setFavorites(data.favorites);
        }
      } catch (error) {
        console.error('여행 데이터 로딩 오류:', error);
        if (mounted) {
          setProfile(profileFallback);
          setRecords([]);
          setFavorites([]);
          setStorageError('저장된 데이터를 불러오지 못했습니다. 기본 데이터를 표시합니다.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }

      const revisionAtHydrationStart = profileRevisionRef.current;
      const hydrationPromise = hydrateProfileFromFirestore(user, localProfile)
        .then(async (hydratedProfile) => {
          if (!mounted || profileRevisionRef.current !== revisionAtHydrationStart) return;

          await persistProfile(user.uid, hydratedProfile);
          if (mounted && profileRevisionRef.current === revisionAtHydrationStart) {
            setProfile(hydratedProfile);
          }
        })
        .catch((error) => {
          logFirebaseError('프로필 초기 동기화', error);
        });

      profileHydrationPromiseRef.current = hydrationPromise;
      await hydrationPromise;
    };

    void loadLocalDataThenHydrateProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const value = useMemo<TravelDataContextValue>(
    () => ({
      profile,
      records,
      favorites,
      isLoading,
      storageError,
      updateProfile: async (nextProfile) => {
        if (!user) throw new Error('프로필을 저장하려면 로그인이 필요합니다.');
        profileRevisionRef.current += 1;

        try {
          await persistProfile(user.uid, nextProfile);
          setProfile(nextProfile);
          setStorageError(null);
        } catch (error) {
          console.error('프로필 저장 오류:', error);
          setStorageError('프로필을 저장하지 못했습니다.');
          throw error;
        }

        void (async () => {
          try {
            await profileHydrationPromiseRef.current;
            await saveProfileToFirestore(user, nextProfile);
            setStorageError(null);
          } catch (error) {
            logFirebaseError('프로필 저장 동기화', error);
            setStorageError('프로필은 기기에 저장했지만 Firebase와 동기화하지 못했습니다.');
          }
        })();
      },
      addRecord: async (record) => {
        if (!user) throw new Error('로그인이 필요합니다.');
        const normalizedRecord = migrateTravelRecord(record, 0) ?? record;
        const nextRecords = [normalizedRecord, ...records];
        try {
          await persistRecords(user.uid, nextRecords);
          setRecords(nextRecords);
          setStorageError(null);
        } catch (error) {
          console.error('여행 기록 저장 오류:', error);
          setStorageError('여행 기록을 저장하지 못했습니다.');
          throw error;
        }
      },
      deleteRecord: async (recordId) => {
        if (!user) throw new Error('로그인이 필요합니다.');
        const nextRecords = records.filter((record) => record.id !== recordId);
        try {
          await persistRecords(user.uid, nextRecords);
          setRecords(nextRecords);
          setStorageError(null);
        } catch (error) {
          console.error('여행 기록 삭제 오류:', error);
          setStorageError('여행 기록을 삭제하지 못했습니다.');
          throw error;
        }
      },
      addFavorite: async (favorite) => {
        if (!user) throw new Error('로그인이 필요합니다.');
        const nextFavorites = [favorite, ...favorites.filter((item) => item.id !== favorite.id)];
        try {
          await persistFavorites(user.uid, nextFavorites);
          setFavorites(nextFavorites);
          setStorageError(null);
        } catch (error) {
          console.error('찜한 관광지 저장 오류:', error);
          setStorageError('찜한 관광지를 저장하지 못했습니다.');
          throw error;
        }
      },
      removeFavorite: async (favoriteId) => {
        if (!user) throw new Error('로그인이 필요합니다.');
        const nextFavorites = favorites.filter((favorite) => favorite.id !== favoriteId);
        try {
          await persistFavorites(user.uid, nextFavorites);
          setFavorites(nextFavorites);
          setStorageError(null);
        } catch (error) {
          console.error('찜한 관광지 삭제 오류:', error);
          setStorageError('찜한 관광지를 삭제하지 못했습니다.');
          throw error;
        }
      },
    }),
    [favorites, isLoading, profile, records, storageError, user],
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
