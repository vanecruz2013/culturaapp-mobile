import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await AsyncStorage.multiSet([
      ['@user', JSON.stringify(user)],
      ['@accessToken', accessToken],
      ['@refreshToken', refreshToken],
    ]);
    set({ user, accessToken, refreshToken });
  },

  setTokens: (accessToken, refreshToken) => {
    AsyncStorage.multiSet([
      ['@accessToken', accessToken],
      ['@refreshToken', refreshToken],
    ]);
    set({ accessToken, refreshToken });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['@user', '@accessToken', '@refreshToken']);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  restoreSession: async () => {
    try {
      const [[, userStr], [, accessToken], [, refreshToken]] = await AsyncStorage.multiGet([
        '@user',
        '@accessToken',
        '@refreshToken',
      ]);
      if (userStr && accessToken && refreshToken) {
        set({ user: JSON.parse(userStr), accessToken, refreshToken });
      }
    } catch {
      // ignore — user will need to log in
    } finally {
      set({ isLoading: false });
    }
  },
}));
