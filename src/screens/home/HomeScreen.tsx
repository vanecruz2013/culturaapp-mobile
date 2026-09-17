import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { userContentApi } from '../../api/content';
import ContentCard from '../../components/ContentCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParams>;

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<Nav>();

  const { data: recentMovies } = useQuery({
    queryKey: ['userContent', 'movies', 'recent'],
    queryFn: () => userContentApi.getMyList({ type: 'MOVIE', status: 'WATCHED', page: 1 }),
  });

  const { data: currentlyReading } = useQuery({
    queryKey: ['userContent', 'reading'],
    queryFn: () => userContentApi.getMyList({ status: 'READING', page: 1 }),
  });

  const { data: currentlyWatching } = useQuery({
    queryKey: ['userContent', 'watching'],
    queryFn: () => userContentApi.getMyList({ status: 'WATCHING', page: 1 }),
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user?.displayName?.split(' ')[0]} 👋</Text>
        <Text style={styles.subGreeting}>¿Qué vas a descubrir hoy?</Text>
      </View>

      {/* En progreso */}
      {((currentlyReading?.items?.length ?? 0) > 0 || (currentlyWatching?.items?.length ?? 0) > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En progreso</Text>
          <FlatList
            horizontal
            data={[...(currentlyReading?.items ?? []), ...(currentlyWatching?.items ?? [])]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContentCard
                item={item.content}
                status={item.status}
                progress={item.progressValue && item.progressTotal
                  ? { value: item.progressValue, total: item.progressTotal }
                  : undefined}
                onPress={() => {
                  if (item.content.type === 'MOVIE' || item.content.type === 'SERIES') {
                    navigation.navigate('MovieDetail', { externalId: item.content.externalId ?? item.contentId });
                  }
                }}
                horizontal
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Últimas películas vistas */}
      {(recentMovies?.items?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎬 Últimas películas</Text>
          <FlatList
            horizontal
            data={recentMovies?.items?.slice(0, 10)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContentCard
                item={item.content}
                rating={item.rating}
                onPress={() =>
                  navigation.navigate('MovieDetail', { externalId: item.content.externalId ?? item.contentId })
                }
                horizontal
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      )}

      {/* Empty state */}
      {(recentMovies?.total ?? 0) === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎬 📚 🎵</Text>
          <Text style={styles.emptyTitle}>Empieza a registrar</Text>
          <Text style={styles.emptyText}>
            Busca una película, libro o serie y añádela a tu lista
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Main', { screen: 'Discover' } as any)}
          >
            <Text style={styles.emptyButtonText}>Descubrir contenido</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FC' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  greeting: { fontSize: 26, fontWeight: '800', color: '#1A1A2E' },
  subGreeting: { fontSize: 16, color: '#666', marginTop: 4 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  horizontalList: { paddingRight: 16 },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  emptyButton: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
