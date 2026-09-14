import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { KOREA_MAP_PATHS } from '@/src/data/koreaMapPaths';
import { REGIONS } from '@/src/data/regions';

export const MAP_LEVELS = [
  { label: '0개', color: '#E8E9F0' },
  { label: '1개', color: '#D0C4FA' },
  { label: '2~3개', color: '#9B82E0' },
  { label: '4개 이상', color: '#6040AC' },
];
export const getMapColor = (count: number) => MAP_LEVELS[count === 0 ? 0 : count === 1 ? 1 : count < 4 ? 2 : 3].color;

// Projected label positions; leader lines keep small cities easy to select.
const LABELS: Record<string, [string, number, number, number?, number?]> = {
  '1': ['서울', 149, 130, 241, 149], '2': ['인천', 101, 184, 218, 160],
  '31': ['경기', 278, 187], '32': ['강원', 358, 123],
  '33': ['충북', 306, 249], '34': ['충남', 193, 281],
  '8': ['세종', 116, 240, 247, 250], '3': ['대전', 125, 332, 259, 287],
  '35': ['전북', 249, 351], '36': ['전남', 224, 454],
  '5': ['광주', 115, 414, 230, 403], '37': ['경북', 393, 286],
  '4': ['대구', 487, 326, 382, 355], '38': ['경남', 350, 409],
  '7': ['울산', 498, 389, 440, 384], '6': ['부산', 457, 458, 426, 414],
  '39': ['제주', 207, 620],
};
type Props = { counts: Record<string, number>; selectedCode: string; onSelect: (code: string) => void };

export function TravelRegionMap({ counts, selectedCode, onSelect }: Props) {
  const selectedPath = KOREA_MAP_PATHS.find(item => item.code === selectedCode);
  return (
    <View style={styles.frame}>
      <Text style={styles.eyebrow}>MY TRAVEL ATLAS</Text>
      <Text style={styles.hint}>지역을 눌러 여행을 펼쳐보세요</Text>
      <View style={styles.canvas}>
        <Svg width="100%" height="100%" viewBox="0 0 560 650" accessibilityLabel="대한민국 17개 시·도 여행 기록 지도">
          <SvgText x="65" y="370" fill="#A3ACB9" fontSize="13">서해</SvgText>
          <SvgText x="476" y="220" fill="#A3ACB9" fontSize="13">동해</SvgText>
          <SvgText x="355" y="538" fill="#A3ACB9" fontSize="13">남해</SvgText>
          {KOREA_MAP_PATHS.map(({ code, d }) => (
            <Path key={code} d={d} fill={getMapColor(counts[code] ?? 0)} fillRule="evenodd" stroke="#FFFFFF" strokeWidth={1.5} strokeLinejoin="round" onPress={() => onSelect(code)} />
          ))}
          {selectedPath && <Path d={selectedPath.d} fill="none" stroke="#352253" strokeWidth={3} strokeLinejoin="round" pointerEvents="none" />}
          <Rect x="461" y="80" width="78" height="60" rx="8" fill="none" stroke="#C9CDD8" strokeDasharray="4 4" />
          <SvgText x="500" y="72" textAnchor="middle" fill="#737D8E" fontSize="10">울릉도 · 독도</SvgText>
          <SvgText x="482" y="132" textAnchor="middle" fill="#737D8E" fontSize="10">울릉도</SvgText>
          <SvgText x="520" y="132" textAnchor="middle" fill="#737D8E" fontSize="10">독도</SvgText>
          <SvgText x="500" y="155" textAnchor="middle" fill="#737D8E" fontSize="10">위치·축척 조정 · 약도</SvgText>
          {REGIONS.map(area => {
            const [name, x, y, anchorX, anchorY] = LABELS[area.code];
            const selected = area.code === selectedCode;
            return <G key={area.code} onPress={() => onSelect(area.code)}>
              {anchorX !== undefined && <Line x1={x} y1={y} x2={anchorX} y2={anchorY} stroke={selected ? '#352253' : '#9294A6'} strokeWidth={1.2} />}
              <Rect x={x - 36} y={y - 20} width={72} height={46} rx={9} fill={selected ? '#352253' : '#FFFFFF'} stroke={selected ? '#352253' : '#E2DEEB'} />
              <SvgText x={x} y={y - 2} textAnchor="middle" fontSize="17" fontWeight="700" fill={selected ? '#FFFFFF' : '#39334A'}>{name}</SvgText>
              <SvgText x={x} y={y + 16} textAnchor="middle" fontSize="15" fill={selected ? '#E4D9FF' : '#666077'}>{counts[area.code] ?? 0}개</SvgText>
            </G>;
          })}
        </Svg>
      </View>
      <View style={styles.legend}>{MAP_LEVELS.map(level => <View key={level.label} style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: level.color }]} /><Text style={styles.legendText}>{level.label}</Text></View>)}</View>
      <Text style={styles.source}>시·도별 여행 기록 수 · 경계 간략화</Text>
      <Text style={styles.source}>경계: KOSTAT 2013 / southkorea-maps</Text>
    </View>
  );
}

export function RegionMapChoices({ counts, selectedCode, onSelect }: Props) {
  return <View style={styles.choices}>{REGIONS.map(area => <Pressable key={area.code} accessibilityRole="button" accessibilityState={{ selected: selectedCode === area.code }} accessibilityLabel={area.name + ', 여행 기록 ' + (counts[area.code] ?? 0) + '개'} onPress={() => onSelect(area.code)} style={[styles.choice, selectedCode === area.code && styles.selectedChoice]}>
    <View style={[styles.swatch, { backgroundColor: getMapColor(counts[area.code] ?? 0) }]} /><Text style={styles.choiceName}>{LABELS[area.code][0]}</Text><Text style={styles.choiceCount}>{counts[area.code] ?? 0}</Text>
  </Pressable>)}</View>;
}

const styles = StyleSheet.create({
  frame: { flex: 1, backgroundColor: '#F4F6FA', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#E6E8F0' },
  eyebrow: { color: '#6B568D', fontSize: 11, fontWeight: '800', letterSpacing: 2 }, hint: { color: '#747082', fontSize: 12, marginTop: 5 },
  canvas: { width: '100%', aspectRatio: 560 / 650, maxWidth: 560, alignSelf: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }, legendItem: { flexDirection: 'row', gap: 5, alignItems: 'center' }, swatch: { width: 12, height: 12, borderRadius: 4, borderWidth: 1, borderColor: '#BDB4CE' }, legendText: { color: '#635C70', fontSize: 11 },
  source: { color: '#737080', fontSize: 10, textAlign: 'center', marginTop: 8 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, choice: { width: '48%', minHeight: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 7, borderWidth: 1, borderColor: '#E8E4ED', borderRadius: 10, backgroundColor: '#FFFFFF' }, selectedChoice: { borderColor: '#6040AC', backgroundColor: '#F2ECFF' }, choiceName: { flex: 1, color: '#443952', fontSize: 12, fontWeight: '600' }, choiceCount: { color: '#6040AC', fontSize: 12, fontWeight: '700' },
});
