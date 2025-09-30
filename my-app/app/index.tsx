import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setSelections } from '../src/store/sessionSlice';

// Demo content
const BOOKS = [
  {
    id: 'how-to-win-friends',
    title: 'How to Win Friends and Influence People',
    chapters: [
      { id: 'chapter-1', title: 'Fundamental Techniques in Handling People' },
      { id: 'chapter-2', title: 'Ways to Make People Like You' },
    ],
  },
  {
    id: 'the-lean-startup',
    title: 'The Lean Startup',
    chapters: [
      { id: 'chapter-1', title: 'Vision' },
      { id: 'chapter-2', title: 'Steer' },
    ],
  },
];

export default function BookSelectionScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter(null); // Reset chapter selection when book changes
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapter(chapterId);
  };

  const handleContinue = () => {
    if (selectedBook && selectedChapter) {
      const book = BOOKS.find(b => b.id === selectedBook);
      const chapter = book?.chapters.find(c => c.id === selectedChapter);
      
      if (book && chapter) {
        dispatch(
          setSelections({
            book: book.title,
            chapter: chapter.title,
            profile: '', // Will be set in ProfileSelectionScreen
          })
        );
        router.push('./profile');
      }
    }
  };

  const selectedBookData = BOOKS.find(book => book.id === selectedBook);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Book</Text>
      
      <ScrollView style={styles.booksContainer}>
        {BOOKS.map(book => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.bookCard,
              selectedBook === book.id && styles.selectedCard,
            ]}
            onPress={() => handleBookSelect(book.id)}
          >
            <Text style={styles.bookTitle}>{book.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedBookData && (
        <>
          <Text style={styles.subtitle}>Select a Chapter</Text>
          <ScrollView horizontal style={styles.chaptersContainer}>
            {selectedBookData.chapters.map(chapter => (
              <TouchableOpacity
                key={chapter.id}
                style={[
                  styles.chapterCard,
                  selectedChapter === chapter.id && styles.selectedCard,
                ]}
                onPress={() => handleChapterSelect(chapter.id)}
              >
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedBook || !selectedChapter) && styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={!selectedBook || !selectedChapter}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  booksContainer: {
    flex: 1,
  },
  bookCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chaptersContainer: {
    marginVertical: 10,
  },
  chapterCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterTitle: {
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});