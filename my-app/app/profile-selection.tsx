import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch } from "react-redux";
import { setSelections } from "../store/sessionSlice";
import { Colors } from "../constants/theme";

const PROFILES = [
  {
    id: "manager",
    title: "Manager",
    description: "Practice as a manager giving feedback",
    gradient: ["#ff9a9e", "#fecfef"] as const,
  },
  {
    id: "teacher",
    title: "Teacher",
    description: "Practice as a teacher explaining concepts",
    gradient: ["#a8edea", "#fed6e3"] as const,
  },
  {
    id: "student",
    title: "Student",
    description: "Practice as a student asking questions",
    gradient: ["#ffecd2", "#fcb69f"] as const,
  },
  {
    id: "sales",
    title: "Salesperson",
    description: "Practice as a salesperson pitching ideas",
    gradient: ["#d299c2", "#fef9d7"] as const,
  },
];

export default function ProfileSelectionScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const { bookTitle, chapterTitle } = params;

  const handleContinue = () => {
    if (selectedProfile) {
      const profile = PROFILES.find((p) => p.id === selectedProfile);

      if (profile) {
        dispatch(
          setSelections({
            book: bookTitle as string,
            chapter: chapterTitle as string,
            profile: profile.title,
          })
        );
        router.push("./roleplayai");
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Book and Chapter Info */}
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionLabel}>Selected Book & Lesson</Text>
          <Text style={styles.bookTitle}>{bookTitle}</Text>
          <Text style={styles.chapterTitle}>{chapterTitle}</Text>
        </View>

        {/* Select Your Profile Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Your Profile</Text>
          <Text style={styles.arrow}>→</Text>
        </View>

        <View style={styles.profileGrid}>
          {PROFILES.map((profile) => {
            const isSelected = selectedProfile === profile.id;
            return (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileCard,
                  isSelected && styles.selectedProfileCard,
                ]}
                onPress={() => setSelectedProfile(profile.id)}
              >
                <LinearGradient
                  colors={profile.gradient}
                  style={styles.profileAvatarPlaceholder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.profileCardTitle}>{profile.title}</Text>
                <Text style={styles.profileCardDescription}>
                  {profile.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Continue Button */}
      {selectedProfile && (
        <SafeAreaView edges={['bottom']} style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Start Roleplay</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  selectionInfo: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  selectionLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  chapterTitle: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
  },
  arrow: {
    fontSize: 20,
    color: "#999999",
  },
  profileGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  profileCard: {
    width: "48%",
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    minHeight: 160,
  },
  selectedProfileCard: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  profileAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginBottom: 15,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  profileCardDescription: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    lineHeight: 16,
  },
  spacer: {
    height: 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  continueButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.light.tint,
    padding: 18,
    borderRadius: 25,
    alignItems: "center",
    elevation: 5,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});