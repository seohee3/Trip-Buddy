import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/context/AuthContext';
import { useTravelType } from '@/src/context/TravelTypeContext';
import { TRIP_BUDDY_MATES } from '@/src/data/mates';
import { logFirebaseError } from '@/src/firebase/errors';
import { fetchMatesFromFirestore } from '@/src/firebase/mateRepository';
import type { Mate } from '@/src/types/mate';
import { recommendMates } from '@/src/travel-type/recommendations';

export default function MateRecommendationsScreen() {
  const { user } = useAuth();
  const { travelType } = useTravelType();
  const [mates, setMates] = useState<Mate[]>(TRIP_BUDDY_MATES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    fetchMatesFromFirestore(user.uid)
      .then((remoteMates) => {
        if (!mounted || remoteMates.length === 0) return;
        setMates(remoteMates.map((mate) => {
          const fallback = TRIP_BUDDY_MATES.find((sample) => sample.id === mate.id);
          return {
            ...mate,
            travelTypeCode: mate.travelTypeCode ?? fallback?.travelTypeCode,
            travelTags: mate.travelTags ?? fallback?.travelTags,
            axisPreferences: mate.axisPreferences ?? fallback?.axisPreferences,
          };
        }));
      })
      .catch((error) => logFirebaseError('맞춤 메이트 목록 조회', error))
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const recommendations = useMemo(
    () => travelType ? recommendMates(mates, travelType, 3) : [],
    [mates, travelType],
  );
  if (!travelType) return <Redirect href="/travel-survey" />;

  const openMate = (mate: Mate) => router.push({
    pathname: '/mate/[id]',
    params: { id: mate.id, name: mate.name, age: String(mate.age), region: mate.region, match: String(mate.match), image: mate.image, sub: mate.sub },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="뒤로 가기"><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerTitle}>맞춤 메이트</Text><View style={styles.headerSpace} /></View>
        <Text style={styles.lead}><Text style={styles.emphasis}>{travelType.name}</Text>과 여행 흐름이 잘 맞는 메이트예요.</Text>
        <Text style={styles.formula}>성향 유사도 70% + 기존 매칭 정보 30%</Text>

        {isLoading ? <View style={styles.loadingRow}><ActivityIndicator color="#5C3DFF" /><Text style={styles.loadingText}>Firebase 메이트 정보를 확인하고 있어요.</Text></View> : null}

        <View style={styles.list}>
          {recommendations.map(({ mate, personalizedMatch, axisSimilarity, reason }, index) => (
            <Pressable key={mate.id} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => openMate(mate)} accessibilityRole="button" accessibilityLabel={`${mate.name} 메이트 상세 보기`}>
              <View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View>
              <Image source={{ uri: mate.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{mate.name}</Text>
                <Text style={styles.meta}>{mate.age}세 · {mate.region}</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>맞춤 적합도 {personalizedMatch}%</Text></View>
                <Text style={styles.reason}>✦ {reason}</Text>
                <Text style={styles.detail}>성향 유사도 {axisSimilarity}% · 기존 매칭 {mate.match}%</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  formula: { marginTop: 9, color: '#777777', fontSize: 12 },
  loadingRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#777777', fontSize: 12 },
  list: { marginTop: 22, gap: 14 },
  card: { position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 14, padding: 15, borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 20, backgroundColor: '#FFFFFF' },
  rank: { position: 'absolute', zIndex: 1, top: 8, left: 8, width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#5C3DFF' },
  rankText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  image: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#F1EDFF' },
  info: { flex: 1, minWidth: 0 },
  name: { color: '#222222', fontSize: 16, fontWeight: '900' },
  meta: { marginTop: 4, color: '#777777', fontSize: 11 },
  badge: { marginTop: 7, alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999, backgroundColor: '#F1EDFF' },
  badgeText: { color: '#5C3DFF', fontSize: 11, fontWeight: '900' },
  reason: { marginTop: 8, color: '#4C35B8', fontSize: 12, lineHeight: 17, fontWeight: '700' },
  detail: { marginTop: 4, color: '#999999', fontSize: 10 },
  pressed: { opacity: 0.72 },
});
