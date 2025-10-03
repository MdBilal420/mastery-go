import { useConversation } from "@elevenlabs/react-native";
import type {
  ConversationStatus,
  ConversationEvent,
  Role,
} from "@elevenlabs/react-native";
import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ChatMessage } from "./chat-message";

export default function RolePlayTestScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);

  const conversation = useConversation({
    clientTools: {},
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log("✅ Connected to conversation", conversationId);
    },
    onDisconnect: (details: string) => {
      console.log("❌ Disconnected from conversation", details);
    },
    onError: (message: string, context?: Record<string, unknown>) => {
      console.error("❌ Conversation error:", message, context);
      // Show alert to user
      Alert.alert("Error", message);
    },
    onMessage: ({
      message,
      source,
    }: {
      message: ConversationEvent;
      source: Role;
    }) => {
      console.log(
        `💬 Message from ${source}:`,
        JSON.stringify(message, null, 2)
      );
      if(message.type === "agent_response"){
        const {agent_response_event} = message
        setMessages((prevMessages) => [
          ...prevMessages,
          { source : "ai", message: agent_response_event.agent_response},
        ])
      }else if(message.type === "user_transcript"){
        const {user_transcription_event} = message
        setMessages((prevMessages) => [
          ...prevMessages,
          { source : "user", message: user_transcription_event.user_transcript},
        ])
      }
    },
    onModeChange: ({ mode }: { mode: "speaking" | "listening" }) => {
      console.log(`🔊 Mode: ${mode}`);
    },
    onStatusChange: ({ status }: { status: ConversationStatus }) => {
      console.log(`📡 Status: ${status}`);
    },
    onCanSendFeedbackChange: ({
      canSendFeedback,
    }: {
      canSendFeedback: boolean;
    }) => {
      console.log(`🔊 Can send feedback: ${canSendFeedback}`);
    },
  });

  const { book, chapter, profile } = useSelector(
    (state: RootState) => state.session
  );

  const [isStarting, setIsStarting] = useState(false);
  const [textInput, setTextInput] = useState("");

  const [gradientAnimation] = useState(new Animated.Value(0));
  const handleSubmitText = () => {
    if (textInput.trim()) {
      conversation.sendUserMessage(textInput.trim());
      setTextInput("");
      Keyboard.dismiss();
    }
  };
  const startConversation = useCallback(async () => {
    if (isStarting) return;
    setIsStarting(true);

    // Start gradient animation
    Animated.timing(gradientAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    try {
      await conversation.startSession({
        agentId: "agent_7201k6mx18dae18tsve5zcqspjdn",
        dynamicVariables: {
          platform: Platform.OS,
          book: book || "Unknown Book",
          chapter: chapter || "Unknown Chapter",
          profile: profile || "Unknown Profile",
        },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, conversation, gradientAnimation]);
  const endConversation = async () => {
    // Reset gradient animation
    Animated.timing(gradientAnimation, {
      toValue: 0,
      duration: 800,
      useNativeDriver: false,
    }).start();

    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
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

  // Dynamic gradient colors based on conversation status
  const getGradientColors = () => {
    switch (conversation.status) {
      case "connected":
        // Mint to sky blue
        return ["#84fab0", "#8fd3f4", "#a6c1ee"];
      case "connecting":
        // Peach to coral
        return ["#fbc2eb", "#fda085", "#fddb92"];
      case "disconnected":
      default:
        // Lavender to pale blue
        return ["#e0c3fc", "#d5deff", "#e8eaf6"];
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.animatedOverlay,
            {
              opacity: gradientAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              }),
            },
          ]}
        />
        <View style={styles.innerContainer}>
          {/* Navigation Header */}
          <View style={styles.navigationHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
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
                <Ionicons name="book" size={18} color={Colors.light.tint} />
                <Text style={styles.contextTitle}>Current Session</Text>
              </View>
              <View style={styles.contextContent}>
                <View style={styles.contextItem}>
                  <Ionicons
                    name="library"
                    size={14}
                    color={Colors.light.tint}
                  />
                  <Text style={styles.contextText}>Book: {book}</Text>
                </View>
                <View style={styles.contextItem}>
                  <Ionicons
                    name="document-text"
                    size={14}
                    color={Colors.light.tint}
                  />
                  <Text style={styles.contextText}>Chapter: {chapter}</Text>
                </View>
                <View style={styles.contextItem}>
                  <Ionicons name="person" size={14} color={Colors.light.tint} />
                  <Text style={styles.contextText}>Your Role: {profile}</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.chatContainer}>
              <ScrollView
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
              </ScrollView>
            </View>
          {/* Button at the bottom */}
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.circularButton,
                canStart && styles.startButton,
                canEnd && styles.stopButton,
                !canStart && !canEnd && styles.disabledButton,
              ]}
              onPress={canStart ? startConversation : endConversation}
              disabled={!canStart && !canEnd}
            >
              <Ionicons
                name={canEnd ? "pause" : "mic"}
                size={32}
                color="white"
              />
              <Text style={styles.buttonLabel}>
                {isStarting ? "Starting..." : canEnd ? "Stop" : "Start"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  animatedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  bottomButtonContainer: {
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 20,
  },
  titleContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  contextContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  contextHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 122, 255, 0.1)",
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 6,
  },
  contextContent: {
    gap: 6,
  },
  contextItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  contextText: {
    fontSize: 14,
    color: "#4a4a4a",
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  speakingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  speakingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  speakingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toolsContainer: {
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  toolsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  toolItem: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  buttonContainer: {
    alignItems: "center",
    gap: 16,
  },
  circularButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    backgroundColor: "#10B981",
  },
  stopButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  buttonLabel: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  instructions: {
    marginTop: 24,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  feedbackContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: "row",
    gap: 16,
  },
  likeButton: {
    backgroundColor: "#10B981",
  },
  dislikeButton: {
    backgroundColor: "#EF4444",
  },
  messagingContainer: {
    marginTop: 24,
    width: "100%",
  },
  messagingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 16,
  },
  messageButtons: {
    flexDirection: "row",
    gap: 16,
  },
  messageButton: {
    backgroundColor: "#3B82F6",
    flex: 1,
  },
  contextButton: {
    backgroundColor: "#4F46E5",
    flex: 1,
  },
  activityContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  activityLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  activityButton: {
    backgroundColor: "#F59E0B",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
});
