import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParams } from '../../navigation/AppNavigator';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Rellena todos los campos');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
      });
      await setAuth(data.user, data.accessToken, data.refreshToken);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const msg = errors ? errors[0].msg : err.response?.data?.error || 'Error al registrarse';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>✨ Cultura</Text>
        <Text style={styles.subtitle}>Crea tu identidad cultural</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre visible</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tu nombre"
            accessibilityLabel="Nombre visible"
          />

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

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            accessibilityLabel="Contraseña"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
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
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  button: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6C63FF', fontSize: 14 },
});
