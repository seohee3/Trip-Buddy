import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SortOption = '추천순' | '거리순' | '인기순';

type NearbyPlace = {
  id: number;
  title: string;
  address: string;
  distance: number;
  rating: number;
  imageStyle: 'green' | 'blue' | 'brown' | 'purple';
};

const COLORS = {
  primary: '#5C3DFF',
  primaryDark: '#6D4CFF',
  primaryLight: '#F1EEFC',
  selectedTab: '#EDE7FF',
  background: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
};

const REGIONS = ['서울특별시', '부산광역시', '제주특별자치도'];
const SORT_OPTIONS: SortOption[] = ['추천순', '거리순', '인기순'];

const SAMPLE_PLACES: NearbyPlace[] = [
  {
    id: 1,
    title: '서울숲',
    address: '서울특별시 성동구 뚝섬로 273',
    distance: 0.8,
    rating: 4.9,
    imageStyle: 'green',
  },
  {
    id: 2,
    title: '남산서울타워',
    address: '서울특별시 용산구 남산공원길 105',
    distance: 1.4,
    rating: 4.8,
    imageStyle: 'blue',
  },
  {
    id: 3,
    title: '광장시장',
    address: '서울특별시 종로구 창경궁로 88',
    distance: 2.1,
    rating: 4.7,
    imageStyle: 'brown',
  },
  {
    id: 4,
    title: '북촌한옥마을',
    address: '서울특별시 종로구 계동길 37',
    distance: 2.7,
    rating: 4.6,
    imageStyle: 'purple',
  },
];

export default function NearbyScreen() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [sortOption, setSortOption] = useState<SortOption>('추천순');
  const [searchInput, setSearchInput] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');

  const visiblePlaces = useMemo(() => {
    const keyword = appliedKeyword.trim().toLowerCase();
    const filteredPlaces = SAMPLE_PLACES.filter(
      (place) =>
        keyword.length === 0 ||
        place.title.toLowerCase().includes(keyword) ||
        place.address.toLowerCase().includes(keyword),
    );

    return [...filteredPlaces].sort((first, second) => {
      if (sortOption === '거리순') return first.distance - second.distance;
      if (sortOption === '인기순') return second.rating - first.rating;
      return second.rating - first.rating;
    });
  }, [appliedKeyword, sortOption]);

  const submitSearch = () => {
    const keyword = searchInput.trim();

    if (!keyword) {
      Alert.alert('검색어를 입력해주세요.');
      return;
    }

    setAppliedKeyword(keyword);
  };

  const cycleRegion = () => {
    const currentIndex = REGIONS.indexOf(selectedRegion);
    const nextRegion = REGIONS[(currentIndex + 1) % REGIONS.length];
    setSelectedRegion(nextRegion);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.regionButton} onPress={cycleRegion}>
          <Text style={styles.regionText}>{selectedRegion}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>

        <Text style={styles.screenTitle}>주변</Text>

        <View style={styles.sortTabs}>
          {SORT_OPTIONS.map((option) => {
            const isSelected = option === sortOption;

            return (
              <Pressable
                key={option}
                style={[styles.sortTab, isSelected && styles.selectedSortTab]}
                onPress={() => setSortOption(option)}
              >
                <Text style={[styles.sortTabText, isSelected && styles.selectedSortTabText]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationText}>현재 위치 기준 3km 이내</Text>
          <Pressable
            style={({ pressed }) => [styles.locationButton, pressed && styles.pressedButton]}
            onPress={() =>
              Alert.alert('위치 검색 안내', '현재는 GPS 연결 전이라 위치 검색을 준비 중입니다.')
            }
          >
            <Text style={styles.locationButtonText}>검색 ↗</Text>
          </Pressable>
        </View>

        <View style={styles.keywordSearch}>
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={submitSearch}
            placeholder="장소명을 검색해보세요"
            placeholderTextColor="#999999"
            returnKeyType="search"
            style={styles.keywordInput}
          />
          <Pressable
            style={({ pressed }) => [styles.keywordButton, pressed && styles.pressedButton]}
            onPress={submitSearch}
          >
            <Text style={styles.keywordButtonText}>검색</Text>
          </Pressable>
        </View>

        <Text style={styles.locationInfo}>현재 위치 정보가 표시됩니다.</Text>

        <MapPlaceholder />

        <View style={styles.placeListHeader}>
          <Text style={styles.placeListTitle}>주변 관광지</Text>
          <Text style={styles.placeListCount}>{visiblePlaces.length}곳</Text>
        </View>

        {visiblePlaces.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.placeList}>
            {visiblePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MapPlaceholder() {
  return (
    <View style={styles.mapBox}>
      <View style={[styles.mapRoad, styles.mapRoadHorizontal]} />
      <View style={[styles.mapRoad, styles.mapRoadDiagonal]} />
      <View style={[styles.mapDot, styles.blueDot]} />
      <View style={[styles.mapDot, styles.greenDot]} />
      <View style={[styles.mapDot, styles.redDot]} />
      <View style={[styles.mapDot, styles.yellowDot]} />
      <View style={styles.currentLocation}>
        <Text style={styles.currentLocationText}>내 위치</Text>
      </View>
      <Text style={styles.mapMessage}>지도가 표시될 영역입니다</Text>
    </View>
  );
}

function PlaceCard({ place }: { place: NearbyPlace }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.placeCard, pressed && styles.pressedCard]}
      onPress={() =>
        Alert.alert(place.title, '관광지 상세 화면은 준비 중입니다.')
      }
    >
      <View style={[styles.placeImage, styles[`${place.imageStyle}Image`]]}>
        <Text style={styles.placeImageText}>여행지</Text>
      </View>
      <View style={styles.placeContent}>
        <Text style={styles.placeTitle}>{place.title}</Text>
        <Text style={styles.placeAddress} numberOfLines={1}>
          {place.address}
        </Text>
        <Text style={styles.placeMeta}>
          📍 {place.distance.toFixed(1)}km · ⭐ {place.rating.toFixed(1)}
        </Text>
      </View>
    </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 38,
  },
  regionButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 32,
  },
  regionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  chevron: {
    marginTop: -4,
    color: COLORS.secondaryText,
    fontSize: 18,
  },
  screenTitle: {
    marginTop: 18,
    marginBottom: 18,
    color: COLORS.primaryDark,
    fontSize: 24,
    fontWeight: '800',
  },
  sortTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  sortTab: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
  },
  selectedSortTab: {
    backgroundColor: COLORS.selectedTab,
  },
  sortTabText: {
    color: COLORS.secondaryText,
    fontSize: 13,
  },
  selectedSortTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationText: {
    color: COLORS.secondaryText,
    fontSize: 13,
  },
  locationButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  locationButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  keywordSearch: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  keywordInput: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 13,
  },
  keywordButton: {
    marginRight: 5,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  keywordButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '700',
  },
  locationInfo: {
    marginTop: 9,
    marginBottom: 12,
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  mapBox: {
    height: 135,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: '#EEF3EA',
  },
  mapRoad: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  mapRoadHorizontal: {
    width: '120%',
    height: 12,
    transform: [{ rotate: '-12deg' }],
  },
  mapRoadDiagonal: {
    width: 12,
    height: '120%',
    transform: [{ rotate: '28deg' }],
  },
  mapDot: {
    width: 13,
    height: 13,
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.background,
    borderRadius: 8,
  },
  blueDot: {
    top: '48%',
    left: '48%',
    backgroundColor: '#4C6FFF',
  },
  greenDot: {
    top: '28%',
    left: '22%',
    backgroundColor: '#65C466',
  },
  redDot: {
    top: '24%',
    right: '22%',
    backgroundColor: '#FF5A5F',
  },
  yellowDot: {
    right: '32%',
    bottom: '22%',
    backgroundColor: '#FFC43D',
  },
  currentLocation: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  currentLocationText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  mapMessage: {
    color: '#999999',
    fontSize: 12,
  },
  placeListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  placeListTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  placeListCount: {
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  placeList: {
    marginTop: 4,
  },
  placeCard: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  placeImage: {
    width: 92,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  greenImage: {
    backgroundColor: '#9FD89F',
  },
  blueImage: {
    backgroundColor: '#9ED0FF',
  },
  brownImage: {
    backgroundColor: '#C8A77A',
  },
  purpleImage: {
    backgroundColor: '#CFC5FF',
  },
  placeImageText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '700',
  },
  placeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  placeTitle: {
    marginBottom: 5,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  placeAddress: {
    marginBottom: 7,
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  placeMeta: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  emptyText: {
    color: COLORS.secondaryText,
    fontSize: 13,
  },
  pressedButton: {
    opacity: 0.7,
  },
  pressedCard: {
    opacity: 0.72,
  },
});
