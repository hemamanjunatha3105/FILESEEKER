import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../assets/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { loginAccount } from '../services/accountService';
import { getFirebaseErrorMessage } from '../services/firebaseErrors';

interface LoginScreenProps {
  onNavigateToRegistration: () => void;
  serviceError?: string;
}

function LoginScreen({
  onNavigateToRegistration,
  serviceError = '',
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleLogin = async () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Enter your password.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await loginAccount(email, password);
      } catch (error) {
        Alert.alert(
          'Unable to sign in',
          getFirebaseErrorMessage(error, 'Please try again.'),
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>F</Text>
            </View>
            <Text style={styles.brandName}>FileSeeker</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to your account.
            </Text>
            {serviceError ? (
              <Text accessibilityRole="alert" style={styles.serviceError}>
                {serviceError}
              </Text>
            ) : null}
            <View style={styles.form}>
              <FormInput
                autoComplete="email"
                error={errors.email}
                keyboardType="email-address"
                label="Email address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                returnKeyType="next"
                textContentType="emailAddress"
                value={email}
              />
              <FormInput
                autoComplete="current-password"
                error={errors.password}
                isPassword
                label="Password"
                onChangeText={setPassword}
                placeholder="Enter your password"
                returnKeyType="done"
                textContentType="password"
                value={password}
              />
              <PrimaryButton
                disabled={isSubmitting}
                label={isSubmitting ? 'Signing in…' : 'Sign in'}
                onPress={handleLogin}
              />
            </View>

            <Text style={styles.registerPrompt}>
              Don&apos;t have an account?{' '}
              <Text
                accessibilityRole="button"
                onPress={onNavigateToRegistration}
                style={styles.registerLink}>
                Create account
              </Text>
            </Text>
          </View>
          <Text style={styles.footer}>Your files, organized in one place.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 11,
    height: 36,
    justifyContent: 'center',
    marginRight: 10,
    width: 36,
  },
  brandMarkText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '800',
  },
  brandName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    padding: 24,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  serviceError: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  form: {
    marginTop: 26,
  },
  registerPrompt: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 22,
    textAlign: 'center',
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
  },
});

export default LoginScreen;
