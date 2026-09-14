import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requestTourPlaces, type TourPlace } from '../../src/api/tourApi';

type CategoryCode = '' | '12' | '14' | '15' | '39';

type Place = TourPlace;

const COLORS = {
  primary: '#5C3DFF',
  primaryDark: '#4327D9',
  primaryLight: '#F1EDFF',
  primarySelected: '#E5DEFF',
  background: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
};

const CATEGORY_LIST: { code: CategoryCode; label: string }[] = [
  { code: '', label: '전체' },
  { code: '12', label: '관광지' },
  { code: '14', label: '문화시설' },
  { code: '15', label: '축제/행사' },
  { code: '39', label: '맛집' },
];

function getCategoryLabel(code: string) {
  return CATEGORY_LIST.find((category) => category.code === code)?.label ?? '관광지';
}

export default function SearchScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [searchRequest, setSearchRequest] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryCode>('');

  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const visiblePlaces = useMemo(() => {
    const keyword = appliedKeyword.trim().toLowerCase();

    return places.filter((place) => {
      const matchesCategory =
        selectedCategory === '' || place.contentTypeId === selectedCategory;

      const matchesKeyword =
        keyword.length === 0 ||
        place.title.toLowerCase().includes(keyword) ||
        place.areaName.toLowerCase().includes(keyword) ||
        place.sigunguName.toLowerCase().includes(keyword) ||
        place.address.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [appliedKeyword, selectedCategory, places]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setErrorMessage('');
    setPlaces([]);
    void requestTourPlaces({
      endpoint: appliedKeyword ? 'searchKeyword2' : 'areaBasedList2',
      keyword: appliedKeyword,
      contentTypeId: selectedCategory,
    }).then((result) => {
      if (active) setPlaces(result.places);
    }).catch(() => {
      if (active) setErrorMessage('관광공사 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [appliedKeyword, selectedCategory, searchRequest]);

  const submitSearch = () => {
    Keyboard.dismiss();
    setAppliedKeyword(searchInput.trim());
    setSearchRequest((request) => request + 1);
  };

  const openPlaceDetail = (place: Place) => {
    router.push({
      pathname: '/place/[id]',
      params: {
        id: String(place.id),
        title: place.title,
        areaName: place.areaName,
        sigunguName: place.sigunguName,
        address: place.address,
        category: getCategoryLabel(place.contentTypeId),
        image: place.image,
        rating: place.rating == null ? '' : String(place.rating),
        distance: place.distance == null ? '' : String(place.distance),
        mapX: place.mapX ?? '',
        mapY: place.mapY ?? '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>Travel Mate</Text>
          <Text style={styles.screenTitle}>검색</Text>
          <Text style={styles.description}>
            여행지, 맛집, 문화시설을 검색하고 나만의 여행 기록으로 연결해보세요.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color={COLORS.primary} />

          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={submitSearch}
            placeholder="어디로 떠나볼까요?"
            placeholderTextColor="#999999"
            returnKeyType="search"
            style={styles.searchInput}
          />

          <Pressable style={styles.searchButton} onPress={submitSearch}>
            <Text style={styles.searchButtonText}>검색</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>추천 카테고리</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORY_LIST.map((category) => {
            const isSelected = selectedCategory === category.code;

            return (
              <Pressable
                key={category.code || 'all'}
                style={[
                  styles.categoryButton,
                  isSelected && styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category.code)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.selectedCategoryText,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>
            {appliedKeyword ? `"${appliedKeyword}" 검색 결과` : '추천 여행지'}
          </Text>
          <Text style={styles.resultCount}>{visiblePlaces.length}곳</Text>
        </View>

        {isLoading ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.emptyTitle}>관광 정보를 불러오는 중입니다</Text>
            <Text style={styles.emptyText}>잠시만 기다려주세요.</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.emptyBox}>
            <Ionicons name="alert-circle-outline" size={34} color="#B5AECF" />
            <Text style={styles.emptyTitle}>검색에 실패했습니다</Text>
            <Text style={styles.emptyText}>{errorMessage}</Text>
          </View>
        ) : visiblePlaces.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={34} color="#B5AECF" />
            <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
            <Text style={styles.emptyText}>
              다른 키워드나 카테고리로 다시 검색해보세요.
            </Text>
          </View>
        ) : selectedCategory === '' ? (
          <View style={styles.grid}>
            {visiblePlaces.map((place) => (
              <GridPlaceCard
                key={place.id}
                place={place}
                onPress={() => openPlaceDetail(place)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {visiblePlaces.map((place) => (
              <ListPlaceCard
                key={place.id}
                place={place}
                onPress={() => openPlaceDetail(place)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type PlaceCardProps = {
  place: Place;
  onPress: () => void;
};

function GridPlaceCard({ place, onPress }: PlaceCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.gridCard,
        pressed && styles.pressedCard,
      ]}
      onPress={onPress}
    >
      {place.image ? (
        <Image source={{ uri: place.image }} style={styles.gridCardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.gridCardImage, styles.noImage]}>
          <Ionicons name="image-outline" size={28} color="#B5AECF" />
          <Text style={styles.noImageText}>이미지 없음</Text>
        </View>
      )}

      <View style={styles.gridCardContent}>
        <Text style={styles.cardCategory}>
          {getCategoryLabel(place.contentTypeId)}
        </Text>

        <Text style={styles.gridCardTitle} numberOfLines={2}>
          {place.title}
        </Text>

        <Text style={styles.gridCardAddress} numberOfLines={2}>
          {place.address}
        </Text>
      </View>
    </Pressable>
  );
}

function ListPlaceCard({ place, onPress }: PlaceCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.listCard,
        pressed && styles.pressedCard,
      ]}
      onPress={onPress}
    >
      {place.image ? (
        <Image source={{ uri: place.image }} style={styles.listCardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.listCardImage, styles.noImage]}>
          <Ionicons name="image-outline" size={24} color="#B5AECF" />
        </View>
      )}

      <View style={styles.listCardContent}>
        <Text style={styles.cardCategory}>
          {getCategoryLabel(place.contentTypeId)}
        </Text>

        <Text style={styles.listCardTitle}>{place.title}</Text>

        <Text style={styles.listCardAddress} numberOfLines={2}>
          {place.address}
        </Text>

        {place.rating != null && place.distance != null ? (
          <Text style={styles.listCardMeta}>
            ★ {place.rating.toFixed(1)} · {place.distance.toFixed(1)}km
          </Text>
        ) : null}
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
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 18,
  },
  brand: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  screenTitle: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
  },
  description: {
    marginTop: 8,
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },
  searchBox: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
  },
  searchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  categoryList: {
    gap: 8,
    paddingBottom: 20,
  },
  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  resultHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  resultCount: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridCard: {
    width: '48.2%',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  gridCardImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#EEEEEE',
  },
  gridCardContent: {
    minHeight: 112,
    padding: 11,
  },
  cardCategory: {
    marginBottom: 6,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  gridCardTitle: {
    marginBottom: 6,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  gridCardAddress: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 16,
  },
  list: {
    gap: 12,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  listCardImage: {
    width: 92,
    height: 92,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
  },
  listCardContent: {
    flex: 1,
    minWidth: 0,
  },
  listCardTitle: {
    marginBottom: 5,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  listCardAddress: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 17,
  },
  listCardMeta: {
    marginTop: 8,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    marginTop: 4,
    color: '#999999',
    fontSize: 10,
  },
  emptyBox: {
    marginTop: 24,
    paddingVertical: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  emptyTitle: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 6,
    color: COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  pressedCard: {
    opacity: 0.75,
  },
});
