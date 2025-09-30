const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

export interface RoleplayOpenRequest {
  book: string;
  chapter: string;
  profile: string;
}

export interface RoleplayResponse {
  text: string;
  audio_b64: string;
}

export interface FeedbackResponse {
  summary: string;
  score: number;
  suggestions: string[];
}

export const openRoleplaySession = async (request: RoleplayOpenRequest): Promise<RoleplayResponse> => {
  const response = await fetch(`${API_BASE_URL}/roleplay/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error('Failed to open roleplay session');
  }
  
  return response.json();
};

export const sendAudioResponse = async (audioBase64: string): Promise<RoleplayResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBase64);
  
  const response = await fetch(`${API_BASE_URL}/roleplay/respond-audio`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to send audio response');
  }
  
  return response.json();
};

export const getFeedback = async (): Promise<FeedbackResponse> => {
  const response = await fetch(`${API_BASE_URL}/roleplay/feedback`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get feedback');
  }
  
  return response.json();
};