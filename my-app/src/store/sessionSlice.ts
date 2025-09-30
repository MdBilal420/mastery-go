import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the session state structure
export interface SessionState {
  book: string | null;
  chapter: string | null;
  profile: string | null;
  sessionId: string | null;
  history: { role: 'user' | 'bot'; text: string }[];
}

// Initial state
const initialState: SessionState = {
  book: null,
  chapter: null,
  profile: null,
  sessionId: null,
  history: [],
};

// Create the session slice
export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Set book, chapter, profile, and optionally sessionId
    setSelections: (
      state,
      action: PayloadAction<{
        book: string;
        chapter: string;
        profile: string;
        sessionId?: string;
      }>
    ) => {
      state.book = action.payload.book;
      state.chapter = action.payload.chapter;
      state.profile = action.payload.profile;
      if (action.payload.sessionId) {
        state.sessionId = action.payload.sessionId;
      }
    },
    // Add a turn (user or bot message) to history
    addTurn: (
      state,
      action: PayloadAction<{ role: 'user' | 'bot'; text: string }>
    ) => {
      state.history.push(action.payload);
    },
    // Reset the session
    resetSession: (state) => {
      state.book = null;
      state.chapter = null;
      state.profile = null;
      state.sessionId = null;
      state.history = [];
    },
    // Set session ID
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
  },
});

// Export actions
export const { setSelections, addTurn, resetSession, setSessionId } = sessionSlice.actions;

// Export reducer
export default sessionSlice.reducer;