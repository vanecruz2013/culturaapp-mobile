import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder — full implementation in Sprint 2
export default function SearchResultsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Resultados de búsqueda</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, color: '#666' },
});
