import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import HomeScreen from '../screens/home/HomeScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Content screens
import MovieDetailScreen from '../screens/content/MovieDetailScreen';
import SearchResultsScreen from '../screens/discover/SearchResultsScreen';

export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParams = {
  Home: undefined;
  Discover: undefined;
  Profile: undefined;
  Notifications: undefined;
};

export type RootStackParams = {
  Main: undefined;
  MovieDetail: { externalId: string };
  SearchResults: { query: string; type?: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const Tab = createBottomTabNavigator<MainTabParams>();
const RootStack = createNativeStackNavigator<RootStackParams>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 4 },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio', tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Discover" component={DiscoverScreen} options={{ title: 'Descubrir', tabBarLabel: 'Descubrir' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones', tabBarLabel: 'Notif.' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <AuthNavigator />;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={MainTabs} />
      <RootStack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{ headerShown: true, title: '' }}
      />
      <RootStack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ headerShown: true, title: 'Resultados' }}
      />
    </RootStack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
