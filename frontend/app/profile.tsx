import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const profiles = [
  { id: '1', name: 'Manager', description: 'Practice as a manager giving feedback' },
  { id: '2', name: 'Teacher', description: 'Practice as a teacher explaining concepts' },
  { id: '3', name: 'Student', description: 'Practice as a student asking questions' },
];

export default function ProfileSelectionScreen() {
  const router = useRouter();

  const handleProfileSelect = (profileId: string) => {
    // In a real app, you would dispatch an action to set the selected profile
    // For now, we'll just navigate to the roleplay screen
    router.push('/roleplay');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Profile</Text>
      {profiles.map((profile) => (
        <TouchableOpacity
          key={profile.id}
          style={styles.profileCard}
          onPress={() => handleProfileSelect(profile.id)}
        >
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileDescription}>{profile.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileDescription: {
    fontSize: 14,
    color: '#666',
  },
});