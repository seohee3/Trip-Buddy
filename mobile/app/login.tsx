import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthFormLayout, authFormStyles as styles } from '@/src/components/auth/AuthFormLayout';
import { useAuth } from '@/src/context/AuthContext';
import { AuthActionError } from '@/src/firebase/authErrors';
import { normalizeEmail, validateLoginInput } from '@/src/firebase/authValidation';

export default function LoginScreen() {
  const { loginWithEmail, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async () => {
    if (isSubmitting) return;

    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    try {
      await loginWithEmail(normalizeEmail(email), password);
    } catch (error) {
      setErrorMessage(
        error instanceof AuthActionError
          ? error.message
          : '로그인하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  };

  return (
    <AuthFormLayout
      title="로그인"
      description="저장한 여행 기록과 나의 메이트를 다시 만나보세요."
      footer={(
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>아직 계정이 없나요?</Text>
          <Pressable
            onPress={() => router.push('/register' as Href)}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="회원가입 화면으로 이동"
          >
            <Text style={styles.footerLink}>회원가입</Text>
          </Pressable>
        </View>
      )}
    >
      <View style={styles.field}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="tripbuddy@example.com"
          placeholderTextColor="#AAA5B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          accessibilityLabel="이메일"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={() => void submit()}
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#AAA5B8"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          accessibilityLabel="비밀번호"
        />
      </View>

      {errorMessage ? (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
        onPress={() => void submit()}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="이메일로 로그인"
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
      >
        <Text style={styles.primaryButtonText}>{isSubmitting ? '로그인 중...' : '로그인'}</Text>
      </Pressable>
    </AuthFormLayout>
  );
}
