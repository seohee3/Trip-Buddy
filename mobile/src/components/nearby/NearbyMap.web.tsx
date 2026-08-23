import { StyleSheet, Text, View } from 'react-native';

import type { NearbyMapProps } from './NearbyMap.types.ts';

export default function NearbyMap({ origin, markers }: NearbyMapProps) {
  return (
    <View style={styles.container} accessibilityLabel="웹 지도 안내">
      <Text style={styles.title}>지도는 모바일 앱에서 확인할 수 있어요</Text>
      <Text style={styles.description}>
        {origin
          ? `현재 위치 주변 관광지 ${markers.length}곳을 목록으로 확인해보세요.`
          : '현재 위치가 확인되면 주변 관광지 목록을 보여드려요.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F3F1FC',
  },
  title: { color: '#4A3E75', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  description: { marginTop: 7, color: '#777777', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
