import Constants from 'expo-constants';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppCard, HeroCard, ScreenScroll } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';

type Profile = {
  name: string;
  email: string;
  provider: string;
};

const googleClientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

const upcomingProviders = [
  { label: 'Continue with Facebook', icon: 'f', color: '#1877F2' },
  { label: 'Continue with Apple', icon: 'A', color: '#111111' },
] as const;

function hasGoogleClientIdForPlatform() {
  if (Platform.OS === 'ios') return Boolean(googleClientIds.iosClientId);
  if (Platform.OS === 'android') return Boolean(googleClientIds.androidClientId);
  return Boolean(googleClientIds.webClientId);
}

function getGoogleSetupMessage() {
  if (Platform.OS === 'ios') {
    return 'Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, then run a development build. Expo Go cannot load native Google Sign-In.';
  }

  if (Platform.OS === 'android') {
    return 'Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, then run an Android development build.';
  }

  return 'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, then restart Expo.';
}

function GoogleSignInButton({
  onSuccess,
  onError,
}: {
  onSuccess: (profile: Profile) => void;
  onError: (message: string) => void;
}) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (Constants.appOwnership === 'expo') {
      onError('Real Gmail sign-in needs a development build. Expo Go cannot load native Google Sign-In.');
      return;
    }

    onError('');
    setIsGoogleLoading(true);
    let signInCancelledCode: string | undefined;

    try {
      const { GoogleSignin, statusCodes } = await import(
        '@react-native-google-signin/google-signin'
      );
      signInCancelledCode = statusCodes.SIGN_IN_CANCELLED;

      GoogleSignin.configure({
        webClientId: googleClientIds.webClientId,
        iosClientId: googleClientIds.iosClientId,
        offlineAccess: false,
        profileImageSize: 120,
      });

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const signInResult = (await GoogleSignin.signIn()) as {
        data?: { user?: { name?: string | null; email?: string | null } };
        user?: { name?: string | null; email?: string | null };
      };
      const googleUser = signInResult.data?.user ?? signInResult.user;

      if (!googleUser?.email) {
        throw new Error('Google did not return an email address.');
      }

      onSuccess({
        name: googleUser.name || googleUser.email,
        email: googleUser.email,
        provider: 'Google',
      });
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined;

      if (code === signInCancelledCode) {
        onError('Google sign-in was cancelled.');
      } else {
        console.error('Google sign-in error:', error);
        onError('Google sign-in failed. Check your OAuth client IDs and development build setup.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Gmail"
      disabled={isGoogleLoading}
      onPress={handleGoogleSignIn}
      style={({ pressed }) => [
        styles.socialButton,
        { borderColor: '#DB4437' },
        (pressed || isGoogleLoading) && styles.pressed,
      ]}>
      <View style={[styles.socialIcon, { backgroundColor: '#DB4437' }]}>
        <ThemedText style={styles.socialIconText}>G</ThemedText>
      </View>
      <ThemedText style={styles.socialButtonText}>
        {isGoogleLoading ? 'Signing in with Gmail...' : 'Continue with Gmail'}
      </ThemedText>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const [name, setName] = useState('Study Hero');
  const [email, setEmail] = useState('student@example.com');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState('');
  const isGoogleConfigured = hasGoogleClientIdForPlatform();

  const initials = useMemo(() => {
    if (!profile?.name) return 'SC';

    return profile.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [profile]);

  const handleSignIn = () => {
    setProfile({
      name: name.trim() || 'Study Hero',
      email: email.trim() || 'student@example.com',
      provider: 'Email',
    });
  };

  return (
    <ScreenScroll>
      <HeroCard
        kicker="Profile"
        title={profile ? `Welcome back, ${profile.name.split(' ')[0]}.` : 'Sign in to personalize study.'}
        body="Keep your study identity, account controls, and sign-in status in one polished profile."
        accent={Design.color.success}
      />

      {profile ? (
        <>
          <AppCard style={styles.profileCard}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText type="subtitle">{profile.name}</ThemedText>
              <ThemedText style={styles.body}>{profile.email}</ThemedText>
              <View style={styles.providerPill}>
                <ThemedText style={styles.providerText}>Signed in with {profile.provider}</ThemedText>
              </View>
            </View>
          </AppCard>

          <View style={styles.metricsRow}>
            <AppCard style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>4</ThemedText>
              <ThemedText style={styles.metricLabel}>study modes</ThemedText>
            </AppCard>
            <AppCard style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>30m</ThemedText>
              <ThemedText style={styles.metricLabel}>sprint ready</ThemedText>
            </AppCard>
          </View>

          <AppCard style={styles.panel}>
            <ThemedText type="subtitle">Account</ThemedText>
            <ThemedText style={styles.body}>
              Real Gmail sign-in requires a development build. Email sign-in remains local for demo
              use until a production auth backend is added.
            </ThemedText>
            <AppButton variant="danger" onPress={() => setProfile(null)}>
              Sign Out
            </AppButton>
          </AppCard>
        </>
      ) : (
        <AppCard style={styles.panel}>
          <ThemedText type="subtitle">Sign In</ThemedText>
          <ThemedText style={styles.body}>
            Continue with Gmail in a development build, or use local email sign-in for demo testing.
          </ThemedText>

          <View style={styles.socialStack}>
            {isGoogleConfigured ? (
              <GoogleSignInButton onSuccess={setProfile} onError={setAuthError} />
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Configure Gmail sign-in"
                onPress={() => setAuthError(getGoogleSetupMessage())}
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.disabledSocialButton,
                  { borderColor: '#DB4437' },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.socialIcon, { backgroundColor: '#DB4437' }]}>
                  <ThemedText style={styles.socialIconText}>G</ThemedText>
                </View>
                <ThemedText style={styles.socialButtonText}>Continue with Gmail</ThemedText>
                <ThemedText style={styles.badgeText}>Setup</ThemedText>
              </Pressable>
            )}

            {upcomingProviders.map((provider) => (
              <Pressable
                key={provider.label}
                accessibilityRole="button"
                accessibilityLabel={provider.label}
                disabled
                style={[
                  styles.socialButton,
                  styles.disabledSocialButton,
                  { borderColor: provider.color },
                ]}>
                <View style={[styles.socialIcon, { backgroundColor: provider.color }]}>
                  <ThemedText style={styles.socialIconText}>{provider.icon}</ThemedText>
                </View>
                <ThemedText style={styles.socialButtonText}>{provider.label}</ThemedText>
                <ThemedText style={styles.badgeText}>Soon</ThemedText>
              </Pressable>
            ))}
          </View>

          {authError ? <ThemedText style={styles.errorText}>{authError}</ThemedText> : null}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>or continue with email</ThemedText>
            <View style={styles.divider} />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="defaultSemiBold">Name</ThemedText>
            <TextInput
              accessibilityLabel="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Design.color.subtle}
              autoCapitalize="words"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText type="defaultSemiBold">Email</ThemedText>
            <TextInput
              accessibilityLabel="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="student@example.com"
              placeholderTextColor={Design.color.subtle}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <AppButton onPress={handleSignIn}>Sign In</AppButton>
        </AppCard>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  body: {
    color: Design.color.muted,
    lineHeight: 22,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.color.primary,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  providerPill: {
    alignSelf: 'flex-start',
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.successSoft,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  providerText: {
    color: Design.color.success,
    fontSize: 12,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Design.space.md,
  },
  metricCard: {
    flex: 1,
    padding: Design.space.md,
  },
  metricValue: {
    color: Design.color.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  metricLabel: {
    color: Design.color.muted,
    marginTop: 4,
  },
  panel: {
    gap: Design.space.md,
  },
  socialStack: {
    gap: Design.space.sm,
  },
  socialButton: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Design.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
    paddingHorizontal: Design.space.md,
    backgroundColor: Design.color.surface,
  },
  disabledSocialButton: {
    opacity: 0.62,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  socialIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  socialButtonText: {
    flex: 1,
    color: Design.color.text,
    fontWeight: '800',
  },
  badgeText: {
    color: Design.color.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  errorText: {
    color: Design.color.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Design.color.border,
  },
  dividerText: {
    color: Design.color.muted,
    fontSize: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Design.color.border,
    borderRadius: Design.radius.md,
    color: Design.color.text,
    backgroundColor: Design.color.surface,
    paddingHorizontal: Design.space.md,
    paddingVertical: 13,
    fontSize: 16,
  },
});
