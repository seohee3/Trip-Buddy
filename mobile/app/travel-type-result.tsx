import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTravelType } from '@/src/context/TravelTypeContext';
import { TRAVEL_TYPE_BY_CODE } from '@/src/travel-type/catalog';
import { AXIS_LABELS, TRAVEL_AXIS_ORDER, type AxisPercentages, type TravelAxis } from '@/src/travel-type/model';

export default function TravelTypeResultScreen() {
  const { travelType, isOnboardingReady } = useTravelType();
  if (!isOnboardingReady) return null;
  if (!travelType) return <Redirect href="/travel-survey" />;
  const definition = TRAVEL_TYPE_BY_CODE[travelType.code];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: definition.color }]}>
          <Text style={styles.heroEyebrow}>TRIP-BUDDY TRAVEL TYPE</Text>
          <Text style={styles.icon} accessibilityLabel={`아이콘 ${definition.icon}`}>✦</Text>
          <Text style={styles.resultLead}>당신은</Text>
          <Text style={styles.name}>{definition.name}형 여행자입니다</Text>
          <View style={styles.codeBadge}><Text style={styles.code}>{definition.code}</Text></View>
          <Text style={styles.summary}>{definition.summary}</Text>
        </View>

        <Section title="이런 여행자예요">
          <Text style={styles.bodyText}>{definition.description}</Text>
        </Section>

        <Section title="나의 성향 비율">
          <View style={styles.axisList}>
            {TRAVEL_AXIS_ORDER.map((axis) => (
              <AxisBar key={axis} axis={axis} scores={travelType.axisScores[axis]} />
            ))}
          </View>
        </Section>

        <Section title="여행에서 빛나는 점">
          {definition.strengths.map((strength) => (
            <Text key={strength} style={styles.bullet}>• {strength}</Text>
          ))}
        </Section>

        <Section title="한 번 더 살펴보면 좋아요">
          <Text style={styles.bodyText}>{definition.caution}</Text>
        </Section>

        <Section title="추천 여행 키워드">
          <View style={styles.tags}>
            {definition.tags.map((tag) => <Text key={tag} style={styles.tag}>#{tag}</Text>)}
          </View>
        </Section>

        <View style={styles.actions}>
          <PrimaryButton label="추천 여행지 보기" onPress={() => router.push('/travel-recommendations')} />
          <PrimaryButton label="잘 맞는 메이트 보기" onPress={() => router.push('/mate-recommendations')} secondary />
          <Pressable style={styles.homeButton} onPress={() => router.replace('/(tabs)')} accessibilityRole="button" accessibilityLabel="홈으로 이동">
            <Text style={styles.homeText}>홈으로 이동</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function AxisBar({ axis, scores }: { axis: TravelAxis; scores: AxisPercentages }) {
  const [leftLabel, rightLabel] = AXIS_LABELS[axis];
  return (
    <View>
      <View style={styles.axisLabels}>
        <Text style={styles.axisLabel}>{scores.left} {leftLabel} {scores.leftPercent}%</Text>
        <Text style={styles.axisLabel}>{scores.rightPercent}% {rightLabel} {scores.right}</Text>
      </View>
      <View style={styles.axisTrack} accessibilityLabel={`${leftLabel} ${scores.leftPercent}퍼센트, ${rightLabel} ${scores.rightPercent}퍼센트`}>
        <View style={[styles.axisLeft, { flex: scores.leftScore }]} />
        <View style={[styles.axisRight, { flex: scores.rightScore }]} />
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable style={[styles.primaryButton, secondary && styles.secondaryButton]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.primaryButtonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F7FF' },
  content: { paddingBottom: 34 },
  hero: { margin: 16, padding: 28, alignItems: 'center', borderRadius: 28 },
  heroEyebrow: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  icon: { marginTop: 18, color: '#FFFFFF', fontSize: 36 },
  resultLead: { marginTop: 12, color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '700' },
  name: { marginTop: 6, color: '#FFFFFF', fontSize: 25, lineHeight: 34, textAlign: 'center', fontWeight: '900' },
  codeBadge: { marginTop: 14, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)' },
  code: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 3 },
  summary: { marginTop: 16, color: '#FFFFFF', fontSize: 14, lineHeight: 21, textAlign: 'center', fontWeight: '700' },
  section: { marginTop: 12, marginHorizontal: 16, padding: 20, borderWidth: 1, borderColor: '#ECE9FA', borderRadius: 22, backgroundColor: '#FFFFFF' },
  sectionTitle: { marginBottom: 12, color: '#222222', fontSize: 17, fontWeight: '900' },
  bodyText: { color: '#666666', fontSize: 14, lineHeight: 22 },
  bullet: { marginTop: 4, color: '#555555', fontSize: 14, lineHeight: 22 },
  axisList: { gap: 16 },
  axisLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  axisLabel: { flex: 1, color: '#555555', fontSize: 11, fontWeight: '800' },
  axisTrack: { height: 9, marginTop: 7, flexDirection: 'row', overflow: 'hidden', borderRadius: 999 },
  axisLeft: { backgroundColor: '#5C3DFF' },
  axisRight: { backgroundColor: '#D8D1FF' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 8, paddingHorizontal: 11, overflow: 'hidden', borderRadius: 999, color: '#5C3DFF', backgroundColor: '#F1EDFF', fontSize: 12, fontWeight: '800' },
  actions: { marginTop: 22, paddingHorizontal: 16, gap: 10 },
  primaryButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#5C3DFF' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  secondaryButton: { borderWidth: 1, borderColor: '#5C3DFF', backgroundColor: '#FFFFFF' },
  secondaryButtonText: { color: '#5C3DFF' },
  homeButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  homeText: { color: '#777777', fontSize: 13, fontWeight: '800' },
});
