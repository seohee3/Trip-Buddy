import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTravelData } from '@/src/context/TravelDataContext';
import { createRecordId, displayDate, RECORD_REGION_OPTIONS } from '@/src/utils/travel';
import type { TravelRecord } from '@/src/types/travel';

export default function CreateRecordScreen() {
  const { addRecord, isLoading } = useTravelData();
  const params = useLocalSearchParams<{ startDate?: string; endDate?: string }>();
  const [region, setRegion] = useState(RECORD_REGION_OPTIONS[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(params.startDate ?? '');
  const [endDate, setEndDate] = useState(params.endDate ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.startDate) setStartDate(params.startDate);
    if (params.endDate) setEndDate(params.endDate);
  }, [params.endDate, params.startDate]);

  const chooseImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 권한 필요', '여행 사진을 선택하려면 사진 접근 권한을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 0.8,
    });

    if (!result.canceled) setImages(result.assets.map((asset) => asset.uri).filter(Boolean));
  };

  const openCalendar = () => {
    router.push({ pathname: '/record/calendar', params: { startDate, endDate } });
  };

  const save = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('여행 제목을 입력해주세요.');
      return;
    }
    if (!startDate) {
      Alert.alert('방문 일정을 선택해주세요.');
      return;
    }

    const finalEndDate = endDate || startDate;
    const record: TravelRecord = {
      id: createRecordId(),
      region,
      startDate,
      endDate: finalEndDate,
      date: `${displayDate(startDate)} ~ ${displayDate(finalEndDate)}`,
      title: trimmedTitle,
      content: content.trim(),
      images,
      isPublic,
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await addRecord(record);
      Alert.alert('저장 완료', '여행 기록이 저장되었습니다.', [{ text: '확인', onPress: () => router.replace('/(tabs)/my') }]);
    } catch {
      Alert.alert('저장 실패', '여행 기록을 저장하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <View style={styles.loading}><Text style={styles.loadingText}>여행 기록을 준비하는 중입니다.</Text></View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>여행 기록</Text>
          <Pressable onPress={save} disabled={isSaving}><Text style={styles.done}>{isSaving ? '저장 중' : '완료'}</Text></Pressable>
        </View>

        <Text style={styles.label}>방문 지역</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionList}>
          {RECORD_REGION_OPTIONS.map((option) => <Pressable key={option} style={[styles.regionChip, option === region && styles.selectedChip]} onPress={() => setRegion(option)}><Text style={[styles.regionChipText, option === region && styles.selectedChipText]}>{option}</Text></Pressable>)}
        </ScrollView>

        <Text style={styles.label}>방문 일정</Text>
        <Pressable style={styles.dateButton} onPress={openCalendar}>
          <Text style={startDate ? styles.dateValue : styles.datePlaceholder}>{startDate ? `${displayDate(startDate)} ~ ${displayDate(endDate || startDate)}` : '방문 일정을 선택해주세요'}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.label}>사진 추가</Text>
        <Pressable style={styles.photoPicker} onPress={chooseImages}><Text style={styles.photoPickerText}>＋ 사진 선택</Text></Pressable>
        {images.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewList}>{images.map((uri, index) => <View key={`${uri}-${index}`} style={styles.previewWrap}><Image source={{ uri }} style={styles.previewImage} /><Pressable style={styles.removeImage} onPress={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Text style={styles.removeImageText}>×</Text></Pressable></View>)}</ScrollView> : <Text style={styles.previewEmpty}>선택한 사진이 없습니다. 사진 없이도 저장할 수 있어요.</Text>}

        <Text style={styles.label}>여행 제목</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="예: 제주도 여행" placeholderTextColor="#999999" style={styles.input} />

        <Text style={styles.label}>글 작성</Text>
        <TextInput value={content} onChangeText={setContent} placeholder="오늘의 여행 기록을 남겨보세요." placeholderTextColor="#999999" style={[styles.input, styles.contentInput]} multiline />

        <Text style={styles.label}>공개 설정</Text>
        <View style={styles.visibilityRow}>
          <Pressable style={[styles.visibilityButton, isPublic && styles.selectedVisibility]} onPress={() => setIsPublic(true)}><Text style={[styles.visibilityText, isPublic && styles.selectedVisibilityText]}>현재 공개</Text></Pressable>
          <Pressable style={[styles.visibilityButton, !isPublic && styles.selectedVisibility]} onPress={() => setIsPublic(false)}><Text style={[styles.visibilityText, !isPublic && styles.selectedVisibilityText]}>나만 보기</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingBottom: 42 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 42, color: '#222222', fontSize: 34, lineHeight: 34 },
  headerTitle: { color: '#222222', fontSize: 19, fontWeight: '800' },
  done: { width: 52, color: '#5C3DFF', fontSize: 14, fontWeight: '700', textAlign: 'right' },
  label: { marginTop: 18, marginBottom: 8, color: '#222222', fontSize: 14, fontWeight: '700' },
  regionList: { gap: 8, paddingVertical: 2 },
  regionChip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 18, backgroundColor: '#F1EEFC' },
  selectedChip: { backgroundColor: '#5C3DFF' },
  regionChipText: { color: '#777777', fontSize: 12 },
  selectedChipText: { color: '#FFFFFF', fontWeight: '700' },
  dateButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13, borderRadius: 14, backgroundColor: '#F1EEFC' },
  dateValue: { color: '#5C3DFF', fontSize: 13, fontWeight: '700' },
  datePlaceholder: { color: '#777777', fontSize: 13 },
  chevron: { color: '#5C3DFF', fontSize: 24 },
  photoPicker: { height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#9ED0FF' },
  photoPickerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  previewList: { gap: 8, paddingTop: 10 },
  previewWrap: { position: 'relative' },
  previewImage: { width: 82, height: 82, borderRadius: 12, backgroundColor: '#F1EEFC' },
  removeImage: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  removeImageText: { color: '#FFFFFF', fontSize: 18, lineHeight: 20 },
  previewEmpty: { marginTop: 8, color: '#999999', fontSize: 12 },
  input: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 12, borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 14, color: '#222222', fontSize: 14 },
  contentInput: { minHeight: 130, textAlignVertical: 'top' },
  visibilityRow: { flexDirection: 'row', gap: 10 },
  visibilityButton: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#F1EEFC' },
  selectedVisibility: { backgroundColor: '#5C3DFF' },
  visibilityText: { color: '#777777', fontSize: 13, fontWeight: '700' },
  selectedVisibilityText: { color: '#FFFFFF' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { color: '#777777', fontSize: 14 },
});
