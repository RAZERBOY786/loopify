// app/(tabs)/settings.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Add this
import { Theme } from '../../constants/types';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.mainTitle}>Settings</Text>
      
      <View style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View>
        <Text style={styles.name}>RAZER</Text>
        <Text style={styles.sub}>Free Account</Text>
      </View>
      
      <TouchableOpacity style={styles.option}><Text style={styles.optText}>Account Settings</Text></TouchableOpacity>
      <TouchableOpacity style={styles.option}><Text style={styles.optText}>Audio Quality</Text></TouchableOpacity>
      <TouchableOpacity style={styles.option}><Text style={styles.optText}>Privacy Policy</Text></TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg, paddingHorizontal: 20 },
  mainTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 20 },
  profile: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  sub: { color: Theme.subText },
  option: { paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  optText: { color: '#fff', fontSize: 16 }
});