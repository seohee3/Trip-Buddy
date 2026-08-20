import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTravelData } from '@/src/context/TravelDataContext';
import type { TravelRecord } from '@/src/types/travel';
import {
  getFavoritePlaces,
  removeFavoritePlace,
  type FavoritePlace,
} from '../../src/storage/favoritePlaces';

export default function MyScreen() {
  const { profile, records, isLoading, deleteRecord } = useTravelData();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);

  const loadFavoritePlaces = async () => {
    try {
      const savedPlaces = await getFavoritePlaces();
      setFavoritePlaces(savedPlaces);
    } catch (error) {
      console.error(error);
      setFavoritePlaces([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavoritePlaces();
    }, []),
  );

  const confirmDelete = (record: TravelRecord) => {
    Alert.alert('여행 기록 삭제', '이 여행 기록을 삭제하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(record.id);

          try {
            await deleteRecord(record.id);
          } catch {
            Alert.alert(
              '삭제 실패',
              '여행 기록을 삭제하지 못했어요. 다시 시도해주세요.',
            );
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const openFavoritePlace = (place: FavoritePlace) => {
    router.push({
      pathname: '/place/[id]',
      params: {
        id: place.id,
        title: place.title,
        areaName: place.areaName,
        sigunguName: place.sigunguName,
        address: place.address,
        category: place.category,
        image: place.image,
        rating: place.rating,
        distance: place.distance,
      },
    });
  };

  const confirmRemoveFavorite = (place: FavoritePlace) => {
    Alert.alert('찜한 장소 삭제', `"${place.title}"을 찜 목록에서 삭제할까요?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFavoritePlace(place.id);
            await loadFavoritePlaces();
          } catch (error) {
            console.error(error);
            Alert.alert('삭제 실패', '찜한 장소를 삭제하지 못했어요.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
        </View>

        <View style={styles.profile}>
          <Image source={{ uri: profile.image }} style={styles.avatar} />

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileBio}>{profile.bio}</Text>
          </View>
        </View>

        <View style={styles.profileButtons}>
          <ActionButton
            label="프로필 편집"
            onPress={() => router.push('/profile-edit')}
          />
          <ActionButton
            label="+ 여행 기록 추가"
            onPress={() => router.push('/record/create')}
          />
        </View>

        <View style={styles.stats}>
          <StatItem value={records.length} label="게시물" />
          <StatItem value={0} label="동행" />
          <StatItem value={favoritePlaces.length} label="찜한 장소" />
        </View>

        <View style={styles.menuGrid}>
          <ActionButton
            label="여행 지도"
            onPress={() => router.push('/travel-map')}
          />
          <ActionButton
            label="마스코트 도감"
            onPress={() => router.push('/mascot-book')}
          />
        </View>

        <Text style={styles.sectionTitle}>찜한 장소</Text>

        {favoritePlaces.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>아직 찜한 장소가 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.favoriteList}>
            {favoritePlaces.map((place) => (
              <FavoritePlaceCard
                key={place.id}
                place={place}
                onPress={() => openFavoritePlace(place)}
                onDelete={() => confirmRemoveFavorite(place)}
              />
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>나의 여행 기록</Text>

        {records.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>아직 저장된 여행 기록이 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.recordGrid}>
            {records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                deleting={deletingId === record.id}
                onPress={() =>
                  router.push({
                    pathname: '/record/[id]',
                    params: {
                      id: record.id,
                    },
                  })
                }
                onDelete={() => confirmDelete(record)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>마이페이지를 불러오는 중입니다.</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function FavoritePlaceCard({
  place,
  onPress,
  onDelete,
}: {
  place: FavoritePlace;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.favoriteItem}>
      <Pressable
        style={({ pressed }) => [styles.favoriteBody, pressed && styles.pressed]}
        onPress={onPress}
      >
        <Image source={{ uri: place.image }} style={styles.favoriteImage} />

        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteCategory}>{place.category}</Text>
          <Text style={styles.favoriteTitle} numberOfLines={1}>
            {place.title}
          </Text>
          <Text style={styles.favoriteAddress} numberOfLines={2}>
            {place.address}
          </Text>
        </View>
      </Pressable>

      <Pressable style={styles.favoriteDeleteButton} onPress={onDelete}>
        <Text style={styles.favoriteDeleteText}>삭제</Text>
      </Pressable>
    </View>
  );
}

function RecordCard({
  record,
  deleting,
  onPress,
  onDelete,
}: {
  record: TravelRecord;
  deleting: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const image = record.images[0];

  return (
    <View style={styles.recordCard}>
      <Pressable
        style={({ pressed }) => [styles.recordBody, pressed && styles.pressed]}
        onPress={onPress}
        disabled={deleting}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.recordImage} />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>이미지 없음</Text>
          </View>
        )}

        <View style={styles.recordOverlay}>
          <Text style={styles.recordTitle} numberOfLines={1}>
            {record.title}
          </Text>
          <Text style={styles.recordDate} numberOfLines={1}>
            {record.date}
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        onPress={onDelete}
        disabled={deleting}
      >
        <Text style={styles.deleteText}>{deleting ? '...' : '삭제'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 42,
  },
  header: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#5C3DFF',
    fontSize: 22,
    fontWeight: '800',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1EEFC',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#222222',
    fontSize: 18,
    fontWeight: '800',
  },
  profileBio: {
    marginTop: 6,
    color: '#777777',
    fontSize: 13,
  },
  profileButtons: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#F1EEFC',
  },
  actionText: {
    color: '#5C3DFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#222222',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 3,
    color: '#777777',
    fontSize: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 18,
  },
  sectionTitle: {
    marginTop: 2,
    marginBottom: 10,
    color: '#222222',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBox: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
  },
  emptyText: {
    color: '#777777',
    fontSize: 13,
    textAlign: 'center',
  },
  favoriteList: {
    gap: 10,
    marginBottom: 18,
  },
  favoriteItem: {
    position: 'relative',
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  favoriteBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    paddingRight: 58,
  },
  favoriteImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#F1EEFC',
  },
  favoriteInfo: {
    flex: 1,
    minWidth: 0,
  },
  favoriteCategory: {
    marginBottom: 4,
    color: '#5C3DFF',
    fontSize: 11,
    fontWeight: '800',
  },
  favoriteTitle: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '800',
  },
  favoriteAddress: {
    marginTop: 4,
    color: '#777777',
    fontSize: 12,
    lineHeight: 17,
  },
  favoriteDeleteButton: {
    position: 'absolute',
    top: 12,
    right: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  favoriteDeleteText: {
    color: '#D9534F',
    fontSize: 11,
    fontWeight: '800',
  },
  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  recordCard: {
    width: '48.5%',
    height: 150,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#D8D8D8',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  recordBody: {
    flex: 1,
  },
  recordImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1EEFC',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1EEFC',
  },
  noImageText: {
    color: '#999999',
    fontSize: 11,
  },
  recordOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  recordTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recordDate: {
    marginTop: 3,
    color: '#FFFFFF',
    fontSize: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  deleteText: {
    color: '#D9534F',
    fontSize: 10,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#777777',
    fontSize: 14,
  },
});