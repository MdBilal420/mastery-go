import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { resetSession } from '../store/sessionSlice';
import { getFeedback } from '../store/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function FeedbackScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { book, chapter, profile, history, sessionId } = useSelector((state: RootState) => state.session);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await getFeedback(history, sessionId);
      setFeedback(response);
    } catch (error) {
      console.error('Failed to get feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    dispatch(resetSession());
    router.push('/');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Generating personalized feedback...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Session Feedback</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          {book} - {chapter}
          {'\n'}
          Role: {profile}
        </ThemedText>
      </View>
      
      {feedback ? (
        <ScrollView style={styles.feedbackContainer} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.card}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{feedback.summary}</Text>
          </ThemedView>
          
          <ThemedView style={styles.card}>
            <Text style={styles.sectionTitle}>Performance Scores</Text>
            <View style={styles.scoresContainer}>
              {feedback.scores && Object.entries(feedback.scores).map(([key, value]) => (
                <View key={key} style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>{key}</Text>
                  <View style={styles.scoreValueContainer}>
                    <Text style={styles.scoreValue}>{value as string}/10</Text>
                  </View>
                </View>
              ))}
            </View>
          </ThemedView>
          
          <ThemedView style={styles.card}>
            <Text style={styles.sectionTitle}>Suggestions for Improvement</Text>
            <Text style={styles.suggestionsText}>{feedback.suggestions}</Text>
          </ThemedView>
        </ScrollView>
      ) : (
        <View style={styles.noFeedbackContainer}>
          <Text style={styles.noFeedbackText}>No feedback available</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.newSessionButton}
        onPress={handleNewSession}
      >
        <Text style={styles.newSessionButtonText}>Start New Session</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  feedbackContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  summaryText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scoreValueContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  scoreValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
  suggestionsText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  noFeedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noFeedbackText: {
    fontSize: 18,
    color: '#666',
  },
  newSessionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  newSessionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});