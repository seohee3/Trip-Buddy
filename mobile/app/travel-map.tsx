import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { REGIONS, findRegionSelection, getFullRegionName } from '@/src/data/regions';
import { useTravelData } from '@/src/context/TravelDataContext';
import { getRecordRegionName, getRegionRecords, getVisitedRegions } from '@/src/utils/travel';
import type { TravelRecord } from '@/src/types/travel';

export default function TravelMapScreen() {
  const { records, isLoading } = useTravelData();
  const params = useLocalSearchParams<{ region?: string }>();
  const initialSelection = params.region ? findRegionSelection(String(params.region)) : undefined;
  const [selectedAreaCode, setSelectedAreaCode] = useState(initialSelection?.area.code ?? REGIONS[0].code);
  const [selectedSigunguCode, setSelectedSigunguCode] = useState(initialSelection?.sigungu?.code ?? '');
  const selectedArea = REGIONS.find((area) => area.code === selectedAreaCode) ?? REGIONS[0];

  useEffect(() => {
    if (!params.region) return;
    const selection = findRegionSelection(String(params.region));
    if (selection) {
      setSelectedAreaCode(selection.area.code);
      setSelectedSigunguCode(selection.sigungu?.code ?? '');
    }
  }, [params.region]);

  const areaCounts = useMemo(() => records.reduce<Record<string, number>>((counts, record) => {
    if (record.areaCode) counts[record.areaCode] = (counts[record.areaCode] ?? 0) + 1;
    return counts;
  }, {}), [records]);
  const sigunguCounts = useMemo(() => records.reduce<Record<string, number>>((counts, record) => {
    if (record.areaCode === selectedArea.code && record.sigunguCode) counts[record.sigunguCode] = (counts[record.sigunguCode] ?? 0) + 1;
    return counts;
  }, {}), [records, selectedArea.code]);
  const selectedAreaRecords = useMemo(() => records.filter((record) => record.areaCode === selectedArea.code), [records, selectedArea.code]);
  const selectedRecords = selectedSigunguCode
    ? selectedAreaRecords.filter((record) => record.sigunguCode === selectedSigunguCode)
    : selectedAreaRecords;
  const visitedRegions = useMemo(() => getVisitedRegions(records), [records]);
  const visitedAreaCount = new Set(records.map((record) => record.areaCode).filter(Boolean)).size;
  const totalSigunguCount = REGIONS.reduce((total, area) => total + area.sigungus.length, 0);
  const visitedSigunguCount = new Set(records.map((record) => record.sigunguCode || record.fullRegionName).filter(Boolean)).size;
  const regionCounts = useMemo(() => records.reduce<Record<string, number>>((counts, record) => {
    const region = getRecordRegionName(record);
    counts[region] = (counts[region] ?? 0) + 1;
    return counts;
  }, {}), [records]);
  const sortedVisitedRegions = [...visitedRegions].sort((a, b) => (regionCounts[b] ?? 0) - (regionCounts[a] ?? 0));
  const recentRecord = useMemo(() => [...records].sort((a, b) => b.startDate.localeCompare(a.startDate))[0], [records]);
  const topRegions = sortedVisitedRegions.slice(0, 3);
  const mostVisited = sortedVisitedRegions[0];
  const selectedRegionName = selectedSigunguCode
    ? getFullRegionName(selectedArea.name, selectedArea.sigungus.find((item) => item.code === selectedSigunguCode)?.name)
    : selectedArea.name;

  if (isLoading) return <View style={styles.loading}><Text style={styles.loadingText}>여행 통계를 계산하는 중입니다.</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.headerTitle}>여행 지도</Text><Text style={styles.brand}>Travel Mate</Text></View>
        <View style={styles.mapHero}><Text style={styles.mapEmoji}>🗺️</Text><Text style={styles.mapTitle}>나의 상세 여행 발자국</Text><Text style={styles.mapSubtitle}>도·광역시를 고른 뒤 시·군·구별 방문 현황을 확인해보세요.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaList}>{REGIONS.map((area) => <Pressable key={area.code} onPress={() => { setSelectedAreaCode(area.code); setSelectedSigunguCode(''); }} style={[styles.areaChip, area.code === selectedArea.code && styles.selectedAreaChip, (areaCounts[area.code] ?? 0) > 0 && styles.visitedAreaChip]}><Text style={[styles.areaChipText, area.code === selectedArea.code && styles.selectedAreaChipText]}>{area.name}</Text></Pressable>)}</ScrollView>
        </View>

        <View style={styles.mapStatus}><Text style={styles.statusTitle}>{selectedArea.name} 방문 지도</Text><Text style={styles.statusText}>상세 방문 지역 <Text style={styles.statusStrong}>{visitedSigunguCount} / {totalSigunguCount}</Text> · 방문 도/광역시 {visitedAreaCount} / {REGIONS.length}</Text></View>
        <View style={styles.subregionCard}><View style={styles.subregionHeader}><Text style={styles.subregionTitle}>시 / 군 / 구 현황</Text><Text style={styles.legend}><Text style={styles.legendVisited}>●</Text> 방문 <Text style={styles.legendUnvisited}>●</Text> 미방문</Text></View><View style={styles.subregionGrid}>{selectedArea.sigungus.map((sigungu) => { const count = sigunguCounts[sigungu.code] ?? 0; const isSelected = selectedSigunguCode === sigungu.code; return <Pressable key={sigungu.code} onPress={() => setSelectedSigunguCode(isSelected ? '' : sigungu.code)} style={[styles.subregionItem, count > 0 && styles.visitedSubregion, isSelected && styles.selectedSubregion]}><Text style={[styles.subregionName, count > 0 && styles.visitedSubregionText]}>{sigungu.name}</Text><Text style={[styles.subregionCount, count > 0 && styles.visitedSubregionText]}>{count > 0 ? `${count}회` : '미방문'}</Text></Pressable>; })}</View></View>

        {selectedRegionName && <RegionDetail region={selectedRegionName} records={selectedRecords} count={selectedRecords.length} onClose={() => setSelectedSigunguCode('')} />}

        <Text style={styles.sectionTitle}>여행 통계</Text>
        <View style={styles.summaryGrid}><Summary icon="✈️" label="총 여행" value={`${records.length}`} sub="기록한 여행의 총 횟수" /><Summary icon="📍" label="방문 지역" value={`${visitedSigunguCount}`} sub="상세 시·군·구 기준" /><Summary icon="🧭" label="최근 방문" value={recentRecord ? getRecordRegionName(recentRecord) : '없음'} sub={recentRecord?.date ?? '기록 없음'} /><Summary icon="🏆" label="최다 방문" value={mostVisited ?? '없음'} sub={mostVisited ? `${regionCounts[mostVisited]}회 방문` : '0회 방문'} /></View>

        <Text style={styles.sectionTitle}>TOP 3 지역</Text><View style={styles.topGrid}>{topRegions.length === 0 ? <EmptyText text="아직 방문 기록이 없습니다." /> : topRegions.map((region, index) => <Pressable key={region} style={styles.topCard} onPress={() => { const selection = findRegionSelection(region); if (selection) { setSelectedAreaCode(selection.area.code); setSelectedSigunguCode(selection.sigungu?.code ?? ''); } }}><Text style={styles.medal}>{['🥇', '🥈', '🥉'][index]}</Text><Text style={styles.topRegion}>{region}</Text><Text style={styles.topCount}>{regionCounts[region]}회</Text></Pressable>)}</View>

        <View style={styles.regionHeader}><Text style={styles.sectionTitle}>방문 지역 목록</Text><Text style={styles.regionHeaderText}>방문 횟수 기준</Text></View><View style={styles.regionList}>{sortedVisitedRegions.length === 0 ? <EmptyText text="아직 방문 기록이 없습니다." /> : sortedVisitedRegions.map((region, index) => <Pressable key={region} style={styles.regionItem} onPress={() => { const selection = findRegionSelection(region); if (selection) { setSelectedAreaCode(selection.area.code); setSelectedSigunguCode(selection.sigungu?.code ?? ''); } }}><Text style={styles.rank}>{index + 1}</Text><View style={styles.regionInfo}><Text style={styles.regionName}>{region}</Text><View style={styles.bar}><View style={[styles.barFill, { width: `${Math.max(((regionCounts[region] ?? 0) / (regionCounts[sortedVisitedRegions[0]] || 1)) * 100, 8)}%` }]} /></View></View><Text style={styles.regionCount}>{regionCounts[region]}회</Text></Pressable>)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) { return <View style={styles.summaryCard}><Text style={styles.summaryIcon}>{icon}</Text><View style={styles.summaryInfo}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue} numberOfLines={1}>{value}</Text><Text style={styles.summarySub} numberOfLines={2}>{sub}</Text></View></View>; }
function EmptyText({ text }: { text: string }) { return <Text style={styles.emptyText}>{text}</Text>; }
function RegionDetail({ region, records, count, onClose }: { region: string; records: TravelRecord[]; count: number; onClose: () => void }) { return <View style={styles.detailCard}><View style={styles.detailHeader}><View><Text style={styles.detailLabel}>선택한 지역</Text><Text style={styles.detailTitle}>{region}</Text></View><Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View><View style={styles.detailStats}><View style={styles.detailStat}><Text style={styles.detailStatLabel}>방문 횟수</Text><Text style={styles.detailStatValue}>{count}회</Text></View><View style={styles.detailStat}><Text style={styles.detailStatLabel}>최근 방문</Text><Text style={styles.detailStatValue} numberOfLines={1}>{records[0]?.date ?? '기록 없음'}</Text></View></View>{records.length === 0 ? <EmptyText text="이 지역의 여행 기록이 없습니다." /> : records.map((record) => <Pressable key={record.id} style={styles.detailRecord} onPress={() => router.push({ pathname: '/record/[id]', params: { id: record.id } })}><Text style={styles.detailRecordTitle} numberOfLines={1}>{record.title}</Text><Text style={styles.detailRecordDate}>{record.date}</Text></Pressable>)}</View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFDFF' }, container: { flex: 1, backgroundColor: '#FDFDFF' }, content: { paddingHorizontal: 20, paddingBottom: 42 }, header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 42, color: '#222222', fontSize: 34, lineHeight: 34 }, headerTitle: { color: '#222222', fontSize: 19, fontWeight: '800' }, brand: { color: '#5C3DFF', fontSize: 13, fontStyle: 'italic', fontWeight: '700' }, mapHero: { alignItems: 'center', marginTop: 18, padding: 18, borderRadius: 20, backgroundColor: '#F0F2FF' }, mapEmoji: { fontSize: 48 }, mapTitle: { marginTop: 8, color: '#30284A', fontSize: 18, fontWeight: '800' }, mapSubtitle: { marginTop: 5, color: '#777086', fontSize: 12, textAlign: 'center' }, areaList: { gap: 7, marginTop: 18 }, areaChip: { paddingVertical: 8, paddingHorizontal: 11, borderRadius: 16, backgroundColor: '#E1E1EA' }, selectedAreaChip: { backgroundColor: '#5C3DFF' }, visitedAreaChip: { borderWidth: 1, borderColor: '#AFA2FF' }, areaChipText: { color: '#777777', fontSize: 11, fontWeight: '700' }, selectedAreaChipText: { color: '#FFFFFF' }, mapStatus: { marginTop: 16 }, statusTitle: { color: '#222222', fontSize: 18, fontWeight: '800' }, statusText: { marginTop: 8, color: '#777777', fontSize: 13 }, statusStrong: { color: '#5C3DFF', fontSize: 18, fontWeight: '800' }, subregionCard: { marginTop: 16, padding: 16, borderRadius: 18, backgroundColor: '#FFFFFF' }, subregionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, subregionTitle: { color: '#30284A', fontSize: 15, fontWeight: '800' }, legend: { color: '#888394', fontSize: 10 }, legendVisited: { color: '#5C3DFF' }, legendUnvisited: { color: '#C8C8D2' }, subregionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 }, subregionItem: { width: '31.7%', minHeight: 53, justifyContent: 'center', paddingHorizontal: 6, borderRadius: 12, backgroundColor: '#E4E4EB' }, visitedSubregion: { backgroundColor: '#B6AAFF' }, selectedSubregion: { borderWidth: 2, borderColor: '#5C3DFF' }, subregionName: { color: '#777783', fontSize: 11, fontWeight: '700', textAlign: 'center' }, visitedSubregionText: { color: '#3B2B9D' }, subregionCount: { marginTop: 4, color: '#9999A5', fontSize: 9, textAlign: 'center' }, sectionTitle: { marginTop: 22, marginBottom: 14, color: '#222222', fontSize: 17, fontWeight: '700' }, summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, summaryCard: { width: '48.3%', minHeight: 108, flexDirection: 'row', gap: 9, padding: 12, borderRadius: 16, backgroundColor: '#FFFFFF' }, summaryIcon: { fontSize: 22 }, summaryInfo: { flex: 1 }, summaryLabel: { color: '#777086', fontSize: 11 }, summaryValue: { marginTop: 5, color: '#30284A', fontSize: 15, fontWeight: '800' }, summarySub: { marginTop: 4, color: '#777086', fontSize: 9, lineHeight: 13 }, topGrid: { flexDirection: 'row', gap: 10 }, topCard: { flex: 1, minHeight: 125, alignItems: 'center', padding: 11, borderWidth: 1, borderColor: '#E8E5EF', borderRadius: 16, backgroundColor: '#F5F2FF' }, medal: { fontSize: 28 }, topRegion: { marginTop: 8, color: '#332D47', fontSize: 11, fontWeight: '700', textAlign: 'center' }, topCount: { marginTop: 5, color: '#5C3DFF', fontSize: 12, fontWeight: '700' }, regionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, regionHeaderText: { marginTop: 22, color: '#777086', fontSize: 11 }, regionList: { padding: 16, borderRadius: 18, backgroundColor: '#FFFFFF' }, regionItem: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F4' }, rank: { width: 24, height: 24, paddingTop: 5, borderRadius: 12, backgroundColor: '#5C3DFF', color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' }, regionInfo: { flex: 1 }, regionName: { color: '#302A45', fontSize: 13, fontWeight: '700' }, bar: { height: 5, marginTop: 6, overflow: 'hidden', borderRadius: 3, backgroundColor: '#EEEEF4' }, barFill: { height: '100%', borderRadius: 3, backgroundColor: '#5C3DFF' }, regionCount: { width: 38, color: '#222222', fontSize: 12, textAlign: 'right' }, emptyText: { padding: 18, color: '#777777', fontSize: 13, textAlign: 'center' }, detailCard: { marginTop: 16, padding: 18, borderWidth: 1, borderColor: '#ECE9F8', borderRadius: 20, backgroundColor: '#FFFFFF' }, detailHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, detailLabel: { color: '#8D83B8', fontSize: 12, fontWeight: '700' }, detailTitle: { marginTop: 5, color: '#29233D', fontSize: 19, fontWeight: '800' }, closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#F2EFFB' }, closeText: { color: '#766BA7', fontSize: 21 }, detailStats: { flexDirection: 'row', gap: 10, marginTop: 16 }, detailStat: { flex: 1, padding: 13, borderRadius: 14, backgroundColor: '#F7F5FC' }, detailStatLabel: { color: '#8A839F', fontSize: 12 }, detailStatValue: { marginTop: 6, color: '#5C3DFF', fontSize: 14, fontWeight: '700' }, detailRecord: { marginTop: 8, padding: 12, borderRadius: 13, backgroundColor: '#FAF9FD' }, detailRecordTitle: { color: '#302A45', fontSize: 14, fontWeight: '700' }, detailRecordDate: { marginTop: 5, color: '#948CA8', fontSize: 12 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }, loadingText: { color: '#777777', fontSize: 14 },
});
