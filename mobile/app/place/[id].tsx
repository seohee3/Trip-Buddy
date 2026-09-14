import { Alert } from '@/src/utils/alert';
import { useEffect, useState } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    distanceLabel?: string;
    mapX?: string;
    mapY?: string;
  }>();

  const id = String(params.id ?? '');
  const title = params.title ?? '관광지';
  const areaName = params.areaName ?? '지역';
  const sigunguName = params.sigunguName ?? '구/군';
  const address = params.address ?? '주소 정보 없음';
  const category = params.category ?? '관광지';
  const image = params.image ?? '';
  const rating = params.rating ?? '';
  const distance = params.distance ?? '';
  const distanceLabel = params.distanceLabel ?? (distance ? `${distance}km` : '');
  const longitude = Number(params.mapX);
  const latitude = Number(params.mapY);
  const hasMapCoordinates = Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && longitude >= -180
    && longitude <= 180
    && latitude >= -90
    && latitude <= 90
    && params.mapX !== ''
    && params.mapY !== '';

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

  const openKakaoMap = async () => {
    if (!hasMapCoordinates) return;

    const appUrl = `kakaomap://look?p=${latitude},${longitude}`;
    const webUrl = `https://map.kakao.com/link/map/${encodeURIComponent(title)},${latitude},${longitude}`;
    try {
      const canOpenApp = Platform.OS !== 'web' && await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpenApp ? appUrl : webUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        Alert.alert('카카오맵 열기 실패', '지도 링크를 열 수 없어요. 잠시 후 다시 시도해주세요.');
      }
    }
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

        {image ? (
          <Image source={{ uri: image }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.noImage]}>
            <Text style={styles.noImageText}>제공된 이미지가 없습니다</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.location}>
            {areaName} {sigunguName}
          </Text>

          {rating || distanceLabel ? (
            <View style={styles.metaRow}>
              {rating ? <Text style={styles.metaText}>★ {rating}</Text> : null}
              {rating && distanceLabel ? <Text style={styles.metaDot}>·</Text> : null}
              {distanceLabel ? <Text style={styles.metaText}>{distanceLabel}</Text> : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주소</Text>
            <Text style={styles.sectionText}>{address}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>장소 소개</Text>
            <Text style={styles.sectionText}>
              현재 관광공사 API에서 받은 기본정보를 표시하고 있어요. 운영 시간과 이용 정보는
              방문 전에 공식 안내 또는 지도에서 다시 확인해주세요.
            </Text>
          </View>

          {hasMapCoordinates ? (
            <Pressable
              style={({ pressed }) => [styles.kakaoMapButton, pressed && styles.pressed]}
              onPress={() => void openKakaoMap()}
              accessibilityRole="button"
              accessibilityLabel={`${title} 카카오맵에서 보기`}
            >
              <Text style={styles.kakaoMapButtonText}>카카오맵에서 보기</Text>
            </Pressable>
          ) : null}

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
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    fontWeight: '700',
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
  kakaoMapButton: {
    height: 50,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FEE500',
  },
  kakaoMapButtonText: {
    color: '#191919',
    fontSize: 14,
    fontWeight: '900',
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
  pressed: {
    opacity: 0.72,
  },
});
