import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTravelData } from '@/src/context/TravelDataContext';
import { getRegionRecords, getVisitedRegions, normalizeRegionName, REGION_NAMES } from '@/src/utils/travel';
import type { TravelRecord } from '@/src/types/travel';

export default function TravelMapScreen() {
  const { records, isLoading } = useTravelData();
  const params = useLocalSearchParams<{ region?: string }>();
  const [selectedRegion, setSelectedRegion] = useState(params.region ? normalizeRegionName(params.region) : '');
  const regionCounts = useMemo(() => records.reduce<Record<string, number>>((counts, record) => { const region = normalizeRegionName(record.region); counts[region] = (counts[region] ?? 0) + 1; return counts; }, {}), [records]);
  const visitedRegions = useMemo(() => getVisitedRegions(records).sort((a, b) => (regionCounts[b] ?? 0) - (regionCounts[a] ?? 0)), [records, regionCounts]);
  const recentRecord = useMemo(() => [...records].sort((a, b) => b.startDate.localeCompare(a.startDate))[0], [records]);
  const topRegions = visitedRegions.slice(0, 3);
  const mostVisited = visitedRegions[0];
  const selectedRecords = selectedRegion ? getRegionRecords(records, selectedRegion) : [];

  useEffect(() => {
    if (params.region) setSelectedRegion(normalizeRegionName(params.region));
  }, [params.region]);

  if (isLoading) return <View style={styles.loading}><Text style={styles.loadingText}>여행 통계를 계산하는 중입니다.</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.headerTitle}>여행 지도</Text><Text style={styles.brand}>Travel Mate</Text></View>
        <View style={styles.mapHero}><Text style={styles.mapEmoji}>🗺️</Text><Text style={styles.mapTitle}>나의 여행 발자국</Text><Text style={styles.mapSubtitle}>기록한 지역을 눌러 여행 기록을 확인해보세요.</Text><View style={styles.regionDots}>{REGION_NAMES.map((region) => <Pressable key={region} onPress={() => setSelectedRegion(region)} style={[styles.regionDot, (regionCounts[region] ?? 0) > 0 && styles.visitedDot]}><Text style={styles.regionDotText}>{region.slice(0, 2)}</Text></Pressable>)}</View></View>

        <View style={styles.mapStatus}><Text style={styles.statusTitle}>나의 방문 현황</Text><Text style={styles.statusText}>방문 지역 <Text style={styles.statusStrong}>{visitedRegions.length} / {REGION_NAMES.length}</Text></Text></View>

        {selectedRegion && <RegionDetail region={selectedRegion} records={selectedRecords} count={regionCounts[selectedRegion] ?? 0} onClose={() => setSelectedRegion('')} />}

        <Text style={styles.sectionTitle}>여행 통계</Text>
        <View style={styles.summaryGrid}><Summary icon="🧳" label="총 여행" value={`${records.length}`} sub="기록한 여행의 총 횟수" /><Summary icon="📍" label="방문 지역" value={`${visitedRegions.length}`} sub="방문한 지역 수" /><Summary icon="📅" label="최근 방문" value={recentRecord?.region ?? '없음'} sub={recentRecord?.date ?? '기록 없음'} /><Summary icon="🏆" label="최다 방문" value={mostVisited ?? '없음'} sub={mostVisited ? `${regionCounts[mostVisited]}회 방문` : '0회 방문'} /></View>

        <Text style={styles.sectionTitle}>TOP 3 지역</Text>
        <View style={styles.topGrid}>{topRegions.length === 0 ? <EmptyText text="아직 방문 기록이 없습니다." /> : topRegions.map((region, index) => <Pressable key={region} style={styles.topCard} onPress={() => setSelectedRegion(region)}><Text style={styles.medal}>{['🥇', '🥈', '🥉'][index]}</Text><Text style={styles.topRegion}>{region}</Text><Text style={styles.topCount}>{regionCounts[region]}회</Text></Pressable>)}</View>

        <View style={styles.regionHeader}><Text style={styles.sectionTitle}>방문 지역 목록</Text><Text style={styles.regionHeaderText}>방문 횟수 순</Text></View>
        <View style={styles.regionList}>{visitedRegions.length === 0 ? <EmptyText text="아직 방문 기록이 없습니다." /> : visitedRegions.map((region, index) => <Pressable key={region} style={styles.regionItem} onPress={() => setSelectedRegion(region)}><Text style={styles.rank}>{index + 1}</Text><View style={styles.regionInfo}><Text style={styles.regionName}>{region}</Text><View style={styles.bar}><View style={[styles.barFill, { width: `${Math.max(((regionCounts[region] ?? 0) / (regionCounts[visitedRegions[0]] || 1)) * 100, 8)}%` }]} /></View></View><Text style={styles.regionCount}>{regionCounts[region]}회</Text></Pressable>)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) { return <View style={styles.summaryCard}><Text style={styles.summaryIcon}>{icon}</Text><View style={styles.summaryInfo}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue} numberOfLines={1}>{value}</Text><Text style={styles.summarySub} numberOfLines={2}>{sub}</Text></View></View>; }
function EmptyText({ text }: { text: string }) { return <Text style={styles.emptyText}>{text}</Text>; }
function RegionDetail({ region, records, count, onClose }: { region: string; records: TravelRecord[]; count: number; onClose: () => void }) { return <View style={styles.detailCard}><View style={styles.detailHeader}><View><Text style={styles.detailLabel}>선택한 지역</Text><Text style={styles.detailTitle}>{region}</Text></View><Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View><View style={styles.detailStats}><View style={styles.detailStat}><Text style={styles.detailStatLabel}>방문 횟수</Text><Text style={styles.detailStatValue}>{count}회</Text></View><View style={styles.detailStat}><Text style={styles.detailStatLabel}>최근 방문</Text><Text style={styles.detailStatValue} numberOfLines={1}>{records[0]?.date ?? '기록 없음'}</Text></View></View>{records.length === 0 ? <EmptyText text="이 지역의 여행 기록이 없습니다." /> : records.map((record) => <Pressable key={record.id} style={styles.detailRecord} onPress={() => router.push({ pathname: '/record/[id]', params: { id: record.id } })}><Text style={styles.detailRecordTitle} numberOfLines={1}>{record.title}</Text><Text style={styles.detailRecordDate}>{record.date}</Text></Pressable>)}</View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDFDFF' }, container: { flex: 1, backgroundColor: '#FDFDFF' }, content: { paddingHorizontal: 20, paddingBottom: 42 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 42, color: '#222222', fontSize: 34, lineHeight: 34 }, headerTitle: { color: '#222222', fontSize: 19, fontWeight: '800' }, brand: { color: '#5C3DFF', fontSize: 13, fontStyle: 'italic', fontWeight: '700' },
  mapHero: { alignItems: 'center', marginTop: 18, padding: 18, borderRadius: 20, backgroundColor: '#F0F2FF' }, mapEmoji: { fontSize: 48 }, mapTitle: { marginTop: 8, color: '#30284A', fontSize: 18, fontWeight: '800' }, mapSubtitle: { marginTop: 5, color: '#777086', fontSize: 12 }, regionDots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: 18 }, regionDot: { width: 34, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E1E1EA' }, visitedDot: { backgroundColor: '#AFA2FF' }, regionDotText: { color: '#777777', fontSize: 10, fontWeight: '700' },
  mapStatus: { marginTop: 16 }, statusTitle: { color: '#222222', fontSize: 18, fontWeight: '800' }, statusText: { marginTop: 8, color: '#777777', fontSize: 14 }, statusStrong: { color: '#5C3DFF', fontSize: 18, fontWeight: '800' }, sectionTitle: { marginTop: 22, marginBottom: 14, color: '#222222', fontSize: 17, fontWeight: '700' }, summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, summaryCard: { width: '48.3%', minHeight: 108, flexDirection: 'row', gap: 9, padding: 12, borderRadius: 16, backgroundColor: '#FFFFFF', shadowColor: '#443778', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 9, elevation: 2 }, summaryIcon: { fontSize: 22 }, summaryInfo: { flex: 1 }, summaryLabel: { color: '#777086', fontSize: 11 }, summaryValue: { marginTop: 5, color: '#30284A', fontSize: 16, fontWeight: '800' }, summarySub: { marginTop: 4, color: '#777086', fontSize: 9, lineHeight: 13 }, topGrid: { flexDirection: 'row', gap: 10 }, topCard: { flex: 1, minHeight: 125, alignItems: 'center', padding: 11, borderWidth: 1, borderColor: '#E8E5EF', borderRadius: 16, backgroundColor: '#F5F2FF' }, medal: { fontSize: 28 }, topRegion: { marginTop: 8, color: '#332D47', fontSize: 12, fontWeight: '700', textAlign: 'center' }, topCount: { marginTop: 5, color: '#5C3DFF', fontSize: 12, fontWeight: '700' }, regionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, regionHeaderText: { marginTop: 22, color: '#777086', fontSize: 11 }, regionList: { padding: 16, borderRadius: 18, backgroundColor: '#FFFFFF' }, regionItem: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F4' }, rank: { width: 24, height: 24, paddingTop: 5, borderRadius: 12, backgroundColor: '#5C3DFF', color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' }, regionInfo: { flex: 1 }, regionName: { color: '#302A45', fontSize: 13, fontWeight: '700' }, bar: { height: 5, marginTop: 6, overflow: 'hidden', borderRadius: 3, backgroundColor: '#EEEEF4' }, barFill: { height: '100%', borderRadius: 3, backgroundColor: '#5C3DFF' }, regionCount: { width: 38, color: '#222222', fontSize: 12, textAlign: 'right' }, emptyText: { padding: 18, color: '#777777', fontSize: 13, textAlign: 'center' },
  detailCard: { marginTop: 16, padding: 18, borderWidth: 1, borderColor: '#ECE9F8', borderRadius: 20, backgroundColor: '#FFFFFF', shadowColor: '#443778', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 }, detailHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, detailLabel: { color: '#8D83B8', fontSize: 12, fontWeight: '700' }, detailTitle: { marginTop: 5, color: '#29233D', fontSize: 19, fontWeight: '800' }, closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#F2EFFB' }, closeText: { color: '#766BA7', fontSize: 21 }, detailStats: { flexDirection: 'row', gap: 10, marginTop: 16 }, detailStat: { flex: 1, padding: 13, borderRadius: 14, backgroundColor: '#F7F5FC' }, detailStatLabel: { color: '#8A839F', fontSize: 12 }, detailStatValue: { marginTop: 6, color: '#5C3DFF', fontSize: 14, fontWeight: '700' }, detailRecord: { marginTop: 8, padding: 12, borderRadius: 13, backgroundColor: '#FAF9FD' }, detailRecordTitle: { color: '#302A45', fontSize: 14, fontWeight: '700' }, detailRecordDate: { marginTop: 5, color: '#948CA8', fontSize: 12 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }, loadingText: { color: '#777777', fontSize: 14 },
});
