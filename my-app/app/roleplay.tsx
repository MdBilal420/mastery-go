import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addTurn, setSessionId } from '../store/sessionSlice';
import { openSession, sendUserAudio } from '../store/api';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

export default function RolePlayScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { book, chapter, profile, history } = useSelector((state: RootState) => state.session);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state for processing indicator
  const [initialBotMessage, setInitialBotMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef<string | null>(null);
  const playerRef = useRef<Audio.Sound | null>(null);
  const currentAudioSourceRef = useRef<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeightRef = useRef<number>(0);
  const [isCloseToBottom, setIsCloseToBottom] = useState(true);

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

  useEffect(() => {
    // Scroll to bottom when history changes, but only if we were close to bottom before
    if (scrollViewRef.current && isCloseToBottom) {
      // Use a longer timeout to ensure layout is complete
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [history, isCloseToBottom]);

  // Remove the duplicate scroll handling and improve the logic
  const handleScroll = (nativeEvent: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    // More accurate calculation for determining if user is at bottom
    const paddingToBottom = 20;
    const isClose = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    setIsCloseToBottom(isClose);
  };

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
    if(isPlaying) return
    recordScale.value = withSpring(0.9, { damping: 10 });
    
    if (isRecording) {
      // Stop recording
      try {
        const audioBase64 = await stopRecording();
        recordScale.value = withSpring(1, { damping: 10 });
        
        // Send audio to backend
        if (audioBase64 && sessionId.current && book && chapter && profile) {
          setIsProcessing(true); // Show processing indicator
          const response = await sendUserAudio(
            audioBase64,
            sessionId.current,
            book,
            chapter,
            profile
          );
          setIsProcessing(false); // Hide processing indicator
          
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
        setIsProcessing(false); // Hide processing indicator on error
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

  const handleEndSession = async () => {
    // Stop any playing audio
    if (playerRef.current) {
      try {
        await playerRef.current.stopAsync();
        setIsPlaying(false);
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
    
    // Stop recording if in progress
    if (isRecording) {
      await recorder.stop();
      setIsRecording(false);
    }
    
    router.push('./feedback');
  };

  // Animated components
  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
  const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
  
  // Initialize scroll position tracking
  useEffect(() => {
    // Set initial scroll position tracking after first render
    setTimeout(() => {
      setIsCloseToBottom(true); // Start with user at bottom
    }, 500);
  }, []);

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
      {/* Header bar with back button, title, and end session button */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {book} - {chapter}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleEndSession}>
          <Text style={styles.endSessionText}>End</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing session...</Text>
        </View>
      ) : (
        <AnimatedScrollView 
          ref={scrollViewRef}
          style={styles.historyContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.historyContent}
          onScroll={({ nativeEvent }) => handleScroll(nativeEvent)}
          scrollEventThrottle={16} // Increased frequency for smoother tracking
          onContentSizeChange={(width, height) => {
            // Track content height changes
            const previousHeight = contentHeightRef.current;
            contentHeightRef.current = height;
            
            // When content size increases, scroll to bottom if we were close to bottom
            if (isCloseToBottom && scrollViewRef.current && height > previousHeight) {
              // Reduced timeout for faster response
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }}
        >
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
                <Text style={styles.speakerLabel}>
                  {turn.role === 'user' ? 'You' : 'Tutor'}
                </Text>
                <Text style={styles.messageText}>{turn.text}</Text>
                <Text style={styles.timestamp}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Animated.View>
            );
          })}
          
          {initialBotMessage && history.length === 0 && (
            <Animated.View style={[styles.messageBubble, styles.botMessage, messageStyle]}>
              <Text style={styles.speakerLabel}>Tutor</Text>
              <Text style={styles.messageText}>{initialBotMessage}</Text>
              <Text style={styles.timestamp}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Animated.View>
          )}
        </AnimatedScrollView>
      )}
      
      {/* Record button moved to bottom */}
      {isLoading ? null :<AnimatedTouchableOpacity
        style={[
          styles.recordButton,
          isPlaying && styles.playingButton,
          isRecording && styles.recordingButton,
          recordButtonStyle
        ]}
        onPress={handleRecordPress}
        activeOpacity={0.8}
      >
        <Animated.View style={pulseStyle}>
          <Ionicons 
            name={isPlaying ? "volume-high" : isRecording ? "square" : "mic"} 
            size={32} 
            color="#FFFFFF" 
          />
        </Animated.View>
      </AnimatedTouchableOpacity>}
      
      {/* Processing indicator */}
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.processingText}>Processing your response...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerButton: {
    padding: 10,
    minWidth: 50,
  },
  headerTitleContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  endSessionText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666666',
  },
  historyContainer: {
    flex: 1,
  },
  historyContent: {
    padding: 20,
    paddingBottom: 140, // Space for floating panel
  },
  processingContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10, // Ensure it appears above other elements
  },
  processingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  messageBubble: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 15,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  botMessage: {
    backgroundColor: '#f0f4f8',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 8,
    borderRightWidth: 3,
    borderRightColor: '#34C759',
  },
  speakerLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
    color: '#333333',
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
    marginTop: 8,
    textAlign: 'right',
  },
  recordButton: {
    position: 'absolute',
    bottom: 30, // Positioned at bottom
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
  },
  playingButton: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0.1,
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  activeNavText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});