import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TravelRecord = {
  id: number;
  title: string;
  region: string;
  date: string;
  content: string;
  image: string;
};

const COLORS = {
  primary: '#5C3DFF',
  primaryLight: '#F1EEFC',
  background: '#FFFFFF',
  card: '#FFFFFF',
  profileCard: '#FAFAFA',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
};

const PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

const SAMPLE_RECORDS: TravelRecord[] = [
  {
    id: 1,
    title: '경기도 광주 여행',
    region: '경기도',
    date: '2026.07.09 ~ 2026.07.10',
    content: '화담숲, 도자기공원, 칼국수 먹음',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: '제주도 여행',
    region: '제주특별자치도',
    date: '2026.06.27 ~ 2026.06.30',
    content: '푸른 바다 제주도 너무 좋았어요',
    image:
      'https://images.unsplash.com/photo-1549893072-4bc678117f45?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function HomeScreen() {
  const showPreparingMessage = (screenName: string) => {
    Alert.alert(
      '준비 중',
      `${screenName} 화면은 다음 단계에서 연결할 예정입니다.`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Travel Mate</Text>
            <Text style={styles.greeting}>
              최근 여행 기록을 확인해보세요
            </Text>
          </View>

          <View style={styles.headerIcons}>
            <Pressable
              style={styles.circleButton}
              onPress={() => showPreparingMessage('알림')}
            >
              <Ionicons
                name="notifications"
                size={16}
                color={COLORS.primary}
              />
            </Pressable>

            <Pressable
              style={styles.circleButton}
              onPress={() => showPreparingMessage('여행 추천')}
            >
              <Ionicons
                name="airplane"
                size={16}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* 사용자 프로필 */}
        <Pressable
          style={styles.profileCard}
          onPress={() => router.push('/(tabs)/my')}
        >
          <Image
            source={{ uri: PROFILE_IMAGE }}
            style={styles.profileImage}
          />

          <View style={styles.profileText}>
            <Text style={styles.profileName}>남지</Text>
            <Text style={styles.profileBio}>여행을 좋아하는 남지</Text>
          </View>
        </Pressable>

        {/* 최근 여행 기록 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 여행 기록</Text>

            <Pressable onPress={() => router.push('/(tabs)/my')}>
              <Text style={styles.viewAll}>전체보기</Text>
            </Pressable>
          </View>

          <View style={styles.recordList}>
            {SAMPLE_RECORDS.map((record) => (
              <Pressable
                key={record.id}
                style={styles.recordCard}
                onPress={() => showPreparingMessage('여행 기록 상세')}
              >
                <View style={styles.recordHeader}>
                  <View style={styles.recordIcon}>
                    <Text style={styles.recordIconText}>🌿</Text>
                  </View>

                  <View style={styles.recordTitleBox}>
                    <Text style={styles.recordTitle}>{record.title}</Text>

                    <Text style={styles.recordMeta}>
                      {record.region} · {record.date}
                    </Text>
                  </View>
                </View>

                <Image
                  source={{ uri: record.image }}
                  style={styles.recordImage}
                  resizeMode="cover"
                />

                <Text style={styles.recordContent}>
                  {record.content}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 여행 현황 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>나의 여행 현황</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>2</Text>
              <Text style={styles.statusLabel}>기록</Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>2</Text>
              <Text style={styles.statusLabel}>방문 지역</Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>2</Text>
              <Text style={styles.statusLabel}>마스코트</Text>
            </View>
          </View>
        </View>

        {/* 추천 바로가기 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 바로가기</Text>

          <View style={styles.shortcutList}>
            <ShortcutButton
              icon="location"
              label="주변 관광지 둘러보기"
              onPress={() => router.push('/(tabs)/nearby')}
            />

            <ShortcutButton
              icon="create"
              label="여행 기록 남기기"
              onPress={() => showPreparingMessage('여행 기록 작성')}
            />

            <ShortcutButton
              icon="map"
              label="나의 여행 지도 보기"
              onPress={() => showPreparingMessage('여행 지도')}
            />

            <ShortcutButton
              icon="bag-handle"
              label="마스코트 도감 보기"
              onPress={() => showPreparingMessage('마스코트 도감')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ShortcutButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function ShortcutButton({
  icon,
  label,
  onPress,
}: ShortcutButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.shortcutButton,
        pressed && styles.pressedButton,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={17}
        color={COLORS.primary}
      />

      <Text style={styles.shortcutText}>{label}</Text>
    </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  greeting: {
    marginTop: 4,
    color: COLORS.secondaryText,
    fontSize: 13,
  },

  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },

  circleButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.profileCard,
  },

  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryLight,
  },

  profileText: {
    flex: 1,
  },

  profileName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  profileBio: {
    marginTop: 5,
    color: COLORS.secondaryText,
    fontSize: 12,
  },

  section: {
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    marginBottom: 12,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },

  viewAll: {
    marginBottom: 12,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  recordList: {
    gap: 16,
  },

  recordCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.card,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  recordIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
  },

  recordIconText: {
    fontSize: 17,
  },

  recordTitleBox: {
    flex: 1,
  },

  recordTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  recordMeta: {
    marginTop: 3,
    color: COLORS.secondaryText,
    fontSize: 10,
  },

  recordImage: {
    width: '100%',
    height: 175,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
  },

  recordContent: {
    color: '#555555',
    fontSize: 13,
    lineHeight: 19,
  },

  statusCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: '#F7F4FF',
  },

  statusItem: {
    flex: 1,
    alignItems: 'center',
  },

  statusNumber: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
  },

  statusLabel: {
    marginTop: 2,
    color: COLORS.secondaryText,
    fontSize: 12,
  },

  shortcutList: {
    gap: 10,
  },

  shortcutButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
  },

  pressedButton: {
    opacity: 0.7,
  },

  shortcutText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});