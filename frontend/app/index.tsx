import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const books = [
  { id: '1', title: 'How to Win Friends and Influence People', author: 'Dale Carnegie' },
  { id: '2', title: 'The Lean Startup', author: 'Eric Ries' },
];

export default function BookSelectionScreen() {
  const router = useRouter();

  const handleBookSelect = (bookId: string) => {
    // In a real app, you would dispatch an action to set the selected book
    // For now, we'll just navigate to the profile selection screen
    router.push('/profile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Book</Text>
      {books.map((book) => (
        <TouchableOpacity
          key={book.id}
          style={styles.bookCard}
          onPress={() => handleBookSelect(book.id)}
        >
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>
        </TouchableOpacity>
      ))}
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
  bookCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
});