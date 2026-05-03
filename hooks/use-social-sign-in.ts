import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type SocialProvider = 'google' | 'apple';

export type SocialProfile = {
  name: string;
  email: string;
  provider: 'Google' | 'Apple';
};

export type UseSocialSignInResult = {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean;
  unavailableReason: string | null;
  clearError: () => void;
};

const GOOGLE_CLIENT_IDS = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

function googleClientIdForPlatform() {
  if (Platform.OS === 'ios') return GOOGLE_CLIENT_IDS.iosClientId;
  if (Platform.OS === 'android') return GOOGLE_CLIENT_IDS.androidClientId;
  return GOOGLE_CLIENT_IDS.webClientId;
}

function googleUnavailableReason(): string | null {
  if (googleClientIdForPlatform()) return null;
  if (Platform.OS === 'ios') {
    return 'Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, then run a development build. Expo Go cannot load native Google Sign-In.';
  }
  if (Platform.OS === 'android') {
    return 'Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, then run an Android development build.';
  }
  return 'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, then restart Expo.';
}

function appleUnavailableReason(): string | null {
  if (Platform.OS !== 'ios') {
    return 'Sign in with Apple is only available on iOS.';
  }
  return null;
}

export function useSocialSignIn(
  provider: SocialProvider,
  onSuccess: (profile: SocialProfile) => void,
): UseSocialSignInResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const clearError = useCallback(() => setError(null), []);

  const signInWithGoogle = useCallback(async () => {
    if (Constants.appOwnership === 'expo') {
      setError(
        'Real Gmail sign-in needs a development build. Expo Go cannot load native Google Sign-In.',
      );
      return;
    }

    setError(null);
    setIsLoading(true);

    let cancelledCode: string | undefined;

    try {
      const { GoogleSignin, statusCodes } = await import(
        '@react-native-google-signin/google-signin'
      );
      cancelledCode = statusCodes.SIGN_IN_CANCELLED;

      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_IDS.webClientId,
        iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
        offlineAccess: false,
        profileImageSize: 120,
      });

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const result = (await GoogleSignin.signIn()) as {
        data?: { user?: { name?: string | null; email?: string | null } };
        user?: { name?: string | null; email?: string | null };
      };
      const user = result.data?.user ?? result.user;

      if (!user?.email) {
        throw new Error('Google did not return an email address.');
      }

      onSuccessRef.current({
        name: user.name || user.email,
        email: user.email,
        provider: 'Google',
      });
    } catch (cause) {
      const code = typeof cause === 'object' && cause && 'code' in cause ? cause.code : undefined;
      if (cancelledCode && code === cancelledCode) {
        setError('Google sign-in was cancelled.');
      } else {
        console.error('Google sign-in error:', cause);
        setError('Google sign-in failed. Check your OAuth client IDs and development build setup.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const fullName = credential.fullName;
      const composedName = [fullName?.givenName, fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const email = credential.email ?? `${credential.user}@privaterelay.appleid.com`;
      const name = composedName || credential.email || 'Apple User';

      onSuccessRef.current({ name, email, provider: 'Apple' });
    } catch (cause) {
      const code = typeof cause === 'object' && cause && 'code' in cause ? cause.code : undefined;
      if (code === 'ERR_REQUEST_CANCELED') {
        setError('Apple sign-in was cancelled.');
      } else {
        console.error('Apple sign-in error:', cause);
        setError('Apple sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unavailableReason =
    provider === 'google' ? googleUnavailableReason() : appleUnavailableReason();

  const signIn = useCallback(async () => {
    if (unavailableReason) {
      setError(unavailableReason);
      return;
    }
    if (provider === 'google') return signInWithGoogle();
    return signInWithApple();
  }, [provider, unavailableReason, signInWithGoogle, signInWithApple]);

  return {
    signIn,
    isLoading,
    error,
    isAvailable: unavailableReason === null,
    unavailableReason,
    clearError,
  };
}
