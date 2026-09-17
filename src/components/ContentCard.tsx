import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface ContentItem {
  id?: string;
  externalId?: string;
  title: string;
  creator?: string;
  year?: number;
  coverUrl?: string;
  type?: string;
}

interface Props {
  item: ContentItem;
  rating?: number;
  status?: string;
  progress?: { value: number; total: number };
  onPress?: () => void;
  horizontal?: boolean;
}

const TYPE_EMOJI: Record<string, string> = {
  MOVIE: '🎬',
  BOOK: '📚',
  SERIES: '📺',
  MUSIC_ARTIST: '🎵',
  MUSIC_ALBUM: '🎵',
  MUSIC_TRACK: '🎵',
};

const StarRating = ({ rating }: { rating: number }) => {
  const stars = Math.round(rating);
  return (
    <Text style={styles.stars}>
      {'⭐'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </Text>
  );
};

const ProgressBar = ({ value, total }: { value: number; total: number }) => {
  const pct = Math.min(100, Math.round((value / total) * 100));
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressText}>{pct}%</Text>
    </View>
  );
};

export default function ContentCard({ item, rating, status, progress, onPress, horizontal }: Props) {
  const emoji = item.type ? (TYPE_EMOJI[item.type] ?? '🎭') : '🎭';

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.cardH} onPress={onPress} activeOpacity={0.8}>
        {item.coverUrl ? (
          <Image source={{ uri: item.coverUrl }} style={styles.coverH} contentFit="cover" />
        ) : (
          <View style={[styles.coverH, styles.coverPlaceholder]}>
            <Text style={styles.coverEmoji}>{emoji}</Text>
          </View>
        )}
        <Text style={styles.titleH} numberOfLines={2}>{item.title}</Text>
        {item.creator && <Text style={styles.creatorH} numberOfLines={1}>{item.creator}</Text>}
        {rating !== undefined && <StarRating rating={rating} />}
        {progress && <ProgressBar value={progress.value} total={progress.total} />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={styles.cover} contentFit="cover" />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.coverEmoji}>{emoji}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.creator && <Text style={styles.creator} numberOfLines={1}>{item.creator}</Text>}
        {item.year && <Text style={styles.year}>{item.year}</Text>}
        {rating !== undefined && <StarRating rating={rating} />}
        {progress && <ProgressBar value={progress.value} total={progress.total} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Vertical card
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cover: { width: 70, height: 100 },
  coverPlaceholder: { backgroundColor: '#F0EFFF', alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 28 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  creator: { fontSize: 13, color: '#666', marginTop: 2 },
  year: { fontSize: 12, color: '#999', marginTop: 2 },

  // Horizontal card
  cardH: {
    width: 130,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  coverH: { width: 130, height: 185 },
  titleH: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', padding: 8, paddingBottom: 2 },
  creatorH: { fontSize: 11, color: '#666', paddingHorizontal: 8 },

  // Stars
  stars: { fontSize: 11, marginTop: 4, paddingHorizontal: 8 },

  // Progress
  progressContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 8, gap: 6 },
  progressBg: { flex: 1, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#6C63FF', borderRadius: 2 },
  progressText: { fontSize: 10, color: '#666', minWidth: 28 },
});
