import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { resetSession } from '../src/store/sessionSlice';
import { getFeedback } from '../src/api';

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating feedback...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Feedback</Text>
      <Text style={styles.subtitle}>
        {book} - {chapter}
        {'\n'}
        Role: {profile}
      </Text>
      
      {feedback ? (
        <ScrollView style={styles.feedbackContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{feedback.summary}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scores</Text>
            <View style={styles.scoresContainer}>
              {feedback.scores && Object.entries(feedback.scores).map(([key, value]) => (
                <View key={key} style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>{key}:</Text>
                  <Text style={styles.scoreValue}>{value as string}/10</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            <Text style={styles.suggestionsText}>{feedback.suggestions}</Text>
          </View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  feedbackContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scoreItem: {
    flexDirection: 'row',
    marginRight: 20,
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  suggestionsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  noFeedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFeedbackText: {
    fontSize: 18,
    color: '#666',
  },
  newSessionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  newSessionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});