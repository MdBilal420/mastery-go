import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { addTurn, setSessionId } from '../src/store/sessionSlice';
import { openSession, sendUserAudio } from '../src/api';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';

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
    
    // Start a new session
    startNewSession();
    
    // Cleanup function
    return () => {
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
    if (isRecording) {
      // Stop recording
      try {
        const audioBase64 = await stopRecording();
        
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
          
          // Play bot's response audio
          if (response.audio_b64) {
            await playBase64Audio(response.audio_b64);
          }
        }
      } catch (error) {
        console.error('Failed to send audio:', error);
        Alert.alert('Error', 'Failed to send audio. Please try again.');
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        await startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
        Alert.alert('Error', 'Failed to start recording. Please try again.');
      }
    }
  };

  const handleEndSession = () => {
    router.push('./feedback');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Role Play</Text>
      <Text style={styles.subtitle}>
        {book} - {chapter}
        {'\n'}
        Role: {profile}
      </Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Starting session...</Text>
        </View>
      ) : (
        <ScrollView style={styles.historyContainer}>
          {history.map((turn, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                turn.role === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text style={styles.messageText}>{turn.text}</Text>
            </View>
          ))}
          
          {initialBotMessage && history.length === 0 && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <Text style={styles.messageText}>{initialBotMessage}</Text>
            </View>
          )}
        </ScrollView>
      )}
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton,
            isPlaying && styles.disabledButton,
          ]}
          onPress={handleRecordPress}
          disabled={isPlaying || isLoading}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndSession}
          disabled={isLoading}
        >
          <Text style={styles.endButtonText}>End Session</Text>
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
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  historyContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageBubble: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  controlsContainer: {
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '80%',
  },
  endButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});