import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { setSelections } from '../src/store/sessionSlice';

// Demo profiles
const PROFILES = [
  { id: 'manager', title: 'Manager', description: 'Practice as a manager giving feedback' },
  { id: 'teacher', title: 'Teacher', description: 'Practice as a teacher explaining concepts' },
  { id: 'student', title: 'Student', description: 'Practice as a student asking questions' },
];

export default function ProfileSelectionScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { book, chapter } = useSelector((state: RootState) => state.session);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);
  };

  const handleContinue = () => {
    if (selectedProfile) {
      const profile = PROFILES.find(p => p.id === selectedProfile);
      
      if (profile && book && chapter) {
        dispatch(
          setSelections({
            book,
            chapter,
            profile: profile.title,
          })
        );
        router.push('./roleplay');
      }
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Role</Text>
      <Text style={styles.subtitle}>
        Book: {book}
        {'\n'}
        Chapter: {chapter}
      </Text>
      
      <View style={styles.profilesContainer}>
        {PROFILES.map(profile => (
          <TouchableOpacity
            key={profile.id}
            style={[
              styles.profileCard,
              selectedProfile === profile.id && styles.selectedCard,
            ]}
            onPress={() => handleProfileSelect(profile.id)}
          >
            <Text style={styles.profileTitle}>{profile.title}</Text>
            <Text style={styles.profileDescription}>{profile.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedProfile && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedProfile}
        >
          <Text style={styles.continueButtonText}>Start Roleplay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  profilesContainer: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  profileDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});