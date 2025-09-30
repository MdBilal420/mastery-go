// API helper functions for communicating with the backend

// Base URL for the backend API
// In a production app, this should be configurable via environment variables
const API_BASE_URL = 'http://localhost:8000'; // Assuming backend runs on port 8000

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
  const response = await fetch(`${API_BASE_URL}/roleplay/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const response = await fetch(`${API_BASE_URL}/roleplay/respond-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_b64: audioBase64,
      session_id: sessionId,
      book,
      chapter,
      profile,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send audio: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get feedback for the session
 * @param history The conversation history
 * @param sessionId The session ID
 * @returns Promise with feedback summary, scores, and suggestions
 */
export async function getFeedback(history: { role: string; text: string }[], sessionId: string) {
  const response = await fetch(`${API_BASE_URL}/roleplay/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
}