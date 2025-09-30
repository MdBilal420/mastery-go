import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState({
    summary: '',
    score: 0,
    suggestions: [] as string[],
  });

  useEffect(() => {
    // In a real app, you would fetch feedback from the backend
    // For now, we'll use placeholder data
    setFeedback({
      summary: 'You did a great job maintaining the conversation and asking relevant questions. Your tone was appropriate for the selected role.',
      score: 85,
      suggestions: [
        'Try to ask more open-ended questions to encourage detailed responses',
        'Listen actively and respond to specific points mentioned by the other person',
        'Vary your sentence structures to make the conversation more engaging'
      ]
    });
  }, []);

  const restartSession = () => {
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Session Feedback</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Your Score</Text>
        <Text style={styles.scoreValue}>{feedback.score}/100</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>{feedback.summary}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggestions for Improvement</Text>
        {feedback.suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity style={styles.restartButton} onPress={restartSession}>
        <Text style={styles.restartButtonText}>Start New Session</Text>
      </TouchableOpacity>
    </ScrollView>
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
  scoreContainer: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 24,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});