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
  /** Short chip label shown on the button when sign-in isn't available here. */
  unavailableLabel: string | null;
  clearError: () => void;
};

const GOOGLE_CLIENT_IDS = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

// Web uses Google Identity Services; the native Google Sign-In module only runs in iOS/Android builds.
const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken: () => void;
};

type GoogleIdentityServices = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
        error_callback?: (error: { type?: string; message?: string }) => void;
      }) => GoogleTokenClient;
    };
  };
};

let googleIdentityScriptPromise: Promise<GoogleIdentityServices> | null = null;

function loadGoogleIdentityServices(): Promise<GoogleIdentityServices> {
  const existing = (window as { google?: GoogleIdentityServices }).google;
  if (existing?.accounts?.oauth2) return Promise.resolve(existing);

  if (!googleIdentityScriptPromise) {
    googleIdentityScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GOOGLE_IDENTITY_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        const google = (window as { google?: GoogleIdentityServices }).google;
        if (google?.accounts?.oauth2) resolve(google);
        else reject(new Error('Google Identity Services did not load.'));
      };
      script.onerror = () => {
        googleIdentityScriptPromise = null;
        reject(new Error('Could not load Google Identity Services.'));
      };
      document.head.appendChild(script);
    });
  }

  return googleIdentityScriptPromise;
}

function requestGoogleWebProfile(google: GoogleIdentityServices, clientId: string) {
  return new Promise<SocialProfile>((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'No access token.'));
          return;
        }

        try {
          const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          if (!userInfoResponse.ok) throw new Error('Could not read the Google profile.');

          const user = (await userInfoResponse.json()) as { name?: string; email?: string };
          if (!user.email) throw new Error('Google did not return an email address.');

          resolve({ name: user.name || user.email, email: user.email, provider: 'Google' });
        } catch (cause) {
          reject(cause);
        }
      },
      error_callback: (error) => {
        reject(Object.assign(new Error(error.message || 'Google sign-in failed.'), { code: error.type }));
      },
    });

    tokenClient.requestAccessToken();
  });
}

function googleClientIdForPlatform() {
  if (Platform.OS === 'ios') return GOOGLE_CLIENT_IDS.iosClientId;
  if (Platform.OS === 'android') return GOOGLE_CLIENT_IDS.androidClientId;
  return GOOGLE_CLIENT_IDS.webClientId;
}

// Expo Go is a shared app and can't include the native Google Sign-In module.
const IS_EXPO_GO = Constants.appOwnership === 'expo';

function googleUnavailableReason(): string | null {
  if (Platform.OS !== 'web' && IS_EXPO_GO) {
    return 'Gmail sign-in isn’t available in Expo Go. Use email below, or sign in with Gmail on the website or in the installed app.';
  }
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

  // Load the Google script ahead of the click: browsers only allow the sign-in popup
  // when it opens directly from the user's tap, not after an async script load.
  useEffect(() => {
    if (Platform.OS === 'web' && provider === 'google' && GOOGLE_CLIENT_IDS.webClientId) {
      loadGoogleIdentityServices().catch(() => {});
    }
  }, [provider]);

  const signInWithGoogleWeb = useCallback(async () => {
    const clientId = GOOGLE_CLIENT_IDS.webClientId;
    if (!clientId) return;

    setError(null);
    setIsLoading(true);

    try {
      const google = await loadGoogleIdentityServices();
      const profile = await requestGoogleWebProfile(google, clientId);
      onSuccessRef.current(profile);
    } catch (cause) {
      const code = typeof cause === 'object' && cause && 'code' in cause ? cause.code : undefined;
      if (code === 'popup_closed') {
        setError('Google sign-in was cancelled.');
      } else if (code === 'popup_failed_to_open') {
        setError('Your browser blocked the Google sign-in popup. Allow popups and try again.');
      } else {
        console.error('Google sign-in error:', cause);
        setError(
          'Google sign-in failed. Make sure this site is listed under Authorized JavaScript origins for your Google OAuth client.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') return signInWithGoogleWeb();

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
  }, [signInWithGoogleWeb]);

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
  const unavailableLabel = !unavailableReason
    ? null
    : provider === 'apple'
      ? 'iOS only'
      : Platform.OS !== 'web' && IS_EXPO_GO
        ? 'Web only'
        : 'Setup';

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
    unavailableLabel,
    clearError,
  };
}
