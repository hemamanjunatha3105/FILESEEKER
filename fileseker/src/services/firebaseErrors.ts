export function getFirebaseErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? error.code
      : undefined;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Check your internet connection and try again.';
    case 'firestore/permission-denied':
      return 'This account does not have permission to access its data.';
    default:
      return error instanceof Error && error.message
        ? error.message
        : fallback;
  }
}
