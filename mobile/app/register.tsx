import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthFormLayout, authFormStyles as styles } from '@/src/components/auth/AuthFormLayout';
import { useAuth } from '@/src/context/AuthContext';
import { AuthActionError } from '@/src/firebase/authErrors';
import { normalizeEmail, validateRegistrationInput } from '@/src/firebase/authValidation';

export default function RegisterScreen() {
  const { registerWithEmail, isSubmitting } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async () => {
    if (isSubmitting) return;

    const validationError = validateRegistrationInput({
      name,
      email,
      password,
      passwordConfirmation,
    });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    try {
      await registerWithEmail(name.trim(), normalizeEmail(email), password);
    } catch (error) {
      setErrorMessage(
        error instanceof AuthActionError
          ? error.message
          : '회원가입하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  };

  return (
    <AuthFormLayout
      title="회원가입"
      description="Trip-Buddy와 함께 새로운 여행 기록을 시작해보세요."
      footer={(
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>이미 계정이 있나요?</Text>
          <Pressable
            onPress={() => router.replace('/login' as Href)}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="로그인 화면으로 이동"
          >
            <Text style={styles.footerLink}>로그인</Text>
          </Pressable>
        </View>
      )}
    >
      <View style={styles.field}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="여행에서 사용할 이름"
          placeholderTextColor="#AAA5B8"
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          accessibilityLabel="이름"
        />
      </View>

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
          style={styles.input}
          placeholder="6자 이상 입력하세요"
          placeholderTextColor="#AAA5B8"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          accessibilityLabel="비밀번호"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          onSubmitEditing={() => void submit()}
          style={styles.input}
          placeholder="비밀번호를 한 번 더 입력하세요"
          placeholderTextColor="#AAA5B8"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          accessibilityLabel="비밀번호 확인"
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
        accessibilityLabel="이메일로 회원가입"
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
      >
        <Text style={styles.primaryButtonText}>{isSubmitting ? '가입 중...' : '회원가입'}</Text>
      </Pressable>
    </AuthFormLayout>
  );
}
