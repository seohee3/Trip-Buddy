import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CategoryCode = '' | '12' | '14' | '39';

type Area = {
  code: string;
  name: string;
};

type Place = {
  id: number;
  title: string;
  areaName: string;
  sigunguName: string;
  address: string;
  contentTypeId: Exclude<CategoryCode, ''>;
  image: string;
  rating: number;
  distance: number;
};

const COLORS = {
  primary: '#5C3DFF',
  primaryDark: '#6D4CFF',
  primaryLight: '#F1EEFC',
  primarySelected: '#EDE7FF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
  background: '#FFFFFF',
  modalOverlay: 'rgba(0, 0, 0, 0.18)',
};

const AREA_LIST: Area[] = [
  { code: '1', name: '서울특별시' },
  { code: '2', name: '인천광역시' },
  { code: '3', name: '대전광역시' },
  { code: '4', name: '대구광역시' },
  { code: '5', name: '광주광역시' },
  { code: '6', name: '부산광역시' },
  { code: '7', name: '울산광역시' },
  { code: '8', name: '세종특별자치시' },
  { code: '31', name: '경기도' },
  { code: '32', name: '강원특별자치도' },
  { code: '33', name: '충청북도' },
  { code: '34', name: '충청남도' },
  { code: '35', name: '경상북도' },
  { code: '36', name: '경상남도' },
  { code: '37', name: '전북특별자치도' },
  { code: '38', name: '전라남도' },
  { code: '39', name: '제주특별자치도' },
];

const SIGUNGU_LIST: Record<string, string[]> = {
  '1': [
    '전체',
    '강남구',
    '강동구',
    '강북구',
    '강서구',
    '관악구',
    '광진구',
    '구로구',
    '금천구',
    '노원구',
    '도봉구',
    '동대문구',
    '동작구',
    '마포구',
    '서대문구',
    '서초구',
    '성동구',
    '성북구',
    '송파구',
    '양천구',
    '영등포구',
    '용산구',
    '은평구',
    '종로구',
    '중구',
    '중랑구',
  ],
  '31': [
    '전체',
    '가평군',
    '고양시',
    '과천시',
    '광명시',
    '광주시',
    '구리시',
    '군포시',
    '김포시',
    '남양주시',
    '동두천시',
    '부천시',
    '성남시',
    '수원시',
    '시흥시',
    '안산시',
    '안성시',
    '안양시',
    '양주시',
    '양평군',
    '여주시',
    '연천군',
    '오산시',
    '용인시',
    '의왕시',
    '의정부시',
    '이천시',
    '파주시',
    '평택시',
    '포천시',
    '하남시',
    '화성시',
  ],
  '39': ['전체', '서귀포시', '제주시'],
};

const CATEGORY_LIST: {
  code: CategoryCode;
  label: string;
}[] = [
  { code: '', label: '전체' },
  { code: '12', label: '자연' },
  { code: '14', label: '문화·역사' },
  { code: '39', label: '맛집' },
];

const SAMPLE_PLACES: Place[] = [
  {
    id: 1,
    title: '롯데시티호텔 마포',
    areaName: '서울특별시',
    sigunguName: '마포구',
    address: '서울특별시 마포구 마포대로 109',
    contentTypeId: '14',
    image:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    distance: 2.1,
  },
  {
    id: 2,
    title: '롯데시티호텔 명동',
    areaName: '서울특별시',
    sigunguName: '중구',
    address: '서울특별시 중구 삼일대로 362',
    contentTypeId: '14',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    distance: 2.5,
  },
  {
    id: 3,
    title: '임피리얼 팰리스 부티크 호텔',
    areaName: '서울특별시',
    sigunguName: '용산구',
    address: '서울특별시 용산구 이태원로 221',
    contentTypeId: '14',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=700&q=80',
    rating: 4.6,
    distance: 3.2,
  },
  {
    id: 4,
    title: '호텔 마누',
    areaName: '서울특별시',
    sigunguName: '중구',
    address: '서울특별시 중구 퇴계로 19',
    contentTypeId: '14',
    image:
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=700&q=80',
    rating: 4.5,
    distance: 3.4,
  },
  {
    id: 5,
    title: '서울숲',
    areaName: '서울특별시',
    sigunguName: '성동구',
    address: '서울특별시 성동구 뚝섬로 273',
    contentTypeId: '12',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    distance: 4.1,
  },
  {
    id: 6,
    title: '광장시장 맛집거리',
    areaName: '서울특별시',
    sigunguName: '종로구',
    address: '서울특별시 종로구 창경궁로 88',
    contentTypeId: '39',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80',
    rating: 4.7,
    distance: 3.8,
  },
  {
    id: 7,
    title: '광교호수공원',
    areaName: '경기도',
    sigunguName: '수원시',
    address: '경기도 수원시 영통구 광교호수로 165',
    contentTypeId: '12',
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=80',
    rating: 4.8,
    distance: 1.7,
  },
  {
    id: 8,
    title: '수원화성',
    areaName: '경기도',
    sigunguName: '수원시',
    address: '경기도 수원시 장안구 영화동',
    contentTypeId: '14',
    image:
      'https://images.unsplash.com/photo-1538485399081-7c897c0e7efc?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    distance: 2.3,
  },
  {
    id: 9,
    title: '성산일출봉',
    areaName: '제주특별자치도',
    sigunguName: '서귀포시',
    address: '제주특별자치도 서귀포시 성산읍',
    contentTypeId: '12',
    image:
      'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=700&q=80',
    rating: 4.9,
    distance: 5.2,
  },
  {
    id: 10,
    title: '제주 향토음식점',
    areaName: '제주특별자치도',
    sigunguName: '제주시',
    address: '제주특별자치도 제주시 연동',
    contentTypeId: '39',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80',
    rating: 4.6,
    distance: 1.9,
  },
];

export default function SearchScreen() {
  const [searchInput, setSearchInput] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryCode>('');

  const [selectedArea, setSelectedArea] = useState<Area>(AREA_LIST[0]);
  const [selectedSigungu, setSelectedSigungu] = useState('전체');

  const [tempArea, setTempArea] = useState<Area>(AREA_LIST[0]);
  const [tempSigungu, setTempSigungu] = useState('전체');

  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    'area' | 'sigungu' | null
  >(null);

  const sigunguOptions =
    SIGUNGU_LIST[tempArea.code] ?? ['전체'];

  const visiblePlaces = useMemo(() => {
    const normalizedKeyword = appliedKeyword.trim().toLowerCase();

    return SAMPLE_PLACES.filter((place) => {
      const matchesArea = place.areaName === selectedArea.name;

      const matchesSigungu =
        selectedSigungu === '전체' ||
        place.sigunguName === selectedSigungu;

      const matchesCategory =
        selectedCategory === '' ||
        place.contentTypeId === selectedCategory;

      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        place.title.toLowerCase().includes(normalizedKeyword) ||
        place.address.toLowerCase().includes(normalizedKeyword);

      return (
        matchesArea &&
        matchesSigungu &&
        matchesCategory &&
        matchesKeyword
      );
    });
  }, [
    appliedKeyword,
    selectedArea,
    selectedCategory,
    selectedSigungu,
  ]);

  const openRegionModal = () => {
    setTempArea(selectedArea);
    setTempSigungu(selectedSigungu);
    setOpenDropdown(null);
    setRegionModalVisible(true);
  };

  const closeRegionModal = () => {
    setOpenDropdown(null);
    setRegionModalVisible(false);
  };

  const applyRegion = () => {
    setSelectedArea(tempArea);
    setSelectedSigungu(tempSigungu);
    closeRegionModal();
  };

  const submitSearch = () => {
    Keyboard.dismiss();
    setAppliedKeyword(searchInput.trim());
  };

  const selectedRegionText =
    selectedSigungu === '전체'
      ? selectedArea.name
      : `${selectedArea.name} ${selectedSigungu}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.regionButton} onPress={openRegionModal}>
          <Text style={styles.regionText}>{selectedRegionText}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.text} />
        </Pressable>

        <Text style={styles.screenTitle}>검색</Text>

        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={19}
            color={COLORS.primary}
          />

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

        <Text style={styles.sectionTitle}>추천 관광지</Text>

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

        {visiblePlaces.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="search-outline"
              size={34}
              color="#B5AECF"
            />
            <Text style={styles.emptyText}>
              선택한 조건에 맞는 관광지가 없습니다.
            </Text>
          </View>
        ) : selectedCategory === '' ? (
          <View style={styles.grid}>
            {visiblePlaces.slice(0, 6).map((place) => (
              <GridPlaceCard key={place.id} place={place} />
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {visiblePlaces.map((place) => (
              <ListPlaceCard key={place.id} place={place} />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={regionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRegionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.regionModal}>
            <View style={styles.modalHeader}>
              <Pressable
                style={styles.modalBackButton}
                onPress={closeRegionModal}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={COLORS.text}
                />
              </Pressable>

              <Text style={styles.modalTitle}>지역 설정</Text>
            </View>

            <Text style={styles.modalLabel}>도 / 광역시</Text>

            <DropdownButton
              text={tempArea.name}
              isOpen={openDropdown === 'area'}
              onPress={() =>
                setOpenDropdown((current) =>
                  current === 'area' ? null : 'area',
                )
              }
            />

            {openDropdown === 'area' && (
              <ScrollView
                style={styles.dropdownList}
                nestedScrollEnabled
              >
                {AREA_LIST.map((area) => {
                  const isSelected = tempArea.code === area.code;

                  return (
                    <Pressable
                      key={area.code}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setTempArea(area);
                        setTempSigungu('전체');
                        setOpenDropdown(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected &&
                            styles.selectedDropdownItemText,
                        ]}
                      >
                        {area.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Text style={styles.modalLabel}>시 / 구</Text>

            <DropdownButton
              text={tempSigungu}
              isOpen={openDropdown === 'sigungu'}
              onPress={() =>
                setOpenDropdown((current) =>
                  current === 'sigungu' ? null : 'sigungu',
                )
              }
            />

            {openDropdown === 'sigungu' && (
              <ScrollView
                style={styles.dropdownList}
                nestedScrollEnabled
              >
                {sigunguOptions.map((sigungu) => {
                  const isSelected = tempSigungu === sigungu;

                  return (
                    <Pressable
                      key={sigungu}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setTempSigungu(sigungu);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected &&
                            styles.selectedDropdownItemText,
                        ]}
                      >
                        {sigungu}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeRegionModal}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>

              <Pressable
                style={styles.applyButton}
                onPress={applyRegion}
              >
                <Text style={styles.applyButtonText}>적용하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type PlaceCardProps = {
  place: Place;
};

function GridPlaceCard({ place }: PlaceCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.gridCard,
        pressed && styles.pressedCard,
      ]}
      onPress={() =>
        Alert.alert(
          place.title,
          '관광지 상세 화면은 이후 단계에서 연결합니다.',
        )
      }
    >
      <Image
        source={{ uri: place.image }}
        style={styles.gridCardImage}
        resizeMode="cover"
      />

      <View style={styles.gridCardContent}>
        <Text style={styles.gridCardTitle} numberOfLines={2}>
          {place.title}
        </Text>

        <Text style={styles.gridCardAddress} numberOfLines={3}>
          {place.address}
        </Text>
      </View>
    </Pressable>
  );
}

function ListPlaceCard({ place }: PlaceCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.listCard,
        pressed && styles.pressedCard,
      ]}
      onPress={() =>
        Alert.alert(
          place.title,
          '관광지 상세 화면은 이후 단계에서 연결합니다.',
        )
      }
    >
      <Image
        source={{ uri: place.image }}
        style={styles.listCardImage}
        resizeMode="cover"
      />

      <View style={styles.listCardContent}>
        <Text style={styles.listCardTitle}>{place.title}</Text>

        <Text style={styles.listCardAddress} numberOfLines={2}>
          {place.address}
        </Text>

        <Text style={styles.listCardMeta}>
          ⭐ {place.rating.toFixed(1)} · {place.distance.toFixed(1)}km
        </Text>
      </View>
    </Pressable>
  );
}

type DropdownButtonProps = {
  text: string;
  isOpen: boolean;
  onPress: () => void;
};

function DropdownButton({
  text,
  isOpen,
  onPress,
}: DropdownButtonProps) {
  return (
    <Pressable style={styles.dropdownButton} onPress={onPress}>
      <Text style={styles.dropdownButtonText}>{text}</Text>

      <Ionicons
        name={isOpen ? 'chevron-up' : 'chevron-down'}
        size={17}
        color="#555555"
      />
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
    paddingTop: 12,
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

  screenTitle: {
    marginTop: 22,
    marginBottom: 18,
    color: COLORS.primaryDark,
    fontSize: 22,
    fontWeight: '800',
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
    fontWeight: '700',
  },

  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  categoryList: {
    gap: 8,
    paddingBottom: 18,
  },

  categoryButton: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
  },

  selectedCategoryButton: {
    backgroundColor: COLORS.primarySelected,
  },

  categoryText: {
    color: COLORS.secondaryText,
    fontSize: 13,
  },

  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: '700',
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
    backgroundColor: '#FFFFFF',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 3,
  },

  gridCardImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#EEEEEE',
  },

  gridCardContent: {
    minHeight: 88,
    padding: 11,
  },

  gridCardTitle: {
    marginBottom: 6,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
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
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  listCardImage: {
    width: 92,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },

  listCardContent: {
    flex: 1,
  },

  listCardTitle: {
    marginBottom: 6,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  listCardAddress: {
    marginBottom: 7,
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 17,
  },

  listCardMeta: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  pressedCard: {
    opacity: 0.72,
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 230,
    paddingHorizontal: 20,
  },

  emptyText: {
    marginTop: 12,
    color: COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 90,
    paddingHorizontal: 20,
    backgroundColor: COLORS.modalOverlay,
  },

  regionModal: {
    width: '100%',
    maxWidth: 350,
    maxHeight: '78%',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  modalBackButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  modalLabel: {
    marginTop: 22,
    marginBottom: 9,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  dropdownButton: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
  },

  dropdownButtonText: {
    color: '#333333',
    fontSize: 14,
  },

  dropdownList: {
    maxHeight: 170,
    marginTop: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  dropdownItem: {
    minHeight: 41,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  selectedDropdownItem: {
    backgroundColor: COLORS.primarySelected,
  },

  dropdownItemText: {
    color: '#555555',
    fontSize: 13,
  },

  selectedDropdownItemText: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },

  cancelButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F1F1',
  },

  cancelButtonText: {
    color: '#555555',
    fontSize: 16,
    fontWeight: '700',
  },

  applyButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },

  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});