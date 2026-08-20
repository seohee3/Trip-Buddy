import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addFavoritePlace,
  isFavoritePlace,
  removeFavoritePlace,
} from '../../src/storage/favoritePlaces';

const COLORS = {
  primary: '#5C3DFF',
  background: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
  lightPurple: '#F1EDFF',
  badgeText: '#6847FF',
};

export default function PlaceDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    areaName?: string;
    sigunguName?: string;
    address?: string;
    category?: string;
    image?: string;
    rating?: string;
    distance?: string;
  }>();

  const id = String(params.id ?? '');
  const title = params.title ?? '관광지';
  const areaName = params.areaName ?? '지역';
  const sigunguName = params.sigunguName ?? '구/군';
  const address = params.address ?? '주소 정보 없음';
  const category = params.category ?? '관광지';
  const image =
    params.image ??
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
  const rating = params.rating ?? '4.8';
  const distance = params.distance ?? '1.5';

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    isFavoritePlace(id)
      .then(setIsFavorite)
      .catch(() => setIsFavorite(false));
  }, [id]);

  const toggleFavorite = async () => {
    if (!id) {
      Alert.alert('오류', '장소 정보를 찾을 수 없어요.');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavoritePlace(id);
        setIsFavorite(false);
        Alert.alert('찜 해제', '찜한 장소에서 삭제했어요.');
        return;
      }

      await addFavoritePlace({
        id,
        title,
        areaName,
        sigunguName,
        address,
        category,
        image,
        rating,
        distance,
      });

      setIsFavorite(true);
      Alert.alert('찜 완료', '찜한 장소에 저장했어요.');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '찜하기 저장 중 문제가 발생했어요.');
    }
  };

  const goRecord = () => {
    router.push({
      pathname: '/record/create',
      params: {
        placeTitle: title,
        placeAddress: address,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>장소 상세</Text>
          <View style={styles.headerSpace} />
        </View>

        <Image source={{ uri: image }} style={styles.heroImage} />

        <View style={styles.body}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.location}>
            {areaName} {sigunguName}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>★ {rating}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{distance}km</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주소</Text>
            <Text style={styles.sectionText}>{address}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>장소 소개</Text>
            <Text style={styles.sectionText}>
              여행 중 방문하기 좋은 장소예요. 실제 배포 단계에서는 관광공사 API의 상세
              설명, 운영 시간, 위치 좌표, 이미지 정보를 연결해 더 자세한 정보를 보여줄 수 있어요.
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.subButton, isFavorite && styles.favoriteButton]}
              onPress={toggleFavorite}
            >
              <Text style={[styles.subButtonText, isFavorite && styles.favoriteButtonText]}>
                {isFavorite ? '찜 해제' : '찜하기'}
              </Text>
            </Pressable>

            <Pressable style={styles.mainButton} onPress={goRecord}>
              <Text style={styles.mainButtonText}>여행 기록하기</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 36,
    color: COLORS.text,
    lineHeight: 38,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },
  headerSpace: {
    width: 36,
  },
  heroImage: {
    width: '100%',
    height: 260,
    backgroundColor: COLORS.lightPurple,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.lightPurple,
  },
  categoryText: {
    color: COLORS.badgeText,
    fontSize: 12,
    fontWeight: '900',
  },
  title: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
  },
  location: {
    marginTop: 8,
    color: COLORS.secondaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  metaDot: {
    color: COLORS.secondaryText,
    fontSize: 14,
  },
  section: {
    marginTop: 26,
  },
  sectionTitle: {
    marginBottom: 9,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionText: {
    color: COLORS.secondaryText,
    fontSize: 14,
    lineHeight: 22,
  },
  actionRow: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 10,
  },
  subButton: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  subButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  favoriteButton: {
    backgroundColor: COLORS.lightPurple,
  },
  favoriteButtonText: {
    color: COLORS.primary,
  },
  mainButton: {
    flex: 1.4,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});