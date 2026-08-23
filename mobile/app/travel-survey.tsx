import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/context/AuthContext';
import { useTravelType } from '@/src/context/TravelTypeContext';
import { loadTravelSurveyDraft, saveTravelSurveyDraft } from '@/src/storage/travelTypeStorage';
import type { TravelSurveyAnswers, TravelPole } from '@/src/travel-type/model';
import { TRAVEL_SURVEY_QUESTIONS } from '@/src/travel-type/questions';

const PRIMARY = '#5C3DFF';

export default function TravelSurveyScreen() {
  const { user, logout, isSubmitting } = useAuth();
  const { onboardingCompleted, completeSurvey, isSavingTravelType } = useTravelType();
  const [answers, setAnswers] = useState<Partial<TravelSurveyAnswers>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const question = TRAVEL_SURVEY_QUESTIONS[currentIndex];
  const selected = answers[question.id];
  const isLast = currentIndex === TRAVEL_SURVEY_QUESTIONS.length - 1;
  const isBusy = isSavingTravelType || isSubmitting;

  useEffect(() => {
    let mounted = true;
    if (!user) return () => { mounted = false; };
    loadTravelSurveyDraft(user.uid)
      .then((draft) => {
        if (!mounted || !draft) return;
        setAnswers(draft.answers);
        setCurrentIndex(draft.currentIndex);
      })
      .catch((error) => console.error('설문 임시 저장 불러오기 실패:', error))
      .finally(() => { if (mounted) setIsDraftReady(true); });
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    if (onboardingCompleted) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [onboardingCompleted]);

  const persistDraft = (nextAnswers: Partial<TravelSurveyAnswers>, index: number) => {
    if (!user) return;
    void saveTravelSurveyDraft(user.uid, nextAnswers, index).catch((error) => {
      console.error('설문 임시 저장 실패:', error);
    });
  };

  const selectAnswer = (value: TravelPole) => {
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);
    persistDraft(nextAnswers, currentIndex);
  };

  const movePrevious = () => {
    const nextIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(nextIndex);
    persistDraft(answers, nextIndex);
  };

  const moveNext = async () => {
    if (!selected || isBusy) return;
    if (!isLast) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      persistDraft(answers, nextIndex);
      return;
    }

    try {
      await completeSurvey(answers as TravelSurveyAnswers);
      router.replace('/travel-type-result');
    } catch {
      Alert.alert(
        '결과 저장 실패',
        '답변은 이 기기에 임시 저장했어요. 네트워크를 확인한 뒤 다시 시도해주세요.',
      );
    }
  };

  const closeOrLogout = () => {
    if (onboardingCompleted) {
      router.replace('/(tabs)/my');
      return;
    }
    Alert.alert('설문을 나갈까요?', '처음 설문 중에는 로그아웃만 할 수 있어요. 답변은 저장됩니다.', [
      { text: '계속하기', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  if (!isDraftReady) {
    return (
      <View style={styles.loading} accessibilityLabel="여행유형 설문 불러오는 중">
        <ActivityIndicator color={PRIMARY} />
        <Text style={styles.loadingText}>이어할 설문을 확인하고 있어요.</Text>
      </View>
    );
  }

  const progress = ((currentIndex + 1) / TRAVEL_SURVEY_QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={closeOrLogout}
            disabled={isBusy}
            accessibilityRole="button"
            accessibilityLabel={onboardingCompleted ? '설문 닫기' : '설문에서 로그아웃'}
          >
            <Text style={styles.headerButtonText}>{onboardingCompleted ? '닫기' : '로그아웃'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>나의 여행유형</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.progressText}>{currentIndex + 1} / {TRAVEL_SURVEY_QUESTIONS.length}</Text>
        <View style={styles.progressTrack} accessibilityLabel={`설문 진행률 ${Math.round(progress)}퍼센트`}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.eyebrow}>둘 다 좋은 선택이에요. 더 끌리는 쪽을 골라주세요.</Text>
        <Text style={styles.question}>{question.prompt}</Text>

        <View style={styles.options}>
          {question.options.map((option, optionIndex) => {
            const isSelected = selected === option.value;
            return (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => selectAnswer(option.value)}
                disabled={isBusy}
                accessibilityRole="radio"
                accessibilityLabel={`${optionIndex + 1}번 선택지, ${option.label}`}
                accessibilityState={{ selected: isSelected, disabled: isBusy }}
              >
                <View style={[styles.optionNumber, isSelected && styles.optionNumberSelected]}>
                  <Text style={[styles.optionNumberText, isSelected && styles.optionNumberTextSelected]}>
                    {optionIndex + 1}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.previousButton, currentIndex === 0 && styles.disabled]}
            onPress={movePrevious}
            disabled={currentIndex === 0 || isBusy}
            accessibilityRole="button"
            accessibilityLabel="이전 질문"
          >
            <Text style={styles.previousText}>이전</Text>
          </Pressable>
          <Pressable
            style={[styles.nextButton, (!selected || isBusy) && styles.disabled]}
            onPress={() => void moveNext()}
            disabled={!selected || isBusy}
            accessibilityRole="button"
            accessibilityLabel={isLast ? '여행유형 결과 확인' : '다음 질문'}
            accessibilityState={{ disabled: !selected || isBusy, busy: isBusy }}
          >
            {isBusy ? <ActivityIndicator color="#FFFFFF" /> : (
              <Text style={styles.nextText}>{isLast ? '결과 확인' : '다음'}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F7FF' },
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { minWidth: 72, minHeight: 44, justifyContent: 'center' },
  headerButtonText: { color: PRIMARY, fontSize: 13, fontWeight: '800' },
  headerTitle: { color: '#222222', fontSize: 17, fontWeight: '900' },
  headerSpacer: { width: 72 },
  progressText: { marginTop: 12, color: PRIMARY, fontSize: 14, fontWeight: '900' },
  progressTrack: { height: 8, marginTop: 8, overflow: 'hidden', borderRadius: 999, backgroundColor: '#E3DFFF' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: PRIMARY },
  eyebrow: { marginTop: 34, color: '#777777', fontSize: 12, lineHeight: 18 },
  question: { marginTop: 10, color: '#222222', fontSize: 25, lineHeight: 35, fontWeight: '900' },
  options: { marginTop: 26, gap: 14 },
  optionCard: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderWidth: 2, borderColor: '#E8E5F5', borderRadius: 22, backgroundColor: '#FFFFFF' },
  optionCardSelected: { borderColor: PRIMARY, backgroundColor: '#F1EDFF' },
  optionNumber: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#F2F2F2' },
  optionNumberSelected: { backgroundColor: PRIMARY },
  optionNumberText: { color: '#777777', fontWeight: '900' },
  optionNumberTextSelected: { color: '#FFFFFF' },
  optionText: { flex: 1, color: '#333333', fontSize: 15, lineHeight: 23, fontWeight: '700' },
  optionTextSelected: { color: '#4327D9' },
  footer: { marginTop: 'auto', paddingTop: 28, flexDirection: 'row', gap: 10 },
  previousButton: { width: 92, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D9D4F3', borderRadius: 17, backgroundColor: '#FFFFFF' },
  previousText: { color: PRIMARY, fontSize: 15, fontWeight: '900' },
  nextButton: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: PRIMARY },
  nextText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F7FF' },
  loadingText: { marginTop: 10, color: '#777777', fontSize: 13 },
});
