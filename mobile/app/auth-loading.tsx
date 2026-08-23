import { StyleSheet, Text, View } from 'react-native';

export default function AuthLoadingScreen() {
  return (
    <View style={styles.container} accessibilityLabel="로그인 상태 확인 중">
      <Text style={styles.brand}>Trip-Buddy</Text>
      <Text style={styles.description}>로그인과 여행유형 상태를 확인하고 있어요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7FF',
  },
  brand: {
    color: '#5C3DFF',
    fontSize: 30,
    fontWeight: '900',
  },
  description: {
    marginTop: 12,
    color: '#777777',
    fontSize: 13,
  },
});
