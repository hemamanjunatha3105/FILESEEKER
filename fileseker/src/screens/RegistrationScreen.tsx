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
import { registerAccount } from '../services/accountService';
import { getFirebaseErrorMessage } from '../services/firebaseErrors';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface RegistrationScreenProps {
  onNavigateToLogin: () => void;
}

function RegistrationScreen({
  onNavigateToLogin,
}: RegistrationScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const nextErrors: FormErrors = {};

    if (!name.trim() || name.trim().length > 80) {
      nextErrors.name = 'Enter a name with at most 80 characters.';
    }
    if (
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (password.length < 8 || password.length > 128) {
      nextErrors.password = 'Use between 8 and 128 characters.';
    }
    if (confirmPassword !== password || !confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await registerAccount(name, email, password);
      } catch (error) {
        Alert.alert(
          'Unable to create account',
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
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Sign up to get started. It only takes a minute.
            </Text>

            <View style={styles.form}>
              <FormInput
                autoComplete="name"
                autoCapitalize="words"
                error={errors.name}
                label="Full name"
                onChangeText={setName}
                placeholder="Enter your full name"
                returnKeyType="next"
                textContentType="name"
                value={name}
              />
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
                autoComplete="new-password"
                error={errors.password}
                isPassword
                label="Password"
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                returnKeyType="next"
                textContentType="newPassword"
                value={password}
              />
              <FormInput
                autoComplete="new-password"
                error={errors.confirmPassword}
                isPassword
                label="Confirm password"
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                returnKeyType="done"
                textContentType="newPassword"
                value={confirmPassword}
              />
              <PrimaryButton
                disabled={isSubmitting}
                label={isSubmitting ? 'Creating account…' : 'Create account'}
                onPress={handleRegister}
              />
            </View>

            <Text style={styles.signInPrompt}>
              Already have an account?{' '}
              <Text
                accessibilityRole="button"
                onPress={onNavigateToLogin}
                style={styles.signIn}>
                Sign in
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
    padding: 24,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
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
  form: {
    marginTop: 26,
  },
  signInPrompt: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 22,
    textAlign: 'center',
  },
  signIn: {
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

export default RegistrationScreen;
