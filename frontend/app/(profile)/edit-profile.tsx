 import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>
      <View style={styles.section}>
        <View style={styles.avatarContainer}>
          <User size={48} color="#1E40AF" />
        </View>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{user?.username}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Age</Text>
        <Text style={styles.value}>{user?.profile?.age}</Text>
        <Text style={styles.label}>Gender</Text>
        <Text style={styles.value}>{user?.profile?.gender === 'M' ? 'Male' : user?.profile?.gender === 'F' ? 'Female' : 'Other'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Districts</Text>
        <View style={styles.preferencesContainer}>
          {user?.preferences?.preferred_districts?.length ? user.preferences.preferred_districts.map((preference, idx) => (
            <View key={idx} style={[styles.preferenceTag, { backgroundColor: '#6366F1', shadowColor: '#6366F1' }]}> 
              <Text style={styles.preferenceText}>
                {typeof preference === 'object' && preference !== null ? preference.name : preference}
              </Text>
            </View>
          )) : <Text style={styles.emptyText}>No preferred districts</Text>}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Geographies</Text>
        <View style={styles.preferencesContainer}>
          {user?.preferences?.preferred_geographies?.length ? user.preferences.preferred_geographies.map((preference, idx) => (
            <View key={idx} style={[styles.preferenceTag, { backgroundColor: '#10B981', shadowColor: '#10B981' }]}> 
              <Text style={styles.preferenceText}>
                {typeof preference === 'object' && preference !== null ? preference.name : preference}
              </Text>
            </View>
          )) : <Text style={styles.emptyText}>No preferred geographies</Text>}
        </View>
      </View>
      {/* Future: Add buttons for add/delete preferences here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  backButtonText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E40AF',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 10,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
}); 