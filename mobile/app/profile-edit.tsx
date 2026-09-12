import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTravelData } from '@/src/context/TravelDataContext';

export default function ProfileEditScreen() {
  const { profile, isLoading, updateProfile } = useTravelData();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setName(profile.name);
      setBio(profile.bio);
      setImage(profile.image);
    }
  }, [isLoading, profile]);

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('사진 권한 필요', '프로필 사진을 선택하려면 사진 접근 권한을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) setImage(result.assets[0].uri);
  };

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: trimmedName,
        bio: bio.trim() || '소개글이 없습니다.',
        image,
      });
      Alert.alert('저장 완료', '프로필이 수정되었습니다.', [{ text: '확인', onPress: () => router.back() }]);
    } catch {
      Alert.alert('저장 실패', '프로필을 저장하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable>
          <Text style={styles.headerTitle}>프로필 편집</Text>
          <Pressable onPress={save} disabled={isSaving}><Text style={styles.done}>{isSaving ? '저장 중' : '완료'}</Text></Pressable>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>프로필 사진</Text>
          <Pressable style={styles.photoButton} onPress={pickProfileImage}>
            {image ? <Image source={{ uri: image }} style={styles.profileImage} /> : <Text style={styles.photoEmoji}>🐶</Text>}
            <Text style={styles.photoHint}>사진 변경</Text>
          </Pressable>

          <Text style={styles.label}>닉네임</Text>
          <TextInput value={name} onChangeText={setName} placeholder="닉네임을 입력하세요" placeholderTextColor="#999" style={styles.input} />

          <Text style={styles.label}>소개글</Text>
          <TextInput value={bio} onChangeText={setBio} placeholder="소개글을 입력하세요" placeholderTextColor="#999" style={[styles.input, styles.bioInput]} multiline />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingScreen() {
  return <View style={styles.loading}><Text style={styles.loadingText}>프로필을 불러오는 중입니다.</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: '#222222', fontSize: 34, lineHeight: 34, width: 42 },
  headerTitle: { color: '#222222', fontSize: 19, fontWeight: '800' },
  done: { color: '#5C3DFF', fontSize: 14, fontWeight: '700', width: 50, textAlign: 'right' },
  formCard: { marginTop: 20 },
  label: { marginTop: 18, marginBottom: 8, color: '#222222', fontSize: 14, fontWeight: '700' },
  photoButton: { alignSelf: 'center', alignItems: 'center', gap: 8 },
  profileImage: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F1EEFC' },
  photoEmoji: { width: 96, height: 96, paddingTop: 25, borderRadius: 48, backgroundColor: '#EEEEEE', fontSize: 34, textAlign: 'center' },
  photoHint: { color: '#5C3DFF', fontSize: 12, fontWeight: '700' },
  input: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 12, borderWidth: 1, borderColor: '#EEEEEE', borderRadius: 14, color: '#222222', fontSize: 14 },
  bioInput: { minHeight: 110, textAlignVertical: 'top' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { color: '#777777', fontSize: 14 },
});
