import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

const fetchNotifications = () =>
  api.get('/notifications').then((r) => r.data);

const TYPE_LABELS: Record<string, string> = {
  RECOMMENDATION_RECEIVED: '🎁 Te han recomendado',
  RECOMMENDATION_FOLLOWED: '❤️ Siguieron tu recomendación',
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.items ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones</Text>
        {notifications.some((n: any) => !n.read) && (
          <TouchableOpacity onPress={() => markAllRead.mutate()}>
            <Text style={styles.markAll}>Marcar todas leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 && !isLoading && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>Sin notificaciones aún</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={[styles.item, !item.read && styles.itemUnread]}
            onPress={() => !item.read && markRead.mutate(item.id)}
          >
            <Text style={styles.itemType}>{TYPE_LABELS[item.type] ?? '📣'}</Text>
            <Text style={styles.itemContent}>
              {item.type === 'RECOMMENDATION_RECEIVED'
                ? `${item.data.senderDisplayName} te recomendó "${item.data.contentTitle}"`
                : `${item.data.receiverDisplayName} siguió tu recomendación de "${item.data.contentTitle}"`}
            </Text>
            {!item.read && <View style={styles.dot} />}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FC' },
  header: {
    backgroundColor: '#fff', padding: 16, paddingTop: 56,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  markAll: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  list: { padding: 16 },
  item: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 10, position: 'relative',
  },
  itemUnread: { backgroundColor: '#F0EFFF' },
  itemType: { fontSize: 13, fontWeight: '700', color: '#6C63FF', marginBottom: 4 },
  itemContent: { fontSize: 14, color: '#333', lineHeight: 20 },
  dot: {
    position: 'absolute', top: 16, right: 16,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#6C63FF',
  },
  empty: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#999', fontSize: 16 },
});
