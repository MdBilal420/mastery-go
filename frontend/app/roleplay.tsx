import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function RolePlayScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [botText, setBotText] = useState('');
  const [botAudioUri, setBotAudioUri] = useState('');

  // Request permissions and start the session
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is required to use this feature.');
      }
      
      // Start the roleplay session
      await startSession();
    })();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startSession = async () => {
    try {
      // Call backend /open endpoint
      // This is a placeholder - in a real app, you would make an API call
      const response = {
        text: "Hello! Welcome to our roleplay session. Let's practice having a conversation about the selected topic.",
        audio_b64: "" // Placeholder for base64 audio data
      };
      
      setBotText(response.text);
      // In a real app, you would convert the base64 audio to a playable format
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start the session. Please try again.');
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Convert audio file to base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Send to backend
        await sendAudioToBackend(base64);
      }
      
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const sendAudioToBackend = async (audioBase64: string) => {
    try {
      // Call backend /respond-audio endpoint
      // This is a placeholder - in a real app, you would make an API call
      const response = {
        text: "That's an interesting point. Could you tell me more about that?",
        audio_b64: "" // Placeholder for base64 audio data
      };
      
      setBotText(response.text);
      // In a real app, you would convert the base64 audio to a playable format
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      Alert.alert('Error', 'Failed to process your response. Please try again.');
    }
  };

  const playBotAudio = async () => {
    if (!botAudioUri) return;
    
    try {
      setIsPlaying(true);
      
      const { sound } = await Audio.Sound.createAsync({ uri: botAudioUri });
      setSound(sound);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
        }
      });
      
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing audio', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  const endSession = () => {
    router.push('/feedback');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Role Play</Text>
      
      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptLabel}>Bot:</Text>
        <Text style={styles.transcriptText}>{botText}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.micButton, isRecording ? styles.recording : null]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.micButtonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.playButton]}
          onPress={playBotAudio}
          disabled={isPlaying || !botAudioUri}
        >
          <Text style={styles.actionButtonText}>
            {isPlaying ? 'Playing...' : 'Play Bot Audio'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.endButton]}
          onPress={endSession}
        >
          <Text style={styles.actionButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>
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
  transcriptContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flex: 1,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transcriptText: {
    fontSize: 16,
  },
  micButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 20,
  },
  recording: {
    backgroundColor: '#f44336',
  },
  micButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  playButton: {
    backgroundColor: '#2196F3',
  },
  endButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});