import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTravelData } from '@/src/context/TravelDataContext';
import { getRecordRegionName } from '@/src/utils/travel';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records, isLoading, deleteRecord } = useTravelData();
  const record = records.find((item) => item.id === id);
  const [selectedImage, setSelectedImage] = useState(0);

  const confirmDelete = () => {
    if (!record) return;
    Alert.alert('여행 기록 삭제', '이 여행 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(record.id);
            router.back();
          } catch {
            Alert.alert('삭제 실패', '여행 기록을 삭제하지 못했습니다. 다시 시도해주세요.');
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingScreen />;
  if (!record) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundTitle}>기록을 찾을 수 없습니다.</Text><Pressable onPress={() => router.back()}><Text style={styles.backLink}>돌아가기</Text></Pressable></View></SafeAreaView>;
  }

  const images = record.images ?? [];
  const selectedUri = images[selectedImage];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.headerTitle}>여행 기록 상세</Text><Pressable onPress={confirmDelete}><Text style={styles.deleteLink}>삭제</Text></Pressable></View>

        <View style={styles.hero}>{selectedUri ? <Image source={{ uri: selectedUri }} style={styles.heroImage} resizeMode="cover" /> : <Text style={styles.noImage}>이미지 없음</Text>}</View>
        {images.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>{images.map((uri, index) => <Pressable key={`${uri}-${index}`} onPress={() => setSelectedImage(index)} style={[styles.thumbnailWrap, index === selectedImage && styles.selectedThumbnail]}><Image source={{ uri }} style={styles.thumbnail} /></Pressable>)}</ScrollView>}

        <View style={styles.detailCard}>
          <Text style={styles.title}>{record.title || '여행 제목'}</Text>
          <Text style={styles.date}>{record.date}</Text>
          <Text style={styles.region}>{getRecordRegionName(record)}</Text>
          <View style={styles.detailInfo}><Text style={styles.detailLabel}>기록</Text><Text style={styles.contentText}>{record.content || '작성된 내용이 없습니다.'}</Text></View>
          <Text style={styles.visibility}>{record.isPublic ? '현재 공개' : '나만 보기'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingScreen() { return <View style={styles.loading}><Text style={styles.loadingText}>여행 기록을 불러오는 중입니다.</Text></View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 42, color: '#222222', fontSize: 34, lineHeight: 34 },
  headerTitle: { color: '#222222', fontSize: 19, fontWeight: '800' },
  deleteLink: { width: 42, color: '#D9534F', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  hero: { height: 240, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 18, borderRadius: 18, backgroundColor: '#F1EEFC' },
  heroImage: { width: '100%', height: '100%' },
  noImage: { color: '#999999', fontSize: 13 },
  thumbnailList: { gap: 8, paddingVertical: 12 },
  thumbnailWrap: { padding: 2, borderWidth: 2, borderColor: 'transparent', borderRadius: 13 },
  selectedThumbnail: { borderColor: '#5C3DFF' },
  thumbnail: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F1EEFC' },
  detailCard: { padding: 18, borderRadius: 18, backgroundColor: '#FAFAFA' },
  title: { color: '#222222', fontSize: 22, fontWeight: '800' },
  date: { marginTop: 8, color: '#5C3DFF', fontSize: 13, fontWeight: '700' },
  region: { marginTop: 8, color: '#777777', fontSize: 13 },
  detailInfo: { marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  detailLabel: { color: '#222222', fontSize: 14, fontWeight: '700' },
  contentText: { marginTop: 8, color: '#555555', fontSize: 14, lineHeight: 22 },
  visibility: { alignSelf: 'flex-start', marginTop: 18, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 12, backgroundColor: '#F1EEFC', color: '#5C3DFF', fontSize: 11, fontWeight: '700' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { color: '#777777', fontSize: 14 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundTitle: { color: '#555555', fontSize: 15 },
  backLink: { marginTop: 12, color: '#5C3DFF', fontWeight: '700' },
});
