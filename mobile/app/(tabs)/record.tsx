import { StyleSheet, Text, View } from 'react-native';

export default function RecordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>여행 기록</Text>
      <Text style={styles.description}>
        여행 기록 작성 화면이 들어갈 예정입니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7FF',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});