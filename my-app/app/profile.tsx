import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { setSelections } from '../src/store/sessionSlice';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming
} from 'react-native-reanimated';

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
  
  // Shared values for animations
  const scale = useSharedValue(1);
  const profileScales = PROFILES.map(() => useSharedValue(1));
  const profileRotations = PROFILES.map(() => useSharedValue(0));
  
  // Animated styles for profiles
  const profileAnimatedStyles = PROFILES.map((_, index) => 
    useAnimatedStyle(() => ({
      transform: [
        { scale: profileScales[index].value },
        { rotateY: `${profileRotations[index].value}deg` }
      ],
    }))
  );

  const handleProfileSelect = (profileId: string, profileIndex: number) => {
    setSelectedProfile(profileId);
    
    // Animation for profile selection
    profileRotations[profileIndex].value = withSpring(5, { damping: 5 });
    setTimeout(() => {
      profileRotations[profileIndex].value = withSpring(0, { damping: 8 });
    }, 300);
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

  // Animated components
  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Role</Text>
        <Text style={styles.subtitle}>
          Book: {book}
          {'\n'}
          Chapter: {chapter}
        </Text>
      </View>
      
      <View style={styles.profilesContainer}>
        {PROFILES.map((profile, profileIndex) => {
          const isProfileSelected = selectedProfile === profile.id;
          
          return (
            <AnimatedTouchableOpacity
              key={profile.id}
              style={[
                styles.profileCard,
                isProfileSelected && styles.selectedCard,
                profileAnimatedStyles[profileIndex],
                { 
                  shadowOpacity: isProfileSelected ? 0.3 : 0.15,
                  transform: [
                    { scale: isProfileSelected ? 1.03 : 1 },
                    { translateY: isProfileSelected ? -10 : 0 }
                  ]
                }
              ]}
              onPress={() => handleProfileSelect(profile.id, profileIndex)}
              onPressIn={() => {
                profileScales[profileIndex].value = withTiming(0.95, { duration: 150 });
                profileRotations[profileIndex].value = withTiming(10, { duration: 150 });
              }}
              onPressOut={() => {
                profileScales[profileIndex].value = withTiming(1, { duration: 150 });
                profileRotations[profileIndex].value = withTiming(0, { duration: 150 });
              }}
            >
              <Text style={styles.profileTitle}>{profile.title}</Text>
              <Text style={styles.profileDescription}>{profile.description}</Text>
            </AnimatedTouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttonContainer}>
        <AnimatedTouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </AnimatedTouchableOpacity>
        
        <AnimatedTouchableOpacity
          style={[
            styles.continueButton,
            !selectedProfile && styles.disabledButton,
            { transform: [{ scale: scale.value }] }
          ]}
          onPress={handleContinue}
          disabled={!selectedProfile}
        >
          <Text style={styles.continueButtonText}>Start Roleplay</Text>
        </AnimatedTouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 122, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0c0',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  profilesContainer: {
    flex: 1,
    padding: 20,
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: '#1a1a2e',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2d2d4d',
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    shadowColor: '#00aaff',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#ffffff',
  },
  profileDescription: {
    fontSize: 16,
    color: '#a0a0c0',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  backButton: {
    backgroundColor: '#2c2c4c',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    flex: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  disabledButton: {
    backgroundColor: '#2c2c4c',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});