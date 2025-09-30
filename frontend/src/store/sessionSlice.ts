import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Turn {
  speaker: 'user' | 'bot';
  text: string;
}

interface SessionState {
  book: string | null;
  chapter: string | null;
  profile: string | null;
  history: Turn[];
}

const initialState: SessionState = {
  book: null,
  chapter: null,
  profile: null,
  history: [],
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSelections: (state, action: PayloadAction<{ book: string; chapter: string; profile: string }>) => {
      state.book = action.payload.book;
      state.chapter = action.payload.chapter;
      state.profile = action.payload.profile;
    },
    addTurn: (state, action: PayloadAction<Turn>) => {
      state.history.push(action.payload);
    },
    resetSession: (state) => {
      state.book = null;
      state.chapter = null;
      state.profile = null;
      state.history = [];
    },
  },
});

export const { setSelections, addTurn, resetSession } = sessionSlice.actions;

export default sessionSlice.reducer;