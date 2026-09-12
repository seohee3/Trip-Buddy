import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requestTourPlaces, type TourPlace } from '@/src/api/tourApi';
import { useTravelType } from '@/src/context/TravelTypeContext';
import { TRAVEL_TYPE_BY_CODE } from '@/src/travel-type/catalog';
import {
  loadTourRecommendations,
  rankTourRecommendations,
  type RankedTourPlace,
  type TourRecommendationLoadStatus,
} from '@/src/travel-type/recommendations';

const CATEGORY_LABELS: Record<string, string> = {
  '12': '관광지', '14': '문화시설', '15': '축제/행사', '25': '여행코스',
  '28': '레포츠', '32': '숙박', '38': '쇼핑', '39': '음식점',
};

export default function TravelRecommendationsScreen() {
  const { travelType } = useTravelType();
  const [recommendations, setRecommendations] = useState<RankedTourPlace<TourPlace>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState<TourRecommendationLoadStatus>('empty');
  const [retryCount, setRetryCount] = useState(0);

  const loadRecommendations = useCallback(async () => {
    if (!travelType) return;
    setIsLoading(true);
    const definition = TRAVEL_TYPE_BY_CODE[travelType.code];

    try {
      const result = await loadTourRecommendations(
        definition,
        (query) => requestTourPlaces({
          endpoint: query.endpoint,
          keyword: query.keyword,
          contentTypeId: query.contentTypeId,
          numOfRows: 10,
          pageNo: 1,
        }),
      );
      setLoadStatus(result.status);
      setRecommendations(
        result.status === 'success'
          ? rankTourRecommendations(result.places, travelType, definition)
          : [],
      );
    } catch {
      setRecommendations([]);
      setLoadStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [travelType]);

  useEffect(() => { void loadRecommendations(); }, [loadRecommendations, retryCount]);
  if (!travelType) return <Redirect href="/travel-survey" />;

  const openPlace = (place: TourPlace) => {
    router.push({
      pathname: '/place/[id]',
      params: {
        id: place.id,
        title: place.title,
        areaName: place.areaName,
        sigunguName: place.sigunguName,
        address: place.address,
        category: CATEGORY_LABELS[place.contentTypeId] ?? '관광정보',
        image: place.image,
        mapX: place.mapX ?? '',
        mapY: place.mapY ?? '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title="추천 여행지" />
        <Text style={styles.lead}><Text style={styles.emphasis}>{travelType.name}</Text>에게 어울리는 실제 관광정보예요.</Text>
        <Text style={styles.notice}>관광공사 API 응답만 표시하며, 현재 제공되는 결과 수에 따라 목록이 달라질 수 있어요.</Text>

        {isLoading ? (
          <StateBox icon="sparkles-outline" title="맞춤 장소를 찾고 있어요" description="여행 취향과 관광정보를 연결하는 중입니다." loading />
        ) : loadStatus === 'missing-key' ? (
          <StateBox icon="key-outline" title="API 키 설정이 필요해요" description="EXPO_PUBLIC_TOUR_API_KEY가 설정되지 않았습니다." onRetry={() => setRetryCount((value) => value + 1)} />
        ) : loadStatus === 'error' ? (
          <StateBox icon="cloud-offline-outline" title="추천을 불러오지 못했어요" description="관광공사 API 요청 중 오류가 발생했어요. 네트워크를 확인하고 다시 시도해주세요." onRetry={() => setRetryCount((value) => value + 1)} />
        ) : loadStatus === 'empty' || recommendations.length === 0 ? (
          <StateBox icon="map-outline" title="조건에 맞는 장소가 없어요" description="관광공사 응답이 비어 있어요. 잠시 후 다시 찾아보세요." onRetry={() => setRetryCount((value) => value + 1)} />
        ) : (
          <View style={styles.list}>
            {recommendations.map(({ place, reason }) => (
              <Pressable key={place.id} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => openPlace(place)} accessibilityRole="button" accessibilityLabel={`${place.title} 상세 보기`}>
                {place.image ? <Image source={{ uri: place.image }} style={styles.image} /> : (
                  <View style={[styles.image, styles.noImage]}><Ionicons name="image-outline" size={30} color="#B5AECF" /><Text style={styles.noImageText}>이미지 없음</Text></View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.category}>{CATEGORY_LABELS[place.contentTypeId] ?? '관광정보'}</Text>
                  <Text style={styles.title} numberOfLines={2}>{place.title}</Text>
                  <Text style={styles.address} numberOfLines={2}>{place.address}</Text>
                  <Text style={styles.reason}>✦ {reason}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title }: { title: string }) {
  return <View style={styles.header}><Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="뒤로 가기"><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerTitle}>{title}</Text><View style={styles.headerSpace} /></View>;
}

function StateBox({ icon, title, description, loading, onRetry }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; loading?: boolean; onRetry?: () => void }) {
  return <View style={styles.stateBox}>{loading ? <ActivityIndicator color="#5C3DFF" size="large" /> : <Ionicons name={icon} size={38} color="#9B90C6" />}<Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateDescription}>{description}</Text>{onRetry ? <Pressable style={styles.retry} onPress={onRetry} accessibilityRole="button" accessibilityLabel="추천 다시 시도"><Text style={styles.retryText}>다시 시도</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#222222', fontSize: 36, lineHeight: 38 },
  headerTitle: { color: '#222222', fontSize: 17, fontWeight: '900' },
  headerSpace: { width: 40 },
  lead: { marginTop: 14, color: '#333333', fontSize: 22, lineHeight: 31, fontWeight: '900' },
  emphasis: { color: '#5C3DFF' },
  notice: { marginTop: 8, color: '#777777', fontSize: 12, lineHeight: 18 },
  list: { marginTop: 22, gap: 14 },
  card: { overflow: 'hidden', borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 20, backgroundColor: '#FFFFFF' },
  image: { width: '100%', height: 178, backgroundColor: '#F1EDFF' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  noImageText: { marginTop: 7, color: '#8E87A8', fontSize: 11, fontWeight: '700' },
  cardBody: { padding: 15 },
  category: { color: '#5C3DFF', fontSize: 11, fontWeight: '900' },
  title: { marginTop: 5, color: '#222222', fontSize: 17, lineHeight: 23, fontWeight: '900' },
  address: { marginTop: 6, color: '#777777', fontSize: 12, lineHeight: 17 },
  reason: { marginTop: 11, color: '#6847FF', fontSize: 12, lineHeight: 18, fontWeight: '800' },
  pressed: { opacity: 0.74 },
  stateBox: { marginTop: 42, padding: 32, alignItems: 'center', borderRadius: 24, backgroundColor: '#F8F7FF' },
  stateTitle: { marginTop: 13, color: '#333333', fontSize: 16, fontWeight: '900' },
  stateDescription: { marginTop: 7, color: '#777777', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: { marginTop: 18, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14, backgroundColor: '#5C3DFF' },
  retryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
