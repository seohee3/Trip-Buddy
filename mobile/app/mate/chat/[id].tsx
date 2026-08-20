import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type ChatMessage = {
  id: number;
  sender: 'mate' | 'me';
  text: string;
};

const COLORS = {
  primary: '#5C3DFF',
  background: '#FFFFFF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
  myBubble: '#5C3DFF',
  mateBubble: '#F4F4F6',
};

export default function MateChatScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    image?: string;
    sub?: string;
  }>();

  const name = params.name ?? '트립 메이트';
  const image =
    params.image ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'mate',
      text: '안녕하세요! 여행 메이트 신청 보고 연락드려요.',
    },
    {
      id: 2,
      sender: 'me',
      text: '안녕하세요! 일정이 비슷해서 같이 이야기해보고 싶었어요.',
    },
    {
      id: 3,
      sender: 'mate',
      text: '좋아요. 저는 카페랑 야경 코스 좋아해요!',
    },
  ]);

  const sendMessage = () => {
    const text = input.trim();

    if (!text) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'me',
        text,
      },
    ]);
    setInput('');
  };

  const startCompanion = () => {
    router.push({
      pathname: '/mate/companion/[id]',
      params: {
        id: params.id ?? '1',
        name,
        image,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.userInfo}>
            <Image source={{ uri: image }} style={styles.profileImage} />
            <View>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userStatus}>여행 메이트와 대화 중</Text>
            </View>
          </View>

          <Pressable style={styles.startButton} onPress={startCompanion}>
            <Text style={styles.startButtonText}>동행</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.chatBody}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              안전한 여행을 위해 만남 장소와 시간을 채팅으로 확인해보세요.
            </Text>
          </View>

          {messages.map((message) => {
            const isMe = message.sender === 'me';

            return (
              <View
                key={message.id}
                style={[styles.messageRow, isMe && styles.myMessageRow]}
              >
                {!isMe && <Image source={{ uri: image }} style={styles.smallProfile} />}

                <View style={[styles.bubble, isMe ? styles.myBubble : styles.mateBubble]}>
                  <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                    {message.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#AAAAAA"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>전송</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 64,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 34,
    lineHeight: 36,
    color: COLORS.text,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1EDFF',
  },
  userName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  userStatus: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  startButton: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  chatBody: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  notice: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F7F5FF',
  },
  noticeText: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '700',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  smallProfile: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bubble: {
    maxWidth: '76%',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 17,
  },
  mateBubble: {
    backgroundColor: COLORS.mateBubble,
    borderBottomLeftRadius: 5,
  },
  myBubble: {
    backgroundColor: COLORS.myBubble,
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F5F5F5',
    color: COLORS.text,
    fontSize: 14,
  },
  sendButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});