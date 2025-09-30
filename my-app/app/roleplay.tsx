import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { addTurn, setSessionId } from '../src/store/sessionSlice';
import { openSession, sendUserAudio } from '../src/api';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

export default function RolePlayScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { book, chapter, profile, history } = useSelector((state: RootState) => state.session);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialBotMessage, setInitialBotMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef<string | null>(null);
  const playerRef = useRef<Audio.Sound | null>(null);
  const currentAudioSourceRef = useRef<string | null>(null);
  
  // Animation values
  const pulse = useSharedValue(0);
  const recordScale = useSharedValue(1);
  const messageOpacity = useSharedValue(1);
  const messageTranslateY = useSharedValue(0);

  // Initialize audio recorder
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    // Set up audio mode and request permissions on component mount
    (async () => {
      try {
        // Request recording permissions
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permission Required', 'Please allow microphone access to record audio.');
        }
        
        // Set audio mode
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error('Failed to set up audio permissions:', error);
      }
    })();
    
    // Start animation loop for recording button pulse
    const interval = setInterval(() => {
      pulse.value = withTiming(pulse.value === 0 ? 1 : 0, { duration: 1000 });
    }, 1000);
    
    // Start a new session
    startNewSession();
    
    // Cleanup function
    return () => {
      clearInterval(interval);
      if (recorder.isRecording) {
        recorder.stop();
      }
      // Properly unload the audio player
      if (playerRef.current) {
        playerRef.current.unloadAsync();
        playerRef.current = null;
      }
      // Delete temporary audio files
      if (currentAudioSourceRef.current) {
        FileSystem.deleteAsync(currentAudioSourceRef.current, { idempotent: true });
      }
    };
  }, []);

  const startNewSession = async () => {
    try {
      // Generate a new session ID
      const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionId.current = newSessionId;
      
      // Update session ID in Redux
      dispatch(setSessionId(newSessionId));
      
      // Call the backend to open a new session
      if (book && chapter && profile) {
        setIsLoading(true);
        const response = await openSession(book, chapter, profile, newSessionId);
        
        // Add bot's initial message to history
        dispatch(addTurn({ role: 'bot', text: response.text }));
        setInitialBotMessage(response.text);
        
        // Play the initial audio
        if (response.audio_b64) {
          await playBase64Audio(response.audio_b64);
        }
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Check permissions first
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Please allow microphone access to record audio.');
        return;
      }

      // Prepare and start recording
      await recorder.prepareToRecordAsync();
      await recorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      setIsRecording(false);
      
      // Access the URI directly from the recorder
      const uri = recorder.uri;
      if (!uri) {
        throw new Error('No recording URI available');
      }
      
      // Read the recorded audio file
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return audioBase64;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
      setIsRecording(false);
      return null;
    }
  };

  const playBase64Audio = async (base64Audio: string) => {
    try {
      // Create a temporary file URI
      const fileName = `${FileSystem.documentDirectory}temp_audio_${Date.now()}.m4a`;
      
      // Write the base64 audio to a file
      await FileSystem.writeAsStringAsync(fileName, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Clean up previous audio file
      if (currentAudioSourceRef.current) {
        FileSystem.deleteAsync(currentAudioSourceRef.current, { idempotent: true });
      }
      
      // Store the new file path
      currentAudioSourceRef.current = fileName;
      
      // Unload previous player if exists
      if (playerRef.current) {
        await playerRef.current.unloadAsync();
        playerRef.current = null;
      }
      
      // Create a new sound object
      const { sound } = await Audio.Sound.createAsync({ uri: fileName });
      playerRef.current = sound;
      
      // Play the audio
      await sound.playAsync();
      
      // Set up playback completion listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        } else if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });
    } catch (error) {
      console.error('Failed to prepare audio:', error);
      Alert.alert('Error', 'Failed to prepare audio response.');
    }
  };

  const handleRecordPress = async () => {
    recordScale.value = withSpring(0.9, { damping: 10 });
    
    if (isRecording) {
      // Stop recording
      try {
        const audioBase64 = await stopRecording();
        recordScale.value = withSpring(1, { damping: 10 });
        
        // Send audio to backend
        if (audioBase64 && sessionId.current && book && chapter && profile) {
          const response = await sendUserAudio(
            audioBase64,
            sessionId.current,
            book,
            chapter,
            profile
          );
          
          // Add user's message to history
          dispatch(addTurn({ role: 'user', text: '[Audio Message]' }));
          
          // Add bot's response to history
          dispatch(addTurn({ role: 'bot', text: response.text }));
          
          // Animate new message
          messageTranslateY.value = withSpring(20, { damping: 15 });
          setTimeout(() => {
            messageTranslateY.value = withSpring(0, { damping: 15 });
          }, 300);
          
          // Play bot's response audio
          if (response.audio_b64) {
            await playBase64Audio(response.audio_b64);
          }
        }
      } catch (error) {
        console.error('Failed to send audio:', error);
        Alert.alert('Error', 'Failed to send audio. Please try again.');
        setIsRecording(false);
        recordScale.value = withSpring(1, { damping: 10 });
      }
    } else {
      // Start recording
      try {
        await startRecording();
        recordScale.value = withSpring(1, { damping: 10 });
      } catch (error) {
        console.error('Failed to start recording:', error);
        Alert.alert('Error', 'Failed to start recording. Please try again.');
        recordScale.value = withSpring(1, { damping: 10 });
      }
    }
  };

  const handleEndSession = () => {
    router.push('./feedback');
  };

  // Animated components
  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
  const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
  
  // Animated styles
  const pulseStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: interpolate(pulse.value, [0, 1], [0.4, 0.7], Extrapolate.CLAMP),
      transform: [
        { scale: interpolate(pulse.value, [0, 1], [1, 1.05], Extrapolate.CLAMP) }
      ]
    };
  });
  
  const recordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: recordScale.value }]
    };
  });
  
  const messageStyle = useAnimatedStyle(() => {
    return {
      opacity: messageOpacity.value,
      transform: [{ translateY: messageTranslateY.value }]
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Role Play</Text>
        <Text style={styles.subtitle}>
          {book} - {chapter}
          {'\n'}
          Role: {profile}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing session...</Text>
        </View>
      ) : (
        <AnimatedScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
          {history.map((turn, index) => {
            const isLatestMessage = index === history.length - 1;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.messageBubble,
                  turn.role === 'user' ? styles.userMessage : styles.botMessage,
                  isLatestMessage && messageStyle
                ]}
              >
                <Text style={styles.messageText}>{turn.text}</Text>
              </Animated.View>
            );
          })}
          
          {initialBotMessage && history.length === 0 && (
            <Animated.View style={[styles.messageBubble, styles.botMessage, messageStyle]}>
              <Text style={styles.messageText}>{initialBotMessage}</Text>
            </Animated.View>
          )}
        </AnimatedScrollView>
      )}
      
      <View style={styles.controlsContainer}>
        <AnimatedTouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton,
            isPlaying && styles.disabledButton,
            recordButtonStyle,
            isRecording && pulseStyle
          ]}
          onPress={handleRecordPress}
          disabled={isPlaying || isLoading}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </AnimatedTouchableOpacity>
        
        <AnimatedTouchableOpacity
          style={styles.endButton}
          onPress={handleEndSession}
          disabled={isLoading}
        >
          <Text style={styles.endButtonText}>End Session</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 122, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0c0',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#a0a0c0',
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },
  messageBubble: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 8,
    shadowColor: '#007AFF',
  },
  botMessage: {
    backgroundColor: '#1a1a2e',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#2d2d4d',
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
  controlsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  recordButton: {
    backgroundColor: '#34C759',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center',
    width: '80%',
    marginBottom: 25,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#2c2c4c',
    shadowOpacity: 0.1,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  endButton: {
    backgroundColor: '#FF9500',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  endButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});