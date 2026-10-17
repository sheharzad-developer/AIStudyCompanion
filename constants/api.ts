import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ConstantsWithManifest = typeof Constants & {
  manifest?: {
    debuggerHost?: string;
  };
};

function getDevServerHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ?? (Constants as ConstantsWithManifest).manifest?.debuggerHost;

  return hostUri?.split(':')[0];
}

function getDefaultApiBaseUrl() {
  const devServerHost = getDevServerHost();

  if (devServerHost && devServerHost !== 'localhost' && devServerHost !== '127.0.0.1') {
    return `http://${devServerHost}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

// The deployed web build serves the backend from the same origin under /api.
const SAME_ORIGIN_API_PATH = '/api';

export function getApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

  if (Platform.OS === 'web' && !__DEV__) {
    // An http:// backend is blocked as mixed content on an https page (e.g. a LAN IP
    // left in the deploy env), so fall back to the same-origin API instead.
    const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';

    if (!configured || (isHttpsPage && configured.startsWith('http:'))) {
      return SAME_ORIGIN_API_PATH;
    }
  }

  return configured || getDefaultApiBaseUrl();
}
