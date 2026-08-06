import { StyleSheet, Text, View } from 'react-native';

export default function NearbyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>주변</Text>
      <Text style={styles.description}>
        기존 웹의 주변 관광지 화면을 옮길 예정입니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5C3DFF',
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
});