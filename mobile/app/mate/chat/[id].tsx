import { useEffect, useRef, useState } from 'react';
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

import { useAuth } from '@/src/context/AuthContext';
import { openMateChat, sendChatMessage, subscribeChat, type ChatMessage } from '@/src/firebase/chatRepository';

function chatError(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    return error.code === 'permission-denied'
      ? '채팅 권한이 없어요. 계정 프로필과 채팅 서비스 설정을 확인해주세요.'
      : '채팅 서버에 연결하지 못했어요. 네트워크를 확인하고 다시 시도해주세요.';
  }
  return error instanceof Error ? error.message : '채팅을 불러오지 못했어요.';
}

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

  const { user } = useAuth();
  const mateId = typeof params.id === 'string' ? params.id : '';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [retry, setRetry] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    setMessages([]);
    setRoomId(null);
    setError('');
    setIsLoading(true);
    const timeout = setTimeout(() => {
      if (active) {
        setIsLoading(false);
        setError('연결이 지연되고 있어요. 네트워크를 확인하고 다시 시도해주세요.');
      }
    }, 15000);
    const fail = (reason: unknown) => {
      if (!active) return;
      clearTimeout(timeout);
      setIsLoading(false);
      setRoomId(null);
      setError(chatError(reason));
    };
    if (!user) {
      fail(new Error('로그인 후 채팅을 이용해주세요.'));
    } else {
      void openMateChat(user.uid, mateId).then((id) => {
        if (!active) return;
        unsubscribe = subscribeChat(id, (nextMessages) => {
          if (!active) return;
          clearTimeout(timeout);
          setMessages(nextMessages);
          setRoomId(id);
          setIsLoading(false);
          setError('');
        }, fail);
      }).catch(fail);
    }
    return () => {
      active = false;
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, [mateId, retry, user]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !roomId || !user || sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);
    setError('');
    setInput('');
    try {
      await sendChatMessage(roomId, user.uid, text);
    } catch (reason) {
      setInput(text);
      setError(chatError(reason));
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          style={styles.chatBody}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              안전한 여행을 위해 만남 장소와 시간을 채팅으로 확인해보세요.
            </Text>
          </View>

          {isLoading ? <Text style={styles.noticeText}>대화를 불러오는 중이에요…</Text> : null}
          {!isLoading && !error && messages.length === 0 ? (
            <Text style={styles.noticeText}>첫 메시지로 여행 이야기를 시작해보세요.</Text>
          ) : null}
          {messages.map((message) => {
            const isMe = message.senderId === user?.uid;

            return (
              <View
                key={message.id}
                style={[styles.messageRow, isMe && styles.myMessageRow]}
              >
                {!isMe && <Image source={{ uri: image }} style={styles.smallProfile} />}

                <View style={[styles.bubble, isMe ? styles.myBubble : styles.mateBubble]}>
                  <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                    {message.text}
                    {message.pending ? ' (전송 중…)' : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {error ? (
          <View style={styles.notice}>
            <Text accessibilityRole="alert" style={styles.noticeText}>{error}</Text>
            {!roomId ? (
              <Pressable onPress={() => setRetry((value) => value + 1)} accessibilityRole="button">
                <Text style={styles.noticeText}>다시 시도</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <View style={styles.inputArea}>
          <TextInput
            editable={Boolean(roomId) && !isSending}
            maxLength={2000}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#AAAAAA"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable style={[styles.sendButton, (!roomId || isSending || !input.trim()) && { opacity: 0.45 }]} disabled={!roomId || isSending || !input.trim()} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>{isSending ? '전송 중' : '전송'}</Text>
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