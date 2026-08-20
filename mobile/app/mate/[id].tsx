import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#5C3DFF',
  background: '#FFFFFF',
  cardBackground: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  badgeBackground: '#F1EDFF',
  badgeText: '#6847FF',
  border: '#EEEEEE',
};

export default function MateDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    age?: string;
    region?: string;
    match?: string;
    image?: string;
    sub?: string;
  }>();

  const name = params.name ?? '트립 메이트';
  const age = params.age ?? '20';
  const region = params.region ?? '서울';
  const match = params.match ?? '80';
  const image =
    params.image ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';
  const sub = params.sub ?? '나와 여행 스타일이 잘 맞는 메이트예요';

  const goChat = () => {
    router.push({
      pathname: '/mate/chat/[id]',
      params: {
        id: params.id ?? '1',
        name,
        image,
        sub,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>메이트 프로필</Text>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.profileCard}>
          <Image source={{ uri: image }} style={styles.profileImage} />

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {age}세 · {region}
          </Text>

          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>✧ 매칭률 {match}%</Text>
          </View>

          <Text style={styles.intro}>{sub}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>여행 스타일</Text>

          <View style={styles.tagRow}>
            <Text style={styles.tag}>#맛집</Text>
            <Text style={styles.tag}>#카페</Text>
            <Text style={styles.tag}>#사진</Text>
            <Text style={styles.tag}>#여유로운 일정</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>선호하는 동행 방식</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>같이 이동하고, 일정은 유연하게</Text>
            <Text style={styles.infoText}>
              주요 관광지는 함께 둘러보고, 중간중간 자유 시간을 갖는 여행을 선호해요.
              처음 만나는 사람과도 부담 없이 대화하는 편이에요.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 여행 기록</Text>

          <View style={styles.photoGrid}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.photo}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.photo}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.photo}
            />
          </View>
        </View>

        <Pressable style={styles.chatButton} onPress={goChat}>
          <Text style={styles.chatButtonText}>메시지 보내기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 36,
    color: COLORS.text,
    lineHeight: 38,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSpace: {
    width: 36,
  },
  profileCard: {
    marginHorizontal: 18,
    padding: 22,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  profileImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.badgeBackground,
  },
  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.secondaryText,
  },
  matchBadge: {
    marginTop: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.badgeBackground,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.badgeText,
  },
  intro: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.badgeBackground,
    color: COLORS.badgeText,
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  infoTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.secondaryText,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photo: {
    flex: 1,
    height: 92,
    borderRadius: 16,
    backgroundColor: COLORS.badgeBackground,
  },
  chatButton: {
    marginTop: 28,
    marginHorizontal: 18,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});