import { useConversation } from "@elevenlabs/react-native";
import type { ConversationStatus } from "@elevenlabs/react-native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Colors } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const RolePlayAIScreen = () => {
  const router = useRouter();

  // Get selections from Redux store
  const { book, chapter, profile } = useSelector(
    (state: RootState) => state.session
  );

  const conversation = useConversation({
    clientTools: {},
    onError: (message: string) => {
      Alert.alert(
        "Voice Error",
        `Error: ${message}. Please check microphone permissions and try again.`,
        [{ text: "OK" }]
      );
    },
    onModeChange: ({ mode }: { mode: "speaking" | "listening" }) => {
      setConversationMode(mode);
    },
  });

  const [isStarting, setIsStarting] = useState(false);
  const [conversationMode, setConversationMode] = useState<
    "speaking" | "listening" | null
  >(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (Platform.OS === "android") {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );

          if (hasPermission) {
            setHasPermissions(true);
            return;
          }

          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: "Microphone Permission",
              message:
                "This app needs access to your microphone for voice conversations.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );

          setHasPermissions(granted === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          setHasPermissions(true);
        }
      } catch (err) {
        setHasPermissions(false);
      }
    };

    requestPermissions();
  }, []);

  const startConversation = async () => {
    if (isStarting || !hasPermissions) {
      if (!hasPermissions) {
        Alert.alert(
          "Microphone Permission Required",
          "Please enable microphone access in your device settings to use voice features.",
          [{ text: "OK" }]
        );
      }
      return;
    }

    setIsStarting(true);
    try {
      await conversation.startSession({
        agentId: "agent_0301k6hyrs35fwht1cr2p9t00qzz",
        dynamicVariables: {
          book: book || "Unknown Book",
          chapter: chapter || "Unknown Chapter",
          profile: profile || "Unknown Profile",
        },
      });

      if (book && chapter && profile) {
        const contextMessage = `We are doing a roleplay exercise based on the book "${book}", specifically focusing on the chapter "${chapter}". I am playing the role of a ${profile}. Please start our roleplay conversation based on this context and help me practice the concepts from this chapter.`;

        setTimeout(() => {
          conversation.sendContextualUpdate(contextMessage);
        }, 1000);
      }
    } catch (error) {
      Alert.alert(
        "Connection Error",
        "Failed to start the conversation. Please check your internet connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsStarting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      // Silent fail
    }
  };

  const handleBack = () => {
    // End conversation if active before navigating back
    if (conversation.status === "connected") {
      endConversation();
    }
    router.back();
  };

  const getStatusColor = (status: ConversationStatus): string => {
    switch (status) {
      case "connected":
        return "#10B981";
      case "connecting":
        return "#F59E0B";
      case "disconnected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: ConversationStatus): string => {
    return status[0].toUpperCase() + status.slice(1);
  };

  const canStart = conversation.status === "disconnected" && !isStarting;
  const canEnd = conversation.status === "connected";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.innerContainer}>
        {/* Navigation Header */}
        <View style={styles.navigationHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.endConversationButton,
              !canEnd && styles.disabledHeaderButton,
            ]}
            onPress={endConversation}
            disabled={!canEnd}
          >
            <Ionicons
              name="stop-circle"
              size={20}
              color={canEnd ? "#FF3B30" : "#cccccc"}
            />
            <Text
              style={[
                styles.endConversationButtonText,
                !canEnd && styles.disabledButtonText,
              ]}
            >
              End
            </Text>
          </TouchableOpacity>
        </View>

        {/* Display current selections */}
        {book && chapter && profile && (
          <View style={styles.contextContainer}>
            <View style={styles.contextHeader}>
              <Ionicons name="book" size={20} color={Colors.light.tint} />
              <Text style={styles.contextTitle}>Current Session</Text>
            </View>
            <View style={styles.contextItem}>
              <Ionicons name="library" size={16} color="#666666" />
              <Text style={styles.contextText}>Book: {book}</Text>
            </View>
            <View style={styles.contextItem}>
              <Ionicons name="document-text" size={16} color="#666666" />
              <Text style={styles.contextText}>Chapter: {chapter}</Text>
            </View>
            <View style={styles.contextItem}>
              <Ionicons name="person" size={16} color="#666666" />
              <Text style={styles.contextText}>Your Role: {profile}</Text>
            </View>
          </View>
        )}

        {/* Status Section */}
        {conversation.status === "connected" && (
          <View style={styles.statusSection}>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(conversation.status) },
                ]}
              />
              <Text style={styles.statusText}>
                {getStatusText(conversation.status)}
              </Text>
            </View>

            <View style={styles.speakingContainer}>
              <Ionicons
                name={
                  conversationMode === "speaking"
                    ? "volume-high"
                    : conversationMode === "listening"
                    ? "mic"
                    : "ear"
                }
                size={16}
                color={
                  conversationMode === "speaking"
                    ? "#8B5CF6"
                    : conversationMode === "listening"
                    ? "#10B981"
                    : "#666666"
                }
              />
              <Text
                style={[
                  styles.speakingText,
                  {
                    color:
                      conversationMode === "speaking"
                        ? "#8B5CF6"
                        : conversationMode === "listening"
                        ? "#10B981"
                        : "#666666",
                  },
                ]}
              >
                {conversationMode === "speaking"
                  ? "AI Speaking"
                  : conversationMode === "listening"
                  ? "Listening"
                  : "Ready"}
              </Text>
            </View>
          </View>
        )}

        {/* Main Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              !canStart && styles.disabledButton,
            ]}
            onPress={startConversation}
            disabled={!canStart}
          >
            <LinearGradient
              colors={
                canStart ? ["#667eea", "#764ba2"] : ["#cccccc", "#999999"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Ionicons
                name={isStarting ? "hourglass" : "play-circle"}
                size={24}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.heroButtonText}>
                {isStarting ? "Starting..." : "Start AI Roleplay"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  navigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endConversationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledHeaderButton: {
    backgroundColor: "#f0f0f0",
    shadowOpacity: 0.05,
  },
  endConversationButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
  disabledButtonText: {
    color: "#cccccc",
  },

  contextContainer: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contextHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  contextTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginLeft: 8,
  },
  contextItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contextText: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 12,
    flex: 1,
  },
  statusSection: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  speakingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  speakingText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButton: {
    backgroundColor: "transparent",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 64,
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 25,
    minHeight: 64,
  },
  heroButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    shadowOpacity: 0.1,
  },
});

export default RolePlayAIScreen;
