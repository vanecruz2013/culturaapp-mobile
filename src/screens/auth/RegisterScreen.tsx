import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [step, setStep] = useState<'credentials' | 'username'>('credentials');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, completeProfile } = useAuthStore();

  // Step 1: crear cuenta en Supabase
  const handleSignUp = async () => {
    if (!displayName.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Rellena todos los campos');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      setStep('username');
    } catch (err: any) {
      const msg = err.message?.includes('already registered')
        ? 'Este email ya está registrado'
        : err.message || 'Error al registrarse';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: elegir username
  const handleCompleteProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Elige un nombre de usuario');
      return;
    }
    setLoading(true);
    try {
      await completeProfile(username.trim().toLowerCase());
      // La sesión ya está activa — el navigator detecta el cambio
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error al completar el perfil';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'username') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>✨ Cultura</Text>
          <Text style={styles.subtitle}>Elige tu nombre de usuario</Text>
          <View style={styles.form}>
            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="solo_letras_y_numeros"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Nombre de usuario"
            />
            <Text style={styles.hint}>3–30 caracteres, sin espacios</Text>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCompleteProfile}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Empezar</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>✨ Cultura</Text>
        <Text style={styles.subtitle}>Crea tu identidad cultural</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre visible</Text>
          <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Tu nombre" accessibilityLabel="Nombre" />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} accessibilityLabel="Email" />
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" secureTextEntry accessibilityLabel="Contraseña" />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continuar</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: '800', color: '#6C63FF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  form: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 8 },
  hint: { fontSize: 12, color: '#999', marginTop: 2 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#FAFAFA', color: '#333' },
  button: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6C63FF', fontSize: 14 },
});
