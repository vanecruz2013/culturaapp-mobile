import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams } from '../../navigation/AppNavigator';
import { contentApi, userContentApi, ContentStatus } from '../../api/content';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'MovieDetail'>;
  route: RouteProp<RootStackParams, 'MovieDetail'>;
};

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function MovieDetailScreen({ route, navigation }: Props) {
  const { externalId } = route.params;
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['content', 'movie', externalId],
    queryFn: () => contentApi.getDetail('movie', externalId),
    onSuccess: (d) => {
      if (d.userStatus?.rating) setSelectedRating(d.userStatus.rating);
    },
  });

  const mutation = useMutation({
    mutationFn: (vars: { status: ContentStatus; rating?: number }) =>
      userContentApi.upsert({ contentId: data.id, ...vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'movie', externalId] });
      queryClient.invalidateQueries({ queryKey: ['userContent'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar');
    },
  });

  const handleMarkWatched = () => {
    mutation.mutate({ status: 'WATCHED', rating: selectedRating ?? undefined });
  };

  const handleWantToWatch = () => {
    mutation.mutate({ status: 'WANT_TO_WATCH' });
  };

  const handleRate = (rating: number) => {
    setSelectedRating(rating);
    if (data?.userStatus?.status === 'WATCHED') {
      mutation.mutate({ status: 'WATCHED', rating });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!data) return null;

  const userStatus = data.userStatus;
  const isWatched = userStatus?.status === 'WATCHED';
  const isWantToWatch = userStatus?.status === 'WANT_TO_WATCH';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover */}
      <View style={styles.coverContainer}>
        {data.coverUrl ? (
          <Image source={{ uri: data.coverUrl }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.coverEmoji}>🎬</Text>
          </View>
        )}
        <View style={styles.coverOverlay} />
      </View>

      <View style={styles.content}>
        {/* Title & meta */}
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.meta}>
          {[data.creator, data.year, data.genre].filter(Boolean).join(' · ')}
        </Text>

        {/* Platform stats */}
        {data.platformStats?.averageRating && (
          <Text style={styles.platformRating}>
            ⭐ {data.platformStats.averageRating} en la plataforma · {data.platformStats.totalUsers} usuarios
          </Text>
        )}

        {/* User actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, isWatched && styles.actionBtnActive]}
            onPress={handleMarkWatched}
            disabled={mutation.isPending}
          >
            <Text style={[styles.actionBtnText, isWatched && styles.actionBtnTextActive]}>
              {isWatched ? '✅ Vista' : '👁 Marcar como vista'}
            </Text>
          </TouchableOpacity>

          {!isWatched && (
            <TouchableOpacity
              style={[styles.actionBtn, isWantToWatch && styles.actionBtnSecondary]}
              onPress={handleWantToWatch}
              disabled={mutation.isPending}
            >
              <Text style={[styles.actionBtnText, isWantToWatch && styles.actionBtnTextSecondary]}>
                {isWantToWatch ? '🔖 En tu lista' : '+ Quiero verla'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rating (only if watched) */}
        {isWatched && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Tu puntuación</Text>
            <View style={styles.stars}>
              {STAR_OPTIONS.map((s) => (
                <TouchableOpacity key={s} onPress={() => handleRate(s)}>
                  <Text style={styles.star}>{s <= (selectedRating ?? 0) ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Synopsis */}
        {data.synopsis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text style={styles.synopsis}>{data.synopsis}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverContainer: { height: 300, position: 'relative' },
  cover: { width: '100%', height: 300 },
  coverPlaceholder: { backgroundColor: '#F0EFFF', alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 64 },
  coverOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    // gradient simulation with a simple bottom-to-top fade
  },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  meta: { fontSize: 14, color: '#666', marginBottom: 4 },
  platformRating: { fontSize: 13, color: '#999', marginBottom: 16 },
  actions: { gap: 10, marginBottom: 20 },
  actionBtn: {
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  actionBtnActive: { backgroundColor: '#6C63FF' },
  actionBtnSecondary: { backgroundColor: '#F0EFFF', borderColor: '#F0EFFF' },
  actionBtnText: { color: '#6C63FF', fontWeight: '700', fontSize: 15 },
  actionBtnTextActive: { color: '#fff' },
  actionBtnTextSecondary: { color: '#6C63FF' },
  ratingSection: { marginBottom: 20 },
  ratingLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 32 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  synopsis: { fontSize: 15, color: '#444', lineHeight: 24 },
});
