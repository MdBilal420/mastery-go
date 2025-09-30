import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setSelections } from '../store/sessionSlice';
import { Colors } from '../constants/theme';

// Demo content
const BOOKS = [
  {
    id: 'how-to-win-friends',
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    description: 'Classic guide to building relationships and influencing others',
    chapters: [
      { id: 'chapter-1', title: 'Fundamental Techniques in Handling People' },
      { id: 'chapter-2', title: 'Ways to Make People Like You' },
    ],
  },
  {
    id: 'the-lean-startup',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    description: 'How today\'s entrepreneurs use continuous innovation to create successful businesses',
    chapters: [
      { id: 'chapter-1', title: 'Vision' },
      { id: 'chapter-2', title: 'Steer' },
    ],
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'Proven way to build good habits and break bad ones',
    chapters: [
      { id: 'chapter-1', title: 'The Surprising Power of Atomic Habits' },
      { id: 'chapter-2', title: 'How Your Habits Shape Your Identity' },
    ],
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    description: 'Rules for focused success in a distracted world',
    chapters: [
      { id: 'chapter-1', title: 'Deep Work is Valuable' },
      { id: 'chapter-2', title: 'Deep Work is Rare' },
    ],
  },
];

const PROFILES = [
  { id: 'manager', title: 'Manager', description: 'Practice as a manager giving feedback' },
  { id: 'teacher', title: 'Teacher', description: 'Practice as a teacher explaining concepts' },
  { id: 'student', title: 'Student', description: 'Practice as a student asking questions' },
  { id: 'sales', title: 'Salesperson', description: 'Practice as a salesperson pitching ideas' },
];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedBook, setSelectedBook] = useState<string | null>(BOOKS[0].id);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  
  const selectedBookData = BOOKS.find(book => book.id === selectedBook);

  const handleContinue = () => {
    if (selectedBook && selectedProfile) {
      const book = BOOKS.find(b => b.id === selectedBook);
      const profile = PROFILES.find(p => p.id === selectedProfile);
      
      if (book && profile) {
        // For now, we'll use the first chapter as default
        const chapter = book.chapters[0];
        
        dispatch(
          setSelections({
            book: book.title,
            chapter: chapter.title,
            profile: profile.title,
          })
        );
        router.push('./roleplay');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured book card */}
        {selectedBookData && (
          <View style={styles.featuredBookCard}>
            <View style={styles.bookImagePlaceholder}>
              <View style={styles.gradientOverlay} />
              <Text style={styles.featuredBookAuthor}>{selectedBookData.author}</Text>
              <Text style={styles.featuredBookTitle}>{selectedBookData.title}</Text>
              <Text style={styles.featuredBookDescription}>{selectedBookData.description}</Text>
            </View>
          </View>
        )}

        {/* Choose Your Book Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose Your Book</Text>
          <Text style={styles.arrow}>→</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {BOOKS.map((book) => {
            const isSelected = selectedBook === book.id;
            return (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.bookCard,
                  isSelected && styles.selectedBookCard
                ]}
                onPress={() => setSelectedBook(book.id)}
              >
                <View style={styles.bookCoverPlaceholder} />
                <Text style={styles.bookCardTitle} numberOfLines={2}>{book.title}</Text>
                <Text style={styles.bookCardAuthor}>{book.author}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Select Your Profile Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Your Profile</Text>
          <Text style={styles.arrow}>→</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {PROFILES.map((profile) => {
            const isSelected = selectedProfile === profile.id;
            return (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileCard,
                  isSelected && styles.selectedProfileCard
                ]}
                onPress={() => setSelectedProfile(profile.id)}
              >
                <View style={styles.profileAvatarPlaceholder} />
                <Text style={styles.profileCardTitle}>{profile.title}</Text>
                <Text style={styles.profileCardDescription}>{profile.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Floating Navigation Bar */}
      {/* <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>⌂</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('./explore')}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navText}>Books</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('./feedback')}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
      </View> */}

      {/* Continue Button - only shown when both book and profile are selected */}
      {selectedBook && selectedProfile && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Start Roleplay</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
  },
  featuredBookCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bookImagePlaceholder: {
    height: 200,
    backgroundColor: '#e0e0e0',
    justifyContent: 'flex-end',
    padding: 20,
    position: 'relative',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  featuredBookAuthor: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  featuredBookTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredBookDescription: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '400',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 35,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  arrow: {
    fontSize: 20,
    color: '#999999',
  },
  horizontalScroll: {
    marginBottom: 10,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
  },
  bookCard: {
    width: 150,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  selectedBookCard: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  bookCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 5,
  },
  bookCardAuthor: {
    fontSize: 12,
    color: '#999999',
  },
  profileCard: {
    width: 160,
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  selectedProfileCard: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  profileAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginBottom: 10,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 5,
  },
  profileCardDescription: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  spacer: {
    height: 100, // Space for the bottom nav bar
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.light.tint,
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});