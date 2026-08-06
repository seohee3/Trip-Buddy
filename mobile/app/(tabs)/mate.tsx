import { StyleSheet, Text, View } from 'react-native';

export default function MateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>메이트</Text>
      <Text style={styles.description}>
        기존 웹의 여행 메이트 화면을 옮길 예정입니다.
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
    color: '#222222',
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
});