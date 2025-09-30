import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export const startRecording = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    return recording;
  } catch (error) {
    console.error('Failed to start recording', error);
    throw error;
  }
};

export const stopRecording = async (recording: Audio.Recording) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    if (uri) {
      // Convert audio file to base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return base64;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to stop recording', error);
    throw error;
  }
};

export const playAudioFromBase64 = async (base64: string) => {
  try {
    // Write base64 to temporary file
    const uri = FileSystem.cacheDirectory + 'temp_audio.wav';
    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Play the audio file
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    
    return sound;
  } catch (error) {
    console.error('Error playing audio', error);
    throw error;
  }
};