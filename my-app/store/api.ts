// API helper functions for communicating with the backend

// Base URL for the backend API
// In a production app, this should be configurable via environment variables
// For development, we need to use the actual IP address for mobile devices
const getApiBaseUrl = () => {
  // Check if we're in a React Native environment (mobile)
  // Use a more reliable way to detect React Native
  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent &&
    navigator.userAgent.includes("ReactNative")
  ) {
    // Replace with your actual IP address
    return "http://192.168.1.137:8000";
  }

  // Alternative check for React Native environment using Hermes
  if (typeof global !== "undefined" && (global as any).HermesInternal) {
    return "http://192.168.1.137:8000";
  }

  // Check for React Native using __DEV__ flag
  if (typeof global !== "undefined" && (global as any).__DEV__ !== undefined) {
    return "http://192.168.1.137:8000";
  }

  // For web, we can use localhost
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : `http://${window.location.hostname}:8000`;
  }

  // Default fallback
  return "http://localhost:8000";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Open a new roleplay session
 * @param book The selected book
 * @param chapter The selected chapter
 * @param profile The selected profile
 * @param sessionId Optional session ID (for resuming sessions)
 * @returns Promise with response text and audio in base64
 */
export async function openSession(
  book: string,
  chapter: string,
  profile: string,
  sessionId?: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/roleplay/open`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book,
        chapter,
        profile,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to open session: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message === "Network request failed"
    ) {
      throw new Error(
        "Unable to connect to the server. Please make sure the backend server is running and accessible from your device. Check that your mobile device is on the same network as your development machine."
      );
    }
    throw error;
  }
}

/**
 * Send user audio to get a response
 * @param audioBase64 The user's recorded audio in base64 format
 * @param sessionId The current session ID
 * @param book The selected book
 * @param chapter The selected chapter
 * @param profile The selected profile
 * @returns Promise with response text and audio in base64
 */
export async function sendUserAudio(
  audioBase64: string,
  sessionId: string,
  book: string,
  chapter: string,
  profile: string
) {
  try {
    // Create FormData and send base64 as form field
    const formData = new FormData();
    formData.append("audio_b64", audioBase64);
    formData.append("session_id", sessionId);
    formData.append("book", book);
    formData.append("chapter", chapter);
    formData.append("profile", profile);

    const response = await fetch(`${API_BASE_URL}/roleplay/respond-audio`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to send audio: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in sendUserAudio:", error);
    if (
      error instanceof TypeError &&
      error.message === "Network request failed"
    ) {
      throw new Error(
        "Unable to connect to the server. Please make sure the backend server is running and accessible from your device. Check that your mobile device is on the same network as your development machine."
      );
    }
    throw error;
  }
}

/**
 * Get feedback for the session
 * @param history The conversation history
 * @param sessionId The session ID
 * @returns Promise with feedback summary, scores, and suggestions
 */
export async function getFeedback(
  history: { role: string; text: string }[],
  sessionId: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/roleplay/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get feedback: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message === "Network request failed"
    ) {
      throw new Error(
        "Unable to connect to the server. Please make sure the backend server is running and accessible from your device. Check that your mobile device is on the same network as your development machine."
      );
    }
    throw error;
  }
}
