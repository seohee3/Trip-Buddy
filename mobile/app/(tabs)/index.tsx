import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Trip-Buddy</Text>
      <Text style={styles.title}>홈</Text>
      <Text style={styles.description}>
        맞춤 관광지와 여행 메이트가 표시될 예정입니다.
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
  logo: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '800',
    color: '#7B61FF',
  },
  title: {
    fontSize: 32,
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