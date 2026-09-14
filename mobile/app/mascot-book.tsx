import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegionMascot } from '@/src/components/mascot/RegionMascot';
import { useTravelData } from '@/src/context/TravelDataContext';
import { MASCOTS } from '@/src/data/mascots';
import { getVisibleMascots, type MascotBookFilter } from '@/src/utils/mascotBookPresentation';
import { getRegionMascotLook } from '@/src/data/regionMascotThemes';
import {
  buildMascotCollection,
  displayAcquiredDate,
  type MascotCollectionEntry,
} from '@/src/utils/mascotUnlockUtils';

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 10;
const MASCOT_NUMBERS = new Map(MASCOTS.map((mascot, index) => [mascot.id, index + 1]));
const FILTERS: { key: MascotBookFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'collected', label: '수집 완료' },
  { key: 'locked', label: '미해금' },
];

export default function MascotBookScreen() {
  const { records, isLoading } = useTravelData();
  const listRef = useRef<FlatList<MascotCollectionEntry>>(null);
  const [filter, setFilter] = useState<MascotBookFilter>('all');
  const { width } = useWindowDimensions();
  const [selectedMascotId, setSelectedMascotId] = useState<string | null>(null);
  const [listWidth, setListWidth] = useState(Math.min(width, 1100));
  const collection = useMemo(() => buildMascotCollection(records, MASCOTS), [records]);
  const visibleCollection = useMemo(() => getVisibleMascots(collection, filter), [collection, filter]);
  const selectedMascot = collection.find(item => item.id === selectedMascotId) ?? null;
  const unlockedCount = collection.filter((mascot) => mascot.isUnlocked).length;
  const remainingCount = collection.length - unlockedCount;
  const filterCounts = { all: collection.length, collected: unlockedCount, locked: remainingCount };
  const changeFilter = (next: MascotBookFilter) => {
    setFilter(next);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };
  const progress = collection.length === 0 ? 0 : Math.round((unlockedCount / collection.length) * 100);
  const numColumns = listWidth >= 960 ? 5 : listWidth >= 720 ? 4 : listWidth >= 520 ? 3 : 2;
  const cardWidth = (listWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP * (numColumns - 1)) / numColumns;
  const message = unlockedCount === 0
    ? '상세 지역 여행 기록을 남기고 첫 트립버디를 만나보세요.'
    : remainingCount === 0
      ? '모든 상세 지역 트립버디를 수집했어요!'
      : `앞으로 ${remainingCount}개 지역의 트립버디가 기다리고 있어요.`;

  if (isLoading) {
    return <View style={styles.loading}><Text style={styles.loadingText}>마스코트 도감을 준비하는 중입니다.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        ref={listRef}
        key={numColumns}
        style={styles.list}
        onLayout={event => setListWidth(event.nativeEvent.layout.width)}
        extraData={selectedMascotId}
        data={visibleCollection}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={12}
        windowSize={7}
        ListHeaderComponent={(
          <View>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="이전 화면으로 돌아가기"
                hitSlop={10}
              >
                <Text style={styles.back}>‹</Text>
              </Pressable>
              <Text style={styles.headerTitle}>마스코트 도감</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.intro}>
              <Text style={styles.eyebrow}>TRIP BUDDY COLLECTION</Text>
              <Text style={styles.introTitle}>여행할수록 늘어나는{`\n`}나만의 지역 친구들</Text>
              <Text style={styles.introDescription}>지역의 풍경을 닮은 작은 여행 친구들. 기록을 남기고 나만의 컬렉션을 채워보세요.</Text>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressLabel}>수집한 시·군·구 / 전체 지역</Text>
                  <Text style={styles.progressCount}>{unlockedCount} / {collection.length}</Text>
                </View>
                <View style={styles.percentBadge}><Text style={styles.progressPercent}>{progress}%</Text></View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.progressFooter}>
                <Text style={styles.progressMessage}>{message}</Text>
                <Text style={styles.remaining}>남은 지역 {remainingCount}</Text>
              </View>
            </View>

            <View style={styles.filters}>
              {FILTERS.map(item => (
                <Pressable key={item.key} accessibilityRole="tab"
                  accessibilityState={{ selected: filter === item.key }}
                  accessibilityLabel={item.label + ' ' + filterCounts[item.key] + '개'}
                  onPress={() => changeFilter(item.key)}
                  style={({ pressed }) => [styles.filterButton, filter === item.key && styles.filterActive, pressed && styles.filterPressed]}>
                  <Text style={[styles.filterLabel, filter === item.key && styles.filterLabelActive]}>{item.label}</Text>
                  <Text style={[styles.filterCount, filter === item.key && styles.filterLabelActive]}>{filterCounts[item.key]}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{filter === 'collected' ? '나의 컬렉션' : filter === 'locked' ? '다음 여행의 친구들' : '지역 친구들'}</Text>
              <Text style={styles.sectionHint} accessibilityLiveRegion="polite">{visibleCollection.length}개 · {filter === 'locked' ? '지역순' : filter === 'collected' ? '최근 획득순' : '수집 완료 먼저'}</Text>
            </View>
            <Text style={styles.collectionHint}>{filter === 'locked' ? '지역마다 다른 실루엣 속에서 다음 여행의 단서를 찾아보세요.' : '여행으로 만난 친구들이 앞에 모여 있어요. 최근 획득순으로 살펴보세요.'}</Text>
          </View>
        )}
        ListEmptyComponent={<View style={styles.emptyCollection}>
          <Text style={styles.emptyCollectionTitle}>{filter === 'collected' ? '첫 지역 친구를 기다리고 있어요' : '모든 지역 친구를 만났어요!'}</Text>
          <Text style={styles.emptyCollectionText}>{filter === 'collected' ? '여행 기록을 남기면 이곳에 나만의 컬렉션이 채워집니다.' : '수집 완료에서 함께한 친구들을 다시 만나보세요.'}</Text>
        </View>}
        renderItem={({ item }) => (
          <MascotCard
            mascot={item}
            width={cardWidth}
            number={MASCOT_NUMBERS.get(item.id) ?? 0}
            selected={selectedMascotId === item.id}
            onPress={() => setSelectedMascotId(item.id)}
          />
        )}
      />

      <MascotDetailModal mascot={selectedMascot} onClose={() => setSelectedMascotId(null)} />
    </SafeAreaView>
  );
}

function MascotCard({ mascot, width, number, selected, onPress }: { mascot: MascotCollectionEntry; width: number; number: number; selected: boolean; onPress: () => void }) {
  const look = getRegionMascotLook(mascot.areaCode, mascot.sigunguCode, mascot.sigunguName);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${mascot.regionName}, ${mascot.isUnlocked ? `${displayAcquiredDate(mascot.acquiredDate)} 획득` : '미획득'}, 상세 보기`}
      style={({ pressed }) => [
        styles.mascotCard,
        { width },
        mascot.isUnlocked && styles.unlockedCard,
        mascot.isUnlocked && { borderColor: look.primary },
        selected && styles.selectedCard,
        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.status, mascot.isUnlocked && styles.unlockedStatus, mascot.isUnlocked && { backgroundColor: look.pale }]}>
          {mascot.isUnlocked ? '✓ 수집 완료' : '미해금'}
        </Text>
        <Text style={styles.cardCode}>{'No. ' + String(number).padStart(3, '0')}</Text>
      </View>
      <View style={[styles.mascotStage, { backgroundColor: mascot.isUnlocked ? look.pale : '#EEF1F2' }]}>
      <RegionMascot
        areaCode={mascot.areaCode}
        sigunguCode={mascot.sigunguCode}
        sigunguName={mascot.sigunguName}
        regionName={mascot.regionName}
        unlocked={mascot.isUnlocked}
        size={Math.min(164, width - 24)}
      />
      </View>
      <Text style={[styles.regionName, !mascot.isUnlocked && styles.lockedRegionName]} numberOfLines={2}>
        {mascot.regionName}
      </Text>
      <Text style={styles.mascotName} numberOfLines={1}>
        {mascot.isUnlocked ? mascot.mascotName : '아직 만나지 못한 친구'}
      </Text>
      <Text style={styles.cardMeta} numberOfLines={1}>
        {mascot.isUnlocked ? `${displayAcquiredDate(mascot.acquiredDate)} 획득` : '여행 기록으로 해금'}
      </Text>
    </Pressable>
  );
}

function MascotDetailModal({ mascot, onClose }: { mascot: MascotCollectionEntry | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  if (!mascot) return null;

  const look = getRegionMascotLook(mascot.areaCode, mascot.sigunguCode, mascot.sigunguName);
  const isSuwon = mascot.areaCode === '31' && mascot.sigunguName === '수원시';
  const motifSummary = isSuwon ? '성곽 · 성문 · 여행 스탬프' : look.theme.motifSummary;

  const openRecord = (recordId: string) => {
    onClose();
    router.push({ pathname: '/record/[id]', params: { id: recordId } });
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="마스코트 상세 닫기"
        />
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom }]} accessibilityViewIsModal>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.modalHeading}>
              <Text style={styles.modalEyebrow}>{mascot.isUnlocked ? 'COLLECTED BUDDY' : 'LOCKED BUDDY'}</Text>
              <Text style={styles.modalTitle}>{mascot.regionName}</Text>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="마스코트 상세 닫기"
              hitSlop={8}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            <View style={[styles.heroMascot, { backgroundColor: mascot.isUnlocked ? look.pale : '#EFEDF2' }]}>
              <RegionMascot
                areaCode={mascot.areaCode}
                sigunguCode={mascot.sigunguCode}
                sigunguName={mascot.sigunguName}
                regionName={mascot.regionName}
                unlocked={mascot.isUnlocked}
                size={188}
              />
            </View>

            <View style={styles.detailTitleRow}>
              <View style={styles.detailTitleText}>
                <Text style={styles.detailName}>{mascot.isUnlocked ? mascot.mascotName : '아직 만나지 못한 트립버디'}</Text>
                <Text style={styles.detailTheme}>{look.title}</Text>
              </View>
              <View style={[styles.detailStatus, mascot.isUnlocked && styles.detailStatusUnlocked]}>
                <Text style={[styles.detailStatusText, mascot.isUnlocked && styles.detailStatusTextUnlocked]}>
                  {mascot.isUnlocked ? '획득' : '잠김'}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>지역 테마</Text>
              <Text style={styles.infoText}>{look.description}</Text>
              <Text style={styles.motifText}>{motifSummary}</Text>
            </View>

            <View style={styles.acquireCard}>
              <View>
                <Text style={styles.acquireLabel}>획득 날짜</Text>
                <Text style={styles.acquireValue}>
                  {mascot.isUnlocked ? displayAcquiredDate(mascot.acquiredDate) : '여행 기록을 남기면 자동 해금'}
                </Text>
              </View>
              <Text style={styles.acquireIcon}>{mascot.isUnlocked ? '✓' : '⌁'}</Text>
            </View>

            <Text style={styles.recordSectionTitle}>관련 여행 기록 {mascot.relatedRecords.length}</Text>
            {mascot.relatedRecords.length === 0 ? (
              <View style={styles.emptyRecords}>
                <Text style={styles.emptyRecordsTitle}>아직 연결된 여행 기록이 없어요.</Text>
                <Text style={styles.emptyRecordsText}>이 시·군·구의 여행 기록을 저장하면 컬러 트립버디와 획득일이 표시됩니다.</Text>
              </View>
            ) : mascot.relatedRecords.map((record) => (
              <Pressable
                key={record.id}
                style={({ pressed }) => [styles.recordItem, pressed && styles.recordItemPressed]}
                onPress={() => openRecord(record.id)}
                accessibilityRole="button"
                accessibilityLabel={`${record.title}, ${record.date}, 여행 기록 열기`}
              >
                <View style={styles.recordDot} />
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle} numberOfLines={1}>{record.title}</Text>
                  <Text style={styles.recordDate}>{record.date || displayAcquiredDate(record.startDate)}</Text>
                </View>
                <Text style={styles.recordChevron}>›</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFDFF' },
  list: { width: '100%', maxWidth: 1100, alignSelf: 'center' },
  selectedCard: { borderColor: '#483268', borderWidth: 2 },
  modalHeading: { flex: 1 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 22 },
  filterButton: { flex: 1, minWidth: 0, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 15, borderWidth: 1, borderColor: '#E1DDE7', backgroundColor: '#FFFFFF' },
  filterActive: { backgroundColor: '#463557', borderColor: '#463557' },
  filterPressed: { opacity: 0.8 },
  filterLabel: { color: '#70657A', fontSize: 12, fontWeight: '700' },
  filterCount: { color: '#463557', fontSize: 19, fontWeight: '800' },
  filterLabelActive: { color: '#FFFFFF' },
  collectionHint: { color: '#7B7282', fontSize: 12, lineHeight: 19, marginBottom: 16 },
  mascotStage: { width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 15, marginTop: 12 },
  emptyCollection: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 42, borderRadius: 18, backgroundColor: '#F5F2F8', gap: 10 },
  emptyCollectionTitle: { color: '#47384F', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyCollectionText: { color: '#7A6E82', fontSize: 13, lineHeight: 21, textAlign: 'center' },
  content: { paddingHorizontal: HORIZONTAL_PADDING, paddingBottom: 44 },
  gridRow: { gap: COLUMN_GAP, marginBottom: 10 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 42, color: '#222222', fontSize: 34, lineHeight: 34 },
  headerTitle: { color: '#222222', fontSize: 19, fontWeight: '800' },
  headerSpacer: { width: 42 },
  intro: { paddingTop: 20, paddingBottom: 5 },
  eyebrow: { color: '#7666D8', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  introTitle: { marginTop: 8, color: '#2D2840', fontSize: 25, lineHeight: 33, fontWeight: '900' },
  introDescription: { marginTop: 9, color: '#777086', fontSize: 13, lineHeight: 18 },
  progressCard: { marginTop: 18, padding: 18, borderWidth: 1, borderColor: '#E6E0FA', borderRadius: 22, backgroundColor: '#F3EFF7' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { color: '#82799C', fontSize: 12 },
  progressCount: { marginTop: 5, color: '#30284A', fontSize: 23, fontWeight: '900' },
  percentBadge: { minWidth: 58, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#FFFFFF' },
  progressPercent: { color: '#5C3DFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  progressBar: { height: 9, marginTop: 15, overflow: 'hidden', borderRadius: 5, backgroundColor: '#DED8EF' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: '#6040AC' },
  progressFooter: { marginTop: 11, gap: 5 },
  progressMessage: { color: '#6F687E', fontSize: 11, lineHeight: 16 },
  remaining: { color: '#5C3DFF', fontSize: 11, fontWeight: '700' },
  sectionHeader: { marginTop: 25, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { color: '#272331', fontSize: 17, fontWeight: '800' },
  sectionHint: { flexShrink: 1, color: '#796F84', fontSize: 11, textAlign: 'right' },
  mascotCard: { minHeight: 290, alignItems: 'center', padding: 11, overflow: 'hidden', borderWidth: 1, borderColor: '#E4E1E8', borderRadius: 19, backgroundColor: '#F7F7F8' },
  unlockedCard: { borderColor: '#D9D1E6', backgroundColor: '#FFFFFF' },
  pressedCard: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  cardTopRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  status: { paddingVertical: 4, paddingHorizontal: 7, overflow: 'hidden', borderRadius: 999, backgroundColor: '#E1DFE4', color: '#66616D', fontSize: 10, fontWeight: '800' },
  unlockedStatus: { backgroundColor: '#E7F2EC', color: '#365B48' },
  cardCode: { flexShrink: 1, color: '#777080', fontSize: 10, fontWeight: '600' },
  regionName: { minHeight: 40, marginTop: 7, color: '#443552', fontSize: 13, lineHeight: 19, fontWeight: '800', textAlign: 'center' },
  lockedRegionName: { color: '#5E5966' },
  mascotName: { maxWidth: '100%', marginTop: 2, color: '#554E64', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  cardMeta: { maxWidth: '100%', marginTop: 6, color: '#726B7C', fontSize: 11, textAlign: 'center' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28, 24, 38, 0.48)' },
  modalSheet: { width: '100%', maxWidth: 600, alignSelf: 'center', maxHeight: '91%', paddingTop: 10, paddingHorizontal: 18, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FDFDFF' },
  modalHandle: { width: 42, height: 5, alignSelf: 'center', borderRadius: 3, backgroundColor: '#D8D3DF' },
  modalHeader: { minHeight: 67, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  modalEyebrow: { color: '#7666D8', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  modalTitle: { marginTop: 4, color: '#29243A', fontSize: 20, fontWeight: '900' },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#EEEAF6' },
  closeText: { color: '#665C85', fontSize: 23, lineHeight: 25 },
  modalContent: { paddingBottom: 36 },
  heroMascot: { minHeight: 208, alignItems: 'center', justifyContent: 'center', borderRadius: 23 },
  detailTitleRow: { marginTop: 18, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  detailTitleText: { flex: 1 },
  detailName: { color: '#29243A', fontSize: 19, fontWeight: '900' },
  detailTheme: { marginTop: 5, color: '#655A86', fontSize: 13, fontWeight: '700' },
  detailStatus: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, backgroundColor: '#ECE9EF' },
  detailStatusUnlocked: { backgroundColor: '#E3DCFF' },
  detailStatusText: { color: '#7D7685', fontSize: 10, fontWeight: '800' },
  detailStatusTextUnlocked: { color: '#5C3DFF' },
  infoCard: { marginTop: 17, padding: 16, borderWidth: 1, borderColor: '#E9E5F1', borderRadius: 17, backgroundColor: '#FFFFFF' },
  infoLabel: { color: '#8B80B2', fontSize: 11, fontWeight: '800' },
  infoText: { marginTop: 7, color: '#514A5F', fontSize: 13, lineHeight: 20 },
  motifText: { marginTop: 10, color: '#5C3DFF', fontSize: 11, fontWeight: '700' },
  acquireCard: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 17, backgroundColor: '#F2EEFF' },
  acquireLabel: { color: '#887E9D', fontSize: 11 },
  acquireValue: { marginTop: 5, color: '#40365C', fontSize: 14, fontWeight: '800' },
  acquireIcon: { color: '#5C3DFF', fontSize: 24, fontWeight: '800' },
  recordSectionTitle: { marginTop: 22, marginBottom: 10, color: '#29243A', fontSize: 16, fontWeight: '800' },
  emptyRecords: { padding: 18, borderRadius: 17, backgroundColor: '#F4F2F6' },
  emptyRecordsTitle: { color: '#5E5867', fontSize: 13, fontWeight: '700' },
  emptyRecordsText: { marginTop: 6, color: '#8A8491', fontSize: 11, lineHeight: 17 },
  recordItem: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 8, padding: 13, borderWidth: 1, borderColor: '#ECE8F2', borderRadius: 15, backgroundColor: '#FFFFFF' },
  recordItemPressed: { backgroundColor: '#F5F1FF' },
  recordDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#7B65F1' },
  recordInfo: { flex: 1 },
  recordTitle: { color: '#403A4C', fontSize: 13, fontWeight: '700' },
  recordDate: { marginTop: 4, color: '#968FA1', fontSize: 10 },
  recordChevron: { color: '#7769A3', fontSize: 22 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { color: '#777777', fontSize: 14 },
});
