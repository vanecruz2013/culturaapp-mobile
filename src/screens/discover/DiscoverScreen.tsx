import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList,
  StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { contentApi } from '../../api/content';
import ContentCard from '../../components/ContentCard';
import { RootStackParams } from '../../navigation/AppNavigator';
import { useDebouncedCallback } from '../../hooks/useDebounce';

type Nav = NativeStackNavigationProp<RootStackParams>;

const TABS = [
  { key: 'all', label: 'Todo' },
  { key: 'movie', label: '🎬 Cine' },
  { key: 'book', label: '📚 Libros' },
  { key: 'series', label: '📺 Series' },
];

export default function DiscoverScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debounce = useDebouncedCallback((val: string) => setDebouncedQuery(val), 500);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debounce(text);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery, activeTab],
    queryFn: () => contentApi.search(debouncedQuery, activeTab === 'all' ? undefined : activeTab),
    enabled: debouncedQuery.length >= 2,
  });

  // Flatten results from all types
  const results = [
    ...(data?.movies?.results ?? []),
    ...(data?.series?.results ?? []),
    ...(data?.books?.results ?? []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Descubrir</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Busca películas, libros, series..."
            returnKeyType="search"
            accessibilityLabel="Buscar contenido"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setDebouncedQuery(''); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {debouncedQuery.length < 2 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Escribe al menos 2 caracteres para buscar</Text>
        </View>
      )}

      {isLoading && debouncedQuery.length >= 2 && (
        <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
      )}

      {!isLoading && debouncedQuery.length >= 2 && results.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>No se encontraron resultados para "{debouncedQuery}"</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.externalId}`}
        renderItem={({ item }) => (
          <ContentCard
            item={item}
            onPress={() => {
              if (item.type === 'MOVIE' || item.type === 'SERIES') {
                navigation.navigate('MovieDetail', { externalId: item.externalId });
              }
            }}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FC' },
  header: { backgroundColor: '#fff', padding: 16, paddingTop: 56 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E', marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  clearBtn: { fontSize: 16, color: '#999', padding: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  tabActive: { backgroundColor: '#6C63FF' },
  tabText: { fontSize: 13, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { padding: 16 },
  hint: { padding: 32, alignItems: 'center' },
  hintText: { color: '#999', fontSize: 14, textAlign: 'center' },
  loader: { marginTop: 40 },
});
