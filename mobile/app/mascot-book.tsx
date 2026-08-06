import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MASCOTS } from '@/src/data/mascots';
import { useTravelData } from '@/src/context/TravelDataContext';
import { getRegionRecords, getVisitedRegions } from '@/src/utils/travel';

export default function MascotBookScreen() {
  const { records, isLoading } = useTravelData();
  const visitedRegions = getVisitedRegions(records);
  const unlockedCount = MASCOTS.filter((mascot) => visitedRegions.includes(mascot.regionName)).length;
  const progress = MASCOTS.length === 0 ? 0 : Math.round((unlockedCount / MASCOTS.length) * 100);
  const message = unlockedCount === 0
    ? '상세 지역 여행 기록을 남기고 오리지널 친구를 만나보세요.'
    : unlockedCount === MASCOTS.length
      ? '모든 상세 지역 친구를 수집했어요!'
      : `${MASCOTS.length - unlockedCount}개 상세 지역이 남았어요.`;

  if (isLoading) return <View style={styles.loading}><Text style={styles.loadingText}>마스코트 도감을 준비하는 중입니다.</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.headerTitle}>마스코트 도감</Text><View style={styles.headerSpacer} /></View>
        <View style={styles.progressCard}><View style={styles.progressHeader}><View><Text style={styles.progressLabel}>상세 지역 수집 진행률</Text><Text style={styles.progressCount}>{unlockedCount} / {MASCOTS.length}</Text></View><Text style={styles.progressPercent}>{progress}%</Text></View><View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><Text style={styles.progressMessage}>{message}</Text></View>
        <View style={styles.grid}>{MASCOTS.map((mascot) => {
          const isUnlocked = visitedRegions.includes(mascot.regionName);
          const visitCount = getRegionRecords(records, mascot.regionName).length;
          return <Pressable key={mascot.id} disabled={!isUnlocked} onPress={() => router.push({ pathname: '/travel-map', params: { region: mascot.regionName } })} style={[styles.mascotCard, isUnlocked && styles.unlockedCard]}>
            <Text style={[styles.status, isUnlocked && styles.unlockedStatus]}>{isUnlocked ? '수집 완료' : '미수집'}</Text>
            {isUnlocked ? <Image source={{ uri: mascot.image }} style={styles.mascotImage} /> : <Text style={styles.icon}>❔</Text>}
            <Text style={styles.shortName}>{mascot.regionName}</Text>
            <Text style={styles.mascotName}>{isUnlocked ? mascot.mascotName : '아직 만나지 못했어요'}</Text>
            <Text style={styles.concept} numberOfLines={2}>{isUnlocked ? mascot.concept : '여행 기록으로 해금'}</Text>
            <Text style={styles.visitText}>{isUnlocked ? `${visitCount}회 방문` : '잠금 상태'}</Text>
          </Pressable>;
        })}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' }, container: { flex: 1, backgroundColor: '#FFFFFF' }, content: { paddingHorizontal: 20, paddingBottom: 42 }, header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { width: 42, color: '#222222', fontSize: 34, lineHeight: 34 }, headerTitle: { color: '#222222', fontSize: 19, fontWeight: '800' }, headerSpacer: { width: 42 }, progressCard: { marginTop: 20, padding: 18, borderWidth: 1, borderColor: '#ECE9F8', borderRadius: 20, backgroundColor: '#F4F1FF' }, progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, progressLabel: { color: '#89819F', fontSize: 12 }, progressCount: { marginTop: 5, color: '#30284A', fontSize: 20, fontWeight: '800' }, progressPercent: { color: '#5C3DFF', fontSize: 16, fontWeight: '700' }, progressBar: { height: 9, marginTop: 14, overflow: 'hidden', borderRadius: 5, backgroundColor: '#E7E3F4' }, progressFill: { height: '100%', borderRadius: 5, backgroundColor: '#5C3DFF' }, progressMessage: { marginTop: 11, color: '#777086', fontSize: 12 }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 16 }, mascotCard: { width: '48.2%', minHeight: 205, alignItems: 'center', padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E8E5EF', borderRadius: 19, backgroundColor: '#F4F3F7', opacity: 0.65 }, unlockedCard: { borderColor: '#CFC6FF', backgroundColor: '#EEE9FF', opacity: 1 }, status: { alignSelf: 'flex-end', paddingVertical: 4, paddingHorizontal: 7, borderRadius: 999, backgroundColor: '#E9E7EF', color: '#8A8497', fontSize: 9, fontWeight: '700' }, unlockedStatus: { backgroundColor: '#DED7FF', color: '#5C3DFF' }, icon: { marginTop: 15, fontSize: 38 }, mascotImage: { width: 64, height: 64, marginTop: 12, borderRadius: 32, backgroundColor: '#FFFFFF' }, shortName: { marginTop: 6, color: '#5C3DFF', fontSize: 12, fontWeight: '700', textAlign: 'center' }, mascotName: { minHeight: 30, marginTop: 4, color: '#777084', fontSize: 11, textAlign: 'center' }, concept: { minHeight: 28, marginTop: 3, color: '#938BA9', fontSize: 9, lineHeight: 13, textAlign: 'center' }, visitText: { marginTop: 8, color: '#9C95AA', fontSize: 10 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }, loadingText: { color: '#777777', fontSize: 14 },
});
