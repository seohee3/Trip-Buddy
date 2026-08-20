import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type Mate = {
  id: number;
  name: string;
  age: number;
  region: string;
  match: number;
  image: string;
  sub: string;
};

const COLORS = {
  primary: '#5C3DFF',
  badgeBackground: '#F1EDFF',
  badgeText: '#6847FF',
  background: '#FFFFFF',
  cardBackground: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
};

const TRIP_BUDDY_MATES: Mate[] = [
  {
    id: 1,
    name: '여행자_가람',
    age: 28,
    region: '서울',
    match: 89,
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    sub: '맛집과 감성 카페 여행을 좋아해요',
  },
  {
    id: 2,
    name: '여행러_민수',
    age: 30,
    region: '서울',
    match: 86,
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    sub: '계획적인 일정과 야경 산책을 좋아해요',
  },
  {
    id: 3,
    name: '트립메이트_지은',
    age: 26,
    region: '서울',
    match: 83,
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    sub: '사진 찍는 여행을 좋아해요',
  },
  {
    id: 4,
    name: '여행하는_준호',
    age: 29,
    region: '서울',
    match: 81,
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    sub: '자연 풍경과 조용한 코스를 선호해요',
  },
  {
    id: 5,
    name: '트래블러_소희',
    age: 27,
    region: '서울',
    match: 70,
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    sub: '전시, 카페, 산책 코스를 좋아해요',
  },
];

export default function MateScreen() {
  const openMateDetail = (mate: Mate) => {
    router.push({
      pathname: '/mate/[id]',
      params: {
        id: String(mate.id),
        name: mate.name,
        age: String(mate.age),
        region: mate.region,
        match: String(mate.match),
        image: mate.image,
        sub: mate.sub,
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
          <Text style={styles.title}>메이트</Text>
          <Text style={styles.description}>
            나와 여행 스타일이 잘 맞는 동행자를 찾아보세요
          </Text>
        </View>

        <View style={styles.filterRow}>
          <Pressable style={[styles.filterButton, styles.activeFilter]}>
            <Text style={[styles.filterText, styles.activeFilterText]}>추천</Text>
          </Pressable>
          <Pressable style={styles.filterButton}>
            <Text style={styles.filterText}>근처</Text>
          </Pressable>
          <Pressable style={styles.filterButton}>
            <Text style={styles.filterText}>동행중</Text>
          </Pressable>
        </View>

        <View style={styles.mateList}>
          {TRIP_BUDDY_MATES.map((mate) => (
            <Pressable
              key={mate.id}
              style={({ pressed }) => [
                styles.mateCard,
                pressed && styles.pressedCard,
              ]}
              onPress={() => openMateDetail(mate)}
            >
              <Image source={{ uri: mate.image }} style={styles.profileImage} />

              <View style={styles.mateInfo}>
                <Text style={styles.mateName}>{mate.name}</Text>
                <Text style={styles.mateMeta}>
                  {mate.age}세 · {mate.region}
                </Text>
                <Text style={styles.mateSub}>{mate.sub}</Text>

                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>✧ 매칭률 {mate.match}%</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
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
    paddingBottom: 90,
  },
  header: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  description: {
    marginTop: 10,
    color: COLORS.secondaryText,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  mateList: {
    gap: 14,
    paddingTop: 8,
    paddingHorizontal: 18,
  },
  mateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 3,
  },
  pressedCard: {
    opacity: 0.72,
  },
  profileImage: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: 32,
    backgroundColor: COLORS.badgeBackground,
  },
  mateInfo: {
    flex: 1,
    minWidth: 0,
  },
  mateName: {
    marginBottom: 5,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  mateMeta: {
    marginBottom: 4,
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  mateSub: {
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 17,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: COLORS.badgeBackground,
  },
  matchText: {
    color: COLORS.badgeText,
    fontSize: 12,
    fontWeight: '700',
  },
});