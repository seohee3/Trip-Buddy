import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#5C3DFF',
  background: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
  lightPurple: '#F1EDFF',
  danger: '#FF4D4F',
};

function formatElapsedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`;
}

export default function CompanionScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    image?: string;
  }>();

  const name = params.name ?? '트립 메이트';
  const image =
    params.image ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const endCompanion = () => {
    router.replace('/(tabs)/mate');
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
          <Text style={styles.headerTitle}>안심 동행</Text>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>동행 진행 중</Text>
          <Text style={styles.timer}>{formatElapsedTime(elapsedSeconds)}</Text>
          <Text style={styles.statusDescription}>
            현재 메이트와 함께 이동 중이에요
          </Text>
        </View>

        <View style={styles.mapBox}>
          <View style={styles.pathLine} />
          <View style={[styles.pin, styles.myPin]}>
            <Text style={styles.pinText}>나</Text>
          </View>
          <View style={[styles.pin, styles.matePin]}>
            <Text style={styles.pinText}>M</Text>
          </View>
          <Text style={styles.mapText}>실시간 위치 공유 영역</Text>
        </View>

        <View style={styles.companionCard}>
          <Image source={{ uri: image }} style={styles.profileImage} />

          <View style={styles.companionInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>현재 동행 중인 메이트</Text>
          </View>

          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>안전 기능</Text>

          <View style={styles.actionGrid}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={styles.actionText}>위치 공유</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>☎️</Text>
              <Text style={styles.actionText}>비상 연락</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={styles.actionText}>신고하기</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>채팅</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>안심 동행 안내</Text>
          <Text style={styles.noticeText}>
            실제 배포 단계에서는 위치 권한, 보호자 연락처, 신고 기능을 Firebase와 연결해
            안전한 여행 동행 기능으로 확장할 수 있어요.
          </Text>
        </View>

        <Pressable style={styles.endButton} onPress={endCompanion}>
          <Text style={styles.endButtonText}>동행 종료</Text>
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
    fontWeight: '900',
    color: COLORS.text,
  },
  headerSpace: {
    width: 36,
  },
  statusCard: {
    marginHorizontal: 18,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },
  statusLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  timer: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusDescription: {
    marginTop: 6,
    color: '#ECE8FF',
    fontSize: 13,
    fontWeight: '700',
  },
  mapBox: {
    height: 220,
    marginTop: 18,
    marginHorizontal: 18,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F6F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathLine: {
    position: 'absolute',
    width: 180,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#C7BEFF',
    transform: [{ rotate: '-18deg' }],
  },
  pin: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myPin: {
    left: 70,
    bottom: 62,
    backgroundColor: COLORS.primary,
  },
  matePin: {
    right: 76,
    top: 60,
    backgroundColor: '#FF8A65',
  },
  pinText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  mapText: {
    marginTop: 130,
    color: COLORS.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  companionCard: {
    marginTop: 18,
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.lightPurple,
  },
  companionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    marginTop: 4,
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  liveBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#EFFFF4',
  },
  liveBadgeText: {
    color: '#00A854',
    fontSize: 11,
    fontWeight: '900',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    marginBottom: 12,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    width: '48%',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: COLORS.lightPurple,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeBox: {
    marginTop: 22,
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeTitle: {
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  noticeText: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 19,
  },
  endButton: {
    marginTop: 24,
    marginHorizontal: 18,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});