import { Alert, Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

import { styles } from '../../styles/appStyles';
import type { ThemeColors } from '../../types/app';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim();
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

export function AuthPage({
  colors,
  loading,
  message,
  onGoogleAuth,
  onSubmit,
}: {
  colors: ThemeColors;
  loading: boolean;
  message: string;
  onGoogleAuth: (idToken: string) => void;
  onSubmit: (payload: {
    mode: 'login' | 'register';
    username: string;
    email: string;
    password: string;
  }) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'grabvocab' });
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
    redirectUri,
  });

  useEffect(() => {
    const idToken = response?.type === 'success' ? response.params?.id_token : undefined;
    if (idToken) {
      onGoogleAuth(idToken);
    }
  }, [onGoogleAuth, response]);

  const googleEnabled = Boolean(
    GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID
  );

  return (
    <View style={[styles.contentGrid, styles.authGrid, !isWide && styles.stackedGrid]}>
      <View
        style={[
          styles.pageCard,
          styles.authIntroCard,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor || colors.buttonBg,
          },
        ]}
      >
        <Text style={[styles.heroEyebrow, { color: colors.accentColor }]}>Account</Text>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
          Sign in to save progress and keep your vocabulary workflow consistent.
        </Text>
        <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>
          Use local authentication or social providers already wired through NextAuth.
        </Text>
      </View>

      <View
        style={[
          styles.authCard,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor || colors.buttonBg,
          },
        ]}
      >
        <View style={styles.pageStack}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>
              Access quizzes, saved activity, and the shared learning experience.
            </Text>
          </View>
          {mode === 'register' && (
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Full name"
              placeholderTextColor={colors.secondaryText}
              style={[
                styles.authInput,
                { borderColor: colors.borderColor, color: colors.primaryText },
              ]}
            />
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.secondaryText}
            autoCapitalize="none"
            style={[
              styles.authInput,
              { borderColor: colors.borderColor, color: colors.primaryText },
            ]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry
            style={[
              styles.authInput,
              { borderColor: colors.borderColor, color: colors.primaryText },
            ]}
          />
          <Pressable
            onPress={() => onSubmit({ mode, username, email, password })}
            disabled={loading}
            style={[
              styles.primaryActionButton,
              { backgroundColor: '#3b82f6', opacity: loading ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.primaryActionText}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
            </Text>
          </Pressable>
          <View style={styles.ctaRow}>
            <Pressable
              disabled={loading || !request || !googleEnabled}
              style={[
                styles.secondaryActionButton,
                { borderColor: colors.borderColor, opacity: loading || !googleEnabled ? 0.6 : 1 },
              ]}
              onPress={() => {
                if (!googleEnabled) {
                  Alert.alert(
                    'Google login unavailable',
                    'Set the Google client IDs in frontend-app/.env and backend env first.'
                  );
                  return;
                }
                void promptAsync();
              }}
            >
              <FontAwesome name="google" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                Google
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryActionButton, { borderColor: colors.borderColor }]}
              onPress={() =>
                Alert.alert('Unavailable', 'Social auth is not wired in this app yet.')
              }
            >
              <FontAwesome name="facebook" size={16} color={colors.primaryText} />
              <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
                Facebook
              </Text>
            </Pressable>
          </View>
          {message ? (
            <Text style={[styles.sectionCopy, { color: colors.secondaryText }]}>{message}</Text>
          ) : null}
          <Pressable
            style={[
              styles.secondaryActionButton,
              styles.authSwitchButton,
              { borderColor: colors.borderColor },
            ]}
            onPress={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
          >
            <Text style={[styles.secondaryActionText, { color: colors.primaryText }]}>
              {mode === 'login' ? 'Need an account?' : 'Already registered?'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
