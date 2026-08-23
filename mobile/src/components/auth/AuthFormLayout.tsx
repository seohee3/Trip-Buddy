import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthFormLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
  footer: ReactNode;
}>;

export function AuthFormLayout({ title, description, footer, children }: AuthFormLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>Trip-Buddy</Text>
            <Text style={styles.brandDescription}>여행의 순간을 함께 기록해요</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.form}>{children}</View>
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const authFormStyles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8E5F2',
    borderRadius: 14,
    color: '#222222',
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },
  errorBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF2F1',
  },
  errorText: {
    color: '#C4473A',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#5C3DFF',
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#777777',
    fontSize: 13,
  },
  footerLink: {
    color: '#5C3DFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 36,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 26,
  },
  brand: {
    color: '#5C3DFF',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  brandDescription: {
    marginTop: 8,
    color: '#777777',
    fontSize: 13,
  },
  card: {
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#EEEAFB',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#35228F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  title: {
    color: '#222222',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  form: {
    marginTop: 24,
    gap: 16,
  },
});
