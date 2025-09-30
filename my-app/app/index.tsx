import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setSelections } from '../src/store/sessionSlice';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

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
  
  // Shared values for animations
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const bookScales = BOOKS.map(() => useSharedValue(1));
  const chapterScales = BOOKS.flatMap(book => 
    book.chapters.map(() => useSharedValue(1))
  );
  
  // Animated styles for books
  const bookAnimatedStyles = bookScales.map(scale => 
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))
  );
  
  // Animated styles for chapters
  const chapterAnimatedStyles = chapterScales.map(scale => 
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }))
  );

  const handleBookSelect = (bookId: string, bookIndex: number) => {
    setSelectedBook(bookId);
    setSelectedChapter(null); // Reset chapter selection when book changes
    
    // Animation for book selection
    bookScales[bookIndex].value = withSpring(0.96, { damping: 10 });
    setTimeout(() => {
      bookScales[bookIndex].value = withSpring(1, { damping: 10 });
    }, 100);
  };

  const handleChapterSelect = (chapterId: string, chapterIndex: number) => {
    setSelectedChapter(chapterId);
    
    // Animation for chapter selection
    opacity.value = withTiming(0.7, { duration: 100 });
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 100 });
    }, 100);
    
    // Animation for chapter selection
    chapterScales[chapterIndex].value = withTiming(0.95, { duration: 100 });
    setTimeout(() => {
      chapterScales[chapterIndex].value = withTiming(1, { duration: 100 });
    }, 100);
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

  // Animated components
  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
  const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: opacity.value }]}>
        <Text style={styles.title}>Select a Book</Text>
      </Animated.View>
      
      <AnimatedScrollView style={styles.booksContainer}>
        {BOOKS.map((book, bookIndex) => {
          const isBookSelected = selectedBook === book.id;
          
          return (
            <AnimatedTouchableOpacity
              key={book.id}
              style={[
                styles.bookCard,
                isBookSelected && styles.selectedCard,
                bookAnimatedStyles[bookIndex],
                { 
                  shadowOpacity: isBookSelected ? 0.2 : 0.1,
                  transform: [{ scale: isBookSelected ? 1.02 : 1 }]
                }
              ]}
              onPress={() => handleBookSelect(book.id, bookIndex)}
            >
              <Text style={styles.bookTitle}>{book.title}</Text>
            </AnimatedTouchableOpacity>
          );
        })}
      </AnimatedScrollView>

      {selectedBookData && (
        <>
          <Text style={styles.subtitle}>Select a Chapter</Text>
          <ScrollView horizontal style={styles.chaptersContainer} showsHorizontalScrollIndicator={false}>
            {selectedBookData.chapters.map((chapter, chapterIndex) => {
              const isChapterSelected = selectedChapter === chapter.id;
              
              // Find the global index for this chapter
              let globalChapterIndex = 0;
              for (let i = 0; i < BOOKS.length; i++) {
                if (BOOKS[i].id === selectedBook) {
                  globalChapterIndex += chapterIndex;
                  break;
                }
                globalChapterIndex += BOOKS[i].chapters.length;
              }
              
              return (
                <AnimatedTouchableOpacity
                  key={chapter.id}
                  style={[
                    styles.chapterCard,
                    isChapterSelected && styles.selectedCard,
                    chapterAnimatedStyles[globalChapterIndex],
                    { 
                      shadowOpacity: isChapterSelected ? 0.25 : 0.15,
                      transform: [{ scale: isChapterSelected ? 1.05 : 1 }]
                    }
                  ]}
                  onPress={() => handleChapterSelect(chapter.id, globalChapterIndex)}
                >
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                </AnimatedTouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      <AnimatedTouchableOpacity
        style={[
          styles.continueButton,
          (!selectedBook || !selectedChapter) && styles.disabledButton,
          { transform: [{ scale: scale.value }] }
        ]}
        onPress={handleContinue}
        disabled={!selectedBook || !selectedChapter}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </AnimatedTouchableOpacity>
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 122, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 15,
    marginLeft: 20,
    color: '#a0a0c0',
  },
  booksContainer: {
    flex: 1,
    padding: 20,
  },
  bookCard: {
    backgroundColor: '#1a1a2e',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2d2d4d',
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    shadowColor: '#00aaff',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  chaptersContainer: {
    marginVertical: 10,
    paddingLeft: 20,
  },
  chapterCard: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 16,
    marginRight: 20,
    minWidth: 220,
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2d2d4d',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e0ff',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#2c2c4c',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
});