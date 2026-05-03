import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppCard, ScreenScroll, appStyles } from '@/components/ui/app-primitives';
import { ThemedText } from '@/components/themed-text';
import { Design } from '@/constants/theme';
import {
  type SocialProfile,
  type SocialProvider,
  useSocialSignIn,
} from '@/hooks/use-social-sign-in';

type Profile = SocialProfile | { name: string; email: string; provider: 'Email' };

type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>['name'];
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const PROFILE_ACCENT = Design.color.success;
const PROFILE_ACCENT_DARK = '#0B8A5F';

type SocialButtonConfig = {
  provider: SocialProvider;
  label: string;
  loadingLabel: string;
  icon: FontAwesomeIconName;
  color: string;
};

const SOCIAL_BUTTONS: readonly SocialButtonConfig[] = [
  {
    provider: 'google',
    label: 'Continue with Gmail',
    loadingLabel: 'Signing in with Gmail…',
    icon: 'google',
    color: '#DB4437',
  },
  {
    provider: 'apple',
    label: 'Continue with Apple',
    loadingLabel: 'Signing in with Apple…',
    icon: 'apple',
    color: '#111111',
  },
];

type SettingsRow = {
  label: string;
  description: string;
  icon: MaterialIconName;
  accent: string;
};

const settingsRows: readonly SettingsRow[] = [
  {
    label: 'Account preferences',
    description: 'Display name, email, and study identity.',
    icon: 'person-outline',
    accent: Design.color.primary,
  },
  {
    label: 'Notifications',
    description: 'Daily revision nudges and quiz reminders.',
    icon: 'notifications-none',
    accent: '#7C3AED',
  },
  {
    label: 'Privacy',
    description: 'Control what data the tutor remembers.',
    icon: 'lock-outline',
    accent: '#0EA5E9',
  },
  {
    label: 'Help & feedback',
    description: 'Get help or share what could be better.',
    icon: 'help-outline',
    accent: Design.color.warning,
  },
];

function SocialSignInButton({
  config,
  onSuccess,
  onError,
}: {
  config: SocialButtonConfig;
  onSuccess: (profile: SocialProfile) => void;
  onError: (message: string) => void;
}) {
  const { signIn, isLoading, isAvailable, unavailableReason, error } = useSocialSignIn(
    config.provider,
    onSuccess,
  );

  const handlePress = useCallback(async () => {
    onError('');
    await signIn();
  }, [onError, signIn]);

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={config.label}
      accessibilityState={{ busy: isLoading, disabled: !isAvailable }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.socialButton,
        !isAvailable && styles.disabledSocialButton,
        (pressed || isLoading) && styles.pressed,
      ]}>
      <View style={[styles.socialIcon, { backgroundColor: config.color }]}>
        <FontAwesome name={config.icon} size={16} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.socialButtonText}>
        {isLoading ? config.loadingLabel : config.label}
      </ThemedText>
      {isLoading ? (
        <ActivityIndicator size="small" color={Design.color.muted} />
      ) : isAvailable ? (
        <MaterialIcons name="arrow-forward-ios" size={14} color={Design.color.muted} />
      ) : (
        <View style={styles.statusChip}>
          <ThemedText style={styles.statusChipText}>
            {unavailableReason ? 'Setup' : 'Soon'}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const [name, setName] = useState('Study Hero');
  const [email, setEmail] = useState('student@example.com');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState('');

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

  const heroTitle = profile
    ? `Welcome back,\n${profile.name.split(' ')[0]}.`
    : 'Sign in to\npersonalize study.';

  return (
    <ScreenScroll>
      <View style={styles.heroShell}>
        <LinearGradient
          colors={[PROFILE_ACCENT, PROFILE_ACCENT_DARK]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroBadge}>
            <MaterialIcons
              name={profile ? 'verified-user' : 'person-outline'}
              size={14}
              color="#FFFFFF"
            />
            <ThemedText style={styles.heroBadgeText}>
              {profile ? 'Signed in' : 'Profile'}
            </ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>{heroTitle}</ThemedText>
          <ThemedText style={styles.heroBody}>
            Keep your study identity, account controls, and sign-in status in one polished profile.
          </ThemedText>
        </LinearGradient>
      </View>

      {profile ? (
        <>
          <AppCard style={styles.profileCard}>
            <LinearGradient
              colors={[PROFILE_ACCENT, PROFILE_ACCENT_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <ThemedText type="subtitle" style={styles.profileName}>
                {profile.name}
              </ThemedText>
              <ThemedText style={styles.profileEmail}>{profile.email}</ThemedText>
              <View style={styles.providerPill}>
                <MaterialIcons name="check-circle" size={12} color={PROFILE_ACCENT} />
                <ThemedText style={styles.providerText}>
                  Signed in with {profile.provider}
                </ThemedText>
              </View>
            </View>
          </AppCard>

          <View style={styles.metricsRow}>
            <AppCard style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: `${Design.color.primary}18` }]}>
                <MaterialIcons name="auto-stories" size={18} color={Design.color.primary} />
              </View>
              <ThemedText style={styles.metricValue}>4</ThemedText>
              <ThemedText style={styles.metricLabel}>study modes</ThemedText>
            </AppCard>
            <AppCard style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: `${Design.color.warning}18` }]}>
                <MaterialIcons name="local-fire-department" size={18} color={Design.color.warning} />
              </View>
              <ThemedText style={styles.metricValue}>30m</ThemedText>
              <ThemedText style={styles.metricLabel}>sprint ready</ThemedText>
            </AppCard>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <ThemedText style={appStyles.sectionTitle}>Settings</ThemedText>
              <ThemedText style={styles.sectionCaption}>
                Tune the tutor to fit how you like to study.
              </ThemedText>
            </View>

            <AppCard style={styles.settingsCard}>
              {settingsRows.map((row, index) => (
                <View
                  key={row.label}
                  style={[styles.settingsRow, index > 0 && styles.settingsRowDivider]}>
                  <View style={[styles.settingsIcon, { backgroundColor: `${row.accent}18` }]}>
                    <MaterialIcons name={row.icon} size={18} color={row.accent} />
                  </View>
                  <View style={styles.settingsBody}>
                    <ThemedText type="defaultSemiBold" style={styles.settingsLabel}>
                      {row.label}
                    </ThemedText>
                    <ThemedText style={styles.settingsDescription}>{row.description}</ThemedText>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={14}
                    color={Design.color.subtle}
                  />
                </View>
              ))}
            </AppCard>
          </View>

          <AppCard muted style={styles.panel}>
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
        <>
          <AppCard style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={[styles.panelIcon, { backgroundColor: `${PROFILE_ACCENT}18` }]}>
                <MaterialIcons name="login" size={18} color={PROFILE_ACCENT} />
              </View>
              <View style={styles.panelHeaderText}>
                <ThemedText type="subtitle">Sign in</ThemedText>
                <ThemedText style={styles.sectionCaption}>
                  Continue with Gmail in a development build, or use local email sign-in for demo
                  testing.
                </ThemedText>
              </View>
            </View>

            <View style={styles.socialStack}>
              {SOCIAL_BUTTONS.map((config) => (
                <SocialSignInButton
                  key={config.provider}
                  config={config}
                  onSuccess={setProfile}
                  onError={setAuthError}
                />
              ))}
            </View>

            {authError ? (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color={Design.color.danger} />
                <ThemedText style={styles.errorText}>{authError}</ThemedText>
              </View>
            ) : null}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <ThemedText style={styles.dividerText}>or continue with email</ThemedText>
              <View style={styles.divider} />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                Name
              </ThemedText>
              <View style={styles.inputWrap}>
                <MaterialIcons
                  name="person-outline"
                  size={18}
                  color={Design.color.subtle}
                  style={styles.inputIcon}
                />
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
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>
                Email
              </ThemedText>
              <View style={styles.inputWrap}>
                <MaterialIcons
                  name="mail-outline"
                  size={18}
                  color={Design.color.subtle}
                  style={styles.inputIcon}
                />
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
            </View>

            <AppButton onPress={handleSignIn}>Sign in</AppButton>
          </AppCard>
        </>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  heroShell: {
    borderRadius: Design.radius.xl,
    overflow: 'hidden',
    shadowColor: Design.shadow.color,
    shadowOffset: Design.shadow.offset,
    shadowOpacity: Design.shadow.opacity,
    shadowRadius: Design.shadow.radius,
    elevation: Design.shadow.elevation,
  },
  hero: {
    padding: Design.space.xl,
    gap: Design.space.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Design.radius.pill,
    paddingHorizontal: Design.space.sm + 2,
    paddingVertical: Design.space.xs,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.9,
    lineHeight: 36,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
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
    borderRadius: Design.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
    gap: Design.space.xs / 2,
  },
  profileName: {
    color: Design.color.text,
  },
  profileEmail: {
    color: Design.color.muted,
    fontSize: 13,
  },
  providerPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.xs / 2,
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.successSoft,
    marginTop: Design.space.xs,
    paddingHorizontal: Design.space.sm,
    paddingVertical: 4,
  },
  providerText: {
    color: PROFILE_ACCENT,
    fontSize: 11,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Design.space.md,
  },
  metricCard: {
    flex: 1,
    padding: Design.space.md,
    gap: Design.space.xs,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Design.space.xs,
  },
  metricValue: {
    color: Design.color.text,
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    color: Design.color.muted,
    fontSize: 12,
  },
  section: {
    gap: Design.space.md,
  },
  sectionHeading: {
    gap: Design.space.xs / 2,
  },
  sectionCaption: {
    color: Design.color.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  settingsCard: {
    padding: 0,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
    padding: Design.space.md,
  },
  settingsRowDivider: {
    borderTopWidth: 1,
    borderTopColor: Design.color.border,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBody: {
    flex: 1,
    gap: Design.space.xs / 2,
  },
  settingsLabel: {
    color: Design.color.text,
    fontSize: 15,
  },
  settingsDescription: {
    color: Design.color.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  panel: {
    gap: Design.space.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Design.space.md,
  },
  panelIcon: {
    width: 38,
    height: 38,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeaderText: {
    flex: 1,
    gap: Design.space.xs / 2,
  },
  body: {
    color: Design.color.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  socialStack: {
    gap: Design.space.sm,
  },
  socialButton: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: Design.color.border,
    borderRadius: Design.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.md,
    paddingHorizontal: Design.space.md,
    backgroundColor: Design.color.surface,
  },
  disabledSocialButton: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    flex: 1,
    color: Design.color.text,
    fontSize: 14,
    fontWeight: '800',
  },
  statusChip: {
    borderRadius: Design.radius.pill,
    backgroundColor: Design.color.surfaceMuted,
    paddingHorizontal: Design.space.sm,
    paddingVertical: 4,
  },
  statusChipText: {
    color: Design.color.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Design.space.sm,
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.dangerSoft,
    padding: Design.space.sm + 2,
  },
  errorText: {
    flex: 1,
    color: Design.color.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldGroup: {
    gap: Design.space.xs + 2,
  },
  fieldLabel: {
    color: Design.color.text,
    fontSize: 13,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Design.color.border,
    borderRadius: Design.radius.md,
    backgroundColor: Design.color.surface,
    paddingHorizontal: Design.space.sm + 2,
  },
  inputIcon: {
    marginRight: Design.space.sm,
  },
  input: {
    flex: 1,
    color: Design.color.text,
    paddingVertical: Design.space.sm + 2,
    fontSize: 15,
  },
});
