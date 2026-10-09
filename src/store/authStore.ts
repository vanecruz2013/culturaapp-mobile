import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api } from '../api/client';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
}

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  // Acciones
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeProfile: (username: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  // Compatibilidad con el resto del código
  user: Profile | null;
  accessToken: string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  isLoading: true,

  // Alias para compatibilidad con screens existentes
  get user() { return get().profile; },
  get accessToken() { return null; }, // Supabase gestiona el token internamente

  signUp: async (email, password, displayName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
    // El trigger de Supabase crea el perfil automáticamente
    // La app luego llama a completeProfile para elegir username
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Obtener perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    set({ profile });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null });
  },

  completeProfile: async (username) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No hay sesión activa');

    // Llama al backend para guardar el username elegido
    const { data } = await api.post('/auth/complete-profile', {
      username,
      displayName: get().profile?.display_name,
    }, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    set({ profile: data });
  },

  restoreSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile });
      }
    } finally {
      set({ isLoading: false });
    }

    // Escuchar cambios de sesión (token refresh automático)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile });
      } else {
        set({ profile: null });
      }
    });
  },
}));
