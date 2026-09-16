import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { useAuth } from '@/src/context/AuthContext';
import { getFirebaseFirestore } from '@/src/firebase/app';

const COLORS = {
  primary: '#5C3DFF',
  background: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
  lightPurple: '#F1EDFF',
  danger: '#FF4D4F',
};

type CurrentLocation = {
  latitude: number;
  longitude: number;
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

  const { user } = useAuth();

  const mateId = typeof params.id === 'string' ? params.id : '';
  const name = params.name ?? '트립 메이트';

  const image =
    params.image ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const endCompanion = () => {
    Alert.alert('동행 종료', '현재 동행을 종료할까요?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => {
          router.replace('/(tabs)/mate');
        },
      },
    ]);
  };

  const getCurrentLocation = async (): Promise<CurrentLocation | null> => {
    try {
      setIsLoadingLocation(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '위치 공유 기능을 사용하려면 위치 권한을 허용해주세요.',
        );

        return null;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const nextLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocation(nextLocation);

      return nextLocation;
    } catch (error) {
      console.error(error);

      Alert.alert(
        '위치 오류',
        '현재 위치를 가져오지 못했어요. 다시 시도해주세요.',
      );

      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // 위치 공유
  const shareLocation = async () => {
    const currentLocation = await getCurrentLocation();

    if (!currentLocation) return;

    const mapUrl =
      `https://www.google.com/maps/search/?api=1&query=` +
      `${currentLocation.latitude},${currentLocation.longitude}`;

    const message =
      `Trip-Buddy 동행 중 현재 위치입니다.\n` +
      `${mapUrl}`;

    try {
      if (Platform.OS === 'web') {
        const browserNavigator = globalThis.navigator as
          | (Navigator & {
              share?: (data: {
                title?: string;
                text?: string;
                url?: string;
              }) => Promise<void>;
            })
          | undefined;

        if (browserNavigator?.share) {
          await browserNavigator.share({
            title: 'Trip-Buddy 위치 공유',
            text: '현재 위치를 공유합니다.',
            url: mapUrl,
          });

          return;
        }

        await Linking.openURL(mapUrl);

        Alert.alert(
          '현재 위치 확인',
          '브라우저에서 현재 위치 지도를 열었어요.',
        );

        return;
      }

      await Share.share({
        message,
        url: mapUrl,
        title: 'Trip-Buddy 위치 공유',
      });
    } catch (error) {
      console.error(error);

      // 공유창을 사용자가 취소한 경우도 있기 때문에
      // 위치 확인용 지도는 그대로 사용할 수 있게 함
      try {
        await Linking.openURL(mapUrl);
      } catch {
        Alert.alert(
          '위치 공유 실패',
          '현재 위치를 공유하지 못했어요.',
        );
      }
    }
  };

  // 현재 위치 지도 열기
  const openCurrentLocation = async () => {
    let currentLocation = location;

    if (!currentLocation) {
      currentLocation = await getCurrentLocation();
    }

    if (!currentLocation) return;

    const mapUrl =
      `https://www.google.com/maps/search/?api=1&query=` +
      `${currentLocation.latitude},${currentLocation.longitude}`;

    try {
      await Linking.openURL(mapUrl);
    } catch {
      Alert.alert(
        '지도 열기 실패',
        '현재 위치 지도를 열지 못했어요.',
      );
    }
  };

  // 비상 연락
  const callEmergency = () => {
    Alert.alert('비상 연락', '연락할 기관을 선택해주세요.', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '경찰 112',
        onPress: () => {
          void Linking.openURL('tel:112');
        },
      },
      {
        text: '소방·구급 119',
        onPress: () => {
          void Linking.openURL('tel:119');
        },
      },
    ]);
  };

  // 신고 저장
  const submitReport = async (reason: string) => {
    if (!user) {
      Alert.alert(
        '로그인 필요',
        '로그인 후 신고 기능을 이용할 수 있어요.',
      );

      return;
    }

    if (!mateId) {
      Alert.alert(
        '신고 실패',
        '메이트 정보를 찾을 수 없어요.',
      );

      return;
    }

    try {
      const db = getFirebaseFirestore();

      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid,
        mateId,
        mateName: name,
        reason,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        '신고 완료',
        '신고가 정상적으로 접수되었습니다.',
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        '신고 저장 대기 중',
        '현재 신고 저장 권한이 아직 적용되지 않았어요. Firebase 규칙 배포 후 정상적으로 저장됩니다.',
      );
    }
  };

  // 신고하기
  const reportMate = () => {
    Alert.alert(
      '메이트 신고',
      `${name}님을 신고하는 이유를 선택해주세요.`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '불쾌한 언행',
          onPress: () => {
            void submitReport('불쾌한 언행');
          },
        },
        {
          text: '위험한 행동',
          onPress: () => {
            void submitReport('위험한 행동');
          },
        },
        {
          text: '약속 불이행',
          onPress: () => {
            void submitReport('약속 불이행');
          },
        },
        {
          text: '기타',
          onPress: () => {
            void submitReport('기타');
          },
        },
      ],
    );
  };

  // 기존 채팅 화면으로 이동
  const openChat = () => {
    router.push({
      pathname: '/mate/chat/[id]',
      params: {
        id: mateId || '1',
        name,
        image,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            안심 동행
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>
            동행 진행 중
          </Text>

          <Text style={styles.timer}>
            {formatElapsedTime(elapsedSeconds)}
          </Text>

          <Text style={styles.statusDescription}>
            현재 메이트와 함께 이동 중이에요
          </Text>
        </View>

        <Pressable
          style={styles.mapBox}
          onPress={openCurrentLocation}
        >
          <View style={styles.pathLine} />

          <View style={[styles.pin, styles.myPin]}>
            <Text style={styles.pinText}>
              나
            </Text>
          </View>

          <View style={[styles.pin, styles.matePin]}>
            <Text style={styles.pinText}>
              M
            </Text>
          </View>

          {location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.mapText}>
                현재 위치 확인 완료
              </Text>

              <Text style={styles.coordinateText}>
                위도 {location.latitude.toFixed(5)}
              </Text>

              <Text style={styles.coordinateText}>
                경도 {location.longitude.toFixed(5)}
              </Text>

              <Text style={styles.openMapText}>
                눌러서 지도 열기
              </Text>
            </View>
          ) : (
            <View style={styles.locationInfo}>
              <Text style={styles.mapText}>
                실시간 위치 공유 영역
              </Text>

              <Text style={styles.mapSubText}>
                위치 공유 버튼을 눌러주세요
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.companionCard}>
          <Image
            source={{ uri: image }}
            style={styles.profileImage}
          />

          <View style={styles.companionInfo}>
            <Text style={styles.name}>
              {name}
            </Text>

            <Text style={styles.meta}>
              현재 동행 중인 메이트
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>
              LIVE
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            안전 기능
          </Text>

          <View style={styles.actionGrid}>
            <Pressable
              style={[
                styles.actionButton,
                isLoadingLocation && styles.disabledButton,
              ]}
              onPress={shareLocation}
              disabled={isLoadingLocation}
            >
              <Text style={styles.actionIcon}>
                📍
              </Text>

              <Text style={styles.actionText}>
                {isLoadingLocation
                  ? '위치 확인 중'
                  : '위치 공유'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={callEmergency}
            >
              <Text style={styles.actionIcon}>
                ☎️
              </Text>

              <Text style={styles.actionText}>
                비상 연락
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={reportMate}
            >
              <Text style={styles.actionIcon}>
                🚨
              </Text>

              <Text style={styles.actionText}>
                신고하기
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={openChat}
            >
              <Text style={styles.actionIcon}>
                💬
              </Text>

              <Text style={styles.actionText}>
                채팅
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>
            안심 동행 안내
          </Text>

          <Text style={styles.noticeText}>
            위치 공유는 위치 권한을 허용한 경우에만 사용할 수 있어요.
            긴급 상황에서는 경찰 112 또는 소방·구급 119로 바로 연락해주세요.
          </Text>
        </View>

        <Pressable
          style={styles.endButton}
          onPress={endCompanion}
        >
          <Text style={styles.endButtonText}>
            동행 종료
          </Text>
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

  locationInfo: {
    marginTop: 120,
    alignItems: 'center',
  },

  mapText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    fontWeight: '800',
  },

  mapSubText: {
    marginTop: 4,
    color: '#999999',
    fontSize: 11,
  },

  coordinateText: {
    marginTop: 2,
    color: COLORS.secondaryText,
    fontSize: 11,
  },

  openMapText: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
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

  disabledButton: {
    opacity: 0.5,
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
